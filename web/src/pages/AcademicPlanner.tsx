/**
 * AcademicPlanner — Annotated & Organized
 * --------------------------------------
 * Screen for planning courses per School Year → Term.
 * - Matches Schedule Planner layout: horizontal scroll for terms, fixed right rail for "+ Add New Term",
 *   bottom "+ Add New School Year" button, and top inline tabs beside the title.
 * - Uses the same dynamic gradient background as Dashboard (palette + accent aware).
 * - Each term has an editable table of rows: Code · Course Name · Sec. · Credits · GPA.
 * - Shows running totals: Total Credits & weighted Term GPA.
 *
 * Major sections in this file:
 *   1) Imports & small utilities
 *   2) TopTabsInline (inline nav tabs beside title)
 *   3) RowEditor (single editable table row)
 *   4) TermCard (one term canvas)
 *   5) AcademicPlanner (page) — glue + dialogs + gradient
 *
 * Notes / Conventions:
 * - Keep UI-only state local (e.g., dialogs, refs). Persisted data lives in the zustand store.
 * - Select narrow slices from the store to limit unnecessary re-renders.
 * - Be careful with horizontal scroll containers: give term canvases a min-width.
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAcademicPlan, CourseRow } from "@/store/academicPlanStore";
import { useTheme, PALETTES } from "@/store/theme";
import { useSettings } from "@/store/settingsStore";

// ----------------------------------
// 1) Imports & small utilities
// ----------------------------------

/** CSS-only scrollbar skins (light/dark) for horizontal term scrollers. */
const scrollbarStyles = `
  .light-scrollbar::-webkit-scrollbar { width: 10px; height: 10px; }
  .light-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.05); border-radius: 5px; }
  .light-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.20); border-radius: 5px; }
  .light-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.30); }

  .dark-scrollbar::-webkit-scrollbar { width: 10px; height: 10px; }
  .dark-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.10); border-radius: 5px; }
  .dark-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.20); border-radius: 5px; }
  .dark-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.30); }
`;

