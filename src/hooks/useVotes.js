import { useState, useEffect, useCallback, useRef } from 'react';
import { getVotes, addVote, deleteVote } from '../api/sheetdb';
import { tallyVotes, getVoteOptions, uuid } from '../lib/utils';

export function useVotes() {
  const [allVotes, setAllVotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const allVotesRef = useRef(allVotes);
  const submittingRef = useRef(submitting);

  useEffect(() => {
    allVotesRef.current = allVotes;
  }, [allVotes]);

  useEffect(() => {
    submittingRef.current = submitting;
  }, [submitting]);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getVotes();
      setAllVotes(Array.isArray(data) ? data : []);
    } catch {
      setError('Không thể tải dữ liệu vote.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const dateTally = tallyVotes(allVotes, 'date');
  const activityTally = tallyVotes(allVotes, 'activity');
  const dateOptions = getVoteOptions(allVotes, 'date');
  const activityOptions = getVoteOptions(allVotes, 'activity');

  // Check if a voter already voted for an option
  const hasVoted = (voter, type, option) =>
    allVotes.some((v) => v.voter === voter && v.type === type && v.option === option);

  const vote = useCallback(async ({ voter, type, option }) => {
    if (submittingRef.current) return;
    setSubmitting(true);
    try {
      const votes = allVotesRef.current;
      const oldVote = votes.find((v) => v.voter === voter && v.type === type);
      if (oldVote) {
        await deleteVote(oldVote.id);
        setAllVotes((prev) => prev.filter((v) => v.id !== oldVote.id));
      }

      const record = {
        id: uuid(),
        type,
        option,
        voter: voter.trim(),
        created_at: new Date().toISOString(),
      };
      await addVote(record);
      setAllVotes((prev) => [...prev, record]);
    } catch (e) {
      throw new Error('Vote thất bại. Thử lại nhé!');
    } finally {
      setSubmitting(false);
    }
  }, []);

  const addOption = useCallback(async ({ type, option, voter }) => {
    if (submittingRef.current) return;
    setSubmitting(true);
    try {
      const record = {
        id: uuid(),
        type,
        option: option.trim(),
        voter: voter.trim(),
        created_at: new Date().toISOString(),
      };
      await addVote(record);
      setAllVotes((prev) => [...prev, record]);
    } catch (e) {
      throw new Error('Thêm lựa chọn thất bại.');
    } finally {
      setSubmitting(false);
    }
  }, []);

  return {
    allVotes,
    dateTally,
    activityTally,
    dateOptions,
    activityOptions,
    loading,
    error,
    submitting,
    hasVoted,
    vote,
    addOption,
    refetch: fetch,
  };
}
