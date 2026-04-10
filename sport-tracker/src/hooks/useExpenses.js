import { useState, useEffect, useCallback } from 'react';
import { getExpenses, addExpense, deleteExpense } from '../api/sheetdb';
import { calcSummary, filterRecent, uuid } from '../lib/utils';

export function useExpenses() {
  const [allExpenses, setAllExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getExpenses();
      setAllExpenses(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Không thể tải dữ liệu. Kiểm tra kết nối SheetDB.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const expenses = filterRecent(allExpenses);
  const summary = calcSummary(allExpenses);

  const add = async ({ name, amount, note, date }) => {
    setSubmitting(true);
    try {
      const now = new Date().toISOString();
      const record = {
        id: uuid(),
        name: name.trim(),
        amount: String(Number(amount)),
        note: note?.trim() || '',
        date: date || now.slice(0, 10),
        created_at: now,
      };
      await addExpense(record);
      setAllExpenses((prev) => [...prev, record]);
    } catch {
      throw new Error('Thêm thất bại. Thử lại nhé!');
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async (id) => {
    try {
      await deleteExpense(id);
      setAllExpenses((prev) => prev.filter((e) => e.id !== id));
    } catch {
      throw new Error('Xóa thất bại. Thử lại nhé!');
    }
  };

  return { expenses, summary, loading, error, submitting, add, remove, refetch: fetch };
}
