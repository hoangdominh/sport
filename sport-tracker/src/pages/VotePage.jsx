import { useState } from 'react';
import { useVotes } from '../hooks/useVotes';
import VoteSection from '../components/vote/VoteSection';
import { AlertCircle, RefreshCw, User, Calendar, Trophy } from 'lucide-react';

const VOTER_KEY = 'sporttracker_voter';

function Skeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {[1, 2].map(i => (
        <div key={i} className="glass-card h-80 animate-pulse" />
      ))}
    </div>
  );
}

function VoterCard({ voter, voterInput, setVoterInput, voterSaved, setVoterSaved, onSave }) {
  return (
    <div className="glass-card p-5 slide-up">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20">
          <User size={22} className="text-indigo-400" />
        </div>
        <div className="flex-1">
          <p className="font-medium text-white mb-1">Tên của bạn</p>
          <p className="text-xs text-white/40">Nhập tên để tham gia vote</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Nhập tên..."
            value={voterInput}
            onChange={(e) => { setVoterInput(e.target.value); setVoterSaved(false); }}
            onKeyDown={(e) => e.key === 'Enter' && onSave()}
            className="input-glass w-40 sm:w-48"
          />
          <button
            onClick={onSave}
            disabled={voterSaved || !voterInput.trim()}
            className="btn-secondary disabled:opacity-40"
          >
            {voterSaved ? '✓ Đã lưu' : 'Lưu'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function VotePage() {
  const {
    dateTally, activityTally,
    dateOptions, activityOptions,
    loading, error, submitting,
    hasVoted, vote, addOption, refetch,
  } = useVotes();

  const [voter, setVoter] = useState(() => localStorage.getItem(VOTER_KEY) || '');
  const [voterInput, setVoterInput] = useState(voter);
  const [voterSaved, setVoterSaved] = useState(!!voter);

  const saveVoter = () => {
    const v = voterInput.trim();
    if (!v) return;
    setVoter(v);
    setVoterSaved(true);
    localStorage.setItem(VOTER_KEY, v);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="slide-up">
        <p className="section-title">Vote</p>
        <h1 className="font-display text-3xl font-bold text-white tracking-tight">
          Vote lịch chơi
        </h1>
        <p className="mt-1 text-white/50">
          Chọn ngày và bộ môn phù hợp · Mỗi người 1 vote mỗi lựa chọn
        </p>
      </div>

      {/* Voter name card */}
      <VoterCard
        voter={voter}
        voterInput={voterInput}
        setVoterInput={setVoterInput}
        voterSaved={voterSaved}
        setVoterSaved={setVoterSaved}
        onSave={saveVoter}
      />

      {loading && <Skeleton />}

      {error && (
        <div className="glass-card p-5 flex items-center gap-4 slide-up">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-500/10">
            <AlertCircle size={20} className="text-red-400" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-white">Có lỗi xảy ra</p>
            <p className="text-sm text-white/40">{error}</p>
          </div>
          <button
            onClick={refetch}
            className="btn-secondary flex items-center gap-2"
          >
            <RefreshCw size={14} /> Thử lại
          </button>
        </div>
      )}

      {!loading && !error && (
        <div className="grid gap-6 sm:grid-cols-2 slide-up" style={{ animationDelay: '100ms' }}>
          <VoteSection
            title="Vote ngày chơi"
            emoji="📅"
            type="date"
            options={dateOptions}
            tally={dateTally}
            voter={voter}
            hasVoted={hasVoted}
            onVote={vote}
            onAddOption={addOption}
            submitting={submitting}
          />
          <VoteSection
            title="Vote bộ môn"
            emoji="🏸"
            type="activity"
            options={activityOptions}
            tally={activityTally}
            voter={voter}
            hasVoted={hasVoted}
            onVote={vote}
            onAddOption={addOption}
            submitting={submitting}
          />
        </div>
      )}

      {!voter && !loading && (
        <p className="text-center text-sm text-white/40 slide-up" style={{ animationDelay: '200ms' }}>
          ☝️ Nhập tên của bạn trước để có thể vote
        </p>
      )}
    </div>
  );
}
