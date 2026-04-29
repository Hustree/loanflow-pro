import { describe, expect, it } from 'vitest';

import loanProductReducer, {
  addProduct,
  clearError,
  deleteProduct,
  selectProduct,
  setError,
  setLoading,
  setProducts,
  toggleProductStatus,
  updateProduct,
  type LoanProduct,
  type LoanProductState,
} from './loanProductSlice';

const newProductPayload = {
  code: 'TEST',
  name: 'Test Loan',
  description: 'desc',
  minAmount: 1000,
  maxAmount: 10_000,
  interestRate: 1.5,
  processingFee: 100,
  availableTerms: [12, 24],
  requirements: ['Valid ID'],
  isActive: true,
};

describe('loanProductSlice', () => {
  it('seeds three default products', () => {
    const state = loanProductReducer(undefined, { type: '@@INIT' });
    expect(state.products).toHaveLength(3);
    expect(state.selectedProduct).toBeNull();
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('addProduct appends with generated id', () => {
    const initial = loanProductReducer(undefined, { type: '@@INIT' });
    const next = loanProductReducer(initial, addProduct(newProductPayload));
    expect(next.products).toHaveLength(4);
    expect(next.products[3]!.code).toBe('TEST');
    expect(next.products[3]!.id).toBeTruthy();
  });

  it('selectProduct sets selected by id', () => {
    const initial = loanProductReducer(undefined, { type: '@@INIT' });
    const next = loanProductReducer(initial, selectProduct('1'));
    expect(next.selectedProduct?.code).toBe('EMRG');
  });

  it('selectProduct clears when id missing', () => {
    const seed: LoanProductState = {
      products: [],
      selectedProduct: { id: 'x' } as LoanProduct,
      isLoading: false,
      error: null,
    };
    const next = loanProductReducer(seed, selectProduct('missing'));
    expect(next.selectedProduct).toBeNull();
  });

  it('updateProduct merges fields and updates selected when matching', () => {
    let state = loanProductReducer(undefined, { type: '@@INIT' });
    state = loanProductReducer(state, selectProduct('1'));
    state = loanProductReducer(state, updateProduct({ id: '1', name: 'Renamed' }));
    expect(state.products.find((p) => p.id === '1')!.name).toBe('Renamed');
    expect(state.selectedProduct!.name).toBe('Renamed');
  });

  it('updateProduct is a no-op on unknown id', () => {
    const initial = loanProductReducer(undefined, { type: '@@INIT' });
    const next = loanProductReducer(initial, updateProduct({ id: 'missing', name: 'X' }));
    expect(next.products).toEqual(initial.products);
  });

  it('deleteProduct removes the product and clears selection if it was selected', () => {
    let state = loanProductReducer(undefined, { type: '@@INIT' });
    state = loanProductReducer(state, selectProduct('1'));
    state = loanProductReducer(state, deleteProduct('1'));
    expect(state.products.find((p) => p.id === '1')).toBeUndefined();
    expect(state.selectedProduct).toBeNull();
  });

  it('toggleProductStatus flips isActive', () => {
    let state = loanProductReducer(undefined, { type: '@@INIT' });
    const before = state.products.find((p) => p.id === '1')!.isActive;
    state = loanProductReducer(state, toggleProductStatus('1'));
    expect(state.products.find((p) => p.id === '1')!.isActive).toBe(!before);
  });

  it('toggleProductStatus is a no-op on missing id', () => {
    const initial = loanProductReducer(undefined, { type: '@@INIT' });
    const next = loanProductReducer(initial, toggleProductStatus('missing'));
    expect(next.products).toEqual(initial.products);
  });

  it('setProducts replaces the entire list', () => {
    const initial = loanProductReducer(undefined, { type: '@@INIT' });
    const next = loanProductReducer({ ...initial, isLoading: true, error: 'e' }, setProducts([]));
    expect(next.products).toEqual([]);
    expect(next.isLoading).toBe(false);
    expect(next.error).toBeNull();
  });

  it('setLoading / setError / clearError manage UI flags', () => {
    const initial = loanProductReducer(undefined, { type: '@@INIT' });
    expect(loanProductReducer(initial, setLoading(true)).isLoading).toBe(true);
    const errored = loanProductReducer({ ...initial, isLoading: true }, setError('boom'));
    expect(errored.error).toBe('boom');
    expect(errored.isLoading).toBe(false);
    expect(loanProductReducer({ ...initial, error: 'e' }, clearError()).error).toBeNull();
  });
});
