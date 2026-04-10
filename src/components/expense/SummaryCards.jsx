import { Users, Wallet, TrendingUp } from 'lucide-react';
import { formatVND } from '../../lib/utils';

function Card({ icon: Icon, label, value, accent }) {
  const accentMap = {
    orange: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
    green: 'text-green-400 bg-green-500/10 border-green-500/20',
    indigo: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
  };

  return (
    <div className="rounded-2xl border border-[#1f1f1f] bg-[#111] p-5 flex items-start gap-4">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${accentMap[accent]}`}>
        <Icon size={18} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{label}</p>
        <p className="mt-1 truncate text-xl font-bold text-white">{value}</p>
      </div>
    </div>
  );
}

export default function SummaryCards({ summary }) {
  const { players, totalAmount, average } = summary;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <Card
        icon={Users}
        label="Số người chơi"
        value={`${players.length} người`}
        accent="indigo"
      />
      <Card
        icon={Wallet}
        label="Tổng chi tiêu"
        value={formatVND(totalAmount)}
        accent="orange"
      />
      <Card
        icon={TrendingUp}
        label="Trung bình / người"
        value={formatVND(average)}
        accent="green"
      />
    </div>
  );
}
