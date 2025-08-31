import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CourseId = string;

export type Course = {
  id: CourseId;
  code: string;
  title: string;
  instructor?: string;
  syllabusUrl?: string;
  linkedSlotId?: string; // optional explicit link to a Schedule slot
  // Note modules
  modules: Array<{ id: string; title: string; html: string }>;
  // Tasks for this course
  tasks: Array<{
    id: string;
    title: string;
    due?: string;     // ISO date-time
    status: "in-progress" | "complete" | "overdue";
    grade?: number;   // optional % for that task
  }>;
  // Simple folder tree: path segments joined with "/"
  folders: Array<{
    id: string;
    path: string;      // "root/lectures/week1"
    files: Array<{ id: string; name: string; size: number; opfsPath?: string; url?: string }>;
  }>;
};

export type YearTermKey = `${string}::${string}`; // `${yearId}::${termId}`

type State = {
  byYearTerm: Record<YearTermKey, Course[]>;
  selectedCourseId?: CourseId;

  setSelectedCourse: (id?: CourseId) => void;

  addCourse: (key: YearTermKey, data?: Partial<Course>) => CourseId;
  updateCourse: (key: YearTermKey, course: Course) => void;
  removeCourse: (key: YearTermKey, id: CourseId) => void;

  addModule: (key: YearTermKey, courseId: CourseId, title?: string) => string;
  removeModule: (key: YearTermKey, courseId: CourseId, moduleId: string) => void;
  updateModule: (key: YearTermKey, courseId: CourseId, moduleId: string, html: string) => void;

  addTask: (key: YearTermKey, courseId: CourseId, task: Course["tasks"][number]) => void;
  updateTask: (key: YearTermKey, courseId: CourseId, task: Course["tasks"][number]) => void;
  removeTask: (key: YearTermKey, courseId: CourseId, taskId: string) => void;

  ensureFolder: (key: YearTermKey, courseId: CourseId, path: string) => void;
  renameFolder: (key: YearTermKey, courseId: CourseId, folderId: string, newPath: string) => void;
  addFileToFolder: (
    key: YearTermKey,
    courseId: CourseId,
    path: string,
    file: { id: string; name: string; size: number; opfsPath?: string; url?: string }
  ) => void;
  moveFile: (
    key: YearTermKey,
    courseId: CourseId,
    fileId: string,
    fromPath: string,
    toPath: string
  ) => void;
};

const uid = (p = "id") => `${p}_${Math.random().toString(36).slice(2, 8)}`;

