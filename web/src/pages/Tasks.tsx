import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarDays, Plus } from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { useAcademicPlan } from "@/store/academicPlanStore";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useTheme, PALETTES } from "@/store/theme";

type Task = {
  id: string;
  courseId: string; // from Academic Planner's course row id
  title: string;
  status: "Not Started" | "In Progress" | "Completed";
  dueDate?: string;
  dueTime?: string;
  grade?: string;
};

// ---------- Gradient background (match Dashboard/Planner/Schedule) ----------
function useThemedGradient() {
  const theme = useTheme();
  const THEME_COLORS = PALETTES[theme.palette];
  const [accentLocal, setAccentLocal] = React.useState(theme.accent);
  React.useEffect(() => setAccentLocal(theme.accent), [theme.accent]);

  return React.useMemo(() => {
    const alpha = Math.min(0.35, Math.max(0.12, (accentLocal as number) / 260));
    const hex = Math.round(alpha * 255)
      .toString(16)
      .padStart(2, "0");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = theme.mode === "dark" || (theme.mode === "system" && prefersDark);
    const base = isDark
      ? "linear-gradient(135deg, #0b0f19 0%, #0a0a0a 70%)"
      : "linear-gradient(135deg, #ffffff 0%, #f8fbff 65%)";
    const tintA = `radial-gradient(circle at 8% 0%, ${THEME_COLORS[0]}${hex} 0%, transparent 40%)`;
    const tintB = `radial-gradient(circle at 92% 12%, ${THEME_COLORS[3]}${hex} 0%, transparent 45%)`;
    const tintC = `radial-gradient(circle at 50% 120%, ${THEME_COLORS[2]}${hex} 0%, transparent 55%)`;
    return {
      backgroundImage: `${tintA}, ${tintB}, ${tintC}, ${base}`,
      backgroundRepeat: "no-repeat, no-repeat, no-repeat, no-repeat",
      backgroundAttachment: "fixed, fixed, scroll, fixed",
      backgroundPosition: "8% 0%, 92% 12%, 50% 100%, 0 0",
    } as React.CSSProperties;
  }, [accentLocal, theme.mode, THEME_COLORS]);
}

// ---------- Inline top tabs (beside title) ----------
function TopTabsInline({ active }: { active: "dashboard"|"planner"|"tasks"|"schedule"|"courses"|"gpa"|"scholarships"|"textbooks"|"settings" }) {
  const navigate = useNavigate();
  const tabs = [
    { key: "dashboard", label: "Dashboard", path: "/" },
    { key: "planner", label: "Academic Planner", path: "/planner" },
    { key: "tasks", label: "Task Tracker", path: "/tasks" },
    { key: "schedule", label: "Schedule Planner", path: "/schedule" },
    // match existing routes
    { key: "courses", label: "Course Planner", path: "/course-planner" },
    { key: "gpa", label: "GPA Calc", path: "/gpa-calculator" },
    { key: "scholarships", label: "Scholarships", path: "/scholarships" },
    { key: "textbooks", label: "Textbooks", path: "/textbooks" },
    { key: "settings", label: "Settings", path: "/settings" },
  ] as const;
  return (
    <div className="flex items-center gap-2 flex-nowrap whitespace-nowrap">
      {tabs.map((t) => (
        <Button
          key={t.key}
          variant={active === t.key ? "default" : "outline"}
          className={`h-9 rounded-full ${active === t.key ? "" : "bg-white/70 dark:bg-neutral-900/60"}`}
          onClick={() => navigate(t.path)}
        >
          {t.label}
        </Button>
      ))}
    </div>
  );
}

