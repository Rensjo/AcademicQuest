import React from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCoursePlanner } from "@/store/coursePlannerStore";
import { useSchedule } from "@/store/scheduleStore";
import RichTextEditor, { RichTextEditorHandle } from "@/components/RichTextEditor";
import { saveToOPFS, getOPFSFileURL } from "@/lib/opfs";
import { Plus, CalendarDays, Save as SaveIcon } from "lucide-react";
// themed gradient like other pages
import { useTheme, PALETTES } from "@/store/theme";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

// simple tabs beside title (same pattern you use elsewhere)
function TopTabsInline() {
  const navigate = useNavigate();
  const tabs = [
    { label: "Dashboard", path: "/" },
    { label: "Academic Planner", path: "/planner" },
    { label: "Task Tracker", path: "/tasks" },
    { label: "Schedule Planner", path: "/schedule" },
    { label: "Course Planner", path: "/courses", active: true },
    { label: "GPA Calc", path: "/gpa" },
    { label: "Scholarships", path: "/scholarships" },
    { label: "Textbooks", path: "/textbooks" },
    { label: "Settings", path: "/settings" },
  ];
  return (
    <div className="flex items-center gap-2 flex-nowrap">
      {tabs.map((t) => (
        <Button
          key={t.label}
          variant={t.active ? "default" : "outline"}
          className={`h-9 rounded-full ${t.active ? "" : "bg-white/70 dark:bg-neutral-900/60"}`}
          onClick={() => navigate(t.path)}
        >
          {t.label}
        </Button>
      ))}
    </div>
  );
}

// week checkbox helper
const DAYS = ["S", "M", "T", "W", "Th", "F", "S2"] as const;

