// Lightweight compute worker: aggregates tasks & study sessions off main thread
// Receives messages: {type: 'aggregate', payload: { tasks, studySessions, courses, yearId, termId }}
// Responds with: {type: 'aggregateResult', payload: { taskPct, taskCounts, recentStudyHours, totalCredits, weightedGpa }}

// Minimal type shim (keep narrow)
interface AQWorkerScope {
  postMessage: (data: unknown) => void;
  onmessage: ((ev: MessageEvent) => unknown) | null;
}
const globalScope = self as unknown as AQWorkerScope;

globalScope.onmessage = (e: MessageEvent) => {
  const msg = e.data;
  if (!msg || typeof msg !== 'object') return;
  if (msg.type === 'aggregate') {
    try {
  const { tasks = [], studySessions = [], courses = [], yearId, termId } = msg.payload || {};
      const termTasks = yearId && termId ? tasks.filter(t => t.yearId === yearId && t.termId === termId) : [];
      const filled = termTasks.filter(t => (t.title || '').trim().length > 0);
      const completed = filled.filter(t => t.status === 'Completed');
      const taskPct = filled.length ? Math.round((completed.length / filled.length) * 100) : 0;
      const taskCounts = { total: termTasks.length, filled: filled.length, completed: completed.length };

      // Last 7 days study aggregation (minutes → hours, 1 decimal)
      const now = new Date();
      const start = new Date(now); start.setDate(start.getDate() - 6);
      const byDay = new Map();
      for (let i = 0; i < 7; i++) {
        const d = new Date(start); d.setDate(start.getDate() + i);
        const key = d.toISOString().split('T')[0];
        byDay.set(key, 0);
      }
      for (const s of studySessions) {
        // expecting { start: ISO, end: ISO }
        if (!s?.start || !s?.end) continue;
        const dayKey = (s.start as string).split('T')[0];
        if (byDay.has(dayKey)) {
          const durMin = (new Date(s.end).getTime() - new Date(s.start).getTime()) / 60000;
          if (durMin > 0) byDay.set(dayKey, byDay.get(dayKey) + durMin);
        }
      }
      const recentStudyHours = Array.from(byDay.entries()).map(([key, minutes]) => ({
        date: key,
        hours: Math.round((minutes / 60) * 10) / 10
      }));

      // GPA aggregates (0-4 scale expected in course.gpa)
      let totalCredits = 0; let weightedSum = 0;
      for (const c of courses) {
        const cr = Number(c.credits) || 0;
        const g = typeof c.gpa === 'number' ? c.gpa : undefined;
        if (cr > 0 && g !== undefined) { totalCredits += cr; weightedSum += cr * Math.max(0, Math.min(4, g)); }
      }
      const weightedGpa = totalCredits > 0 ? weightedSum / totalCredits : 0;

  globalScope.postMessage({ type: 'aggregateResult', payload: { taskPct, taskCounts, recentStudyHours, totalCredits, weightedGpa } });
    } catch (err) {
  globalScope.postMessage({ type: 'aggregateError', error: (err as Error).message });
    }
  }
};
