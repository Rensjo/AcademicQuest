import { useEffect, useRef, useState, useCallback } from 'react';
import type { SchedulerPayload, SchedulerResult } from './schedulerWorker';

export function useSchedulerWorker() {
  const ref = useRef<Worker | null>(null);
  const [result, setResult] = useState<SchedulerResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [offscreenSupported, setOffscreenSupported] = useState<boolean>(false);

  useEffect(() => {
    ref.current = new Worker(new URL('./schedulerWorker.ts', import.meta.url), { type: 'module' });
    const w = ref.current;
    w.onmessage = (e: MessageEvent) => {
      const msg = e.data;
      if (msg?.type === 'result') {
        setResult(msg.payload);
        if (typeof msg.payload?.offscreen === 'boolean') setOffscreenSupported(msg.payload.offscreen);
      } else if (msg?.type === 'error') {
        setError(msg.error || 'Scheduler worker error');
      }
    };
    return () => { w.terminate(); };
  }, []);

  const run = useCallback((payload: SchedulerPayload) => {
    if (!ref.current) return;
    ref.current.postMessage({ type: 'run', payload });
  }, []);

  return { result, error, run, offscreenSupported };
}