export default function CoursePlanner() {
  const { toast } = useToast();
  // local gradient background (copied pattern from other pages)
  const theme = useTheme();
  const gradientStyle = React.useMemo(() => {
    const COLORS = PALETTES[theme.palette];
    const alpha = Math.min(0.5, Math.max(0.0, theme.accent / 150));
    const hex = Math.round(alpha * 255).toString(16).padStart(2, "0");
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = theme.mode === 'dark' || (theme.mode === 'system' && systemDark);
    const baseLinear = isDark
      ? 'linear-gradient(135deg, #0b0f19 0%, #0a0a0a 70%)'
      : 'linear-gradient(135deg, #ffffff 0%, #f8fbff 65%)';
    const tintA = `radial-gradient(circle at 10% 0%, ${COLORS[0]}${hex} 0%, transparent 40%)`;
    const tintB = `radial-gradient(circle at 90% 10%, ${COLORS[3]}${hex} 0%, transparent 45%)`;
    const tintC = `radial-gradient(circle at 50% 120%, ${COLORS[2]}${hex} 0%, transparent 55%)`;
    return {
      backgroundImage: `${tintA}, ${tintB}, ${tintC}, ${baseLinear}`,
      backgroundRepeat: 'no-repeat, no-repeat, no-repeat, no-repeat',
      backgroundAttachment: 'fixed, fixed, scroll, fixed',
      backgroundPosition: '10% 0%, 90% 10%, 50% 100%, 0 0',
    } as React.CSSProperties;
  }, [theme.accent, theme.mode, theme.palette]);
  // current year/term from schedule store
  const years = useSchedule((s) => s.years);
  const selectedYearId = useSchedule((s) => s.selectedYearId);
  const setSelectedYear = useSchedule((s) => s.setSelectedYear);
  // No explicit hydration flag; Zustand persist rehydrates synchronously enough for default UI.
  const hydrated = true;
  const activeYearId = selectedYearId || years[0]?.id;
  const year = years.find((y) => y.id === activeYearId);
  const term = year?.terms?.[0]; // or expose a term switch if you want

  // Ensure key is typed as YearTermKey for store function signatures (only once hydrated)
  const key = React.useMemo<import("@/store/coursePlannerStore").YearTermKey>(
    () => `${activeYearId || "y"}::${term?.id || "t"}` as import("@/store/coursePlannerStore").YearTermKey,
    [activeYearId, term?.id]
  );

  // course planner store
  const courses = useCoursePlanner((s) => s.byYearTerm[key] || []);
  const selectedCourseId = useCoursePlanner((s) => s.selectedCourseId);
  const setSelectedCourse = useCoursePlanner((s) => s.setSelectedCourse);
  const addCourse = useCoursePlanner((s) => s.addCourse);
  const updateCourse = useCoursePlanner((s) => s.updateCourse);
  const addModule = useCoursePlanner((s) => s.addModule);
  const updateModule = useCoursePlanner((s) => s.updateModule);
  const removeModule = useCoursePlanner((s) => s.removeModule);
  const addTask = useCoursePlanner((s) => s.addTask);
  const updateTask = useCoursePlanner((s) => s.updateTask);
  const removeTask = useCoursePlanner((s) => s.removeTask);
  const ensureFolder = useCoursePlanner((s) => s.ensureFolder);
  const renameFolder = useCoursePlanner((s) => s.renameFolder);
  const addFileToFolder = useCoursePlanner((s) => s.addFileToFolder);
  const moveFile = useCoursePlanner((s) => s.moveFile);

  // ensure one demo course on first use
  React.useEffect(() => {
    if (!hydrated) return;
    // Ensure a selected year is set after hydration
    if (!selectedYearId && years[0]?.id) setSelectedYear(years[0].id);
    if (!courses.length && activeYearId && term?.id) {
      const id = addCourse(key, { title: "Course Title", code: "" });
      setSelectedCourse(id);
    }
  }, [hydrated, courses.length, activeYearId, term?.id, addCourse, setSelectedCourse, key, selectedYearId, years, setSelectedYear]);

  const course = courses.find((c) => c.id === selectedCourseId) || courses[0];

  // ------- auto-sync Class Time + Room from Schedule Planner -------
  const scheduleTerm = term;
  // Live sync: if Course code/title matches a slot, use its time/room; 
  // if a slot is chosen once, remember by id for stability until data changes.
  const classMeta = React.useMemo((): { time: string; room: string; slotId?: string } => {
    if (!course || !scheduleTerm) return { time: "—", room: "—" };
    const norm = (s?: string) => (s || "").trim().toLowerCase();
    const byId = course.linkedSlotId ? scheduleTerm.slots.find((s) => s.id === course.linkedSlotId) : undefined;
    const byCode = scheduleTerm.slots.find((s) => s.courseCode && norm(s.courseCode) === norm(course.code));
    const byTitle = scheduleTerm.slots.find((s) => course.title && s.title && norm(s.title) === norm(course.title));
    const match = byId || byCode || byTitle;
    return match
      ? { time: `${match.start}–${match.end}`, room: match.room || "—", slotId: match.id }
      : { time: "—", room: "—", slotId: undefined };
  }, [course, scheduleTerm]);

  // Persist a stable link when we find a match; avoid loops by only setting when changed
  React.useEffect(() => {
    if (!course) return;
  const slotId = classMeta.slotId;
    if (slotId && course.linkedSlotId !== slotId) {
      updateCourse(key, { ...course, linkedSlotId: slotId });
    }
    if (!slotId && course.linkedSlotId) {
      // If the current course has a stale link that no longer exists in this term, clear it
      const exists = scheduleTerm?.slots.some(s => s.id === course.linkedSlotId);
      if (!exists) updateCourse(key, { ...course, linkedSlotId: undefined });
    }
  }, [classMeta, course, key, updateCourse, scheduleTerm]);

  // modules UI state
  const [activeModuleId, setActiveModuleId] = React.useState<string | undefined>(course?.modules?.[0]?.id);
  const editorRef = React.useRef<RichTextEditorHandle | null>(null);
  // Delete confirmation dialog state
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [pendingDelete, setPendingDelete] = React.useState<{ id: string; title: string } | null>(null);
  const [confirmText, setConfirmText] = React.useState("");
  // Track module list by a stable key to avoid effect churn on content edits
  const modulesList = course?.modules;
  React.useEffect(() => {
    const ids = modulesList?.map((m) => m.id) ?? [];
    if (ids.length === 0) return;
    if (!activeModuleId || !ids.includes(activeModuleId)) {
      setActiveModuleId(ids[0]);
    }
  }, [modulesList, activeModuleId]);

  // file uploading
  const onUpload = async (path: string, files: FileList | null) => {
    if (!files || !course) return;
    for (const f of Array.from(files)) {
      const opfsPath = `AQ/Courses/${activeYearId}/${term?.id}/${course.id}/${path}/${f.name}`;
      const res = await saveToOPFS(opfsPath, f);
      addFileToFolder(key, course.id, path, {
        id: Math.random().toString(36).slice(2, 8),
        name: f.name,
        size: f.size,
        // If OPFS available and write succeeded, keep path; if fallback to URL, store URL
        opfsPath: res.ok && !("url" in res) ? opfsPath : undefined,
        url: res.ok && ("url" in res) ? res.url : undefined,
      });
    }
  };

  // Course Files UI state
  const [uploadTo, setUploadTo] = React.useState<string>("root");
  const [newFolder, setNewFolder] = React.useState("");
  const [renamingId, setRenamingId] = React.useState<string | null>(null);
  const [renameText, setRenameText] = React.useState("");

  React.useEffect(() => {
    if (!course) return;
    // Ensure root exists and keep upload target valid
    ensureFolder(key, course.id, "root");
    const paths = new Set(course.folders.map(f => f.path));
    if (!paths.has(uploadTo)) setUploadTo("root");
  }, [course, key, ensureFolder, uploadTo]);

  const handleAddFolder = () => {
    if (!course) return;
    const name = newFolder.trim();
    if (!name) return;
    // simple: treat name as a path segment under root; allow nested paths too
    ensureFolder(key, course.id, name);
    setNewFolder("");
  };

  const openFile = async (f: { url?: string; opfsPath?: string; name: string }) => {
    try {
      const href = f.url || (f.opfsPath ? await getOPFSFileURL(f.opfsPath) : undefined);
      if (!href) return;
      const a = document.createElement('a');
      a.href = href;
      a.target = '_blank';
      a.download = f.name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      if (!f.url) setTimeout(() => URL.revokeObjectURL(href), 1500);
    } catch {
      /* ignore */
    }
  };

  // Root folder is created when adding a course; no-op here to avoid needless writes

  const onSaveModuleNotes = React.useCallback(async () => {
    if (!course || !activeModuleId) return;
    const mod = course.modules.find((m) => m.id === activeModuleId);
    if (!mod) return;
    // Always fetch the latest HTML from the live editor (in case user typed but state not yet flushed)
    const liveHtml = editorRef.current?.getHTML() ?? mod.html ?? "";
    // Update the store first so a refresh or tab switch keeps the content
    updateModule(key, course.id, activeModuleId, liveHtml);
    const html = liveHtml;
  const titleSlug = (mod.title || activeModuleId).replace(/[^\w-]+/g, "-");
    const yearPart = activeYearId || "year";
    const termPart = term?.id || "term";
    const fileName = `${titleSlug || "module"}.html`;
    const path = `AQ/Courses/${yearPart}/${termPart}/${course.id}/notes/${fileName}`;
    try {
      const file = new File([html], fileName, { type: "text/html" });
      const res = await saveToOPFS(path, file);
      if (res.ok) {
        // If OPFS is unavailable, saveToOPFS returns a blob URL; trigger a download for the user
        if ('url' in res && res.url) {
          const a = document.createElement('a');
          a.href = res.url;
          a.download = fileName;
          document.body.appendChild(a);
          a.click();
          a.remove();
          // best-effort revoke
          setTimeout(() => URL.revokeObjectURL(res.url!), 1500);
        }
        toast({ title: "Notes saved", description: `${mod.title || "Module"} saved${'url' in res ? ' (downloaded)' : ''}.` });
      } else {
        const err = 'error' in res ? res.error : 'Unknown error';
        toast({ title: "Save failed", description: err });
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      toast({ title: "Save failed", description: msg });
    }
  }, [course, activeModuleId, updateModule, key, activeYearId, term?.id, toast]);

  // Save on unmount (navigate away/refresh) - ensure last content is persisted into store
  React.useEffect(() => {
    const handler = () => {
      if (!course || !activeModuleId) return;
      const liveHtml = editorRef.current?.getHTML() ?? course.modules.find((m) => m.id === activeModuleId)?.html ?? "";
      updateModule(key, course.id, activeModuleId, liveHtml);
    };
    window.addEventListener('beforeunload', handler);
    return () => {
      window.removeEventListener('beforeunload', handler);
    };
  }, [course, activeModuleId, key, updateModule]);

  // Ctrl/Cmd+S to save notes quickly (stable listener)
  const saveRef = React.useRef(onSaveModuleNotes);
  React.useEffect(() => { saveRef.current = onSaveModuleNotes; }, [onSaveModuleNotes]);
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        void saveRef.current();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  if (!hydrated) {
    return (
      <div className="min-h-screen w-full" style={gradientStyle}>
        <div className="max-w-[1400px] mx-auto px-3.5 py-7">
          <div className="flex items-center gap-3 mb-4">
            <CalendarDays className="h-5 w-5" />
            <h1 className="text-2xl font-bold">Course Planner</h1>
          </div>
          <div className="rounded-3xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-neutral-900/50 p-6">
            <div className="animate-pulse text-sm text-muted-foreground">Loading your courses…</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full overflow-x-hidden" style={gradientStyle}>
      <div className="max-w-[1400px] mx-auto px-3 py-7 space-y-7">
        {/* Top header: title on first row, tabs on second row; course controls stay at top-right */}
        <div className="relative">
          <div className="flex items-center gap-3 flex-wrap py-0">
            <CalendarDays className="h-5 w-5" />
            <h1 className="text-2xl font-bold">Course Planner</h1>
          </div>
          <div className="mt-2 pr-56">
            <TopTabsInline />
          </div>

          {/* Course switcher controls positioned above at top-right */}
          <div className="absolute top-0 right-0 flex flex-col items-end gap-2">
            <Select
              value={course?.id ?? ""}
              onValueChange={(v) => {
                if (v === "__add_new__") {
                  const id = addCourse(key, { title: "New Course", code: "" });
                  setSelectedCourse(id);
                } else {
                  setSelectedCourse(v);
                }
              }}
            >
              <SelectTrigger className="h-9 rounded-xl border border-black/10 bg-white/80 dark:bg-neutral-900/60 backdrop-blur min-w-[240px]">
                <SelectValue placeholder="Select course" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border border-black/10 dark:border-white/10 bg-white/90 dark:bg-neutral-900/90 backdrop-blur shadow-xl data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95">
                {courses.map((c) => (
                  <SelectItem key={c.id} value={c.id} className="cursor-pointer">
                    <span className="font-medium">{c.code || ""}</span>
                    {c.title ? <span className="opacity-70">{c.code ? " \u2014 " : ""}{c.title}</span> : null}
                  </SelectItem>
                ))}
                <div className="my-1 border-t border-black/10 dark:border-white/10" />
                <SelectItem value="__add_new__" className="cursor-pointer">
                  <span className="inline-flex items-center"><Plus className="h-4 w-4 mr-2" /> Add New Course</span>
                </SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm" className="h-8 rounded-full px-3" onClick={() => setSelectedCourse(addCourse(key, { title: "New Course" }))}>
              <Plus className="h-4 w-4 mr-1" /> Add Course
            </Button>
          </div>
        </div>

        {/* === Two-column layout (30 / 70) ====================================== */}
        <div className="grid grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN (30%) — schedule → tasks → files */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            {/* Weekly checkbox schedule */}
            <Card className="border-0 shadow-lg rounded-3xl bg-white/80 dark:bg-neutral-900/60">
              <CardContent className="p-4">
                <div className="text-sm font-semibold mb-2">This Week</div>
                <div className="grid grid-cols-7 gap-2">
                  {DAYS.map((d, idx) => (
                    <label
                      key={idx}
                      className="inline-flex flex-col items-center text-xs rounded-lg p-1 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                    >
                      <input
                        type="checkbox"
                        className="h-5 w-5 accent-neutral-600 dark:accent-neutral-200"
                      />
                      <span className="mt-1 text-muted-foreground">{d}</span>
                    </label>
                  ))}
                </div>
                <div className="text-xs text-muted-foreground mt-3">
                  Use these to mark attendance/completion for this week.
                </div>
              </CardContent>
            </Card>

            {/* Task Tracker (per-course) */}
            <Card className="border-0 shadow-lg rounded-3xl bg-white/80 dark:bg-neutral-900/60">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm font-semibold">Task Tracker</div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      addTask(key, course!.id, {
                        id: Math.random().toString(36).slice(2, 8),
                        title: "New Task",
                        status: "in-progress",
                      })
                    }
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add Task
                  </Button>
                </div>

                <div className="space-y-2">
                  {course?.tasks.map((t) => (
                    <div
                      key={t.id}
                      className="grid grid-cols-[1fr_160px_160px_120px] gap-3 items-center p-2 rounded-xl border border-black/10 dark:border-white/10"
                    >
                      <Input
                        value={t.title}
                        onChange={(e) => updateTask(key, course!.id, { ...t, title: e.target.value })}
                      />
                      <Input
                        type="datetime-local"
                        value={t.due || ""}
                        onChange={(e) => updateTask(key, course!.id, { ...t, due: e.target.value })}
                      />
                      <select
                        className="h-9 rounded-xl border border-black/10 bg-white dark:bg-neutral-900 px-3"
                        value={t.status}
                        onChange={(e) =>
                          updateTask(key, course!.id, {
                            ...t,
                            status: e.target.value as import("@/store/coursePlannerStore").Course["tasks"][number]["status"],
                          })
                        }
                      >
                        <option value="in-progress">In-Progress</option>
                        <option value="complete">Complete</option>
                        <option value="overdue">Overdue</option>
                      </select>
                      <div className="flex items-center gap-2">
                        <Input
                          className="w-[90px]"
                          type="number"
                          step="0.1"
                          value={t.grade ?? ""}
                          onChange={(e) =>
                            updateTask(key, course!.id, {
                              ...t,
                              grade: e.target.value === "" ? undefined : Number(e.target.value),
                            })
                          }
                          placeholder="%"
                        />
                        <Button size="sm" variant="outline" onClick={() => removeTask(key, course!.id, t.id)}>
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Folder-style storage */}
            <Card className="border-0 shadow-lg rounded-3xl bg-white/80 dark:bg-neutral-900/60">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold">Course Files</div>
                  <div className="flex items-center gap-2">
                    <Select value={uploadTo} onValueChange={setUploadTo}>
                      <SelectTrigger className="h-9 rounded-xl min-w-[180px] bg-white/80 dark:bg-neutral-900/60">
                        <SelectValue placeholder="Upload to" />
                      </SelectTrigger>
                      <SelectContent>
                        {course?.folders.map((f) => (
                          <SelectItem key={f.id} value={f.path}>{f.path}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input type="file" multiple onChange={(e) => onUpload(uploadTo, e.target.files)} />
                  </div>
                </div>

                {/* Add folder */}
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="New folder name (e.g., lectures/week1)"
                    value={newFolder}
                    onChange={(e) => setNewFolder(e.target.value)}
                  />
                  <Button onClick={handleAddFolder}>Add Folder</Button>
                </div>

                {/* Folders and files list */}
                <div className="space-y-3">
                  {course?.folders.map((fold) => (
                    <div key={fold.id} className="rounded-xl border border-black/10 dark:border-white/10 p-3 bg-white/70 dark:bg-neutral-900/60">
                      <div className="flex items-center justify-between mb-2">
                        {renamingId === fold.id ? (
                          <div className="flex items-center gap-2">
                            <Input
                              value={renameText}
                              onChange={(e) => setRenameText(e.target.value)}
                              className="h-8"
                            />
                            <Button
                              size="sm"
                              onClick={() => {
                                if (!course) return;
                                const val = renameText.trim();
                                if (!val) return;
                                renameFolder(key, course.id, fold.id, val);
                                setRenamingId(null);
                                setRenameText("");
                              }}
                            >Save</Button>
                            <Button size="sm" variant="outline" onClick={() => { setRenamingId(null); setRenameText(""); }}>Cancel</Button>
                          </div>
                        ) : (
                          <div className="text-xs font-semibold">{fold.path}</div>
                        )}
                        {renamingId !== fold.id && (
                          <Button size="sm" variant="outline" onClick={() => { setRenamingId(fold.id); setRenameText(fold.path); }}>Rename</Button>
                        )}
                      </div>

                      {/* file list */}
                      {fold.files.length === 0 ? (
                        <div className="text-xs text-muted-foreground">No files</div>
                      ) : (
                        <div className="overflow-x-auto">
                          <div className="min-w-[420px]">
                            <div className="grid grid-cols-[1fr_90px_180px] gap-2 px-2 py-1 text-[11px] text-muted-foreground border-b border-black/10 dark:border-white/10">
                              <div>Name</div>
                              <div className="text-right">Size</div>
                              <div className="text-right">Actions</div>
                            </div>
                            {fold.files.map((f) => (
                              <div key={f.id} className="grid grid-cols-[1fr_90px_180px] gap-2 items-center px-2 py-1 border-b border-black/5 dark:border-white/5 text-xs">
                                <div className="truncate" title={f.name}>{f.name}</div>
                                <div className="text-right">{(f.size / 1024).toFixed(1)} KB</div>
                                <div className="flex items-center justify-end gap-2">
                                  <Button size="sm" variant="outline" onClick={() => openFile(f)}>Open</Button>
                                  <Select
                                    value={fold.path}
                                    onValueChange={(to) => {
                                      if (!course) return;
                                      if (to === fold.path) return;
                                      moveFile(key, course.id, f.id, fold.path, to);
                                    }}
                                  >
                                    <SelectTrigger className="h-8 w-[140px]">
                                      <SelectValue placeholder="Move to" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {course.folders.map((fd) => (
                                        <SelectItem key={fd.id} value={fd.path}>{fd.path}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT COLUMN (70%) — title → meta → notes */}
          <div className="col-span-12 lg:col-span-8 space-y-6">
            {/* Course title (single control at the top) */}
            <Card className="border-0 shadow-lg rounded-3xl bg-white/80 dark:bg-neutral-900/60">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Input
                    value={course?.title || ""}
                    onChange={(e) => updateCourse(key, { ...course!, title: e.target.value })}
                    placeholder="Course Title"
                  />
                  <Input
                    className="w-[160px]"
                    value={course?.code || ""}
                    onChange={(e) => updateCourse(key, { ...course!, code: e.target.value })}
                    placeholder="Code"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Instructor + Class Time/Room (auto) + Syllabus */}
            <Card className="border-0 shadow-lg rounded-3xl bg-white/80 dark:bg-neutral-900/60">
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div>
                    <Label className="text-xs">Instructor</Label>
                    <Input
                      value={course?.instructor || ""}
                      onChange={(e) => updateCourse(key, { ...course!, instructor: e.target.value })}
                      placeholder="Type name"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Class Time</Label>
                    <Input disabled value={classMeta.time} />
                  </div>
                  <div>
                    <Label className="text-xs">Room No.</Label>
                    <Input disabled value={classMeta.room} />
                  </div>
                  <div>
                    <Label className="text-xs">Syllabus (URL)</Label>
                    <Input
                      value={course?.syllabusUrl || ""}
                      onChange={(e) => updateCourse(key, { ...course!, syllabusUrl: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notes: modules inside the notes card as compact chips on the left */}
            <Card className="border-0 shadow-lg rounded-3xl bg-white/80 dark:bg-neutral-900/60">
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-semibold">Notes</div>
                  <Button size="sm" className="h-8 rounded-full px-3" onClick={onSaveModuleNotes} disabled={!course || !activeModuleId}>
                    <SaveIcon className="h-4 w-4 mr-1" /> Save
                  </Button>
                </div>
                <div className="flex items-start gap-3">
                  {/* Module chips column */}
                  <div className="flex flex-col gap-2 pt-1">
                    <div className="text-xs font-semibold text-muted-foreground mb-1"></div>
                    <div className="flex flex-col gap-2">
                      {course?.modules.map((m) => (
                        <div key={m.id} className="relative group">
                          <Button
                            type="button"
                            variant={m.id === activeModuleId ? "default" : "outline"}
                            size="icon"
                            className={`h-8 w-8 rounded-md ${m.id === activeModuleId ? '' : 'bg-white/70 dark:bg-neutral-900/60'}`}
                            onClick={() => setActiveModuleId(m.id)}
                            title={m.title}
                          >
                            <span className="text-[11px] font-semibold">{m.title}</span>
                          </Button>
                          {/* Hover delete X */}
                          <button
                            aria-label="Remove module"
                            className="hidden group-hover:flex absolute -top-1 -right-1 h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white text-[10px] shadow"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setPendingDelete({ id: m.id, title: m.title });
                              setConfirmText("");
                              setDeleteOpen(true);
                            }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-md"
                        onClick={() => {
                          const nextTitle = `M${(course?.modules.length || 0) + 1}`;
                          const id = addModule(key, course!.id, nextTitle);
                          setActiveModuleId(id);
                        }}
                        title="Add module"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Editor area grows */}
                  <div className="flex-1 min-w-0">
                    {course && activeModuleId ? (
                      <RichTextEditor
                        ref={editorRef}
                        value={course.modules.find((m) => m.id === activeModuleId)?.html || ""}
                        onChange={(html) => updateModule(key, course.id, activeModuleId, html)}
                        placeholder="Write your module notes here…"
                      />
                    ) : (
                      <div className="text-sm text-muted-foreground p-4">
                        Select a module on the left or create a new one.
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteOpen} onOpenChange={(open) => {
        setDeleteOpen(open);
        if (!open) { setPendingDelete(null); setConfirmText(""); }
      }}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Delete module?</DialogTitle>
            <DialogDescription>
              This will permanently remove the module and its notes from this course. To confirm, type the module title below.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <div className="text-sm">Module: <span className="font-semibold">{pendingDelete?.title}</span></div>
            <Input
              autoFocus
              placeholder="Type module title to confirm"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setDeleteOpen(false); setPendingDelete(null); setConfirmText(""); }}>Cancel</Button>
            <Button
              variant="destructive"
              disabled={!pendingDelete || confirmText.trim() !== (pendingDelete?.title || "") || !course}
              onClick={() => {
                if (!course || !pendingDelete) return;
                // Remove and move selection to next available module
                const next = course.modules.find((x) => x.id !== pendingDelete.id)?.id;
                removeModule(key, course.id, pendingDelete.id);
                if (activeModuleId === pendingDelete.id) setActiveModuleId(next);
                setDeleteOpen(false);
                setPendingDelete(null);
                setConfirmText("");
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    );
  }
