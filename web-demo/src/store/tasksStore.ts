import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEMO_TASKS } from "./demoData";

export type TaskStatus = "pending" | "completed" | "overdue";

export type AQTask = {
  id: string;
  yearId: string; // academicPlan year id
  termId: string; // academicPlan term id
  courseId?: string; // optional reference to course row id in planner
  title: string;
  description?: string;
  subject?: string;
  priority?: "low" | "medium" | "high";
  status: TaskStatus;
  dueDate?: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm
  dateCompleted?: string;
  timeSpent?: number;
  grade?: string;
};

type TasksState = {
  tasks: AQTask[];
  addTask: (t: AQTask) => void;
  updateTask: (id: string, patch: Partial<AQTask>) => void;
  removeTask: (id: string) => void;
  clearTerm: (yearId: string, termId: string) => void;
};

export const useTasksStore = create<TasksState>()(
  persist(
    (set, get) => ({
      tasks: DEMO_TASKS.map(task => ({
        id: task.id,
        yearId: task.yearId,
        termId: task.termId,
        title: task.title,
        description: task.description,
        subject: task.subject,
        priority: task.priority,
        status: task.status,
        dueDate: task.dueDate,
        dateCompleted: task.dateCompleted,
        timeSpent: task.timeSpent
      })),
      addTask: (t) => set((s) => ({ tasks: [...s.tasks, t] })),
      updateTask: (id, patch) => {
        const task = get().tasks.find(t => t.id === id)
        const wasCompleted = task?.status === "completed"
        const isNowCompleted = patch.status === "completed"
        
        // If task is being completed for the first time, reward XP
        if (!wasCompleted && isNowCompleted && task) {
          // Import gamification helpers dynamically to avoid circular dependencies
          import('./gamificationHelpers').then(({ rewardTaskCompletion }) => {
            rewardTaskCompletion(task.dueDate)
          })
        }
        
        set((s) => ({ tasks: s.tasks.map((x) => (x.id === id ? { ...x, ...patch } : x)) }))
      },
      removeTask: (id) => set((s) => ({ tasks: s.tasks.filter((x) => x.id !== id) })),
      clearTerm: (yearId, termId) =>
        set((s) => ({ tasks: s.tasks.filter((x) => !(x.yearId === yearId && x.termId === termId)) })),
    }),
    { name: "aq:tasks" }
  )
);

export function tasksByTerm(tasks: AQTask[], yearId?: string, termId?: string) {
  if (!yearId || !termId) return [];
  return tasks.filter((t) => t.yearId === yearId && t.termId === termId);
}

export function isWithinNextNDays(dateISO?: string, n = 7) {
  if (!dateISO) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dateISO);
  due.setHours(0, 0, 0, 0);
  const diff = (due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
  return diff >= 0 && diff <= n;
}
