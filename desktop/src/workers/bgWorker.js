// bgWorker.js - Node.js worker thread for heavy JSON operations & aggregation
const { parentPort } = require('worker_threads');

function validateTasks(raw = []) {
  const out = []; const seen = new Set();
  for (const t of raw) {
    if (!t || typeof t !== 'object') continue;
    const id = String(t.id || ''); if (!id || seen.has(id)) continue; seen.add(id);
    const title = String(t.title || '').slice(0, 300);
    const status = t.status === 'Completed' ? 'Completed' : 'Pending';
    out.push({ id, title, status, yearId: String(t.yearId||''), termId: String(t.termId||'') });
  }
  return out;
}

function aggregateTaskCounts(tasks) {
  const filled = tasks.filter(t => t.title.trim());
  const completed = filled.filter(t => t.status === 'Completed');
  const pct = filled.length ? Math.round(completed.length / filled.length * 100) : 0;
  return { total: tasks.length, filled: filled.length, completed: completed.length, pct };
}

parentPort.on('message', (msg) => {
  if (!msg || typeof msg !== 'object') return;
  try {
    switch (msg.type) {
      case 'heavyAggregate': {
        const start = Date.now();
        const { tasks = [], datasets = [] } = msg.payload || {};
        const safeTasks = validateTasks(tasks);
        const taskCounts = aggregateTaskCounts(safeTasks);
        // merge datasets (if provided) after validation
        const merged = {};
        for (const ds of datasets) {
          if (ds && typeof ds === 'object') Object.assign(merged, ds);
        }
        parentPort.postMessage({ type: 'heavyAggregateResult', payload: { taskCounts, mergedKeys: Object.keys(merged), durationMs: Date.now() - start } });
        break;
      }
      default:
        parentPort.postMessage({ type: 'error', error: 'Unknown message type: ' + msg.type });
    }
  } catch (err) {
    parentPort.postMessage({ type: 'error', error: err.message || String(err) });
  }
});
