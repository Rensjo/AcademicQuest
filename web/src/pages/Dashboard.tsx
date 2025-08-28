import { useNavigate } from 'react-router-dom'
import { useTheme, PALETTES } from '@/store/theme'
import { useAQ } from '@/store/aqStore'
import { useSchedule } from "@/store/scheduleStore";

import React, { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence, animate } from "framer-motion";
import { Sun, Moon, Monitor } from "lucide-react";
import {
  Sparkles,
  GraduationCap,
  CalendarDays,
  ClipboardList,
  BookOpenCheck,
  Calculator,
  LineChart,
  BookMarked,
  Settings,
  School,
  Trophy,
  Star,
  Wand2,
  Wand2Icon,
  AlarmClock,
  Wallet,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart as RLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
} from "recharts";
import {
  Select, SelectTrigger, SelectContent, SelectItem, SelectValue
} from "@/components/ui/select";

// ----------------------------------------------------------------
// Academic Quest — Interactive Dashboard Landing Page
// Bright, customizable, gamified, with animations.
// This file focuses ONLY on the dashboard landing; other tabs
// (Planner, Task Tracker, Schedule, Course Planner, Calculators,
// GPA, Scholarships, Textbooks, Settings) will live in separate files.
// ----------------------------------------------------------------

// Mock data (swap with real state later)
const mock = {
  user: { name: "Student" },
  term: "SY 2025–2026 • Term 1",
  kpis: { gpa: 1.73, units: 21, tasksDonePct: 72, streakDays: 5, level: 3, xp: 340, nextLevelXp: 500 },
  scheduleToday: [
    { time: "08:00", course: "Algorithms", room: "B402" },
    { time: "11:00", course: "Data Warehousing", room: "Lab 2" },
    { time: "15:00", course: "Operating Systems", room: "A305" },
  ],
  quickTasks: [
    { label: "Discrete HW 3", status: "In‑Progress" },
    { label: "OS Lab Report", status: "Overdue" },
    { label: "Quiz Prep: Graphs", status: "Complete" },
  ],
};

const donutData = [
  { name: "Complete", value: mock.kpis.tasksDonePct },
  { name: "Remaining", value: 100 - mock.kpis.tasksDonePct },
];

const studyTrend = [
  { d: "Mon", h: 2.0 },
  { d: "Tue", h: 1.5 },
  { d: "Wed", h: 2.8 },
  { d: "Thu", h: 1.1 },
  { d: "Fri", h: 2.6 },
  { d: "Sat", h: 3.2 },
  { d: "Sun", h: 1.4 },
];

const gradeDistribution = [
  { range: "90–100", count: 2 },
  { range: "80–89", count: 4 },
  { range: "70–79", count: 1 },
  { range: "<70", count: 0 },
];

const COLOR_SETS: Record<string, string[]> = {
  sky: ["#0ea5e9", "#22c55e", "#f59e0b", "#a78bfa", "#ef4444"],
  violet: ["#8b5cf6", "#22c55e", "#06b6d4", "#f97316", "#ef4444"],
  emerald: ["#10b981", "#60a5fa", "#f59e0b", "#a78bfa", "#ef4444"],
};

// dynamic palette from theme store
const useColors = () => {
    const { palette } = useTheme();
    return PALETTES[palette];
};

// Small helpers
const Chip = ({ active, onClick, color, label }: { active?: boolean; onClick?: () => void; color: string; label?: string }) => (
  <button
    onClick={onClick}
    className={`h-9 px-3 rounded-2xl border transition focus:outline-none focus:ring-2 focus:ring-offset-2 ${
      active ? "border-black/10 ring-2 ring-black/10" : "border-black/5 hover:border-black/20"
    }`}
    style={{ background: color, color: "#fff" }}
    aria-label={label}
  />
);

