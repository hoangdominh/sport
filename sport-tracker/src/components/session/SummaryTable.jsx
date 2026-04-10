import { useState } from 'react';
import { Check, Loader2, TrendingUp, TrendingDown, Minus, Calculator } from 'lucide-react';
import { addPaymentRow, deletePaymentRow } from '../../api/sheetdb';
import { useSport } from '../../context/SportContext';
import { formatVND, uuid } from '../../lib/utils';

export default function SummaryTable({ session, summary }) {
  const { allPayments, setAllPayments } = useSport();
  const { participants, totalCost, perPersonShare, paidByPerson, netBalance } = summary;
  const [toggling, setToggling] = useState(null); // player name being toggled

  const hasPaid = (player) =>
    allPayments.some((p) => p.session_id === session.id && p.player === player);

  const togglePayment = async (player) => {
    setToggling(player);
    try {
      const existing = allPayments.find(
        (p) => p.session_id === session.id && p.player === player
      );
      if (existing) {
        await deletePaymentRow(existing.id);
        setAllPayments((prev) => prev.filter((p) => p.id !== existing.id));
      } else {
        const row = { id: uuid(), session_id: session.id, player, created_at: new Date().toISOString() };
        await addPaymentRow(row);
        setAllPayments((prev) => [...prev, row]);
      }
    } catch {
      alert('Cập nhật thất bại. Thử lại nhé!');
    } finally {
      setToggling(null);
    }
  };

  if (participants.length === 0) return null;

  return (
    <div className="glass-card overflow-hidden">
      <div className="p-5 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20">
            <Calculator size={20} className="text-indigo-400" />
          </div>
          <div>
            <h3 className="font-display text-lg font-semibold text-white">Phân chia chi tiết</h3>
            <p className="text-sm text-white/40">Tính toán công nợ cho từng thành viên</p>
          </div>
        </div>
      </div>

      <div className="p-5">
        {/* Totals */}
        <div className="mb-6 grid grid-cols-3 gap-4">
          <div className="rounded-xl bg-white/[0.03] p-4">
            <p className="text-xs text-white/40 mb-1">Tổng chi phí</p>
            <p className="font-display text-lg font-bold text-white">{formatVND(totalCost)}</p>
          </div>
          <div className="rounded-xl bg-white/[0.03] p-4">
            <p className="text-xs text-white/40 mb-1">Số người</p>
            <p className="font-display text-lg font-bold text-white">{participants.length}</p>
          </div>
          <div className="rounded-xl bg-white/[0.03] p-4">
            <p className="text-xs text-white/40 mb-1">Mỗi người trả</p>
            <p className="font-display text-lg font-bold text-orange-400">
              {formatVND(Math.round(perPersonShare))}
            </p>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th className="pl-0">Thành viên</th>
                <th className="text-right">Đã ứng</th>
                <th className="text-right">Phải trả</th>
                <th className="text-right">Chênh lệch</th>
                <th className="text-center pr-0">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {participants.map((player) => {
                const paid = paidByPerson[player] || 0;
                const share = perPersonShare;
                const bal = netBalance[player] || 0; // positive = owes, negative = owed back
                const isOwed = bal < -500;
                const owes = bal > 500;
                const paid_status = hasPaid(player);
                const isToggling = toggling === player;

                return (
                  <tr key={player}>
                    <td className="pl-0">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center text-sm font-semibold text-white">
                          {player.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-white">{player}</span>
                      </div>
                    </td>

                    <td className="text-right">
                      {paid > 0 ? (
                        <span className="text-white/60">{formatVND(paid)}</span>
                      ) : (
                        <span className="text-white/20">—</span>
                      )}
                    </td>

                    <td className="text-right">
                      <span className="text-white/60">{formatVND(Math.round(share))}</span>
                    </td>

                    <td className="text-right">
                      <span className={`font-semibold ${
                        isOwed ? 'text-green-400' : owes ? 'text-orange-400' : 'text-white/40'
                      }`}>
                        {bal > 0 ? '+' : ''}{formatVND(Math.round(bal))}
                      </span>
                    </td>

                    <td className="text-center pr-0">
                      {isOwed ? (
                        <span className="badge badge-success">
                          <TrendingDown size={10} className="mr-1" /> Được hoàn
                        </span>
                      ) : owes ? (
                        <button
                          onClick={() => togglePayment(player)}
                          disabled={isToggling}
                          className={`badge transition-all ${
                            paid_status ? 'bg-indigo-500/20 text-indigo-400 hover:bg-red-500/20 hover:text-red-400' : 'badge-warning'
                          }`}
                        >
                          {isToggling ? (
                            <Loader2 size={10} className="animate-spin mr-1" />
                          ) : paid_status ? (
                            <Check size={10} className="mr-1" />
                          ) : (
                            <TrendingUp size={10} className="mr-1" />
                          )}
                          {paid_status ? 'Đã trả' : 'Còn nợ'}
                        </button>
                      ) : (
                        <span className="text-white/20">
                          <Minus size={14} className="inline" />
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
