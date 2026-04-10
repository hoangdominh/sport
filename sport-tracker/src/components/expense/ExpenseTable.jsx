import { Trash2 } from 'lucide-react';
import { formatVND, formatDate } from '../../lib/utils';

const AVATAR_COLORS = [
  'bg-orange-500/20 text-orange-400',
  'bg-indigo-500/20 text-indigo-400',
  'bg-green-500/20 text-green-400',
  'bg-pink-500/20 text-pink-400',
  'bg-yellow-500/20 text-yellow-400',
  'bg-cyan-500/20 text-cyan-400',
];

function getColor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export default function ExpenseTable({ expenses, onDelete }) {
  if (expenses.length === 0) {
    return (
      <div className="rounded-2xl border border-[#1f1f1f] bg-[#111] p-10 text-center">
        <p className="text-sm text-zinc-500">Chưa có bản ghi nào trong 7 ngày qua.</p>
        <p className="mt-1 text-xs text-zinc-600">Thêm chi tiêu ở trên để bắt đầu 👆</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#1f1f1f] bg-[#111] overflow-hidden">
      <div className="border-b border-[#1f1f1f] px-6 py-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
          Bản ghi ({expenses.length})
        </h2>
      </div>

      <div className="divide-y divide-[#1a1a1a]">
        {expenses
          .slice()
          .reverse()
          .map((e) => (
            <div
              key={e.id}
              className="flex items-center gap-4 px-6 py-3.5 hover:bg-white/[0.02] transition-colors"
            >
              {/* Avatar */}
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${getColor(e.name)}`}
              >
                {e.name.slice(0, 1).toUpperCase()}
              </div>

              {/* Name + mục đích */}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-white">{e.name}</p>
                {e.note && (
                  <p className="text-xs text-zinc-500 truncate">{e.note}</p>
                )}
              </div>

              {/* Date — dùng cột date (user chọn) */}
              <p className="hidden text-xs text-zinc-600 sm:block">
                {e.date ? formatDate(e.date + 'T00:00:00') : formatDate(e.created_at)}
              </p>

              {/* Amount */}
              <p className="text-sm font-semibold text-orange-400">{formatVND(Number(e.amount))}</p>

              {/* Delete */}
              <button
                onClick={() => onDelete(e.id)}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-zinc-600 transition-colors hover:bg-red-500/10 hover:text-red-400"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
      </div>
    </div>
  );
}
