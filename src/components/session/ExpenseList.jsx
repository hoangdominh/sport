import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Trash2, Loader2, Receipt, ChevronDown, Check } from 'lucide-react';
import { addExpense, deleteExpense } from '../../api/sheetdb';
import { useSport } from '../../context/SportContext';
import { formatVND, uuid } from '../../lib/utils';

const PURPOSES = ['Tiền sân', 'Tiền cầu', 'Tiền nước', 'Thuê vợt', 'Khác'];

function CustomSelect({ value, onChange, options, placeholder }) {
  const [open, setOpen] = useState(false);
  const [rect, setRect] = useState(null);
  const btnRef = useRef(null);
  const justOpenedRef = useRef(false);

  useEffect(() => {
    const handler = (e) => {
      if (justOpenedRef.current) {
        justOpenedRef.current = false;
        return;
      }
      if (btnRef.current && !btnRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleOpen = (e) => {
    e.stopPropagation();
    if (btnRef.current) {
      setRect(btnRef.current.getBoundingClientRect());
    }
    justOpenedRef.current = true;
    setOpen((p) => !p);
  };

const selected = options.find((o) => o.value === value);

  return (
    <div className="relative">
      <button
        ref={btnRef}
        type="button"
        onClick={handleOpen}
        className="input-glass w-full flex items-center justify-between gap-2 text-left"
      >
        <span className={selected ? 'text-white' : 'text-white/30'}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          size={14}
          className={`shrink-0 text-white/40 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && rect && createPortal(
        <div
          style={{
            position: 'fixed',
            top: rect.bottom + 4,
            left: rect.left,
            width: rect.width,
            zIndex: 9999,
          }}
          className="rounded-xl border border-white/10 bg-[#1a1a1f] shadow-xl shadow-black/60 overflow-hidden"
        >
          {options.map((o) => (
            <button
              key={o.value}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => { onChange(o.value); setOpen(false); }}
              className="flex w-full items-center justify-between px-4 py-2.5 text-sm text-left transition-colors hover:bg-white/[0.06]"
            >
              <span className={o.value === value ? 'text-orange-400 font-medium' : 'text-white/80'}>
                {o.label}
              </span>
              {o.value === value && <Check size={13} className="text-orange-400 shrink-0" />}
            </button>
          ))}
        </div>,
        document.body
      )}
    </div>
  );
}

export default function ExpenseList({ session }) {
  const { allExpenses = [], setAllExpenses } = useSport();
  const sessionExpenses = (allExpenses || []).filter((e) => e?.session_id === session?.id);
  const participants = session?.participants?.split(',').map((p) => p.trim()).filter(Boolean) || [];

  const [payer, setPayer] = useState(participants[0] || '');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [error, setError] = useState('');

  const handleAdd = async (e) => {
    e.preventDefault();
    setError('');
    if (!payer) return setError('Chọn người chi');
    const amt = Number(amount);
    if (!amt || amt <= 0) return setError('Nhập số tiền hợp lệ');

    setSubmitting(true);
    try {
      const record = {
        id: uuid(),
        session_id: session.id,
        payer,
        amount: String(amt),
        note: note.trim() || '',
        created_at: new Date().toISOString(),
      };
      await addExpense(record);
      setAllExpenses((prev) => [...prev, record]);
      setAmount('');
      setNote('');
    } catch {
      setError('Thêm thất bại. Thử lại nhé!');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    setDeleting(id);
    try {
      await deleteExpense(id);
      setAllExpenses((prev) => prev.filter((e) => e.id !== id));
    } catch {
      alert('Xóa thất bại');
    } finally {
      setDeleting(null);
    }
  };

  const totalAmount = sessionExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  const payerOptions = participants.map((p) => ({ value: p, label: p }));
  const purposeOptions = [
    { value: '', label: '-- Mục đích --' },
    ...PURPOSES.map((p) => ({ value: p, label: p })),
  ];

  return (
    <div className="glass-card overflow-hidden">
      <div className="p-5 border-b border-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500/20 to-purple-500/20">
              <Receipt size={20} className="text-orange-400" />
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-white">Chi phí buổi này</h3>
              <p className="text-sm text-white/40">{sessionExpenses.length} khoản chi tiêu</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-white/40">Tổng</p>
            <p className="font-display text-xl font-bold text-orange-400">{formatVND(totalAmount)}</p>
          </div>
        </div>
      </div>

      <div className="p-5">
        {/* Expense list */}
        {sessionExpenses.length > 0 ? (
          <div className="mb-5 space-y-2">
            {sessionExpenses.map((exp) => (
              <div key={exp.id} className="group flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-white/10 to-white/5 text-sm font-semibold text-orange-400">
                  {exp.payer?.slice(0, 2) || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">{exp.payer}</p>
                  {exp.note && <p className="text-xs text-white/40">{exp.note}</p>}
                </div>
                <span className="text-sm font-semibold text-white tabular-nums">
                  {formatVND(Number(exp.amount))}
                </span>
                <button
                  onClick={() => handleDelete(exp.id)}
                  disabled={deleting === exp.id}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-white/20 opacity-0 transition-all hover:bg-red-500/10 hover:text-red-400 group-hover:opacity-100 disabled:opacity-50"
                >
                  {deleting === exp.id ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Trash2 size={14} />
                  )}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="mb-5 py-8 text-center">
            <div className="text-4xl mb-2">💸</div>
            <p className="text-sm text-white/40">Chưa có chi phí nào. Thêm bên dưới.</p>
          </div>
        )}

        {/* Add form */}
        <form onSubmit={handleAdd} className="space-y-3">
          <div className="grid gap-2 sm:grid-cols-4">
            {/* Payer */}
            <CustomSelect
              value={payer}
              onChange={setPayer}
              options={payerOptions}
              placeholder="Chọn người..."
            />

            {/* Amount */}
            <input
              type="number"
              min="1"
              placeholder="Số tiền (VND)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="input-glass sm:col-span-1"
            />

            {/* Note */}
            <CustomSelect
              value={note}
              onChange={setNote}
              options={purposeOptions}
              placeholder="-- Mục đích --"
            />

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary flex items-center justify-center gap-2 sm:col-span-1"
            >
              {submitting ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
              Thêm
            </button>
          </div>

          {error && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3">
              <p className="text-xs text-red-400">{error}</p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
