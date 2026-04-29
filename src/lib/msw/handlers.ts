import { http, HttpResponse, delay } from 'msw';

import type {
  AuthSession,
  CreateLoanRequest,
  Loan,
  LoanStatus,
  UpdateLoanStatusRequest,
} from '@/lib/api/types';

import { db } from './db';

const API = '/api';

const generateRef = (): string => {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `LN-${date}-${rand}`;
};

const paramToId = (raw: string | readonly string[] | undefined): string | null => {
  if (typeof raw === 'string') return raw;
  if (Array.isArray(raw) && raw.length > 0 && typeof raw[0] === 'string') return raw[0];
  return null;
};

export const handlers = [
  http.post(`${API}/auth/login`, async ({ request }) => {
    await delay(300);
    const body = (await request.json()) as { username: string; password: string };
    if (body.username !== 'demo' || body.password !== 'demo') {
      return HttpResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    const current = db.read();
    const session: AuthSession = {
      user: current.user,
      token: 'demo-token-' + Math.random().toString(36).slice(2),
      expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    };
    current.session = session;
    db.write(current);
    return HttpResponse.json(session);
  }),

  http.post(`${API}/auth/logout`, async () => {
    await delay(100);
    const current = db.read();
    current.session = null;
    db.write(current);
    return HttpResponse.json({ ok: true });
  }),

  http.get(`${API}/auth/session`, async () => {
    const current = db.read();
    if (!current.session) return HttpResponse.json(null);
    return HttpResponse.json(current.session);
  }),

  http.get(`${API}/loans`, async () => {
    await delay(200);
    return HttpResponse.json(db.read().loans);
  }),

  http.get(`${API}/loans/:id`, async ({ params }) => {
    await delay(150);
    const id = paramToId(params.id);
    if (!id) return HttpResponse.json({ error: 'Invalid id' }, { status: 400 });
    const loan = db.read().loans.find((l) => l.id === id);
    if (!loan) return HttpResponse.json({ error: 'Not found' }, { status: 404 });
    return HttpResponse.json(loan);
  }),

  http.post(`${API}/loans`, async ({ request }) => {
    await delay(400);
    const body = (await request.json()) as CreateLoanRequest;
    const current = db.read();
    const newLoan: Loan = {
      id: `loan-${Math.random().toString(36).slice(2, 10)}`,
      referenceNumber: generateRef(),
      applicantId: current.user.id,
      applicantName: body.applicantName,
      loanType: body.loanType,
      amount: body.amount,
      termMonths: body.termMonths,
      purpose: body.purpose,
      status: 'pending',
      notes: [],
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    current.loans.unshift(newLoan);
    db.write(current);
    return HttpResponse.json(newLoan, { status: 201 });
  }),

  http.patch(`${API}/loans/:id/status`, async ({ params, request }) => {
    await delay(250);
    const id = paramToId(params.id);
    if (!id) return HttpResponse.json({ error: 'Invalid id' }, { status: 400 });
    const body = (await request.json()) as UpdateLoanStatusRequest;
    const current = db.read();
    const loan = current.loans.find((l) => l.id === id);
    if (!loan) return HttpResponse.json({ error: 'Not found' }, { status: 404 });
    loan.status = body.status as LoanStatus;
    loan.updatedAt = new Date().toISOString();
    if (body.note) {
      loan.notes.push({
        id: `note-${Math.random().toString(36).slice(2, 10)}`,
        content: body.note,
        authorId: 'admin',
        authorName: 'Loan Officer',
        createdAt: loan.updatedAt,
      });
    }
    db.write(current);
    return HttpResponse.json(loan);
  }),

  // Passkey ceremony stubs — simulated, never reach a real RP
  http.post(`${API}/webauthn/registration/options`, async () => {
    await delay(120);
    return HttpResponse.json({
      challenge: btoa(crypto.randomUUID()),
      rp: { id: window.location.hostname, name: 'LoanFlow Pro (demo)' },
      user: {
        id: btoa('demo'),
        name: 'demo',
        displayName: 'Alex Demo',
      },
      pubKeyCredParams: [
        { alg: -7, type: 'public-key' },
        { alg: -257, type: 'public-key' },
      ],
      timeout: 60_000,
      attestation: 'none',
    });
  }),
  http.post(`${API}/webauthn/registration/verify`, async () => {
    await delay(120);
    return HttpResponse.json({ verified: true });
  }),
  http.post(`${API}/webauthn/authentication/options`, async () => {
    await delay(120);
    return HttpResponse.json({
      challenge: btoa(crypto.randomUUID()),
      timeout: 60_000,
      rpId: window.location.hostname,
      allowCredentials: [],
      userVerification: 'preferred',
    });
  }),
  http.post(`${API}/webauthn/authentication/verify`, async () => {
    await delay(120);
    const current = db.read();
    const session: AuthSession = {
      user: current.user,
      token: 'demo-passkey-token-' + Math.random().toString(36).slice(2),
      expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    };
    current.session = session;
    db.write(current);
    return HttpResponse.json({ verified: true, session });
  }),
];