const FONT_STACKS: Record<string, string> = {
  Inter: "'Inter', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif",
  Poppins: "'Poppins', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Arial, 'Noto Sans', sans-serif",
  Nunito: "'Nunito', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Arial, 'Noto Sans', sans-serif",
  Outfit: "'Outfit', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Arial, 'Noto Sans', sans-serif",
  Roboto: "Roboto, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', 'Helvetica Neue', Arial, 'Noto Sans', sans-serif",
  Lato: "Lato, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif",
  Montserrat: "Montserrat, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Arial, 'Noto Sans', sans-serif",
  'Source Sans 3': "'Source Sans 3', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif",
};

// Gradient-glow icon button with pointer "spotlight"
const GlowIconButton = ({
    Icon,
    onClick,
    title,
    size = "md",
    colors,
}: {
    Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    onClick?: () => void;
    title?: string;
    size?: "sm" | "md" | "lg";
    colors: string[]; // pass [primary, secondary]
}) => {
    const dims =
        size === "lg" ? "h-12 w-12" : size === "sm" ? "h-9 w-9" : "h-11 w-11";
    const [c0, c1] = colors?.length ? colors : ["#0ea5e9", "#a78bfa"];

    return (
        <button
        type="button"
        title={title}
        onClick={onClick}
        onMouseMove={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - r.left;
            const y = e.clientY - r.top;
            e.currentTarget.style.setProperty("--mx", `${x}px`);
            e.currentTarget.style.setProperty("--my", `${y}px`);
        }}
        className={`relative group inline-grid place-items-center ${dims} shrink-0 p-0 rounded-2xl
                    border border-black/10 dark:border-white/10
                    bg-neutral-50/90 dark:bg-neutral-800/60
                    overflow-hidden transition`}        
        >
        {/* Outer soft glow */}
        <span
            aria-hidden
            className="pointer-events-none absolute -inset-6 rounded-[24px] blur-2xl opacity-0 group-hover:opacity-100 transition duration-300"
            style={{ background: `linear-gradient(90deg, ${c0}55, ${c1}55)` }}
        />
        {/* Mouse spotlight */}
        <span
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-300"
            style={{ background: `radial-gradient(120px circle at var(--mx) var(--my), ${c0}22, transparent 40%)` }}
        />
        {/* Outline glow (ambient) */}
        <span
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-2xl"
            style={{
                boxShadow: `0 0 0 1px rgba(0,0,0,0.06),
                            0 0 10px ${c0}1f,
                            0 0 18px ${c1}14`,
            }}
        />
        {/* Outline glow (hover boost) */}
        <span
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition duration-300"
            style={{
                boxShadow: `0 0 0 1px ${c0}55,
                            0 0 16px ${c0}55,
                            0 0 28px ${c1}40`,
            }}
        />
        {/* Icon */}
        <Icon className="relative z-10 block h-5 w-5 m-0" />
        </button>
    );
};


