import VoteCard from './VoteCard';
import AddVoteOption from './AddVoteOption';

export default function VoteSection({
  title,
  emoji,
  type,
  options,
  tally,
  voter,
  hasVoted,
  onVote,
  onAddOption,
  submitting,
}) {
  const totalVotes = Object.values(tally).reduce((a, b) => a + b, 0);

  return (
    <div className="glass-card overflow-hidden">
      <div className="p-5 border-b border-white/5">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{emoji}</span>
          <div className="flex-1">
            <h2 className="font-display text-lg font-semibold text-white">{title}</h2>
            <p className="text-xs text-white/40">{totalVotes} người đã vote</p>
          </div>
          <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-medium text-white/60">
            {options.length} lựa chọn
          </span>
        </div>
      </div>

      <div className="p-5">
        {options.length === 0 ? (
          <div className="py-8 text-center">
            <div className="text-4xl mb-2">📝</div>
            <p className="text-sm text-white/40">
              Chưa có lựa chọn nào. Thêm cái đầu tiên đi!
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {options
              .sort((a, b) => (tally[b.option] || 0) - (tally[a.option] || 0))
              .map(({ option, id }, index) => (
                <VoteCard
                  key={id}
                  option={option}
                  count={tally[option] || 0}
                  total={totalVotes}
                  hasVoted={hasVoted(voter, type, option)}
                  onVote={() => onVote({ voter, type, option })}
                  disabled={submitting}
                />
              ))}
          </div>
        )}

        <AddVoteOption
          type={type}
          voter={voter}
          onAddOption={onAddOption}
          submitting={submitting}
          key={`add-${type}`}
        />
      </div>
    </div>
  );
}
