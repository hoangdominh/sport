import { useState } from 'react';
import { Plus, RefreshCw, AlertCircle, TrendingDown, TrendingUp, Search } from 'lucide-react';
import { useSport } from '../context/SportContext';
import SessionCard from '../components/session/SessionCard';
import CreateSessionModal from '../components/session/CreateSessionModal';
import { formatVND } from '../lib/utils';

function Skeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="glass-card h-32 animate-pulse" />
      ))}
    </div>
  );
}

function SummaryTable({ overallSummary }) {
  // Safety checks
  if (!overallSummary) return null;
  
  const { totalShare = {}, totalPaidOut = {}, netBalance = {}, allPlayers = [] } = overallSummary;
  
  if (!allPlayers || allPlayers.length === 0) return null;

  return (
    <div className="glass-card overflow-hidden slide-up">
      <div className="p-5 border-b border-white/5">
        <h2 className="font-display text-lg font-semibold text-white">Tổng kết tất cả các buổi</h2>
        <p className="text-sm text-white/40 mt-1">Tổng hợp chi tiêu và công nợ của tất cả thành viên</p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th className="pl-5">Thành viên</th>
              <th className="text-right">Phải đóng</th>
              <th className="text-right">Đã ứng</th>
              <th className="text-right pr-5">Công nợ</th>
            </tr>
          </thead>
          <tbody>
            {allPlayers.map((p) => {
              const bal = netBalance?.[p] || 0;
              const isOwed = bal < -500;
              const owes = bal > 500;
              
              return (
                <tr key={p}>
                  <td className="pl-5">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center text-sm font-bold text-white">
                        {p?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <span className="font-medium text-white">{p}</span>
                    </div>
                  </td>
                  <td className="text-right text-orange-400">
                    {formatVND(Math.round(totalShare?.[p] || 0))}
                  </td>
                  <td className="text-right text-white/60">
                    {formatVND(Math.round(totalPaidOut?.[p] || 0))}
                  </td>
                  <td className="text-right pr-5">
                    <span className={`badge ${isOwed ? 'badge-success' : owes ? 'badge-warning' : 'badge-danger'}`}>
                      {isOwed ? <TrendingDown size={10} className="mr-1" /> : owes ? <TrendingUp size={10} className="mr-1" /> : null}
                      {bal > 0 ? '+' : ''}{formatVND(Math.round(bal))}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      <div className="p-4 bg-white/[0.02] border-t border-white/5">
        <div className="flex items-center gap-6 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400" />
            <span className="text-white/50">Xanh = được hoàn tiền</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-orange-400" />
            <span className="text-white/50">Cam = còn nợ</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ExpensePage() {
  const { sessions = [], overallSummary = { allPlayers: [] }, loading, error, refetch } = useSport();
  const [showCreate, setShowCreate] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter sessions by search with safety checks
  const filteredSessions = (sessions || []).filter(session => {
    const nameMatch = (session?.sport || '').toLowerCase().includes(searchQuery.toLowerCase());
    const participantsMatch = (session?.participants || '').toLowerCase().includes(searchQuery.toLowerCase());
    return nameMatch || participantsMatch;
  });

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 slide-up">
        <div>
          <p className="section-title">Chi tiêu</p>
          <h1 className="font-display text-3xl font-bold text-white tracking-tight">
            Các buổi chơi
          </h1>
          <p className="mt-1 text-white/50">
            Quản lý chi tiêu và theo dõi công nợ cho từng buổi
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="btn-primary flex items-center gap-2 self-start"
        >
          <Plus size={18} />
          Tạo buổi mới
        </button>
      </div>

      {loading && <Skeleton />}

      {error && (
        <div className="glass-card p-6 space-y-4 slide-up">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/10">
              <AlertCircle size={20} className="text-red-400" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-white">Chưa kết nối được với Google Sheets</p>
              <p className="text-sm text-white/40">Vui lòng kiểm tra cấu hình kết nối</p>
            </div>
            <button
              onClick={refetch}
              className="btn-secondary flex items-center gap-2"
            >
              <RefreshCw size={14} /> Thử lại
            </button>
          </div>

          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 space-y-3 text-sm">
            <p className="font-medium text-white">Làm theo 3 bước sau:</p>
            <div className="space-y-3">
              <div className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-500/20 text-xs font-bold text-orange-400">1</span>
                <span className="text-white/60">
                  Mở Google Sheet → <strong className="text-white">Extensions → Apps Script</strong> → Dán nội dung file{' '}
                  <code className="rounded bg-white/10 px-1.5 py-0.5 text-xs text-orange-300">SETUP_GOOGLE_SHEET.js</code>{' '}
                  → Chạy hàm <code className="rounded bg-white/10 px-1.5 py-0.5 text-xs text-orange-300">setupSportTracker</code>
                </span>
              </div>
              <div className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-500/20 text-xs font-bold text-orange-400">2</span>
                <span className="text-white/60">
                  Vào <strong className="text-white">sheetdb.io</strong> → Create → Dán link Google Sheet → Copy API URL
                </span>
              </div>
              <div className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-500/20 text-xs font-bold text-orange-400">3</span>
                <span className="text-white/60">
                  Mở file <code className="rounded bg-white/10 px-1.5 py-0.5 text-xs text-orange-300">.env</code>{' '}
                  → thay <code className="rounded bg-white/10 px-1.5 py-0.5 text-xs text-white/60">VITE_SHEETDB_URL=</code> bằng URL vừa copy → restart{' '}
                  <code className="rounded bg-white/10 px-1.5 py-0.5 text-xs text-orange-300">npm run dev</code>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {!loading && !error && (
        <div className="space-y-6 slide-up">
          {/* Summary Table */}
          {overallSummary?.allPlayers?.length > 0 && (
            <SummaryTable overallSummary={overallSummary} />
          )}

          {/* Sessions List */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <p className="section-title mb-0">Danh sách buổi chơi</p>
                <p className="text-sm text-white/40">
                  {filteredSessions.length} buổi {searchQuery && '(đã lọc)'}
                </p>
              </div>
              
              {/* Search */}
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  placeholder="Tìm buổi chơi..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-glass pl-10 w-full sm:w-64"
                />
              </div>
            </div>

            {filteredSessions.length === 0 ? (
              <div className="glass-card p-12 text-center">
                <div className="text-5xl mb-4">🏸</div>
                <p className="text-lg font-medium text-white mb-1">
                  {searchQuery ? 'Không tìm thấy buổi nào' : 'Chưa có buổi chơi nào'}
                </p>
                <p className="text-sm text-white/40 mb-6">
                  {searchQuery ? 'Thử tìm kiếm với từ khóa khác' : 'Tạo buổi đầu tiên để bắt đầu theo dõi chi tiêu'}
                </p>
                <button
                  onClick={() => setShowCreate(true)}
                  className="btn-primary inline-flex items-center gap-2"
                >
                  <Plus size={16} /> Tạo buổi mới
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredSessions.map((session, index) => (
                  <SessionCard 
                    key={session?.id || index} 
                    session={session} 
                    delay={index * 50}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {showCreate && <CreateSessionModal onClose={() => setShowCreate(false)} />}
    </div>
  );
}
