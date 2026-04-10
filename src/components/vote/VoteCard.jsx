import { Check, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function VoteCard({ option, count, total, hasVoted, onVote, disabled }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-xl border transition-all duration-200',
        hasVoted
          ? 'border-indigo-500/50 bg-indigo-500/10'
          : 'border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]',
      )}
    >
      {/* Progress fill */}
      <div
        className="absolute inset-y-0 left-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 transition-all duration-500"
        style={{ width: `${pct}%` }}
      />

      <div className="relative flex items-center gap-3 px-4 py-3.5">
        {/* Vote button */}
        <button
          onClick={onVote}
          disabled={disabled || hasVoted}
          className={cn(
            'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs transition-all duration-200',
            hasVoted
              ? 'border-indigo-400 bg-indigo-500 text-white shadow-lg shadow-indigo-500/25'
              : 'border-white/20 text-white/40 hover:border-indigo-400 hover:text-indigo-400 hover:bg-indigo-500/10 disabled:opacity-30',
          )}
        >
          {disabled && !hasVoted ? (
            <Loader2 size={12} className="animate-spin" />
          ) : hasVoted ? (
            <Check size={12} />
          ) : null}
        </button>

        {/* Option label */}
        <span className={cn(
          "flex-1 text-sm font-medium transition-colors",
          hasVoted ? "text-white" : "text-white/80"
        )}>{option}</span>

        {/* Count + pct */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/40">{count} vote{count !== 1 ? 's' : ''}</span>
          <span
            className={cn(
              'rounded-full px-2.5 py-0.5 text-xs font-semibold',
              hasVoted
                ? 'bg-indigo-500/20 text-indigo-300'
                : 'bg-white/5 text-white/50',
            )}
          >
            {pct}%
          </span>
        </div>
      </div>
    </div>
  );
}
