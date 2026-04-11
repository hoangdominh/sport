import axios from 'axios';

const BASE_URL = import.meta.env.VITE_SHEETDB_URL;

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// ── Sessions ──────────────────────────────────────────────
// Sheet cols: id | sport | date | participants | created_at
export const getSessions = () =>
  api.get('?sheet=sessions').then((r) => r.data);

export const addSession = (data) =>
  api.post('?sheet=sessions', { data }).then((r) => r.data);

export const deleteSession = (id) =>
  api.delete(`/id/${id}?sheet=sessions`).then((r) => r.data);

// ── Expenses ──────────────────────────────────────────────
// Sheet cols: id | session_id | payer | amount | note | created_at
export const getAllExpenses = () =>
  api.get('?sheet=expenses').then((r) => r.data);

export const addExpense = (data) =>
  api.post('?sheet=expenses', { data }).then((r) => r.data);

export const deleteExpense = (id) =>
  api.delete(`/id/${id}?sheet=expenses`).then((r) => r.data);

// ── Payments ──────────────────────────────────────────────
// Sheet cols: id | session_id | player | created_at
// Row exists = player has paid their share for that session
export const getPayments = () =>
  api.get('?sheet=payments').then((r) => r.data);

export const addPaymentRow = (data) =>
  api.post('?sheet=payments', { data }).then((r) => r.data);

export const deletePaymentRow = (id) =>
  api.delete(`/id/${id}?sheet=payments`).then((r) => r.data);

// ── Votes ─────────────────────────────────────────────────
export const getVotes = () =>
  api.get('?sheet=votes').then((r) => r.data);

export const addVote = (data) =>
  api.post('?sheet=votes', { data }).then((r) => r.data);

export const deleteVoteOption = (id) =>
  api.delete(`/id/${id}?sheet=votes`).then((r) => r.data);

export const deleteVote = (id) =>
  api.delete(`/id/${id}?sheet=votes`).then((r) => r.data);
