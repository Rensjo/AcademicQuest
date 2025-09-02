// src/pages/SchedulePlanner.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2, CalendarDays } from "lucide-react";
import { useSchedule, DayIndex, Slot, Term } from "@/store/scheduleStore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTheme, PALETTES } from "@/store/theme";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

// Add scrollbar styles
const scrollbarStyles = `
  /* Light theme scrollbars */
  .light-scrollbar::-webkit-scrollbar {
    width: 10px;
    height: 10px;
  }
  
  .light-scrollbar::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.05);
    border-radius: 5px;
  }
  
  .light-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 5px;
  }
  
  .light-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 0, 0, 0.3);
  }
  
  /* Dark theme scrollbars - what you already have */
  .dark-scrollbar::-webkit-scrollbar {
    width: 10px;
    height: 10px;
  }
  
  .dark-scrollbar::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 5px;
  }
  
  .dark-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 5px;
  }
  
  .dark-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

// ------------------------------------------------------------
// Clean Schedule Planner (matches sketch)
// - Top inline tabs beside page title
// - No mini calendar; date range lives in a small dialog opened
//   by a button beside "Add Block"
// - Two visible term canvases for the selected school year
// - Tall right rail "+ Add New Term" with vertical text
// - Background matches Dashboard gradient
// ------------------------------------------------------------

// grid constants
const START_HOUR = 7; // 07:00
const END_HOUR = 21; // 21:00
const STEP_MIN = 30; // 30-minute increments
const ROWS = ((END_HOUR - START_HOUR) * 60) / STEP_MIN;
const ROW_H = 28; // px per row
const GRID_PX = ROWS * ROW_H; // useful for full-height right rail

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

const COLORS = [
  "#0ea5e9",
  "#22c55e",
  "#f59e0b",
  "#a78bfa",
  "#ef4444",
  "#06b6d4",
  "#f97316",
];

function hmToIndex(hm: string) {
  const [h, m] = hm.split(":").map(Number);
  const idx = (h - START_HOUR) * (60 / STEP_MIN) + Math.floor(m / STEP_MIN);
  return Math.max(0, Math.min(ROWS, idx));
}
function indexToHM(idx: number) {
  const mins = START_HOUR * 60 + idx * STEP_MIN;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

// ---------- Block Editor Dialog ----------
type Draft = {
  id?: string;
  title: string;
  courseCode?: string;
  room?: string;
  building?: string;
  link?: string;
  day: DayIndex;
  start: string;
  end: string;
  color?: string;
};

function BlockDialog({
  open,
  onOpenChange,
  initial,
  onSave,
  onDelete,
}: {
  open: boolean;
  onOpenChange: (b: boolean) => void;
  initial: Draft;
  onSave: (d: Draft) => void;
  onDelete?: () => void;
}) {
  const [d, setD] = React.useState<Draft>(initial);
  React.useEffect(() => setD(initial), [initial]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{d.id ? "Edit Block" : "Add Block"}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <Label className="text-xs">Agenda / Course name</Label>
            <Input
              value={d.title}
              onChange={(e) => setD({ ...d, title: e.target.value })}
              placeholder="e.g., Algorithms (LEC)"
            />
          </div>

          <div>
            <Label className="text-xs">Course code</Label>
            <Input
              value={d.courseCode ?? ""}
              onChange={(e) => setD({ ...d, courseCode: e.target.value })}
              placeholder="e.g., CS101"
            />
          </div>
          <div>
            <Label className="text-xs">Room</Label>
            <Input
              value={d.room ?? ""}
              onChange={(e) => setD({ ...d, room: e.target.value })}
              placeholder="e.g., B402"
            />
          </div>

          <div>
            <Label className="text-xs">Building</Label>
            <Input
              value={d.building ?? ""}
              onChange={(e) => setD({ ...d, building: e.target.value })}
              placeholder="e.g., Eng Hall"
            />
          </div>
          <div>
            <Label className="text-xs">Link (optional)</Label>
            <Input
              value={d.link ?? ""}
              onChange={(e) => setD({ ...d, link: e.target.value })}
              placeholder="https://..."
            />
          </div>

          <div>
            <Label className="text-xs">Day</Label>
            <select
              className="mt-1 h-9 w-full rounded-xl border border-black/10 bg-white dark:bg-neutral-900 px-3"
              value={d.day}
              onChange={(e) => setD({ ...d, day: Number(e.target.value) as DayIndex })}
            >
              {DAYS.map((name, idx) => (
                <option value={idx} key={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label className="text-xs">Start</Label>
            <Input
              type="time"
              value={d.start}
              onChange={(e) => setD({ ...d, start: e.target.value })}
            />
          </div>
          <div>
            <Label className="text-xs">End</Label>
            <Input
              type="time"
              value={d.end}
              onChange={(e) => setD({ ...d, end: e.target.value })}
            />
          </div>

          <div className="col-span-2">
            <Label className="text-xs">Color</Label>
            <div className="mt-1 flex flex-wrap gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setD({ ...d, color: c })}
                  className={`h-7 w-7 rounded-lg border ${
                    d.color === c ? "ring-2 ring-black/20" : "border-black/10"
                  }`}
                  style={{ background: c }}
                  title={c}
                />
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="mt-4">
          {onDelete && (
            <Button variant="destructive" onClick={onDelete}>
              <Trash2 className="h-4 w-4 mr-2" /> Delete
            </Button>
          )}
          <div className="flex-1" />
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => onSave(d)}>{d.id ? "Save" : "Add"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------- Term Range Button (opens a tiny dialog) ----------
function TermRangeButton({
  start,
  end,
  onSave,
}: {
  start?: string;
  end?: string;
  onSave: (s?: string, e?: string) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [s, setS] = React.useState<string | undefined>(start);
  const [e, setE] = React.useState<string | undefined>(end);
  React.useEffect(() => {
    setS(start);
    setE(end);
  }, [start, end]);

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)} className="rounded-2xl">
        {start && end ? `${start} — ${end}` : "Set Term Range"}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Term Date Range</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Start</Label>
              <Input type="date" value={s ?? ""} onChange={(ev) => setS(ev.target.value)} />
            </div>
            <div>
              <Label className="text-xs">End</Label>
              <Input type="date" value={e ?? ""} onChange={(ev) => setE(ev.target.value)} />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                onSave(s, e);
                setOpen(false);
              }}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ---------- One Term Column ----------
function TermColumnBody({ yearId, term }: { yearId: string; term: Term }) {
  // store actions
  const addSlot = useSchedule((s) => s.addSlot);
  const updateSlot = useSchedule((s) => s.updateSlot);
  const removeSlot = useSchedule((s) => s.removeSlot);
  const setTermDates = useSchedule((s) => s.setTermDates);

  const hasDateRange = Boolean(term.startDate && term.endDate);

  // dialog state for block editor
  const [open, setOpen] = React.useState(false);
  const [draft, setDraft] = React.useState<Draft | null>(null);

  // term date dialog
  const [dateDialogOpen, setDateDialogOpen] = React.useState(false);

  const daysBlocks = React.useMemo(() => {
    const byDay: Record<DayIndex, Slot[]> = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };
    for (const s of term.slots) byDay[s.day].push(s as Slot);
    ([-1,0,1,2,3,4,5,6].slice(1) as DayIndex[]).forEach((di) => {
      byDay[di].sort((a, b) => hmToIndex(a.start) - hmToIndex(b.start));
    });
    return byDay;
  }, [term.slots]);

  function openCreate(day: DayIndex, idx: number) {
    // Don't allow creating blocks if date range isn't set
    if (!hasDateRange) {
      setDateDialogOpen(true);
      return;
    }

    const start = indexToHM(idx);
    const end = indexToHM(Math.min(idx + 2, ROWS)); // default 1hr
    setDraft({
      title: "",
      day,
      start,
      end,
      color: COLORS[(day + idx) % COLORS.length],
    });
    setOpen(true);
  }

  function onGridClick(day: DayIndex, e: React.MouseEvent<HTMLDivElement>) {
    // Don't allow creating blocks if date range isn't set
    if (!hasDateRange) {
      setDateDialogOpen(true);
      return;
    }
    
    const bounds = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - bounds.top;
    const idx = Math.max(0, Math.floor(y / ROW_H));
    openCreate(day, idx);
  }

  function onSaveBlock(d: Draft) {
    if (d.id) updateSlot(yearId, term.id, d as Slot);
    else addSlot(yearId, term.id, d as Omit<Slot, "id">);
    setOpen(false);
    setDraft(null);
  }

  return (
    <div className="space-y-3">
      {/* Header: Title + date below; Actions on the right */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold">{term.name}</div>
          <div className="text-xs text-muted-foreground">
            {term.startDate || "—"} — {term.endDate || "—"}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <TermRangeButton
            start={term.startDate}
            end={term.endDate}
            onSave={(s, e) => setTermDates(yearId, term.id, s, e)}
          />
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => {
                if (!hasDateRange) {
                  setDateDialogOpen(true);
                  return;
                }
                // Default: Sunday, 07:00–08:00, first color
                setDraft({
                  title: "",
                  day: 0,
                  start: indexToHM(0),
                  end: indexToHM(2), // 1 hour
                  color: COLORS[0],
                });
                setOpen(true);
              }}
              title={!hasDateRange ? "Please set term dates first" : "Add new block"}
            >
              <Plus className="h-4 w-4 mr-1" /> Add Block
            </Button>
        </div>
      </div>

      {/* Weekday header */}
      <div className="grid mt-2 mb-1" style={{ gridTemplateColumns: "100px repeat(7, 1fr)" }}>
        <div />
        {DAYS.map((d) => (
          <div key={d} className="text-center text-xs font-medium text-muted-foreground py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Weekly grid canvas */}
      <Card className="border-0 shadow-lg rounded-3xl overflow-hidden bg-white/80 dark:bg-neutral-900/60">
        <CardContent className="p-0 relative">
          {/* Date Range Required Overlay */}
          {!hasDateRange && (
            <div className="absolute inset-0 bg-black/5 dark:bg-black/20 backdrop-blur-[1px] z-10 flex items-center justify-center">
              <div className="bg-white/90 dark:bg-neutral-900/90 p-5 rounded-xl shadow-lg max-w-md text-center">
                <h3 className="text-lg font-semibold mb-2">Set Term Dates First</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  To add classes to your schedule and see them in today's dashboard, 
                  you must set the term date range first.
                </p>
                <Button onClick={() => setDateDialogOpen(true)}>
                  Set Term Dates
                </Button>
              </div>
            </div>
          )}
          
          <div
            className="grid"
            style={{
              gridTemplateColumns: "100px repeat(7, 1fr)",
              gridTemplateRows: `repeat(${ROWS}, ${ROW_H}px)`,
            }}
          >
            {/* time column */}
            {Array.from({ length: ROWS }).map((_, r) => {
              const label = indexToHM(r);
              const mm = Number(label.slice(3));
              return (
                <div
                  key={`time-${r}`}
                  className={`border-r border-t border-black/5 dark:border-white/10 text-xs pr-2 flex items-start justify-end pt-1 ${
                    mm === 0 ? "bg-black/0" : ""
                  }`}
                  style={{ gridColumn: "1", gridRow: `${r + 1} / ${r + 2}` }}
                >
                  {mm === 0 ? label : ""}
                </div>
              );
            })}

            {/* Day columns (click to add) */}
            {DAYS.map((_, dayIdx) => (
              <div
                key={`col-${dayIdx}`}
                className="relative border-l border-black/5 dark:border-white/10"
                style={{ gridColumn: dayIdx + 2, gridRow: `1 / ${ROWS + 1}` }}
                onClick={(e) => onGridClick(dayIdx as DayIndex, e)}
              >
                {Array.from({ length: ROWS }).map((_, r) => (
                  <div
                    key={`bg-${dayIdx}-${r}`}
                    className={`border-t border-black/5 dark:border-white/10 ${
                      r % 2 ? "bg-black/5 dark:bg-white/5" : ""
                    }`}
                    style={{ height: ROW_H }}
                  />
                ))}

                {daysBlocks[dayIdx as DayIndex].map((b) => {
                  const y1 = hmToIndex(b.start);
                  const y2 = hmToIndex(b.end);
                  const top = y1 * ROW_H;
                  const height = Math.max(ROW_H, (y2 - y1) * ROW_H - 2);
                  return (
                    <button
                      key={b.id}
                      className="absolute left-1 right-1 rounded-xl p-2 text-center flex flex-col justify-center items-center shadow-md hover:shadow-lg transition border border-black/10 dark:border-white/10 overflow-hidden"
                      style={{ top, height, background: `${b.color ?? "#0ea5e9"}22` }}
                      onClick={(ev) => {
                        ev.stopPropagation();
                        setDraft({ ...b });
                        setOpen(true);
                      }}
                      title={`${b.title} • ${b.start}–${b.end}`}
                    >
                      {/* Course name */}
                      <div className="text-xs font-semibold leading-4 line-clamp-2">{b.title}</div>
                      
                      {/* Only show additional info if block is tall enough */}
                      {height > 60 && (
                        <>
                          {/* Course code */}
                          {b.courseCode && <div className="text-[10px] font-medium mt-0.5">{b.courseCode}</div>}
                          
                          {/* Room, building */}
                          {(b.room || b.building) && (
                            <div className="text-[10px] opacity-80">
                              {b.room && `${b.room}`}{b.room && b.building ? ", " : ""}
                              {b.building}
                            </div>
                          )}
                          
                          {/* Link (truncated) */}
                          {b.link && (
                            <div className="text-[10px] text-blue-500 opacity-80 truncate max-w-full">
                              {b.link.replace(/^https?:\/\//, '')}
                            </div>
                          )}
                        </>
                      )}
                      
                      {/* Time always shown */}
                      <div className="text-[10px] opacity-70 mt-0.5">
                        {b.start}–{b.end}
                      </div>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit dialog */}
      {draft && (
        <BlockDialog
          open={open}
          onOpenChange={(b) => {
            setOpen(b);
            if (!b) setDraft(null);
          }}
          initial={draft}
          onSave={onSaveBlock}
          onDelete={
            draft.id
              ? () => {
                  if (draft?.id) {
                    removeSlot(yearId, term.id, draft.id);
                    setOpen(false);
                    setDraft(null);
                  }
                }
              : undefined
          }
        />
      )}

            {/* Term Date Dialog */}
      <Dialog open={dateDialogOpen} onOpenChange={setDateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Set Term Date Range</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 text-center">
            <div className="text-amber-600 dark:text-amber-500 mb-2 flex items-center justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-alert-triangle"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
              Required Step
            </div>
            <p className="text-sm text-muted-foreground">
              Setting the term dates is required to properly display classes in your Today's Schedule dashboard.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Start Date</Label>
              <Input 
                type="date" 
                value={term.startDate || ""} 
                onChange={(ev) => setTermDates(yearId, term.id, ev.target.value, term.endDate)}
                required
              />
            </div>
            <div>
              <Label className="text-xs">End Date</Label>
              <Input 
                type="date" 
                value={term.endDate || ""} 
                onChange={(ev) => setTermDates(yearId, term.id, term.startDate, ev.target.value)}
                required
              />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button 
              onClick={() => setDateDialogOpen(false)}
              disabled={!term.startDate || !term.endDate}
            >
              Save & Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TermColumn({ yearId, termIndex }: { yearId: string; termIndex: number }) {
  const years = useSchedule((s) => s.years);
  const year = years.find((y) => y.id === yearId);
  const term = year?.terms?.[termIndex];
  if (!year || !term) return null;
  return <TermColumnBody yearId={yearId} term={term} />;
}

// ---------- Inline top tabs (beside title) ----------
function TopTabsInline() {
  const navigate = useNavigate();
  const tabs = [
    { label: "Dashboard", path: "/" },
    { label: "Academic Planner", path: "/planner" }, // wire later
    { label: "Task Tracker", path: "/tasks" }, // wire later
    { label: "Schedule Planner", path: "/schedule", active: true },
    { label: "Course Planner", path: "/courses" }, // wire later    
    { label: "Scholarships", path: "/scholarships" }, // wire later
    { label: "Textbooks", path: "/textbooks" }, // wire later
    { label: "Settings", path: "/settings" }, // wire later
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

// ---------- Main Page ----------
export default function SchedulePlanner() {
  const years = useSchedule((s) => s.years);
  const selectedYearId = useSchedule((s) => s.selectedYearId);
  const yearRefs = React.useRef<Record<string, HTMLDivElement | null>>({});
  const setSelectedYear = useSchedule((s) => s.setSelectedYear);
  const addYear = useSchedule((s) => s.addYear);
  const setTermsCount = useSchedule((s) => s.setTermsCount);

  const activeYearId = selectedYearId || years[0]?.id;
  const year = years.find((y) => y.id === activeYearId);

  // year chooser button (top-right)
  const [yearOpen, setYearOpen] = React.useState(false);

  // directly under your existing hooks (years, selectedYearId, etc.)
  const theme = useTheme();
  const THEME_COLORS = PALETTES[theme.palette];
  const [accentLocal, setAccentLocal] = React.useState(theme.accent);
  React.useEffect(() => setAccentLocal(theme.accent), [theme.accent]);

  const bgStyle = React.useMemo(() => {
    const alpha = Math.min(0.35, Math.max(0.12, accentLocal / 260));
    const hex = Math.round(alpha * 255).toString(16).padStart(2, "0");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = theme.mode === "dark" || (theme.mode === "system" && prefersDark);
    const base = isDark
      ? "linear-gradient(135deg, #0b0f19 0%, #0a0a0a 70%)"
      : "linear-gradient(135deg, #ffffff 0%, #f8fbff 65%)";
    const tintA = `radial-gradient(circle at 10% 0%, ${THEME_COLORS[0]}${hex} 0%, transparent 40%)`;
    const tintB = `radial-gradient(circle at 90% 10%, ${THEME_COLORS[3]}${hex} 0%, transparent 45%)`;
    const tintC = `radial-gradient(circle at 50% 120%, ${THEME_COLORS[2]}${hex} 0%, transparent 55%)`;
    return {
      backgroundImage: `${tintA}, ${tintB}, ${tintC}, ${base}`,
      backgroundRepeat: "no-repeat, no-repeat, no-repeat, no-repeat",
      backgroundAttachment: "fixed, fixed, scroll, fixed",
      backgroundPosition: "10% 0%, 90% 10%, 50% 100%, 0 0",
    } as React.CSSProperties;
  }, [accentLocal, theme.mode, THEME_COLORS]);

    // Calculate next school year label based on existing years
  const getNextYearLabel = () => {
    if (years.length === 0) return "SY 2025–2026";
    
    // Find the highest year number
    let maxYear = 2025;
    years.forEach(y => {
      // Extract years from labels like "SY 2025–2026"
      const match = y.label.match(/SY (\d{4})–(\d{4})/);
      if (match) {
        const startYear = parseInt(match[1], 10);
        if (startYear > maxYear) maxYear = startYear;
      }
    });
    
    // Generate next SY label
    return `SY ${maxYear + 1}–${maxYear + 2}`;
  };

  return (
    <div className="min-h-screen w-full" style={bgStyle}>
      <style>{scrollbarStyles}</style>
      <div className="max-w-[1400px] mx-auto px-4 py-6 space-y-6">
        {/* Top header: title + tabs on the left, school year chip on the right */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            <CalendarDays className="h-5 w-5" />
            <h1 className="text-2xl font-bold">Schedule Planner</h1>
            <TopTabsInline />
          </div>

          <Button
            variant="outline"
            className="rounded-2xl"
            onClick={() => setYearOpen(true)}
            title="Select school year"
          >
            {year?.label || "Choose School Year"} <span className="ml-1 opacity-60">▼</span>
          </Button>

          {/* Year chooser dialog */}
          <Dialog open={yearOpen} onOpenChange={setYearOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Select School Year</DialogTitle>
              </DialogHeader>
              <div className="space-y-2 max-h-64 overflow-auto">
                {years.length === 0 ? (
                  <div className="text-sm text-muted-foreground p-2">
                    No school years added yet. Add your first school year below.
                  </div>
                ) : (
                  years.map((y) => (
                    <Button
                      key={y.id}
                      variant={y.id === activeYearId ? "default" : "outline"}
                      className="w-full justify-start rounded-xl"
                      onClick={() => {
                        setSelectedYear(y.id);
                        setYearOpen(false);
                        // Scroll to the selected year
                        setTimeout(() => {
                          yearRefs.current[y.id]?.scrollIntoView({ 
                            behavior: 'smooth',
                            block: 'start' 
                          });
                        }, 10);
                      }}
                    >
                      {y.label}
                    </Button>
                  ))
                )}
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
                        yearRefs.current[last.id]?.scrollIntoView({ behavior: 'smooth' });
                      }
                    }, 10);
                  }}
                >
                  <Plus className="h-4 w-4 mr-1" /> Add School Year
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Only one school year is shown; only first two terms are visible */}
        <div className="space-y-6">
          {years.map((year) => (
            <div 
              key={year.id} 
              className="space-y-4"
              ref={(el) => {
                yearRefs.current[year.id] = el;
              }}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold tracking-tight">{year.label}</h2>
              </div>

              <div className="flex"> {/* Flex container for canvas + button */}
                {/* Scrollable terms container */}
                  <div className={`overflow-x-auto flex-1 ${
                    theme.mode === "dark" || (theme.mode === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)
                      ? "dark-scrollbar" 
                      : "light-scrollbar"
                  }`}>
                  <div className="flex gap-6 items-start min-w-max">
                    {year.terms.map((_, idx) => (
                      <div key={idx} className="min-w-[950px]">
                        <TermColumn yearId={year.id} termIndex={idx} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Fixed-position add-term button outside scroll area */}
                <div className="ml-4 w-[120px] shrink-0 flex flex-col">
                  <div className="h-8 mb-12"></div>
                  <button
                    className="w-full rounded-2xl border border-black/10 dark:border-white/10 
                              bg-white/70 dark:bg-neutral-900/60 hover:bg-white/80 
                              dark:hover:bg-neutral-800/60 transition"
                    style={{ 
                      height: GRID_PX + 56 - 32, // Canvas height minus padding (header=24px + weekday row=32px - section padding)
                    }}
                    onClick={() => setTermsCount(year.id, Math.min(4, (year.terms.length + 1) as 2 | 3 | 4) as 2 | 3 | 4)}
                    title={year.terms.length >= 4 ? "Max 4 terms" : "Add new term"}
                    disabled={year.terms.length >= 4}
                  >
                    <span className="block rotate-90 whitespace-nowrap text-lg md:text-xl font-semibold tracking-wide text-muted-foreground select-none">
                      + Add New Term
                    </span>
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          <div className="mt-4 pb-8">
            <Button
              className="w-full h-24 rounded-2xl border border-black/10 dark:border-white/10 
                        bg-white/70 dark:bg-neutral-900/60 hover:bg-white/80 
                        dark:hover:bg-neutral-800/60 transition text-muted-foreground font-semibold"              onClick={() => {
                const newLabel = getNextYearLabel();
                console.log("Adding new year:", newLabel);
                addYear(newLabel);
                setTimeout(() => {
                  const lastYear = years[years.length - 1];
                  console.log("Years after adding:", years.length, lastYear?.id);
                  if (lastYear?.id) {
                    setSelectedYear(lastYear.id);
                    yearRefs.current[lastYear.id]?.scrollIntoView({ behavior: 'smooth' });
                  }
                }, 10);
              }}
            >
              <Plus className="h-5 w-5 mr-2" /> Add New School Year
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
