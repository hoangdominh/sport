import { useNavigate } from 'react-router-dom';
import { Trash2, ChevronRight, Users, Calendar } from 'lucide-react';
import { formatVND, formatDate, calcSessionSummary } from '../../lib/utils';
import { useSport } from '../../context/SportContext';
import { deleteSession, deleteExpense } from '../../api/sheetdb';

const SPORT_EMOJI = {
  'Cầu lông': '🏸',
  'Pickleball': '🏓',
  'Bóng đá': '⚽',
  'Bơi': '🏊',
  'Tennis': '🎾',
  'Khác': '🎯',
};

export default function SessionCard({ session, delay = 0 }) {
  const navigate = useNavigate();
  const { allExpenses = [], setSessions, setAllExpenses } = useSport();
  
  // Safety check
  if (!session) return null;
  
  const { participants = [], totalCost = 0, perPersonShare = 0, netBalance = {} } =
    calcSessionSummary(session, allExpenses);

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!confirm(`Xóa buổi ${session?.sport || 'này'} ngày ${formatDate(session?.date)}?`)) return;

    try {
      // Cascade delete expenses
      const orphanExpenses = (allExpenses || []).filter((ex) => ex?.session_id === session?.id);
      await Promise.all(orphanExpenses.map((ex) => deleteExpense(ex?.id)));
      await deleteSession(session?.id);

      setSessions((prev) => (prev || []).filter((s) => s?.id !== session?.id));
      setAllExpenses((prev) => (prev || []).filter((ex) => ex?.session_id !== session?.id));
    } catch (err) {
      console.error('Delete error:', err);
      alert('Xóa thất bại. Vui lòng thử lại.');
    }
  };

  const emoji = SPORT_EMOJI[session?.sport] || '🎯';

  return (
    <div
      onClick={() => navigate(`/session/${session?.id}`)}
      className="glass-card group cursor-pointer slide-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500/20 to-indigo-500/20 text-2xl">
              {emoji}
            </div>
            <div>
              <p className="font-display text-lg font-semibold text-white">{session?.sport || 'Không tên'}</p>
              <p className="text-sm text-white/40 flex items-center gap-1">
                <Calendar size={12} />
                {formatDate(session?.date)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleDelete}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-white/30 opacity-0 transition-all hover:bg-red-500/10 hover:text-red-400 group-hover:opacity-100"
            >
              <Trash2 size={14} />
            </button>
            <ChevronRight size={18} className="text-white/20 transition-colors group-hover:text-white/60" />
          </div>
        </div>

        {/* Stats row */}
        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
          <div className="flex items-center gap-1.5 text-white/50">
            <Users size={14} />
            <span>{participants.length} người</span>
          </div>
          <span className="text-white/20">•</span>
          <span className="font-semibold text-orange-400">{formatVND(totalCost)}</span>
          <span className="text-white/20">•</span>
          <span className="text-white/40">~{formatVND(Math.round(perPersonShare))}/người</span>
        </div>

        {/* Participant chips */}
        {participants.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {participants.map((p) => {
              const bal = netBalance?.[p] || 0;
              const isOwed = bal < -500;
              const owes = bal > 500;
              return (
                <span
                  key={p}
                  className={`tag ${
                    isOwed
                      ? 'tag-green'
                      : owes
                      ? 'tag-orange'
                      : ''
                  }`}
                >
                  {p}
                </span>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
