import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle, Calendar, Users } from 'lucide-react';
import { useSport } from '../context/SportContext';
import { calcSessionSummary, formatDate } from '../lib/utils';
import ExpenseList from '../components/session/ExpenseList';
import SummaryTable from '../components/session/SummaryTable';

const SPORT_EMOJI = {
  'Cầu lông': '🏸',
  'Pickleball': '🏓',
  'Bóng đá': '⚽',
  'Bơi': '🏊',
  'Tennis': '🎾',
  'Khác': '🎯',
};

export default function SessionPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { sessions, allExpenses, loading, error } = useSport();

  const session = sessions.find((s) => s.id === id);
  const summary = session ? calcSessionSummary(session, allExpenses) : null;

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-32 rounded-xl bg-white/5 animate-pulse" />
        <div className="h-24 rounded-2xl glass-card animate-pulse" />
        <div className="h-48 rounded-2xl glass-card animate-pulse" />
        <div className="h-64 rounded-2xl glass-card animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card p-5 flex items-center gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-500/10">
          <AlertCircle size={20} className="text-red-400" />
        </div>
        <p className="text-sm text-red-400">{error}</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="glass-card p-12 text-center">
        <div className="text-5xl mb-4">😕</div>
        <p className="text-lg font-medium text-white mb-1">Không tìm thấy buổi chơi</p>
        <button
          onClick={() => navigate('/')}
          className="btn-secondary mt-5 inline-flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          Về trang chủ
        </button>
      </div>
    );
  }

  const participants = summary.participants;
  const emoji = SPORT_EMOJI[session.sport] || '🎯';

  return (
    <div className="space-y-6 pb-20">
      {/* Back */}
      <button
        onClick={() => navigate('/expenses')}
        className="flex items-center gap-2 text-sm text-white/40 hover:text-white transition-colors slide-up"
      >
        <ArrowLeft size={16} />
        Danh sách buổi chơi
      </button>

      {/* Header */}
      <div className="glass-card overflow-hidden slide-up" style={{ animationDelay: '100ms' }}>
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500/20 to-indigo-500/20 text-3xl">
              {emoji}
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="font-display text-2xl font-bold text-white">{session.sport}</h1>
                <span className="tag">
                  <Calendar size={12} className="mr-1" />
                  {formatDate(session.date)}
                </span>
              </div>
              <p className="mt-1 text-sm text-white/50 flex items-center gap-2">
                <Users size={14} />
                {participants.length} người tham gia
              </p>
            </div>
          </div>
          
          {/* Participants tags */}
          <div className="mt-4 flex flex-wrap gap-2">
            {participants.map(p => (
              <span key={p} className="tag">{p}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Expense items */}
      <div className="slide-up" style={{ animationDelay: '200ms' }}>
        <ExpenseList session={session} />
      </div>

      {/* Summary & payment tracking */}
      {summary.sessionExpenses.length > 0 && (
        <div className="slide-up" style={{ animationDelay: '300ms' }}>
          <SummaryTable session={session} summary={summary} />
        </div>
      )}

      {summary.sessionExpenses.length === 0 && (
        <div className="glass-card p-8 text-center slide-up" style={{ animationDelay: '300ms' }}>
          <div className="text-4xl mb-3">💰</div>
          <p className="text-sm text-white/40">
            Thêm chi phí phía trên để xem phân chia tự động
          </p>
        </div>
      )}
    </div>
  );
}
