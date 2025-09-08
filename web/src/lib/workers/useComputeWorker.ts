// DEPRECATED: useSchedulerWorker replaces this hook.
// Retained as no-op shim to avoid import errors during transition.
import { useCallback } from 'react';

type AggregateResult = {
  taskPct: number;
  taskCounts: { total: number; filled: number; completed: number };
  recentStudyHours: { date: string; hours: number }[];
  totalCredits: number;
  weightedGpa: number;
};

export function useComputeWorker() {
  const aggregate: AggregateResult | null = null;
  const error: string | null = null;
  const runAggregate = useCallback(() => { /* no-op */ }, []);
  return { aggregate, error, runAggregate };
}
