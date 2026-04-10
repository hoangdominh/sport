import { formatVND } from '../../lib/utils';

const AVATAR_COLORS = [
  'from-orange-500 to-red-500',
  'from-indigo-500 to-purple-500',
  'from-green-500 to-teal-500',
  'from-pink-500 to-rose-500',
  'from-yellow-500 to-orange-500',
  'from-cyan-500 to-blue-500',
];

function getGradient(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export default function PersonBreakdown({ perPerson, totalAmount }) {
  const entries = Object.entries(perPerson).sort((a, b) => b[1] - a[1]);

  if (entries.length === 0) return null;

  return (
    <div className="rounded-2xl border border-[#1f1f1f] bg-[#111] p-6">
      <h2 className="mb-5 text-sm font-semibold uppercase tracking-wider text-zinc-400">
        Chi tiết từng người
      </h2>
      <div className="space-y-4">
        {entries.map(([name, amount]) => {
          const pct = totalAmount > 0 ? (amount / totalAmount) * 100 : 0;
          return (
            <div key={name}>
              <div className="mb-1.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br ${getGradient(name)} text-xs font-bold text-white`}
                  >
                    {name.slice(0, 1).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-white">{name}</span>
                </div>
                <span className="text-sm font-semibold text-orange-400">{formatVND(amount)}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-[#1f1f1f]">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${getGradient(name)} transition-all duration-500`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="mt-1 text-right text-xs text-zinc-600">{pct.toFixed(1)}%</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
