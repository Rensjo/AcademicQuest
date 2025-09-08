// schedulerWorker.ts
// Dedicated worker for heavier scheduling & aggregation tasks:
// - Task filtering/sorting
// - Study session aggregation
// - Gamification XP / quest progress pre-calcs (lightweight summary only)
// - Academic GPA calculations
// - (Future) OffscreenCanvas rendering (transferred) for lightweight charts
// Messages:
//  { type: 'run', payload: SchedulerPayload }
// Responses:
//  { type: 'result', payload: SchedulerResult } | { type: 'error', error: string }

interface SchedulerTask { id: string; yearId: string; termId: string; title: string; status: string; dueDate?: string; courseId?: string; }
interface SchedulerStudy { start: string; end: string; }
interface SchedulerCourse { credits?: number; gpa?: number; }

export interface SchedulerPayload {
  tasks: SchedulerTask[];
  studySessions: SchedulerStudy[];
  courses: SchedulerCourse[];
  yearId?: string;
  termId?: string;
  visualsQuality?: 'high' | 'medium' | 'low';
  includeCanvas?: boolean; // hint to attempt OffscreenCanvas setup
}

export interface SchedulerResult {
  taskCounts: { total: number; filled: number; completed: number; pct: number };
  study7d: { date: string; hours: number }[];
  gpa: { totalCredits: number; weightedGpa: number };
  quests?: { tasksCompleted: number; studyMinutes: number };
  // OffscreenCanvas support detection
  offscreen?: boolean;
  // Optional lightweight pre-rendered image bitmap (future use)
  lineChartBitmap?: ImageBitmap;
}

interface SchedulerWorkerGlobal {
  postMessage: (msg: unknown, transfer?: Transferable[]) => void;
  onmessage: ((e: MessageEvent) => void) | null;
}
const scope = self as unknown as SchedulerWorkerGlobal;

function aggregateTasks(tasks: SchedulerTask[], yearId?: string, termId?: string) {
  const list = (yearId && termId) ? tasks.filter(t => t.yearId === yearId && t.termId === termId) : tasks;
  const filled = list.filter(t => (t.title || '').trim());
  const completed = filled.filter(t => t.status === 'Completed');
  const pct = filled.length ? Math.round((completed.length / filled.length) * 100) : 0;
  return { total: list.length, filled: filled.length, completed: completed.length, pct };
}

function aggregateStudy(sessions: SchedulerStudy[]) {
  const now = new Date();
  const start = new Date(now); start.setDate(start.getDate() - 6);
  const map = new Map<string, number>();
  for (let i = 0; i < 7; i++) {
    const d = new Date(start); d.setDate(start.getDate() + i);
    map.set(d.toISOString().split('T')[0], 0);
  }
  for (const s of sessions) {
    if (!s.start || !s.end) continue;
    const key = s.start.split('T')[0];
    if (!map.has(key)) continue;
    const mins = (new Date(s.end).getTime() - new Date(s.start).getTime()) / 60000;
    if (mins > 0) map.set(key, map.get(key)! + mins);
  }
  return Array.from(map.entries()).map(([date, minutes]) => ({ date, hours: Math.round((minutes / 60) * 10) / 10 }));
}

function aggregateGpa(courses: SchedulerCourse[]) {
  let credits = 0, weighted = 0;
  for (const c of courses) {
    const cr = Number(c.credits) || 0;
    const g = typeof c.gpa === 'number' ? c.gpa : undefined;
    if (cr > 0 && g !== undefined) { credits += cr; weighted += cr * Math.max(0, Math.min(4, g)); }
  }
  return { totalCredits: credits, weightedGpa: credits ? weighted / credits : 0 };
}

// Lightweight gamification progress summary (not mutating state)
function aggregateQuests(tasks: SchedulerTask[], study: SchedulerStudy[]) {
  const tasksCompleted = tasks.filter(t => t.status === 'Completed').length;
  let studyMinutes = 0;
  for (const s of study) {
    if (!s.start || !s.end) continue;
    const mins = (new Date(s.end).getTime() - new Date(s.start).getTime()) / 60000;
    if (mins > 0) studyMinutes += mins;
  }
  return { tasksCompleted, studyMinutes: Math.round(studyMinutes) };
}

scope.onmessage = (e: MessageEvent) => {
  const msg = e.data;
  if (!msg || typeof msg !== 'object') return;
  try {
    if (msg.type === 'run') {
      const payload = msg.payload as SchedulerPayload;
      const result = buildAggregate(payload);
      // Optional OffscreenCanvas pre-render (only if supported & requested & study data exists)
      if (result.offscreen && payload.includeCanvas && typeof OffscreenCanvas !== 'undefined' && result.study7d.length) {
        try {
          const canvas = new OffscreenCanvas(260, 80);
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.clearRect(0,0,260,80);
            const ys = result.study7d.map(d=>d.hours);
            const maxY = Math.max(...ys,1);
            ctx.strokeStyle = '#6366f1'; ctx.lineWidth = 2; ctx.beginPath();
            result.study7d.forEach((d,i) => {
              const x = (i/(result.study7d.length-1))* (260-8) + 4;
              const y = 80 - (((d.hours)/maxY)*(80-8)+4);
              if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
            });
            ctx.stroke();
            // create bitmap and attach
            const bmp = canvas.transferToImageBitmap();
            result.lineChartBitmap = bmp;
          }
  } catch {
          // ignore rendering failure
        }
      }
      scope.postMessage({ type: 'result', payload: result });
    }
  } catch (err) {
    scope.postMessage({ type: 'error', error: (err as Error).message });
  }
};

function buildAggregate(payload: SchedulerPayload): SchedulerResult {
  const taskCounts = aggregateTasks(payload.tasks, payload.yearId, payload.termId);
  const study7d = aggregateStudy(payload.studySessions);
  const gpa = aggregateGpa(payload.courses);
  const quests = aggregateQuests(payload.tasks, payload.studySessions);
  let offscreen = false;
  if (payload.includeCanvas && typeof OffscreenCanvas !== 'undefined') {
    try {
      const canvas = new OffscreenCanvas(32, 32);
      const ctx = canvas.getContext('2d');
      if (ctx) { ctx.fillStyle='#000'; ctx.fillRect(0,0,32,32); offscreen = true; }
    } catch { /* ignore */ }
  }
  return { taskCounts, study7d, gpa, quests, offscreen };
}
