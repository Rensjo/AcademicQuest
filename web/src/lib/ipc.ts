// ipc.ts - type-safe wrappers for Electron preload exposed APIs (when running in desktop)

interface HeavyAggregatePayload {
  tasks?: { id: string; title?: string; status?: string; yearId?: string; termId?: string }[];
  datasets?: Record<string, unknown>[];
}
interface HeavyAggregateResult {
  success: boolean;
  data?: { taskCounts: { total: number; filled: number; completed: number; pct: number }; mergedKeys: string[]; durationMs: number };
  error?: string;
}

// Ambient module augmentation (ElectronAPI likely defined elsewhere by preload d.ts)
// Augment existing ElectronAPI interface if already declared elsewhere
declare global { interface ElectronAPI { heavyAggregate?: (payload: HeavyAggregatePayload) => Promise<HeavyAggregateResult>; } }

export async function heavyAggregate(payload: HeavyAggregatePayload): Promise<HeavyAggregateResult> {
  const anyWin = window as unknown as { electronAPI?: ElectronAPI };
  const api = anyWin.electronAPI;
  if (typeof window === 'undefined' || !api?.heavyAggregate) {
    return { success: false, error: 'unavailable' };
  }
  try {
    return await api.heavyAggregate(payload);
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}
