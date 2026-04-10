import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Tailwind class merge helper
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// ── Session calculations ───────────────────────────────────────────────────

/**
 * Tính toán chi tiết cho 1 buổi chơi.
 * - perPersonShare: mỗi người phải trả bao nhiêu
 * - netBalance[player]: dương = đang nợ, âm = đã ứng tiền (được hoàn lại)
 */
export function calcSessionSummary(session, allExpenses) {
  // Safety checks
  if (!session) {
    return { 
      participants: [], 
      totalCost: 0, 
      perPersonShare: 0, 
      paidByPerson: {}, 
      netBalance: {}, 
      sessionExpenses: [] 
    };
  }

  const participants = (session.participants || '')
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean);

  const sessionExpenses = allExpenses?.filter((e) => e.session_id === session.id) || [];
  const totalCost = sessionExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const count = participants.length;
  const perPersonShare = count > 0 ? totalCost / count : 0;

  // Tổng tiền mỗi người đã thực sự chi ra
  const paidByPerson = {};
  participants.forEach((p) => { paidByPerson[p] = 0; });
  sessionExpenses.forEach((e) => {
    if (e.payer) {
      paidByPerson[e.payer] = (paidByPerson[e.payer] || 0) + (Number(e.amount) || 0);
    }
  });

  // Net balance: dương = đang nợ, âm = được hoàn lại
  const netBalance = {};
  participants.forEach((p) => {
    netBalance[p] = perPersonShare - (paidByPerson[p] || 0);
  });

  return { participants, totalCost, perPersonShare, paidByPerson, netBalance, sessionExpenses };
}

/**
 * Tính tổng kết toàn bộ (tất cả các buổi).
 * Giống dòng "TỔNG KẾT" trong bảng tính.
 */
export function calcOverallSummary(sessions, allExpenses) {
  // Safety checks
  if (!Array.isArray(sessions) || !Array.isArray(allExpenses)) {
    return { totalShare: {}, totalPaidOut: {}, netBalance: {}, allPlayers: [] };
  }

  const totalShare = {};
  const totalPaidOut = {};

  sessions.forEach((session) => {
    const { participants, perPersonShare, paidByPerson } = calcSessionSummary(session, allExpenses);
    participants.forEach((p) => {
      totalShare[p] = (totalShare[p] || 0) + perPersonShare;
      totalPaidOut[p] = (totalPaidOut[p] || 0) + (paidByPerson[p] || 0);
    });
  });

  const allPlayers = [...new Set([...Object.keys(totalShare)])].sort();
  const netBalance = {};
  allPlayers.forEach((p) => {
    netBalance[p] = (totalShare[p] || 0) - (totalPaidOut[p] || 0);
  });

  return { totalShare, totalPaidOut, netBalance, allPlayers };
}

// ── Vote helpers ───────────────────────────────────────────────────────────

export function tallyVotes(votes, type) {
  if (!Array.isArray(votes)) return {};
  const filtered = votes.filter((v) => v.type === type);
  return filtered.reduce((acc, v) => {
    acc[v.option] = (acc[v.option] || 0) + 1;
    return acc;
  }, {});
}

export function getVoteOptions(votes, type) {
  if (!Array.isArray(votes)) return [];
  const seen = new Map();
  votes
    .filter((v) => v.type === type)
    .forEach((v) => {
      if (!seen.has(v.option)) seen.set(v.option, v.id);
    });
  return Array.from(seen.entries()).map(([option, id]) => ({ option, id }));
}

// ── Formatters ─────────────────────────────────────────────────────────────

export function formatVND(amount) {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '0 ₫';
  }
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(isoString) {
  if (!isoString) return '';
  try {
    return new Date(isoString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return isoString;
  }
}

// ── UUID ───────────────────────────────────────────────────────────────────

export function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}