export const useCoursePlanner = create<State>()(
  persist(
  (set) => ({
      byYearTerm: {},
      selectedCourseId: undefined,

      setSelectedCourse: (id) => set({ selectedCourseId: id }),

      addCourse: (key, data) => {
        const id = uid("course");
        const course: Course = {
          id,
          code: data?.code || "",
          title: data?.title || "Untitled Course",
          instructor: data?.instructor,
          syllabusUrl: data?.syllabusUrl,
          linkedSlotId: data?.linkedSlotId,
          modules: [{ id: uid("m"), title: "M1", html: "" }],
          tasks: [],
          folders: [{ id: uid("fold"), path: "root", files: [] }],
        };
        set((s) => ({
          byYearTerm: {
            ...s.byYearTerm,
            [key]: [...(s.byYearTerm[key] || []), course],
          },
          selectedCourseId: id,
        }));
        return id;
      },

      updateCourse: (key, course) =>
        set((s) => ({
          byYearTerm: {
            ...s.byYearTerm,
            [key]: (s.byYearTerm[key] || []).map((c) => (c.id === course.id ? course : c)),
          },
        })),

      removeCourse: (key, id) =>
        set((s) => ({
          byYearTerm: {
            ...s.byYearTerm,
            [key]: (s.byYearTerm[key] || []).filter((c) => c.id !== id),
          },
          selectedCourseId: s.selectedCourseId === id ? undefined : s.selectedCourseId,
        })),

      addModule: (key, courseId, title = `M${Math.floor(Math.random() * 90) + 2}`) => {
        const mid = uid("m");
        set((s) => ({
          byYearTerm: {
            ...s.byYearTerm,
            [key]: (s.byYearTerm[key] || []).map((c) =>
              c.id !== courseId ? c : { ...c, modules: [...c.modules, { id: mid, title, html: "" }] }
            ),
          },
        }));
        return mid;
      },

      removeModule: (key, courseId, moduleId) =>
        set((s) => ({
          byYearTerm: {
            ...s.byYearTerm,
            [key]: (s.byYearTerm[key] || []).map((c) =>
              c.id !== courseId ? c : { ...c, modules: c.modules.filter((m) => m.id !== moduleId) }
            ),
          },
        })),

      updateModule: (key, courseId, moduleId, html) =>
        set((s) => ({
          byYearTerm: {
            ...s.byYearTerm,
            [key]: (s.byYearTerm[key] || []).map((c) =>
              c.id !== courseId ? c : { ...c, modules: c.modules.map((m) => (m.id === moduleId ? { ...m, html } : m)) }
            ),
          },
        })),

      addTask: (key, courseId, task) =>
        set((s) => ({
          byYearTerm: {
            ...s.byYearTerm,
            [key]: (s.byYearTerm[key] || []).map((c) =>
              c.id !== courseId ? c : { ...c, tasks: [...c.tasks, task] }
            ),
          },
        })),

      updateTask: (key, courseId, task) =>
        set((s) => ({
          byYearTerm: {
            ...s.byYearTerm,
            [key]: (s.byYearTerm[key] || []).map((c) =>
              c.id !== courseId ? c : { ...c, tasks: c.tasks.map((t) => (t.id === task.id ? task : t)) }
            ),
          },
        })),

      removeTask: (key, courseId, taskId) =>
        set((s) => ({
          byYearTerm: {
            ...s.byYearTerm,
            [key]: (s.byYearTerm[key] || []).map((c) =>
              c.id !== courseId ? c : { ...c, tasks: c.tasks.filter((t) => t.id !== taskId) }
            ),
          },
        })),

      ensureFolder: (key, courseId, path) =>
        set((s) => ({
          byYearTerm: {
            ...s.byYearTerm,
            [key]: (s.byYearTerm[key] || []).map((c) =>
              c.id !== courseId
                ? c
                : c.folders.some((f) => f.path === path)
                ? c
                : { ...c, folders: [...c.folders, { id: uid("fold"), path, files: [] }] }
            ),
          },
        })),

      renameFolder: (key, courseId, folderId, newPath) =>
        set((s) => ({
          byYearTerm: {
            ...s.byYearTerm,
            [key]: (s.byYearTerm[key] || []).map((c) =>
              c.id !== courseId
                ? c
                : {
                    ...c,
                    folders: c.folders.map((f) => (f.id === folderId ? { ...f, path: newPath } : f)),
                  }
            ),
          },
        })),

      addFileToFolder: (key, courseId, path, file) =>
        set((s) => ({
          byYearTerm: {
            ...s.byYearTerm,
            [key]: (s.byYearTerm[key] || []).map((c) =>
              c.id !== courseId
                ? c
                : {
                    ...c,
                    folders: c.folders.map((f) =>
                      f.path === path ? { ...f, files: [...f.files, file] } : f
                    ),
                  }
            ),
          },
        })),

      moveFile: (key, courseId, fileId, fromPath, toPath) =>
        set((s) => ({
          byYearTerm: {
            ...s.byYearTerm,
            [key]: (s.byYearTerm[key] || []).map((c) => {
              if (c.id !== courseId) return c;
              let moved: Course["folders"][number]["files"][number] | undefined;
              const folders = c.folders.map((f) => {
                if (f.path === fromPath) {
                  const remaining = f.files.filter((fl) => {
                    if (fl.id === fileId) {
                      moved = fl;
                      return false;
                    }
                    return true;
                  });
                  return { ...f, files: remaining };
                }
                return f;
              }).map((f) => (f.path === toPath && moved ? { ...f, files: [...f.files, moved!] } : f));
              return { ...c, folders };
            }),
          },
        })),
  }),
  { name: "aq:course-planner" }
  )
);
