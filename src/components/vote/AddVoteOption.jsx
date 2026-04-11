import { useState } from 'react';
import { Plus, Loader2 } from 'lucide-react';

export default function AddVoteOption({ type, voter, onAddOption, submitting }) {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');

  const placeholder =
    type === 'date' ? 'VD: Thứ 7 - 12/04' : 'VD: Cầu lông, Pickleball...';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!value.trim()) return setError('Nhập nội dung');
    if (!voter?.trim()) return setError('Nhập tên của bạn trước');

    try {
      await onAddOption({ type, option: value, voter });
      setValue('');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="mt-4">
      <div className="flex gap-2">
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="input-glass flex-1"
        />
        <button
          type="button"
          disabled={submitting}
          className="btn-primary flex shrink-0 items-center gap-1.5"
          onClick={handleSubmit}
        >
          {submitting ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
          Thêm
        </button>
      </div>
      {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
    </div>
  );
}