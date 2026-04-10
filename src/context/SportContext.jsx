import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getSessions, getAllExpenses, getPayments } from '../api/sheetdb';
import { calcOverallSummary } from '../lib/utils';

const SportContext = createContext(null);

export function SportProvider({ children }) {
  const [sessions, setSessions] = useState([]);
  const [allExpenses, setAllExpenses] = useState([]);
  const [allPayments, setAllPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [sessionsData, expensesData, paymentsData] = await Promise.all([
        getSessions(),
        getAllExpenses(),
        getPayments(),
      ]);
      setSessions(Array.isArray(sessionsData) ? sessionsData : []);
      setAllExpenses(Array.isArray(expensesData) ? expensesData : []);
      setAllPayments(Array.isArray(paymentsData) ? paymentsData : []);
    } catch {
      setError('Không thể tải dữ liệu. Kiểm tra kết nối hoặc biến môi trường VITE_SHEETDB_URL.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Sort sessions newest first
  const sortedSessions = [...sessions].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  const overallSummary = calcOverallSummary(sessions, allExpenses);

  return (
    <SportContext.Provider
      value={{
        sessions: sortedSessions,
        allExpenses,
        allPayments,
        setSessions,
        setAllExpenses,
        setAllPayments,
        overallSummary,
        loading,
        error,
        refetch: fetchAll,
      }}
    >
      {children}
    </SportContext.Provider>
  );
}

export function useSport() {
  const ctx = useContext(SportContext);
  if (!ctx) throw new Error('useSport must be used inside SportProvider');
  return ctx;
}
