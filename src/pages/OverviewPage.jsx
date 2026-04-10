import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Wallet, 
  Activity,
  ArrowRight,
  Calendar,
  Trophy,
  ChevronRight
} from 'lucide-react';
import { useSport } from '../context/SportContext';
import { formatVND, formatDate } from '../lib/utils';
import SessionCard from '../components/session/SessionCard';
import CreateSessionModal from '../components/session/CreateSessionModal';

function StatCard({ title, value, subtitle, icon: Icon, trend, trendUp, delay = 0 }) {
  return (
    <div 
      className="glass-card stat-glow p-6 slide-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-white/50 mb-1">{title}</p>
          <p className="font-display text-2xl font-bold text-white">{value}</p>
          {subtitle && (
            <p className="text-xs text-white/40 mt-1">{subtitle}</p>
          )}
          {trend && (
            <div className={`flex items-center gap-1 mt-2 text-xs ${trendUp ? 'text-green-400' : 'text-orange-400'}`}>
              {trendUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              <span>{trend}</span>
            </div>
          )}
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5">
          <Icon size={24} className="text-orange-400" />
        </div>
      </div>
    </div>
  );
}

function QuickSessionCard({ session, expenses, delay = 0 }) {
  // Safety check
  if (!session) return null;
  
  const totalExpenses = (expenses || [])
    .filter(e => e?.session_id === session?.id)
    .reduce((sum, e) => sum + (Number(e?.amount) || 0), 0);
  
  const participants = (session?.participants || '').split(',').map(p => p.trim()).filter(Boolean);
  const perPerson = participants.length > 0 ? totalExpenses / participants.length : 0;

  return (
    <Link
      to={`/session/${session.id}`}
      className="glass-card p-4 flex items-center gap-4 group slide-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500/20 to-indigo-500/20">
        <span className="text-xl">🏸</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-white truncate">{session.sport || 'Không tên'}</p>
        <p className="text-xs text-white/40 flex items-center gap-1">
          <Calendar size={10} />
          {formatDate(session.date)}
        </p>
      </div>
      <div className="text-right">
        <p className="font-semibold text-orange-400">{formatVND(totalExpenses)}</p>
        <p className="text-xs text-white/40">{participants.length} người</p>
      </div>
      <ChevronRight size={16} className="text-white/20 group-hover:text-white/60 transition-colors" />
    </Link>
  );
}

function DebtCard({ name, amount, isOwed, delay = 0 }) {
  if (!name) return null;
  
  return (
    <div 
      className="glass-card p-4 flex items-center justify-between slide-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center text-sm font-bold text-white">
          {name.charAt(0).toUpperCase()}
        </div>
        <span className="font-medium text-white">{name}</span>
      </div>
      <div className={`badge ${isOwed ? 'badge-success' : 'badge-warning'}`}>
        {isOwed ? '+' : '-'}{formatVND(Math.abs(amount || 0))}
      </div>
    </div>
  );
}

function SkeletonStat() {
  return (
    <div className="glass-card p-6 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="h-4 w-20 rounded bg-white/10" />
          <div className="h-8 w-32 rounded bg-white/10" />
        </div>
        <div className="h-12 w-12 rounded-xl bg-white/5" />
      </div>
    </div>
  );
}

export default function OverviewPage() {
  const { sessions = [], allExpenses = [], overallSummary = { allPlayers: [], netBalance: {} }, loading, error, refetch } = useSport();
  const [showCreate, setShowCreate] = useState(false);

  // Calculate stats with safety checks
  const totalSessions = sessions?.length || 0;
  const totalAmount = (sessions || []).reduce((sum, session) => {
    const sessionExpenses = (allExpenses || []).filter(e => e?.session_id === session?.id);
    return sum + sessionExpenses.reduce((s, e) => s + (Number(e?.amount) || 0), 0);
  }, 0);
  
  const totalParticipants = new Set(
    (sessions || []).flatMap(s => (s?.participants || '').split(',').map(p => p.trim()).filter(Boolean))
  ).size;
  
  const avgPerSession = totalSessions > 0 ? totalAmount / totalSessions : 0;

  // Get recent sessions (last 3)
  const recentSessions = (sessions || []).slice(0, 3);

  // Get debt summary (top 5)
  const debts = (overallSummary?.allPlayers || [])
    .map(name => ({
      name,
      amount: overallSummary?.netBalance?.[name] || 0,
    }))
    .sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount))
    .slice(0, 5);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="text-4xl mb-4">⚠️</div>
        <p className="text-white/60 mb-4">Có lỗi khi tải dữ liệu</p>
        <button onClick={refetch} className="btn-primary">Thử lại</button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 slide-up">
        <div>
          <p className="section-title">Dashboard</p>
          <h1 className="font-display text-4xl font-bold text-white tracking-tight">
            Xin chào! 👋
          </h1>
          <p className="mt-2 text-white/50">
            Theo dõi chi tiêu nhóm và quản lý các buổi chơi
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="btn-primary flex items-center gap-2 shrink-0"
        >
          <Plus size={18} />
          <span className="hidden sm:inline">Tạo buổi mới</span>
        </button>
      </div>

      {/* Stats Grid */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => <SkeletonStat key={i} />)}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 stagger-children">
          <StatCard
            title="Tổng buổi chơi"
            value={totalSessions}
            subtitle="Buổi đã tạo"
            icon={Trophy}
            delay={0}
          />
          <StatCard
            title="Tổng chi tiêu"
            value={formatVND(totalAmount)}
            subtitle="Tất cả các buổi"
            icon={Wallet}
            delay={100}
          />
          <StatCard
            title="Thành viên"
            value={totalParticipants}
            subtitle="Người tham gia"
            icon={Users}
            delay={200}
          />
          <StatCard
            title="TB mỗi buổi"
            value={formatVND(avgPerSession)}
            subtitle="Chi phí trung bình"
            icon={Activity}
            delay={300}
          />
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Sessions */}
        <div className="lg:col-span-2 space-y-4 slide-up" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center justify-between">
            <p className="section-title mb-0">Buổi chơi gần đây</p>
            <Link 
              to="/expenses" 
              className="text-sm text-orange-400 hover:text-orange-300 flex items-center gap-1 transition-colors"
            >
              Xem tất cả
              <ArrowRight size={14} />
            </Link>
          </div>
          
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="glass-card p-4 animate-pulse">
                  <div className="h-16 rounded bg-white/5" />
                </div>
              ))}
            </div>
          ) : sessions.length === 0 ? (
            <div className="glass-card p-8 text-center">
              <div className="text-4xl mb-3">🏸</div>
              <p className="text-white/60 font-medium">Chưa có buổi chơi nào</p>
              <p className="text-sm text-white/40 mt-1">Tạo buổi đầu tiên để bắt đầu</p>
              <button
                onClick={() => setShowCreate(true)}
                className="btn-secondary mt-4 inline-flex items-center gap-2"
              >
                <Plus size={16} />
                Tạo buổi mới
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {recentSessions.map((session, index) => (
                <QuickSessionCard
                  key={session?.id || index}
                  session={session}
                  expenses={allExpenses}
                  delay={300 + index * 50}
                />
              ))}
            </div>
          )}
        </div>

        {/* Debt Summary */}
        <div className="space-y-4 slide-up" style={{ animationDelay: '300ms' }}>
          <div className="flex items-center justify-between">
            <p className="section-title mb-0">Công nợ nhanh</p>
            <Link 
              to="/members" 
              className="text-sm text-orange-400 hover:text-orange-300 flex items-center gap-1 transition-colors"
            >
              Chi tiết
              <ArrowRight size={14} />
            </Link>
          </div>
          
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="glass-card p-4 animate-pulse">
                  <div className="h-12 rounded bg-white/5" />
                </div>
              ))}
            </div>
          ) : debts.length === 0 ? (
            <div className="glass-card p-6 text-center">
              <p className="text-white/50 text-sm">Chưa có dữ liệu công nợ</p>
            </div>
          ) : (
            <div className="space-y-3">
              {debts.map((debt, index) => (
                <DebtCard
                  key={debt?.name || index}
                  name={debt?.name}
                  amount={debt?.amount}
                  isOwed={debt?.amount < 0}
                  delay={400 + index * 50}
                />
              ))}
            </div>
          )}
          
          {/* Quick Action Card - Create Session */}
          <div className="glass-card-primary p-5 slide-up" style={{ animationDelay: '600ms' }}>
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10">
                <Calendar size={20} className="text-orange-400" />
              </div>
              <div>
                <p className="font-medium text-white">Tạo buổi mới</p>
                <p className="text-sm text-white/50 mt-1">
                  Thêm buổi chơi mới để quản lý chi tiêu
                </p>
                <button 
                  onClick={() => setShowCreate(true)}
                  className="inline-flex items-center gap-1 mt-3 text-sm text-orange-400 hover:text-orange-300 transition-colors"
                >
                  Tạo buổi
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showCreate && <CreateSessionModal onClose={() => setShowCreate(false)} />}
    </div>
  );
}