/** Build the same gradient background used on the Dashboard/Schedule pages. */
function useThemedGradient() {
  const theme = useTheme();
  const THEME_COLORS = PALETTES[theme.palette];
  const [accentLocal, setAccentLocal] = React.useState(theme.accent);
  React.useEffect(() => setAccentLocal(theme.accent), [theme.accent]);

  return React.useMemo(() => {
    const alpha = Math.min(0.35, Math.max(0.12, accentLocal / 260));
    const hex = Math.round(alpha * 255).toString(16).padStart(2, "0");
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

// ----------------------------------
// 2) Top tabs beside page title
// ----------------------------------

/**
 * TopTabsInline
 * Compact navigation tabs shown next to the page title.
 * Uses React Router to navigate between top-level pages.
 */
function TopTabsInline() {
  const navigate = useNavigate();
  const tabs = [
    { label: "Dashboard", path: "/" },
    { label: "Academic Planner", path: "/planner", active: true },
    { label: "Task Tracker", path: "/tasks" },
    { label: "Schedule Planner", path: "/schedule" },
    { label: "Course Planner", path: "/courses" },
    { label: "Scholarships", path: "/scholarships" },
    { label: "Textbooks", path: "/textbooks" },
    { label: "Settings", path: "/settings" },
  ];
  return (
    <div className="flex items-center gap-2 flex-wrap">
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

// ----------------------------------
// 3) RowEditor — single editable row
// ----------------------------------

/** Props for RowEditor. */
interface RowEditorProps {
  value: CourseRow;
  onChange: (r: CourseRow) => void;
  onRemove: () => void;
}

/**
 * RowEditor
 * Renders a single row in the term table, with inline inputs.
 * - The course name input is styled like a "pill" button per your design.
 * - Credits accepts decimals; GPA accepts 0–4.00 values.
 */
function RowEditor({ value, onChange, onRemove }: RowEditorProps) {
  return (
    <div className="grid grid-cols-[30px_100px_1fr_90px_70px_70px] gap-3 items-center py-2">
      {/* Remove row */}
      <Button variant="ghost" size="icon" onClick={onRemove} className="bg-white/80 dark:bg-neutral-900/60 border-black/10">
        <Trash2 className="h-4 w-4" />
      </Button>

      {/* Code */}
      <Input value={value.code} onChange={(e) => onChange({ ...value, code: e.target.value })} placeholder="Code" />

      {/* Course name (pill) */}
      <div className="flex">
        <input
          className="flex-1 h-9 rounded-full border border-black/10 dark:border-white/15 
                    bg-white/80 dark:bg-neutral-900/60 px-3 outline-none"
          value={value.name}
          onChange={(e) => onChange({ ...value, name: e.target.value })}
          placeholder="Course name"
        />
      </div>

      {/* Section */}
      <Input value={value.section} onChange={(e) => onChange({ ...value, section: e.target.value })} placeholder="Sec." />

      {/* Credits */}
      <Input type="number" step="0.5" value={value.credits} onChange={(e) => onChange({ ...value, credits: Number(e.target.value) || 0 })} placeholder="Cr." />

      {/* GPA (0.00–4.00) */}
      <Input
        type="number"
        step="0.01"
        min={0}
        max={4}
        value={value.gpa ?? ""}
        onChange={(e) => onChange({ ...value, gpa: e.target.value === "" ? undefined : Number(e.target.value) })}
        placeholder="GPA"
      />
    </div>
  );
}

// ----------------------------------
// 4) TermCard — one term canvas
// ----------------------------------

/** Props for one term canvas. */
interface TermCardProps { yearId: string; termIndex: number; }

/**
 * TermCard
 * Displays and edits a single term.
 * - Shows header, column headers, editable rows, and footer with totals.
 * - Totals: credits sum + weighted GPA (by credits).
 */
function TermCard({ yearId, termIndex }: TermCardProps) {
  // Select only what we need from the store
  const years = useAcademicPlan((s) => s.years);
  const addRow = useAcademicPlan((s) => s.addRow);
  const updateRow = useAcademicPlan((s) => s.updateRow);
  const removeRow = useAcademicPlan((s) => s.removeRow);
  const gpaScale = useSettings((s) => s.gpaScale);

  const year = years.find((y) => y.id === yearId);
  const term = year?.terms?.[termIndex];
  const courses = React.useMemo(() => term?.courses ?? [], [term?.courses]);

  // Derived totals
  const totalCredits = React.useMemo(
    () => courses.reduce((sum, r) => sum + (Number(r.credits) || 0), 0),
    [courses]
  );

  const termGPA = React.useMemo(() => {
    const { wSum, cSum } = courses.reduce(
      (acc, r) => {
        const cr = Number(r.credits) || 0;
        const gp = typeof r.gpa === "number" ? r.gpa : undefined;
        if (cr > 0 && gp !== undefined) { acc.wSum += cr * gp; acc.cSum += cr; }
        return acc;
      },
      { wSum: 0, cSum: 0 }
    );
    return cSum > 0 ? wSum / cSum : 0;
  }, [courses]);

  // Convert display GPA if the user prefers a 1.00-highest scale (maps 0–4 → 5–1)
  const displayTermGPA = React.useMemo(() => {
    const g = Math.max(0, Math.min(4, termGPA));
    return gpaScale === '1-highest' ? (5 - g) : g;
  }, [termGPA, gpaScale]);

  if (!year || !term) return null;

  return (
    <Card className="border-0 shadow-lg rounded-3xl overflow-hidden bg-white/80 dark:bg-neutral-900/60 min-w-[900px]">
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-end justify-between mb-3">
          <div className="space-y-1">
            <div className="text-sm font-semibold">{term.name}</div>
            <div className="text-xs text-muted-foreground">Program plan this term</div>
          </div>
          <Button size="sm" variant="outline" onClick={() => addRow(yearId, term.id)}>
            <Plus className="h-4 w-4 mr-1" /> Add Row
          </Button>
        </div>

        {/* Column headers */}
        <div className="grid grid-cols-[30px_100px_1fr_90px_70px_63px] gap-4 text-xs font-medium 
                        text-muted-foreground pb-1 border-b border-black/10 dark:border-white/10">
          <div></div><div>Code</div><div>Course Name</div><div>Sec.</div><div>Cr.</div><div>GPA</div>
        </div>

        {/* Editable rows */}
        <div className="divide-y divide-black/5 dark:divide-white/10">
          {term.courses.map((r) => (
            <RowEditor key={r.id} value={r} onChange={(row) => updateRow(yearId, term.id, row)} onRemove={() => removeRow(yearId, term.id, r.id)} />
          ))}
        </div>

        {/* Footer totals */}
        <div className="flex items-center justify-end pt-3 border-t border-black/5 dark:border-white/10 mt-3 gap-6">
          <div className="text-sm">
            <span className="text-muted-foreground mr-2">Total Credits</span><span className="font-semibold">{totalCredits}</span>
          </div>
          <div className="text-sm">
            <span className="text-muted-foreground mr-2">Term GPA</span><span className="font-semibold">{displayTermGPA.toFixed(2)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ----------------------------------
// 5) AcademicPlanner — page component
// ----------------------------------

/**
 * AcademicPlanner (page)
 * - Renders all School Years, each with horizontally scrollable Terms.
 * - Keeps the "+ Add New Term" rail fixed on the right, matching Schedule Planner.
 * - Provides a dialog to pick/add a School Year and auto-scroll to it.
 */
export default function AcademicPlanner() {
  const gradientStyle = useThemedGradient();
  const theme = useTheme();
  // compute scrollbar skin class once per render
  const scrollCls = React.useMemo(() => {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = theme.mode === "dark" || (theme.mode === "system" && prefersDark);
    return isDark ? "dark-scrollbar" : "light-scrollbar";
  }, [theme.mode]);

  // --- store selections & helpers ---
  const years = useAcademicPlan((s) => s.years);
  const selectedYearId = useAcademicPlan((s) => s.selectedYearId);
  const setSelectedYear = useAcademicPlan((s) => s.setSelectedYear);
  const addYear = useAcademicPlan((s) => s.addYear);
  const setTermsCount = useAcademicPlan((s) => s.setTermsCount);

  const activeYearId = selectedYearId || years[0]?.id;
  const activeYear = years.find((y) => y.id === activeYearId);

  // Refs to measure term heights per year so the right rail matches the tallest term.
  const termRefs = React.useRef<Record<string, HTMLDivElement[]>>({});
  const [termHeights, setTermHeights] = React.useState<Record<string, number>>({});

  /** Recalculate the maximum canvas height for a given year. */
  const updateHeightForYear = React.useCallback((yearId: string) => {
    if (!termRefs.current[yearId]?.length) return;
    const heights = termRefs.current[yearId].filter(Boolean).map((ref) => ref?.offsetHeight || 0);
    const maxHeight = heights.length > 0 ? Math.max(...heights) : 560;
    setTermHeights((prev) => (prev[yearId] === maxHeight ? prev : { ...prev, [yearId]: maxHeight }));
  }, []);

  // Observe content changes in each term (rows added/removed → height changes)
  React.useEffect(() => {
    const observers: MutationObserver[] = [];
    years.forEach((y) => {
      if (!termRefs.current[y.id]) return;
      termRefs.current[y.id].forEach((ref) => {
        if (!ref) return;
        const obs = new MutationObserver(() => updateHeightForYear(y.id));
        obs.observe(ref, { childList: true, subtree: true, attributes: true });
        observers.push(obs);
      });
      updateHeightForYear(y.id);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, [years, updateHeightForYear]);

  // Year DOM refs to scroll into view when selected/added
  const yearRefs = React.useRef<Record<string, HTMLDivElement | null>>({});

  /** Compute the next SY label based on the highest existing year. */
  const getNextYearLabel = React.useCallback(() => {
    if (years.length === 0) return "SY 2025–2026";
    let maxYear = 2025;
    years.forEach((y) => {
      const match = y.label.match(/SY (\d{4})–(\d{4})/);
      if (match) { const start = parseInt(match[1], 10); if (start > maxYear) maxYear = start; }
    });
    return `SY ${maxYear + 1}–${maxYear + 2}`;
  }, [years]);

  // School year chooser dialog
  const [yearOpen, setYearOpen] = React.useState(false);

  return (
    <div className="min-h-screen w-full" style={gradientStyle}>
      <style>{scrollbarStyles}</style>
      <div className="max-w-[1400px] mx-auto px-4 py-6 space-y-6">
        {/* Header (title + tabs + year chooser button) */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            <CalendarDays className="h-5 w-5" />
            <h1 className="text-2xl font-bold">Academic Planner</h1>
            <TopTabsInline />
          </div>
          <Button variant="outline" className="rounded-2xl" onClick={() => setYearOpen(true)}>
            {activeYear?.label || "Choose School Year"} <span className="ml-1 opacity-60">▼</span>
          </Button>
        </div>

        {/* Year chooser dialog */}
        <Dialog open={yearOpen} onOpenChange={setYearOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>Select School Year</DialogTitle></DialogHeader>
            <div className="space-y-2 max-h-64 overflow-auto">
              {years.map((y) => (
                <Button
                  key={y.id}
                  variant={y.id === activeYearId ? "default" : "outline"}
                  className="w-full justify-start rounded-xl text-lg py-5"
                  onClick={() => {
                    setSelectedYear(y.id);
                    setYearOpen(false);
                    setTimeout(() => yearRefs.current[y.id]?.scrollIntoView({ behavior: "smooth", block: "start" }), 10);
                  }}
                >
                  {y.label}
                </Button>
              ))}
            </div>
            <DialogFooter className="mt-3">
              <Button
                onClick={() => {
                  const newLabel = getNextYearLabel();
                  addYear(newLabel);
                  setYearOpen(false);
                  setTimeout(() => {
                    const last = years[years.length - 1];
                    if (last?.id) {
                      setSelectedYear(last.id);
                      yearRefs.current[last.id]?.scrollIntoView({ behavior: "smooth" });
                    }
                  }, 10);
                }}
              >
                <Plus className="h-4 w-4 mr-1" /> Add School Year
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Render all School Years vertically (each row horizontally scrolls its Terms) */}
        <div className="space-y-16">
          {years.map((y) => (
            <div key={y.id} className="space-y-4" ref={(el) => { yearRefs.current[y.id] = el; }}>
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight">
                  {y.label}
                </h2>
              </div>

              <div className="flex">
                {/* Scrollable Terms */}
                <div className={`overflow-x-auto flex-1 ${scrollCls}`}>
                  <div className="flex gap-6 items-start min-w-max">
                    {y.terms.map((_, idx) => (
                      <div
                        key={idx}
                        ref={(el) => {
                          if (!termRefs.current[y.id]) termRefs.current[y.id] = [];
                          if (el) {
                            while (termRefs.current[y.id].length <= idx) termRefs.current[y.id].push(null as unknown as HTMLDivElement);
                            termRefs.current[y.id][idx] = el;
                            setTimeout(() => updateHeightForYear(y.id), 0);
                          }
                        }}
                      >
                        <TermCard yearId={y.id} termIndex={idx} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Fixed right rail: "+ Add New Term" */}
                <div className="ml-4 w-[120px] shrink-0 flex">
                  <button
                    className="w-full rounded-2xl border border-black/10 dark:border-white/10 bg-white/70 
                              dark:bg-neutral-900/60 hover:bg-white/80 dark:hover:bg-neutral-800/60 transition"
                    style={{ height: termHeights[y.id] || 560 }}
                    onClick={() => setTermsCount(y.id, (Math.min(4, y.terms.length + 1) as 2 | 3 | 4))}
                    title={y.terms.length >= 4 ? "Max 4 terms" : "Add new term"}
                    disabled={y.terms.length >= 4}
                  >
                    <span className={`block rotate-90 whitespace-nowrap text-lg md:text-xl font-semibold tracking-wide select-none 
                                      ${y.terms.length >= 4 ? "text-muted-foreground/40" : "text-muted-foreground"}`
                                    }>
                      {y.terms.length >= 4 ? "Max Terms" : "+ Add New Term"}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom: Add New School Year */}
        <div className="mt-4 pb-8">
          <Button
            className="w-full h-24 rounded-2xl border border-black/10 dark:border-white/10 
                      bg-white/70 dark:bg-neutral-900/60 hover:bg-white/80 dark:hover:bg-neutral-800/60 
                      transition text-muted-foreground font-semibold"
            onClick={() => {
              const newLabel = getNextYearLabel();
              addYear(newLabel);
              setTimeout(() => {
                const lastYear = years[years.length - 1];
                if (lastYear?.id) {
                  setSelectedYear(lastYear.id);
                  yearRefs.current[lastYear.id]?.scrollIntoView({ behavior: "smooth" });
                }
              }, 10);
            }}
          >
            <Plus className="h-5 w-5 mr-2" /> Add New School Year
          </Button>
        </div>
      </div>
    </div>
  );
}
