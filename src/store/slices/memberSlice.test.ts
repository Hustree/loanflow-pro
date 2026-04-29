import { describe, expect, it } from 'vitest';

import memberReducer, {
  addMember,
  addLoanToMember,
  clearError,
  deleteMember,
  removeLoanFromMember,
  selectMember,
  setError,
  setLoading,
  setMembers,
  setSearchQuery,
  updateMember,
  type Member,
  type MemberState,
} from './memberSlice';

const initial: MemberState = {
  members: [],
  selectedMember: null,
  isLoading: false,
  error: null,
  searchQuery: '',
};

const newMember = {
  memberNumber: 'M-001',
  firstName: 'Alex',
  lastName: 'Demo',
  email: 'alex@demo.test',
  phone: '+639171234567',
  address: '123 Test St',
  dateJoined: new Date('2024-01-01'),
  status: 'active' as const,
};

describe('memberSlice', () => {
  it('returns the initial state', () => {
    expect(memberReducer(undefined, { type: '@@INIT' })).toEqual(initial);
  });

  it('addMember appends a generated record', () => {
    const next = memberReducer(initial, addMember(newMember));
    expect(next.members).toHaveLength(1);
    expect(next.members[0]!.id).toBeTruthy();
    expect(next.members[0]!.firstName).toBe('Alex');
    expect(next.members[0]!.createdAt).toBeInstanceOf(Date);
    expect(next.error).toBeNull();
  });

  it('selectMember sets selected by id (or null when missing)', () => {
    const seed = memberReducer(initial, addMember(newMember));
    const memberId = seed.members[0]!.id;
    const next = memberReducer(seed, selectMember(memberId));
    expect(next.selectedMember?.id).toBe(memberId);
    const missing = memberReducer(seed, selectMember('nope'));
    expect(missing.selectedMember).toBeNull();
  });

  it('updateMember merges fields and updates selectedMember if matching', () => {
    let state = memberReducer(initial, addMember(newMember));
    const id = state.members[0]!.id;
    state = memberReducer(state, selectMember(id));
    state = memberReducer(state, updateMember({ id, firstName: 'Updated' }));
    expect(state.members[0]!.firstName).toBe('Updated');
    expect(state.selectedMember!.firstName).toBe('Updated');
  });

  it('updateMember is a no-op when id missing', () => {
    const seed = memberReducer(initial, addMember(newMember));
    const next = memberReducer(seed, updateMember({ id: 'missing', firstName: 'X' }));
    expect(next.members).toEqual(seed.members);
  });

  it('deleteMember filters and clears selection if it was selected', () => {
    let state = memberReducer(initial, addMember(newMember));
    const id = state.members[0]!.id;
    state = memberReducer(state, selectMember(id));
    state = memberReducer(state, deleteMember(id));
    expect(state.members).toHaveLength(0);
    expect(state.selectedMember).toBeNull();
  });

  it('setMembers replaces the array and clears flags', () => {
    const next = memberReducer(
      { ...initial, isLoading: true, error: 'e' },
      setMembers([{ id: 'a' } as Member]),
    );
    expect(next.members).toHaveLength(1);
    expect(next.isLoading).toBe(false);
    expect(next.error).toBeNull();
  });

  it('setSearchQuery stores the query', () => {
    expect(memberReducer(initial, setSearchQuery('alex')).searchQuery).toBe('alex');
  });

  it('setLoading / setError / clearError manage UI flags', () => {
    expect(memberReducer(initial, setLoading(true)).isLoading).toBe(true);
    const errored = memberReducer({ ...initial, isLoading: true }, setError('boom'));
    expect(errored.error).toBe('boom');
    expect(errored.isLoading).toBe(false);
    expect(memberReducer({ ...initial, error: 'e' }, clearError()).error).toBeNull();
  });

  it('addLoanToMember initialises array and bumps totalLoans', () => {
    let state = memberReducer(initial, addMember(newMember));
    const id = state.members[0]!.id;
    state = memberReducer(state, addLoanToMember({ memberId: id, loanId: 'loan-1' }));
    expect(state.members[0]!.currentLoanIds).toEqual(['loan-1']);
    expect(state.members[0]!.totalLoans).toBe(1);
    expect(state.members[0]!.updatedAt).toBeInstanceOf(Date);
  });

  it('addLoanToMember appends to existing array', () => {
    let state = memberReducer(initial, addMember(newMember));
    const id = state.members[0]!.id;
    state = memberReducer(state, addLoanToMember({ memberId: id, loanId: 'loan-1' }));
    state = memberReducer(state, addLoanToMember({ memberId: id, loanId: 'loan-2' }));
    expect(state.members[0]!.currentLoanIds).toEqual(['loan-1', 'loan-2']);
    expect(state.members[0]!.totalLoans).toBe(2);
  });

  it('addLoanToMember on missing member is a no-op', () => {
    const next = memberReducer(initial, addLoanToMember({ memberId: 'missing', loanId: 'x' }));
    expect(next).toEqual(initial);
  });

  it('removeLoanFromMember filters loan ids', () => {
    let state = memberReducer(initial, addMember(newMember));
    const id = state.members[0]!.id;
    state = memberReducer(state, addLoanToMember({ memberId: id, loanId: 'loan-1' }));
    state = memberReducer(state, removeLoanFromMember({ memberId: id, loanId: 'loan-1' }));
    expect(state.members[0]!.currentLoanIds).toEqual([]);
  });

  it('removeLoanFromMember is a no-op when member missing currentLoanIds', () => {
    const seed = memberReducer(initial, addMember(newMember));
    const id = seed.members[0]!.id;
    const next = memberReducer(seed, removeLoanFromMember({ memberId: id, loanId: 'x' }));
    expect(next).toEqual(seed);
  });
});
