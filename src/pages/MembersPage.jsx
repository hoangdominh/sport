import { Users, TrendingDown, TrendingUp, Wallet, Activity } from 'lucide-react';
import { useSport } from '../context/SportContext';
import { formatVND } from '../lib/utils';

function MemberCard({ name, data, index }) {
  const { totalShare, totalPaidOut, netBalance, sessionCount } = data;
  const isOwed = netBalance < -500;
  const owes = netBalance > 500;
  const isSettled = !isOwed && !owes;

  // Calculate percentage of expenses covered
  const percentage = totalShare > 0 ? (totalPaidOut / totalShare) * 100 : 0;

  return (
    <div 
      className="glass-card p-5 slide-up"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center text-lg font-bold text-white">
            {name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-display text-lg font-semibold text-white">{name}</p>
            <p className="text-sm text-white/40">{sessionCount} buổi tham gia</p>
          </div>
        </div>
        <div className={`badge ${isOwed ? 'badge-success' : owes ? 'badge-warning' : 'badge-danger'}`}>
          {isOwed ? <TrendingDown size={12} className="mr-1" /> : owes ? <TrendingUp size={12} className="mr-1" /> : null}
          {isSettled ? 'Đã cân bằng' : isOwed ? 'Được hoàn tiền' : 'Còn nợ'}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="rounded-xl bg-white/[0.03] p-3">
          <p className="text-xs text-white/40 mb-1">Phải đóng</p>
          <p className="font-semibold text-orange-400">{formatVND(Math.round(totalShare))}</p>
        </div>
        <div className="rounded-xl bg-white/[0.03] p-3">
          <p className="text-xs text-white/40 mb-1">Đã ứng</p>
          <p className="font-semibold text-white">{formatVND(Math.round(totalPaidOut))}</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="text-white/40">Tỷ lệ đã ứng</span>
          <span className="text-white/60">{Math.round(percentage)}%</span>
        </div>
        <div className="progress-glass">
          <div 
            className="progress-glass-fill"
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      </div>

      {/* Net Balance */}
      <div className="flex items-center justify-between pt-3 border-t border-white/5">
        <span className="text-sm text-white/40">Công nợ hiện tại</span>
        <span className={`font-display text-lg font-bold ${
          isOwed ? 'text-green-400' : owes ? 'text-orange-400' : 'text-white/60'
        }`}>
          {netBalance > 0 ? '+' : ''}{formatVND(Math.round(netBalance))}
        </span>
      </div>
    </div>
  );
}

function SummaryStat({ icon: Icon, label, value, color }) {
  const colorClasses = {
    orange: 'text-orange-400 bg-orange-500/10',
    green: 'text-green-400 bg-green-500/10',
    purple: 'text-purple-400 bg-purple-500/10',
    blue: 'text-blue-400 bg-blue-500/10',
  };

  return (
    <div className="glass-card p-5 flex items-center gap-4">
      <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${colorClasses[color]}`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-sm text-white/40">{label}</p>
        <p className="font-display text-xl font-bold text-white">{value}</p>
      </div>
    </div>
  );
}

export default function MembersPage() {
  const { sessions = [], allExpenses, overallSummary = {}, loading } = useSport();
  const { totalShare = {}, totalPaidOut = {}, netBalance = {}, allPlayers = [] } = overallSummary;

  // Calculate per-member data
  const memberData = (allPlayers || []).map(name => {
    // Count sessions this member participated in
    const sessionCount = (sessions || []).filter(s => 
      s?.participants?.split(',').map(p => p.trim()).includes(name)
    ).length;

    return {
      name,
      totalShare: totalShare[name] || 0,
      totalPaidOut: totalPaidOut[name] || 0,
      netBalance: netBalance[name] || 0,
      sessionCount,
    };
  }).sort((a, b) => Math.abs(b.netBalance) - Math.abs(a.netBalance));

  // Calculate totals
  const totalMembers = (allPlayers || []).length;
  const totalDebt = Object.values(netBalance || {}).reduce((sum, bal) => 
    bal > 0 ? sum + bal : sum, 0
  );
  const totalCredit = Object.values(netBalance || {}).reduce((sum, bal) => 
    bal < 0 ? sum + Math.abs(bal) : sum, 0
  );
  const settledCount = (memberData || []).filter(m => Math.abs(m?.netBalance || 0) <= 500).length;

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="slide-up">
        <p className="section-title">Thành viên</p>
        <h1 className="font-display text-3xl font-bold text-white tracking-tight">
          Quản lý thành viên
        </h1>
        <p className="mt-1 text-white/50">
          Theo dõi công nợ và chi tiêu của từng thành viên trong nhóm
        </p>
      </div>

      {loading ? (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="glass-card h-24 animate-pulse" />
            ))}
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="glass-card h-64 animate-pulse" />
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* Summary Stats */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 slide-up" style={{ animationDelay: '100ms' }}>
            <SummaryStat
              icon={Users}
              label="Tổng thành viên"
              value={totalMembers}
              color="purple"
            />
            <SummaryStat
              icon={TrendingUp}
              label="Tổng nợ phải thu"
              value={formatVND(Math.round(totalDebt))}
              color="orange"
            />
            <SummaryStat
              icon={TrendingDown}
              label="Tổng tiền phải trả"
              value={formatVND(Math.round(totalCredit))}
              color="green"
            />
            <SummaryStat
              icon={Activity}
              label="Đã cân bằng"
              value={`${settledCount}/${totalMembers}`}
              color="blue"
            />
          </div>

          {/* Members Grid */}
          {memberData.length === 0 ? (
            <div className="glass-card p-12 text-center slide-up" style={{ animationDelay: '200ms' }}>
              <div className="text-5xl mb-4">👥</div>
              <p className="text-lg font-medium text-white mb-1">Chưa có thành viên nào</p>
              <p className="text-sm text-white/40">Tạo buổi chơi để thêm thành viên</p>
            </div>
          ) : (
            <div>
              <p className="section-title slide-up" style={{ animationDelay: '200ms' }}>
                Chi tiết từng thành viên
              </p>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {memberData.map((member, index) => (
                  <MemberCard
                    key={member.name}
                    name={member.name}
                    data={member}
                    index={index}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Debt Summary Explanation */}
          {memberData.length > 0 && (
            <div className="glass-card p-6 slide-up" style={{ animationDelay: `${memberData.length * 50 + 200}ms` }}>
              <h3 className="font-display text-lg font-semibold text-white mb-4">Giải thích công nợ</h3>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-500/10">
                    <TrendingDown size={16} className="text-green-400" />
                  </div>
                  <div>
                    <p className="font-medium text-white text-sm">Được hoàn tiền</p>
                    <p className="text-xs text-white/40 mt-0.5">
                      Thành viên đã ứng nhiều hơn số tiền phải đóng, cần được hoàn lại.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-500/10">
                    <TrendingUp size={16} className="text-orange-400" />
                  </div>
                  <div>
                    <p className="font-medium text-white text-sm">Còn nợ</p>
                    <p className="text-xs text-white/40 mt-0.5">
                      Thành viên chưa ứng đủ tiền phải đóng, cần thanh toán thêm.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10">
                    <Activity size={16} className="text-white/60" />
                  </div>
                  <div>
                    <p className="font-medium text-white text-sm">Đã cân bằng</p>
                    <p className="text-xs text-white/40 mt-0.5">
                      Số tiền đã ứng xấp xỉ số tiền phải đóng (chênh lệch {'<'} 500đ).
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
