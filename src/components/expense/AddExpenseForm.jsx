import { useState } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

const QUICK_NAMES = ['Hoàng', 'An', 'Bình', 'Cường', 'Duy', 'Phong', 'Minh', 'Tuấn'];
const QUICK_PURPOSES = ['Đặt sân', 'Mua cầu', 'Nước uống', 'Thuê vợt', 'Khác'];

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function Label({ children }) {
  return (
    <label className="mb-1.5 block text-xs font-medium text-zinc-400">{children}</label>
  );
}

export default function AddExpenseForm({ onAdd, submitting }) {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [purpose, setPurpose] = useState('');
  const [date, setDate] = useState(todayISO);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) return setError('Vui lòng nhập tên');
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0)
      return setError('Vui lòng nhập số tiền hợp lệ');
    if (!date) return setError('Vui lòng chọn ngày');

    try {
      await onAdd({ name, amount, note: purpose, date });
      setName('');
      setAmount('');
      setPurpose('');
      setDate(todayISO());
    } catch (err) {
      setError(err.message);
    }
  };

  const inputCls =
    'w-full rounded-xl border border-[#1f1f1f] bg-[#0a0a0a] px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-zinc-600 focus:outline-none transition-colors';

  return (
    <div className="rounded-2xl border border-[#1f1f1f] bg-[#111] p-6">
      <h2 className="mb-5 text-sm font-semibold uppercase tracking-wider text-zinc-400">
        Thêm chi tiêu
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Tên */}
        <div>
          <Label>Tên</Label>
          <input
            type="text"
            placeholder="VD: Hoàng"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputCls}
          />
          <div className="mt-2 flex flex-wrap gap-1.5">
            {QUICK_NAMES.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setName(n)}
                className={cn(
                  'rounded-full border px-3 py-0.5 text-xs font-medium transition-colors duration-150',
                  name === n
                    ? 'border-orange-500/50 bg-orange-500/10 text-orange-400'
                    : 'border-[#1f1f1f] text-zinc-500 hover:border-zinc-600 hover:text-zinc-300',
                )}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Số tiền + Ngày */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Số tiền đã chi (VND)</Label>
            <input
              type="number"
              placeholder="VD: 2000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={inputCls}
              min="0"
            />
          </div>
          <div>
            <Label>Ngày</Label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={cn(inputCls, 'cursor-pointer')}
            />
          </div>
        </div>

        {/* Mục đích */}
        <div>
          <Label>Mục đích</Label>
          <input
            type="text"
            placeholder="VD: Đặt sân"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            className={inputCls}
          />
          <div className="mt-2 flex flex-wrap gap-1.5">
            {QUICK_PURPOSES.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPurpose(p)}
                className={cn(
                  'rounded-full border px-3 py-0.5 text-xs font-medium transition-colors duration-150',
                  purpose === p
                    ? 'border-indigo-500/50 bg-indigo-500/10 text-indigo-400'
                    : 'border-[#1f1f1f] text-zinc-500 hover:border-zinc-600 hover:text-zinc-300',
                )}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-xs text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-white py-2.5 text-sm font-semibold text-black transition-colors hover:bg-zinc-200 disabled:opacity-50"
        >
          {submitting ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <Plus size={15} />
          )}
          {submitting ? 'Đang thêm...' : 'Thêm bản ghi'}
        </button>
      </form>
    </div>
  );
}
