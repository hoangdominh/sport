import { useState, useRef, useEffect } from 'react';
import { X, Plus, Loader2, Calendar, Users, Trophy } from 'lucide-react';
import { addSession } from '../../api/sheetdb';
import { useSport } from '../../context/SportContext';
import { uuid } from '../../lib/utils';

const SPORTS = ['Cầu lông', 'Pickleball', 'Bóng đá', 'Bơi', 'Tennis', 'Khác'];

const DEFAULT_PLAYERS = JSON.parse(
  localStorage.getItem('sport_known_players') ||
  '["MH","Bò sữa","Mạnh","Đại","Chuột","Huy kều","Đoàn bướm"]'
);

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function CreateSessionModal({ onClose }) {
  const { setSessions } = useSport();
  const [sport, setSport] = useState('Cầu lông');
  const [date, setDate] = useState(todayISO);
  const [participants, setParticipants] = useState([]);
  const [customName, setCustomName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const togglePlayer = (name) => {
    setParticipants((prev) =>
      prev.includes(name) ? prev.filter((p) => p !== name) : [...prev, name]
    );
  };

  const addCustom = () => {
    const name = customName.trim();
    if (!name) return;
    if (!participants.includes(name)) setParticipants((prev) => [...prev, name]);
    setCustomName('');
    inputRef.current?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (participants.length < 2) return setError('Cần ít nhất 2 người tham gia');

    setSubmitting(true);
    try {
      const record = {
        id: uuid(),
        sport,
        date,
        participants: participants.join(','),
        created_at: new Date().toISOString(),
      };
      await addSession(record);
      setSessions((prev) => [record, ...prev]);
      onClose();
    } catch {
      setError('Tạo buổi thất bại. Kiểm tra kết nối và thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="modal-content relative z-10 w-full max-w-md scale-in">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500/20 to-indigo-500/20">
              <Trophy size={20} className="text-orange-400" />
            </div>
            <h2 className="font-display text-xl font-bold text-white">Tạo buổi mới</h2>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white/40 hover:bg-white/5 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Sport */}
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-white/60">
              <Trophy size={14} />
              Bộ môn
            </label>
            <div className="flex flex-wrap gap-2">
              {SPORTS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSport(s)}
                  className={`rounded-xl border px-3 py-2 text-sm font-medium transition-all duration-200 ${
                    sport === s
                      ? 'border-orange-500/50 bg-orange-500/10 text-orange-400'
                      : 'border-white/10 bg-white/[0.03] text-white/50 hover:border-white/20 hover:text-white/80'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-white/60">
              <Calendar size={14} />
              Ngày chơi
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="input-glass w-full [color-scheme:dark]"
            />
          </div>

          {/* Participants */}
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-white/60">
              <Users size={14} />
              Thành viên tham gia
              <span className="text-xs text-white/30">({participants.length} người)</span>
            </label>

            {/* Quick select */}
            <div className="mb-3 flex flex-wrap gap-2">
              {DEFAULT_PLAYERS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => togglePlayer(p)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
                    participants.includes(p)
                      ? 'border-indigo-500/50 bg-indigo-500/10 text-indigo-400'
                      : 'border-white/10 bg-white/[0.03] text-white/40 hover:border-white/20 hover:text-white/70'
                  }`}
                >
                  {participants.includes(p) ? '✓ ' : ''}{p}
                </button>
              ))}
            </div>

            {/* Add custom name */}
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustom(); } }}
                placeholder="Thêm tên khác..."
                className="input-glass flex-1"
              />
              <button
                type="button"
                onClick={addCustom}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-white/60 hover:border-white/20 hover:text-white transition-colors"
              >
                <Plus size={18} />
              </button>
            </div>

            {/* Selected tags that aren't in DEFAULT_PLAYERS */}
            {participants.filter((p) => !DEFAULT_PLAYERS.includes(p)).length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {participants
                  .filter((p) => !DEFAULT_PLAYERS.includes(p))
                  .map((p) => (
                    <span
                      key={p}
                      className="flex items-center gap-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs text-indigo-400"
                    >
                      {p}
                      <button
                        type="button"
                        onClick={() => setParticipants((prev) => prev.filter((x) => x !== p))}
                        className="hover:text-white ml-1"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
              </div>
            )}
          </div>

          {error && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3">
              <p className="text-xs text-red-400">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary flex w-full items-center justify-center gap-2"
          >
            {submitting ? <Loader2 size={16} className="animate-spin" /> : null}
            {submitting ? 'Đang tạo...' : 'Tạo buổi'}
          </button>
        </form>
      </div>
    </div>
  );
}