export default function Tasks() {
  const gradientStyle = useThemedGradient();
  // Pull academic plan data
  const years = useAcademicPlan((s) => s.years);

  // Active selection (default to first year/term)
  const [activeYearId, setActiveYearId] = React.useState<string | undefined>(() => years[0]?.id);
  const [activeTermId, setActiveTermId] = React.useState<string | undefined>(() => years[0]?.terms[0]?.id);

  // Keep active ids valid when plan changes
  React.useEffect(() => {
    if (!years.length) return;
    const year = years.find((y) => y.id === activeYearId) || years[0];
    const term = year.terms.find((t) => t.id === activeTermId) || year.terms[0];
    if (year.id !== activeYearId) setActiveYearId(year.id);
    if (term?.id !== activeTermId) setActiveTermId(term?.id);
  }, [years, activeYearId, activeTermId]);

  const activeYear = React.useMemo(() => years.find((y) => y.id === activeYearId), [years, activeYearId]);
  const activeTerm = React.useMemo(() => activeYear?.terms.find((t) => t.id === activeTermId), [activeYear, activeTermId]);
  const termCourses = React.useMemo(() => (activeTerm?.courses || []).filter((c) => (c.code?.trim() || c.name?.trim())), [activeTerm]);

  // Per-term rows map
  const [rowsByKey, setRowsByKey] = React.useState<Record<string, Task[]>>({});
  const termKey = activeYear && activeTerm ? `${activeYear.id}:${activeTerm.id}` : "";
  const rows = rowsByKey[termKey] || [];

  // Ensure at least 20 default rows whenever term changes
  React.useEffect(() => {
    if (!termKey) return;
    setRowsByKey((prev) => {
      const current = prev[termKey] || [];
      if (current.length >= 20) return prev;
      const missing = 20 - current.length;
      const blanks: Task[] = Array.from({ length: missing }).map(() => ({
        id: crypto.randomUUID(),
        courseId: "",
        title: "",
        status: "Not Started",
        dueDate: "",
        dueTime: "",
        grade: "",
      }));
      return { ...prev, [termKey]: [...current, ...blanks] };
    });
  }, [termKey]);

  // (removed legacy first-load top-up; now handled per-term in the effect above)

  const completed = rows.filter(r => r.status === "Completed").length;
  const pct = rows.length ? Math.round((completed / rows.length) * 100) : 0;

  // Donut chart data
  const donut = [
    { name: "done", value: pct },
    { name: "left", value: 100 - pct },
  ];

  function addRow() {
    if (!termKey) return;
    setRowsByKey((prev) => ({
      ...prev,
      [termKey]: [
        ...(prev[termKey] || []),
        { id: crypto.randomUUID(), courseId: "", title: "", status: "Not Started", dueDate: "", dueTime: "", grade: "" },
      ],
    }));
  }

  function updateRow(id: string, patch: Partial<Task>) {
    if (!termKey) return;
    setRowsByKey((prev) => ({
      ...prev,
      [termKey]: (prev[termKey] || []).map((r) => (r.id === id ? { ...r, ...patch } : r)),
    }));
  }

  // Term/Yr selection dialog
  const [termDialogOpen, setTermDialogOpen] = React.useState(false);
  function selectYearTerm(yId: string, tId: string) {
    setActiveYearId(yId);
    setActiveTermId(tId);
    setTermDialogOpen(false);
  }

  return (
    <div className="min-h-screen w-full" style={gradientStyle}>
      <div className="max-w-[1400px] mx-auto px-4 py-6 space-y-6">
  {/* Header: title + tabs on the left, donut on the right (match other pages) */}
  <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 flex-wrap min-w-0">
            <CalendarDays className="h-5 w-5" />
            <h1 className="text-2xl font-bold">Task Tracker</h1>
            <div className="min-w-0 overflow-x-hidden">
              <TopTabsInline active="tasks" />
            </div>
          </div>
          <Card className="shrink-0 border-0 shadow-lg rounded-3xl bg-white/80 dark:bg-neutral-900/60 w-[176px] sm:w-[200px] md:w-[220px]">
            <CardContent className="p-3 sm:p-3 md:p-4">
              <div className="h-28 sm:h-28 md:h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie dataKey="value" data={donut} innerRadius={36} outerRadius={48} startAngle={90} endAngle={-270} paddingAngle={2} cornerRadius={3} stroke="transparent">
                      {donut.map((_, i) => (
                        <Cell key={i} fill={i === 0 ? "hsl(var(--primary))" : "#e5e7eb"} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="text-center text-sm mt-1">{pct}% Completed</div>
            </CardContent>
          </Card>
        </div>

        {/* Full-width task canvas */}
        <Card className="border-0 shadow-lg rounded-3xl bg-white/80 dark:bg-neutral-900/60 overflow-hidden">
          <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5" />
                {activeYear && activeTerm ? (
                  <span>{activeYear.label} • {activeTerm.name}</span>
                ) : (
                  <span>Current Term</span>
                )}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Dialog open={termDialogOpen} onOpenChange={setTermDialogOpen}>
                <Button
                  variant="outline"
                  className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-neutral-900/60"
                  onClick={() => setTermDialogOpen(true)}
                >
                  {activeYear && activeTerm ? `${activeYear.label} • ${activeTerm.name}` : "Select Term"}
                </Button>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Select School Year • Term</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 max-h-[60vh] overflow-auto">
                    {years.map((y) => (
                      <div key={y.id} className="rounded-xl border p-2">
                        <div className="text-sm font-medium mb-2">{y.label}</div>
                        <div className="flex flex-wrap gap-2">
                          {y.terms.map((t) => (
                            <Button key={t.id} variant={y.id === activeYearId && t.id === activeTermId ? 'default' : 'outline'} className="rounded-xl" onClick={() => selectYearTerm(y.id, t.id)}>
                              {t.name}
                            </Button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
              <Button size="sm" className="rounded-2xl" onClick={addRow}><Plus className="h-4 w-4 mr-1"/>Add Task</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="w-full overflow-x-auto rounded-2xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-neutral-900/50 shadow-sm">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-white/70 dark:bg-neutral-900/50 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-neutral-900/40">
                  <tr className="text-left">
                    <th className="p-3 w-[180px]">Course</th>
                    <th className="p-3 w-[420px]">Assignment / To‑do</th>
                    <th className="p-3 w-[150px]">Status</th>
                    <th className="p-3 w-[140px]">Due Date</th>
                    <th className="p-3 w-[110px]">Due Time</th>
                    <th className="p-3 w-[90px]">Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id} className="border-t border-black/5 dark:border-white/10">
                      <td className="p-2">
                        <Select value={r.courseId} onValueChange={(v) => updateRow(r.id, { courseId: v })}>
                          <SelectTrigger className="h-8 text-left"><SelectValue placeholder="Select course"/></SelectTrigger>
                          <SelectContent className="bg-white/90 dark:bg-neutral-900/90 backdrop-blur border border-black/10 dark:border-white/10">
                            {termCourses.length === 0 && (
                              <SelectItem value="__no_courses__" disabled>No courses</SelectItem>
                            )}
                            {termCourses.map((c) => (
                              <SelectItem key={c.id} value={c.id}>
                                {c.code || c.name || 'Untitled'}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="p-2">
                        <Input className="h-8" value={r.title} onChange={(e) => updateRow(r.id, { title: e.target.value })} placeholder="Assignment title" />
                      </td>
                      <td className="p-2">
                        <Select value={r.status} onValueChange={(v) => updateRow(r.id, { status: v as Task["status"] })}>
                          <SelectTrigger className="h-8 text-left"><SelectValue placeholder="Status"/></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Not Started">Not Started</SelectItem>
                            <SelectItem value="In Progress">In Progress</SelectItem>
                            <SelectItem value="Completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="p-2">
                        <Input className="h-8" type="date" value={r.dueDate || ""} onChange={(e) => updateRow(r.id, { dueDate: e.target.value })} />
                      </td>
                      <td className="p-2">
                        <Input className="h-8" type="time" value={r.dueTime || ""} onChange={(e) => updateRow(r.id, { dueTime: e.target.value })} />
                      </td>
                      <td className="p-2">
                        <Input className="h-8" value={r.grade || ""} onChange={(e) => updateRow(r.id, { grade: e.target.value })} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