const Stat = ({ label, value, icon: Icon, hint, colors }: { label: string; value: React.ReactNode; icon: any; hint?: string; colors: string[] }) => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
    <Card className="border-0 shadow-lg rounded-3xl bg-white/80 dark:bg-neutral-900/60">
      <CardContent className="relative p-4 sm:p-5">
        <div className="flex flex-col gap-3">
            <div className="self-start">
                <GlowIconButton Icon={Icon} colors={[colors[0], colors[3]]} />
            </div>
            <div className="min-w-0">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
                <p className="text-2xl font-extrabold mt-1 truncate">{value}</p>
                {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

const Feature = ({ icon: Icon, title, desc, cta, colors, onClick }: any) => (
  <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
    <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-shadow rounded-3xl bg-white/80 dark:bg-neutral-900/60">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-3">
            <GlowIconButton Icon={Icon} colors={[colors[0], colors[3] ?? colors[0]]} />
            <h3 className="font-semibold text-lg tracking-tight">{title}</h3>
        </div>
        <p className="text-sm text-neutral-600 leading-relaxed mb-4">{desc}</p>
        {cta && (
          <Button variant="outline" className="rounded-2xl" onClick={onClick}>{cta}</Button>
        )}
      </CardContent>
    </Card>
  </motion.div>
);

export default function AcademicQuestDashboard() {
  // User customizations (persisted to localStorage)
  const [primary, setPrimary] = useState<keyof typeof COLOR_SETS>("sky");
  const [accentIntensity, setAccentIntensity] = useState(60); // 0–100
  const [compact, setCompact] = useState(false);
  const [font, setFont] = useState("Inter");
  const [showBadges, setShowBadges] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("aq:settings");
    if (saved) {
      try {
        const { primary, accentIntensity, compact, font } = JSON.parse(saved);
        if (primary) setPrimary(primary);
        if (typeof accentIntensity === "number") setAccentIntensity(accentIntensity);
        if (typeof compact === "boolean") setCompact(compact);
        if (font) setFont(font);
      } catch {}
    }
  }, []);

  // router nav (only if you use React Router)
  let navigate: ((path: string) => void) | undefined;
  try {
    // this will throw if Router isn't mounted; that's okay—we fallback to <a> links
    // @ts-ignore
    navigate = useNavigate();
    // make it a simple function signature
    const go = navigate;
    navigate = (path) => go(path);
  } catch {}

  // Store-driven theme hooks
  const theme = useTheme();
  const aq = useAQ();
  const COLORS = useColors();
  
  // pull today's classes from the active term in the schedule store
  const getTodaySlots = useSchedule((s) => s.todaySlots);
  const todaySlots = React.useMemo(() => getTodaySlots(), [getTodaySlots]);


  const [localCompact, setLocalCompact] = useState(compact);
  useEffect(() => { if (localCompact !== compact) setLocalCompact(compact); }, [compact]);

  // And add another effect to commit changes:
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localCompact !== compact) setCompact(localCompact);
    }, 100);
    return () => clearTimeout(timer);
  }, [localCompact, compact, setCompact]);

  // local mirror so dragging doesn't write to the store every tick
  const [accentLocal, setAccentLocal] = useState(theme.accent);

  // keep in sync if theme.accent changes elsewhere
  useEffect(() => {
    if (accentLocal !== theme.accent) setAccentLocal(theme.accent);
  }, [theme.accent]); // ok


  // apply global font & dark/class mode
  useEffect(() => {
      const stack = FONT_STACKS[theme.font] ?? FONT_STACKS['Inter'];
      document.body.style.fontFamily = stack;
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const dark = theme.mode === 'dark' || (theme.mode === 'system' && prefersDark);
      document.documentElement.classList.toggle('dark', dark);
  }, [theme.font, theme.mode]);

  // Background style from local accent + palette
  const bgStyle = useMemo(() => {
    // Use accentLocal for live updates instead of theme.accent
    const alpha = Math.min(0.35, Math.max(0.12, accentLocal / 260));
    const hex = Math.round(alpha * 255).toString(16).padStart(2, '0');

    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = theme.mode === 'dark' || (theme.mode === 'system' && systemDark);

    // lighter base for light mode, deeper base for dark mode
    const baseLinear = isDark
      ? 'linear-gradient(135deg, #0b0f19 0%, #0a0a0a 70%)'
      : 'linear-gradient(135deg, #ffffff 0%, #f8fbff 65%)';

    // keep palette tints on top in both modes
    const tintA = `radial-gradient(circle at 10% 0%, ${COLORS[0]}${hex} 0%, transparent 40%)`;
    const tintB = `radial-gradient(circle at 90% 10%, ${COLORS[3]}${hex} 0%, transparent 45%)`;

    return { backgroundImage: `${tintA}, ${tintB}, ${baseLinear}` } as React.CSSProperties;
  }, [accentLocal, theme.mode, COLORS]); // Use accentLocal instead of theme.accent


      const todayStr = useMemo(
      () =>
          new Intl.DateTimeFormat(undefined, {
          weekday: "long",
          month: "long",
          day: "numeric",
          year: "numeric",
          }).format(new Date()),
      []
      );
      const xpPct = Math.min(100, Math.round((aq.kpis.xp / aq.kpis.nextLevelXp) * 100));

    return (
          <div
              className="min-h-screen w-full overflow-x-hidden"
              style={bgStyle}
          >
        <div className={`w-full px-4 sm:px-6 lg:px-12 ${compact ? "py-4" : "py-8"}`}>
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className={`rounded-3xl ${compact ? "p-5" : "p-8"} shadow-xl border border-black/5 bg-white/80 dark:bg-neutral-900/60 backdrop-blur-md`}
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <GraduationCap className="h-6 w-6" />
                  <span className="text-sm text-neutral-600">{mock.term}</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                  Academic Quest — Dashboard
                </h1>
                <p className="mt-2 text-sm md:text-base text-neutral-600 max-w-2xl">
                  Your bright, gamified hub for planning classes, tracking tasks, scheduling study time, calculating grades & GPA, scholarships, textbooks, and more.
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  {navigate ? (
                    <Button className="rounded-2xl" onClick={() => navigate!("/planner")}>
                      Open Planner
                    </Button>
                  ) : (
                    <a href="/planner">
                      <Button className="rounded-2xl">Open Planner</Button>
                    </a>
                  )}
                  <Button variant="outline" className="rounded-2xl">Quick Add Task</Button>
                  <Button variant="ghost" className="rounded-2xl bg-transparent text-foreground hover:bg-black/5 dark:hover:bg-white/80 dark:bg-neutral-900/60 border-0 shadow-none focus-visible:outline-none focus-visible:ring-0">Customize Widgets</Button>
                </div>
              </div>

              {/* Gamified XP Card */}
              <Card className="border-0 shadow-lg bg-white/80 dark:bg-neutral-900/60 rounded-3xl w-full md:w-[360px]">
                <CardContent className={`${compact ? "p-5" : "p-6"}`}>
                  <div className="flex items-center justify-between mb-2">
                      <div className="inline-flex items-center gap-2 text-neutral-600">
                          <CalendarDays className="h-4 w-4" />
                          <span className="text-xs md:text-sm">{todayStr}</span>
                      </div>
                      <div className="flex items-center gap-2">
                          <Star className="h-4 w-4" />
                          <span className="text-sm font-semibold">Lvl {aq.kpis.level}</span>
                      </div>
                  </div>
                  <p className="text-xs uppercase tracking-wide text-neutral-500 mb-2">Adventurer Status</p>
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${xpPct}%` }}
                      transition={{ duration: 0.8 }}
                      className="h-full"
                      style={{ background: COLORS[0] }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-2 text-sm text-neutral-600">
                      <span>{aq.kpis.xp} / {aq.kpis.nextLevelXp} XP</span>
                      <span>🔥 Streak: {aq.kpis.streakDays}d</span>
                  </div>
                  <div className="mt-3 flex gap-2">
                      <Button size="sm" className="rounded-2xl">Start 7‑Day Quest</Button>
                      <Button size="sm" variant="outline" className="rounded-2xl" onClick={() => setShowBadges(true)}>View Badges</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>

          {/* Personalization Controls */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
              <Card className="border-0 shadow-lg bg-white/80 dark:bg-neutral-900/60 rounded-3xl">
                  <CardContent className="p-5">
                      <h3 className="font-semibold mb-3">Theme</h3>
                      <div className="flex items-center gap-3">
                          <div className="space-y-2">
                          <Label className="text-xs text-neutral-600">Primary</Label>
                          <div className="flex items-center gap-2">
                              <Chip color="#0ea5e9" active={theme.palette === "sky"} onClick={() => { setPrimary("sky"); theme.setPalette("sky"); }} label="Sky" />
                              <Chip color="#8b5cf6" active={theme.palette === "violet"} onClick={() => { setPrimary("violet"); theme.setPalette("violet"); }} label="Violet" />
                              <Chip color="#10b981" active={theme.palette === "emerald"} onClick={() => { setPrimary("emerald"); theme.setPalette("emerald"); }} label="Emerald" />
                          </div>
                          </div>
                           <div className="flex-1">
                              <Label className="text-xs text-neutral-600">Accent intensity</Label>
                              <input
                                type="range"
                                className="w-full"
                                min={0}
                                max={100}
                                step={1}
                                value={accentLocal}
                                onChange={(e) => setAccentLocal(Math.max(0, Math.min(100, Number(e.target.value))))}
                                onMouseUp={() => accentLocal !== theme.accent && theme.setAccent(accentLocal)}
                                onTouchEnd={() => accentLocal !== theme.accent && theme.setAccent(accentLocal)}
                              />
                            </div>
                      </div>
                      <div className="mt-4 grid grid-cols-3 gap-3">
                          {/* Theme Mode — bubble buttons */}
                          <div className="col-span-3">
                            <Label className="text-xs text-neutral-600">Theme mode</Label>
                            <div className="mt-2 flex gap-2">
                              {([
                                { key: "light", Icon: Sun, label: "Light" },
                                { key: "dark", Icon: Moon, label: "Dark" },
                                { key: "system", Icon: Monitor, label: "System" },
                              ] as const).map(({ key, Icon, label }) => {
                                const active = theme.mode === key;
                                return (
                                  <Button
                                    key={key}
                                    type="button"
                                    variant="ghost"
                                    onClick={() => theme.setMode(key as any)}
                                    className={`h-9 px-3 gap-2 rounded-2xl bg-transparent 
                                      ${active 
                                        ? "bg-black/5 dark:bg-white/10 text-foreground" 
                                        : "text-muted-foreground hover:bg-black/5 dark:hover:bg-white/10"}
                                      border-0 shadow-none focus-visible:outline-none focus-visible:ring-0`}
                                    aria-pressed={active}
                                  >
                                    <Icon className="h-4 w-4 mr-1" />
                                    <span>{label}</span>
                                  </Button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Compact layout (2 columns) */}
                          <div className="flex items-center justify-between col-span-2">
                              <Label className="text-xs text-neutral-600">Compact layout</Label>
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input 
                                  type="checkbox"
                                  className="sr-only peer"
                                  checked={compact}
                                  onChange={e => setCompact(e.target.checked)}
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                              </label>
                          </div>

                          {/* Font family (1 column) */}
                          <div>
                              <Label className="text-xs text-neutral-600">Font family</Label>
                              <Select value={theme.font} onValueChange={(v) => theme.setFont(v)}>
                                  <SelectTrigger className="mt-1 h-9 rounded-xl border border-black/10 bg-white/80 dark:bg-neutral-900/60 hover:bg-white transition">
                                      <SelectValue placeholder="Choose a font" />
                                  </SelectTrigger>
                              {/* animated dropdown */}
                                  <SelectContent className="rounded-xl border border-black/10 bg-white/80 dark:bg-neutral-900/60 shadow-xl data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95">
                                      {["Inter","Poppins","Nunito","Outfit","Roboto","Lato","Montserrat","Source Sans 3"].map(f => (
                                      <SelectItem
                                          key={f}
                                          value={f}
                                          className="cursor-pointer transition hover:bg-black/5"
                                          >
                                          {f}
                                      </SelectItem>
                                      ))}
                                  </SelectContent>
                              </Select>
                          </div>
                      </div>
                  </CardContent>
              </Card>

            <Card className="border-0 shadow-lg bg-white/80 dark:bg-neutral-900/60 rounded-3xl">
              <CardContent className="p-5">
                <h3 className="font-semibold mb-3">Quick Overview</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 ">
                    <Stat label="Current GPA" value={mock.kpis.gpa.toFixed(2)} icon={Calculator} hint="Auto‑computed from terms" colors={COLORS} />
                    <Stat label="Units" value={mock.kpis.units} icon={School} hint="Enrolled this term" colors={COLORS} />
                    <Stat label="Tasks Done" value={`${mock.kpis.tasksDonePct}%`} icon={ClipboardList} hint="All classes" colors={COLORS} />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white/80 dark:bg-neutral-900/60 rounded-3xl">
              <CardContent className="p-5">
                <h3 className="font-semibold mb-3">Task Completion</h3>
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                      <Pie
                        dataKey="value"
                        data={donutData}
                        innerRadius={55}
                        outerRadius={80}
                        startAngle={90}
                        endAngle={-270}
                        paddingAngle={2}
                        cornerRadius={3}
                        stroke="transparent"
                        isAnimationActive
                        animationBegin={100}
                        animationDuration={800}
                        animationEasing="ease-out"
                      >
                        {donutData.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-2 flex items-center justify-center gap-5 text-sm">
                  <span className="inline-flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ background: COLORS[0] }}
                    />
                    Complete
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ background: COLORS[1] }}
                    />
                    Remaining
                  </span>
                </div>
                <p className="text-sm text-neutral-600">{mock.kpis.tasksDonePct}% completed across all classes</p>
              </CardContent>
            </Card>
          </div>

          {/* Middle: Schedule + Study trend + Quick tasks */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-0 shadow-lg rounded-3xl bg-white/80 dark:bg-neutral-900/60">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Today’s Schedule</h3>
                      {navigate ? (
                        <Button variant="outline" className="rounded-2xl" onClick={() => navigate!("/schedule")}>
                          <CalendarDays className="h-4 w-4 mr-2" />View Week
                        </Button>
                      ) : (
                        <a href="/schedule">
                          <Button variant="outline" className="rounded-2xl">
                            <CalendarDays className="h-4 w-4 mr-2" />View Week
                          </Button>
                        </a>
                      )}
                  </div>
                  <div className="grid sm:grid-cols-3 gap-4">
                    {(todaySlots.length ? todaySlots : mock.scheduleToday).map((s, i) => (
                      <motion.div
                        key={`${s.time}-${s.course}-${i}`}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-primary/5 to-sky-500/5"
                      >
                        <div>
                          <p className="text-xs text-muted-foreground">{s.time}</p>
                          <p className="font-semibold">{s.course}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Room</p>
                          <p className="font-medium">{s.room ?? "—"}</p>
                        </div>
                      </motion.div>
                    ))}
                    {!todaySlots.length && (
                      <p className="text-xs text-muted-foreground">
                        Tip: Add class blocks in <span className="font-medium">Schedule Planner</span> and set the active term dates to populate today's schedule here.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg rounded-3xl bg-white/80 dark:bg-neutral-900/60">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Study Hours (7‑day)</h3>
                    <Button variant="ghost" className="rounded-2xl bg-transparent text-foreground hover:bg-black/5 dark:hover:bg-white/10 border-0 shadow-none focus-visible:outline-none focus-visible:ring-0">Details</Button>
                  </div>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <RLineChart data={studyTrend} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="d" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="h" stroke={COLORS[0]} strokeWidth={3} dot={{ r: 3 }} />
                      </RLineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="border-0 shadow-lg rounded-3xl bg-white/80 dark:bg-neutral-900/60">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold">Quick Tasks</h3>
                    <Button variant="outline" className="rounded-2xl">Add</Button>
                  </div>
                  <ul className="space-y-3">
                    {mock.quickTasks.map((t, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -12 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-center justify-between p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60"
                      >
                        <span className="text-sm font-medium">{t.label}</span>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            t.status === "Complete"
                              ? "bg-green-100 text-green-700"
                              : t.status === "Overdue"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {t.status}
                        </span>
                      </motion.li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg rounded-3xl bg-white/80 dark:bg-neutral-900/60">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Grade Distribution</h3>
                    <Button variant="ghost" className="rounded-2xl bg-transparent text-foreground hover:bg-black/5 dark:hover:bg-white/10 border-0 shadow-none focus-visible:outline-none focus-visible:ring-0">View Details</Button>
                  </div>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={gradeDistribution}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="range" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill={COLORS[1]} radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* All‑tabs Summary (clickable previews) */}
          <div className="mt-10">
            <h2 className="text-xl font-semibold tracking-tight mb-4">Everything in one place</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              <Feature
                icon={School}
                title="Academic Planner"
                desc="Program map by SY & term, courses, sections, units, GPA."
                cta="Open Academic Planner"
                colors={COLORS}
                onClick={
                  navigate
                    ? () => navigate("/planner")
                    : () => (window.location.href = "/planner")
                }
              />
              <Feature icon={ClipboardList} title="Task Tracker" desc="Assignments by course with status, due date/time, days‑left, grade + completion chart." cta="Track Tasks" colors={COLORS} />
              <Feature 
                icon={CalendarDays} 
                title="Schedule Planner" 
                desc="Sunday–Saturday timetable with focus blocks & time usage." 
                cta="Plan My Week" 
                colors={COLORS}
                onClick={
                  navigate
                    ? () => navigate("/schedule")
                    : () => (window.location.href = "/schedule")
                }
              />              
              <Feature icon={BookOpenCheck} title="Course Planner" desc="Instructor, time, room, syllabus, meetings/week, weighted grading, projects, notes & study plan." cta="Open Course Planner" colors={COLORS} />
              <Feature icon={Calculator} title="Grade Calculator" desc="Weighted assignments (weight, score, out‑of) with live total %." cta="Calculate Grades" colors={COLORS} />
              <Feature icon={LineChart} title="GPA Calculator" desc="Per‑term credits, % grade, grade points, quality points, term & cumulative GPA." cta="View GPA" colors={COLORS} />
              <Feature icon={Wallet} title="Scholarship Tracker" desc="Status, deadlines, days‑left, submitted docs, awards with charts." cta="Track Scholarships"  colors={COLORS}/>
              <Feature icon={BookMarked} title="Textbook Tracker" desc="Per‑class texts, publisher, status, purchase & return dates." cta="Log Textbooks" colors={COLORS} />
              <Feature icon={Settings} title="Settings" desc="Themes, notifications, data import/export, grading scales, calendar sync, time format." cta="Open Settings" colors={COLORS} />
            </div>
          </div>

          {/* Gamification strip */}
          <div className="mt-12">
            <Card className="border-0 shadow-lg rounded-3xl bg-white/80 dark:bg-neutral-900/60 backdrop-blur-md">
              <CardContent className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 ">
                  <div>
                    <h3 className="text-xl font-semibold ">Level up your semester</h3>
                    <p className="text-sm text-neutral-600 mt-1 max-w-2xl">
                      Earn streaks for consistent study, unlock badges (First A, 10 tasks done, No‑Overdue Week), and upgrade your Academic Avatar.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Button className="rounded-2xl">Start Daily Quest</Button>
                    <Button variant="outline" className="rounded-2xl" onClick={() => setShowBadges(true)}>View Badges</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Footer tips */}
          <div className="flex flex-wrap gap-3 items-center justify-between mt-8 pb-6">
            <p className="text-xs text-neutral-500">Tip: Import syllabi or connect a calendar to auto‑create tasks & classes.</p>
            <div className="flex gap-3">
              <Button variant="outline" className="rounded-2xl">Import Syllabus</Button>
              <Button className="rounded-2xl">Add Course</Button>
            </div>
          </div>
        </div>

        {/* Badges modal (simple inline) */}
        <AnimatePresence>
          {showBadges && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm"
              onClick={() => setShowBadges(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="w-[92%] max-w-lg rounded-3xl shadow-2xl bg-white/90 dark:bg-neutral-900/90 border border-black/10 dark:border-white/10 backdrop-blur-md"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6 border-b border-black/5 dark:border-white/10 flex items-center justify-between">
                  <h4 className="text-lg font-semibold">Unlocked Badges</h4>
                  <Button size="sm" variant="ghost" className="rounded-2xl bg-transparent text-foreground hover:bg-black/5 dark:hover:bg-white/80 dark:bg-neutral-900/60 border-0 shadow-none focus-visible:outline-none focus-visible:ring-0" onClick={() => setShowBadges(false)}>Close</Button>
                </div>
                <div className="p-6 grid grid-cols-3 gap-4">
                  {[
                    { name: "First A", icon: Star },
                    { name: "10 Tasks", icon: Trophy },
                    { name: "No‑Overdue Week", icon: Sparkles },
                  ].map(({ name, icon: Icon }, idx) => (
                    <div key={idx} className="text-center">
                      <div className="mx-auto h-14 w-14 rounded-2xl flex items-center justify-center bg-neutral-50 dark:bg-neutral-800/60">
                        <Icon className="h-6 w-6" />
                      </div>
                      <p className="text-xs mt-2 font-medium">{name}</p>
                    </div>
                  ))}
                </div>
                <div className="px-6 pb-6">
                  <Button className="w-full rounded-2xl">See All Badges</Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }
