import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarDays, Plus, Trash2, Clock } from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { useAcademicPlan } from "@/store/academicPlanStore";
import { useTasksStore, tasksByTerm, AQTask, TaskStatus } from "@/store/tasksStore";
import { useTaskSelectors, useOptimizedTaskActions } from "@/lib/task-selectors";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useTheme, PALETTES } from "@/store/theme";
import TopTabsInline from "@/components/TopTabsInline";
import { validateArray, safeLocalStorage, debounce } from "@/lib/utils";
import { useMainThreadScheduler, createOptimizedStateUpdater } from "@/lib/main-thread-scheduler";
import { initPerformanceMonitor } from "@/lib/performance-monitor";
import { usePageResource, useHeavyComponent, useOptimizedFormInput } from "@/lib/resource-manager";

// Performance optimization: Memoize heavy components
interface CourseOption { id: string; display: string }
const MemoizedTaskRow = React.memo(({ 
  task, 
  courseOptions,
  onUpdate, 
  onDelete,
  isPlaceholder = false 
}: {
  task: AQTask | { id: string; title: string; status: TaskStatus; courseId?: string; dueDate?: string; dueTime?: string; grade?: string }
  courseOptions: CourseOption[]
  onUpdate: (id: string, updates: Partial<AQTask>) => void
  onDelete: (id: string) => void
  isPlaceholder?: boolean
}) => {
  // Local state for immediate UI updates
  const [localTitle, setLocalTitle] = React.useState(task.title || "")
  const [localDate, setLocalDate] = React.useState(task.dueDate || "")
  const [localTime, setLocalTime] = React.useState(task.dueTime || "")
  const [localGrade, setLocalGrade] = React.useState(task.grade || "")

  // Debounced updates to prevent excessive re-renders
  const debouncedUpdate = React.useMemo(
    () => debounce((updates: Partial<AQTask>) => {
      if (!isPlaceholder) {
        onUpdate(task.id, updates)
      }
    }, 300),
    [task.id, onUpdate, isPlaceholder]
  )

  // Sync local state with prop changes
  React.useEffect(() => {
    setLocalTitle(task.title || "")
    setLocalDate(task.dueDate || "")
    setLocalTime(task.dueTime || "")
    setLocalGrade(task.grade || "")
  }, [task.title, task.dueDate, task.dueTime, task.grade])

  const handleTitleChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setLocalTitle(value)
    debouncedUpdate({ title: value })
  }, [debouncedUpdate])

  const handleDateChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setLocalDate(value)
    onUpdate(task.id, { dueDate: value }) // Immediate for dates
  }, [task.id, onUpdate])

  const handleTimeChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setLocalTime(value)
    onUpdate(task.id, { dueTime: value }) // Immediate for times
  }, [task.id, onUpdate])

  const handleGradeChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setLocalGrade(value)
    debouncedUpdate({ grade: value })
  }, [debouncedUpdate])

  return (
    <tr className="border-t border-gray-200/40 dark:border-gray-600/30 hover:bg-white/30 dark:hover:bg-neutral-700/20 transition-colors duration-200">
      <td className="px-2 py-2 w-[120px] max-w-[120px] overflow-hidden">
        <Select 
          value={task.courseId || ""} 
          onValueChange={(value) => onUpdate(task.id, { courseId: value })}
        >
          <SelectTrigger className="h-8 w-full rounded-lg bg-white/80 dark:bg-neutral-800/80 border-gray-200/60 dark:border-gray-600/40 focus:border-blue-400/60 dark:focus:border-blue-400/60 focus:ring-2 focus:ring-blue-200/50 dark:focus:ring-blue-400/20 transition-all duration-200 backdrop-blur-sm text-gray-700 dark:text-gray-200 text-xs overflow-hidden">
            <SelectValue placeholder="Select course" />
          </SelectTrigger>
          <SelectContent className="rounded-2xl bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl border-0 shadow-2xl ring-1 ring-gray-200/50 dark:ring-gray-600/50">
            {courseOptions.map((option) => (
              <SelectItem 
                key={option.id} 
                value={option.id}
                className="rounded-xl mx-1 my-0.5 focus:bg-cyan-50/90 dark:focus:bg-cyan-950/30 focus:text-cyan-700 dark:focus:text-cyan-300 cursor-pointer transition-all duration-200 hover:bg-cyan-50/50 dark:hover:bg-cyan-950/20"
              >
                {option.display}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </td>
      <td className="px-2 py-2">
        <Input 
          className="h-8 rounded-lg bg-white/80 dark:bg-neutral-900/60 border-gray-200/60 dark:border-gray-600/40 focus:border-blue-400/60 dark:focus:border-blue-400/60 focus:ring-2 focus:ring-blue-200/50 dark:focus:ring-blue-400/20 transition-all duration-200 backdrop-blur-sm text-gray-700 dark:text-gray-200 text-xs" 
          value={localTitle} 
          onChange={handleTitleChange} 
          placeholder="Assignment title" 
        />
      </td>
      <td className="px-2 py-2">
        <Select 
          value={task.status || "Not Started"} 
          onValueChange={(value) => onUpdate(task.id, { status: value as TaskStatus })}
        >
          <SelectTrigger className="h-8 rounded-lg bg-white/80 dark:bg-neutral-800/80 border-gray-200/60 dark:border-gray-600/40 focus:border-blue-400/60 dark:focus:border-blue-400/60 focus:ring-2 focus:ring-blue-200/50 dark:focus:ring-blue-400/20 transition-all duration-200 backdrop-blur-sm text-gray-700 dark:text-gray-200 text-xs">
            <SelectValue placeholder="Status"/>
          </SelectTrigger>
          <SelectContent className="rounded-2xl bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl border-0 shadow-2xl ring-1 ring-gray-200/50 dark:ring-gray-600/50">
            <SelectItem value="Not Started" className="rounded-xl mx-1 my-0.5 focus:bg-cyan-50/90 dark:focus:bg-cyan-950/30 focus:text-cyan-700 dark:focus:text-cyan-300 cursor-pointer transition-all duration-200 hover:bg-cyan-50/50 dark:hover:bg-cyan-950/20">Not Started</SelectItem>
            <SelectItem value="In Progress" className="rounded-xl mx-1 my-0.5 focus:bg-cyan-50/90 dark:focus:bg-cyan-950/30 focus:text-cyan-700 dark:focus:text-cyan-300 cursor-pointer transition-all duration-200 hover:bg-cyan-50/50 dark:hover:bg-cyan-950/20">In Progress</SelectItem>
            <SelectItem value="Completed" className="rounded-xl mx-1 my-0.5 focus:bg-cyan-50/90 dark:focus:bg-cyan-950/30 focus:text-cyan-700 dark:focus:text-cyan-300 cursor-pointer transition-all duration-200 hover:bg-cyan-50/50 dark:hover:bg-cyan-950/20">Completed</SelectItem>
          </SelectContent>
        </Select>
      </td>
      <td className="px-2 py-2">
        <Input 
          className="h-8 rounded-lg bg-white/80 dark:bg-neutral-900/60 border-gray-200/60 dark:border-gray-600/40 focus:border-blue-400/60 dark:focus:border-blue-400/60 focus:ring-2 focus:ring-blue-200/50 dark:focus:ring-blue-400/20 transition-all duration-200 backdrop-blur-sm text-gray-700 dark:text-gray-200 text-xs" 
          type="date" 
          value={localDate} 
          onChange={handleDateChange} 
        />
      </td>
      <td className="px-2 py-2">
        <Input 
          className="h-8 rounded-lg bg-white/80 dark:bg-neutral-900/60 border-gray-200/60 dark:border-gray-600/40 focus:border-blue-400/60 dark:focus:border-blue-400/60 focus:ring-2 focus:ring-blue-200/50 dark:focus:ring-blue-400/20 transition-all duration-200 backdrop-blur-sm text-gray-700 dark:text-gray-200 text-xs" 
          type="time" 
          value={localTime} 
          onChange={handleTimeChange} 
        />
      </td>
      <td className="px-2 py-2">
        <Input 
          className="h-8 rounded-lg bg-white/80 dark:bg-neutral-900/60 border-gray-200/60 dark:border-gray-600/40 focus:border-blue-400/60 dark:focus:border-blue-400/60 focus:ring-2 focus:ring-blue-200/50 dark:focus:ring-blue-400/20 transition-all duration-200 backdrop-blur-sm text-gray-700 dark:text-gray-200 text-xs" 
          value={localGrade} 
          onChange={handleGradeChange} 
          placeholder="Grade" 
        />
      </td>
      <td className="px-2 py-2">
        {!isPlaceholder && (
          <Button
            variant="ghost" 
            size="sm"
            onClick={() => onDelete(task.id)}
            className="h-8 w-8 p-0 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </td>
    </tr>
  )
})

// Using global AQTask from tasks store

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

export default function Tasks() {
  // Performance and resource management
  const { performanceMode } = usePageResource('tasks')
  const canRenderHeavyComponents = useHeavyComponent('tasks-table', 8) // High priority
  
  // Initialize performance monitoring for production optimization
  const performanceMonitor = React.useMemo(() => initPerformanceMonitor(), []);
  
  // Gradient separated as non-interactive layer
  const gradientBase = useThemedGradient();
  const gradientStyle: React.CSSProperties = { ...gradientBase, pointerEvents: 'none' };
  
  // Initialize performance optimizations
  const scheduler = useMainThreadScheduler()
  
  // Pull academic plan data
  const years = useAcademicPlan((s) => s.years);
  const selectedYearId = useAcademicPlan((s) => s.selectedYearId);

  // Active selection (default to first year/term)
  const [activeYearId, setActiveYearId] = React.useState<string | undefined>(() => selectedYearId || years[0]?.id);
  const [activeTermId, setActiveTermId] = React.useState<string | undefined>(() => years[0]?.terms[0]?.id);

  // Optimized state updaters
  const optimizedSetActiveYearId = React.useMemo(
    () => createOptimizedStateUpdater(setActiveYearId, { priority: 'high' }),
    []
  )
  const optimizedSetActiveTermId = React.useMemo(
    () => createOptimizedStateUpdater(setActiveTermId, { priority: 'high' }),
    []
  )

  // Keep active ids valid when plan changes
  React.useEffect(() => {
    if (!years.length) return;
    const year = years.find((y) => y.id === activeYearId) || years[0];
    const term = year.terms.find((t) => t.id === activeTermId) || year.terms[0];
    if (year.id !== activeYearId) optimizedSetActiveYearId(year.id);
    if (term?.id !== activeTermId) optimizedSetActiveTermId(term?.id);
  }, [years, activeYearId, activeTermId, optimizedSetActiveYearId, optimizedSetActiveTermId]);

  const activeYear = React.useMemo(() => years.find((y) => y.id === activeYearId), [years, activeYearId]);
  const activeTerm = React.useMemo(() => activeYear?.terms.find((t) => t.id === activeTermId), [activeYear, activeTermId]);
  const courseOptions = React.useMemo(() => {
    const courses = (activeTerm?.courses || []).filter(c => (c.code?.trim() || c.name?.trim()));
    return courses.map(course => ({
      id: course.id,
      display: course.code && course.name
        ? `${course.code} - ${course.name.length > 20 ? course.name.substring(0, 20) + '...' : course.name}`
        : course.code || course.name || 'Untitled'
    }));
  }, [activeTerm]);

  // Global tasks store
  // Use optimized selectors to prevent unnecessary re-renders
  const { tasksPageData } = useTaskSelectors()
  const { debouncedUpdate } = useOptimizedTaskActions()
  
  // Legacy store access for compatibility
  const tasks = useTasksStore((s) => s.tasks);
  const addTask = useTasksStore((s) => s.addTask);
  const updateTask = useTasksStore((s) => s.updateTask);
  const removeTask = useTasksStore((s) => s.removeTask);

  // Validate and optimize task data for performance using scheduler
  const validatedTasks = React.useMemo(() => {
    // For large datasets, schedule background validation
    if (tasks.length > 100) {
      scheduler.scheduleLowPriorityTask(() => {
        const validatedData = validateArray(tasks, (item): item is AQTask => {
          return item && 
                 typeof item === 'object' &&
                 'id' in item && 
                 'title' in item &&
                 'status' in item &&
                 typeof item.id === 'string' &&
                 typeof item.status === 'string'
        })
        // Store validated data for future use
        console.log('Background validation completed:', validatedData.length, 'valid tasks')
      })
      // Return current tasks while processing in background
      return tasks.filter(task => task && typeof task === 'object' && 'id' in task) as AQTask[]
    }
    
    return validateArray(tasks, (item): item is AQTask => {
      return item && 
             typeof item === 'object' &&
             'id' in item && 
             'title' in item &&
             'status' in item &&
             typeof item.id === 'string' &&
             typeof item.status === 'string'
    })
  }, [tasks, scheduler])

  // Data corruption detection and recovery
  React.useEffect(() => {
    try {
      const hasCorruption = validatedTasks.length !== tasks.length
      
      if (hasCorruption) {
        console.warn(`Tasks data corruption detected: ${tasks.length} raw tasks -> ${validatedTasks.length} valid tasks`)
        
        // If more than 50% of tasks are corrupted, consider clearing storage
        const corruptionRatio = 1 - (validatedTasks.length / Math.max(tasks.length, 1))
        if (corruptionRatio > 0.5 && tasks.length > 0) {
          console.warn('Severe task corruption detected, clearing localStorage')
          safeLocalStorage.clear()
          window.location.reload()
        }
      }
    } catch (error) {
      console.error('Error validating task data:', error)
      safeLocalStorage.clear()
      window.location.reload()
    }
  }, [tasks, validatedTasks])

  // Active-term tasks from store (using validated data)
  const termKey = activeYear && activeTerm ? `${activeYear.id}:${activeTerm.id}` : "";
  const termTasks: AQTask[] = React.useMemo(() => tasksByTerm(validatedTasks, activeYearId, activeTermId), [validatedTasks, activeYearId, activeTermId]);

  // Sorting state
  const [sortByDeadline, setSortByDeadline] = React.useState(false);

  // Placeholder handling (for reaching 20 rows visually)
  const placeholderCount = Math.max(0, 20 - termTasks.length);
  const [spawned, setSpawned] = React.useState<Set<string>>(new Set());
  React.useEffect(() => { setSpawned(new Set()); }, [termKey]);

  const spawnFromPlaceholder = React.useCallback((phKey: string, patch: Partial<AQTask>) => {
    if (!activeYear || !activeTerm) return;
    if (spawned.has(phKey)) return;
    const base: AQTask = {
      id: crypto.randomUUID(),
      yearId: activeYear.id,
      termId: activeTerm.id,
      courseId: patch.courseId,
      title: patch.title || "",
      status: patch.status || "Not Started",
      dueDate: patch.dueDate,
      dueTime: patch.dueTime,
      grade: patch.grade,
    };
    addTask(base);
    const next = new Set(spawned);
    next.add(phKey);
    setSpawned(next);
  }, [activeYear, activeTerm, spawned, addTask]);

  type PlaceholderRow = { id: string; courseId?: string; title: string; status: TaskStatus; dueDate?: string; dueTime?: string; grade?: string };
  const placeholders: PlaceholderRow[] = React.useMemo(
    () => Array.from({ length: placeholderCount }).map((_, i) => ({ id: `ph:${i}`, courseId: "", title: "", status: "Not Started", dueDate: "", dueTime: "", grade: "" })),
    [placeholderCount]
  );

  // Optimized days-left helper with memoization
  const getDaysLeft = React.useCallback((dueDate?: string): number | undefined => {
    if (!dueDate) return undefined;
    const today = new Date();
    const d0 = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const due = new Date(dueDate);
    const d1 = new Date(due.getFullYear(), due.getMonth(), due.getDate());
    const diff = (d1.getTime() - d0.getTime()) / (1000 * 60 * 60 * 24);
    return Math.round(diff);
  }, []);

  // Pre-calculate days left for all tasks to avoid repeated computation
  const taskDaysLeftMap = React.useMemo(() => {
    const map = new Map<string, number | undefined>();
    termTasks.forEach(task => {
      if (task?.id) {
        map.set(task.id, getDaysLeft(task.dueDate));
      }
    });
    return map;
  }, [termTasks, getDaysLeft]);

  const rawDisplayRows: (AQTask | PlaceholderRow)[] = React.useMemo(() => {
    const sortedTasks = [...termTasks];
    
    if (sortByDeadline) {
      // Sort by days left: closest deadline first
      sortedTasks.sort((a, b) => {
        const daysA = taskDaysLeftMap.get(a.id);
        const daysB = taskDaysLeftMap.get(b.id);
        
        // Handle undefined dates (tasks without due dates go to end)
        if (daysA === undefined && daysB === undefined) return 0;
        if (daysA === undefined) return 1;
        if (daysB === undefined) return -1;
        
        // Sort by days left (closest deadline first)
        const daysDiff = daysA - daysB;
        if (daysDiff !== 0) return daysDiff;
        
        // If same days left, prioritize by status (Not Started and In Progress first)
        const statusPriority = { "Not Started": 0, "In Progress": 1, "Completed": 2 };
        return statusPriority[a.status] - statusPriority[b.status];
      });
    }
    
    return [...sortedTasks, ...placeholders];
  }, [termTasks, placeholders, sortByDeadline, taskDaysLeftMap]);
  const displayRows = React.useDeferredValue(rawDisplayRows);

  // ---- Simple list virtualization (manual windowing) ----
  const ROW_HEIGHT = 44; // approximate px height of each row
  // Removed LIST_PADDING (was unused after virtualization refinement)
  const [scrollTop, setScrollTop] = React.useState(0);
  const listRef = React.useRef<HTMLDivElement | null>(null);
  const totalRows = displayRows.length;
  const [viewportHeight, setViewportHeight] = React.useState(600);
  React.useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const resize = () => setViewportHeight(el.clientHeight || 600);
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);
  // rAF-throttled scroll handler + velocity detection for coarse visibility toggle
  const scrollRaf = React.useRef<number | null>(null);
  const [isFastScrolling, setIsFastScrolling] = React.useState(false);
  const lastTopRef = React.useRef(0);
  const lastTimeRef = React.useRef(performance.now());
  
  const onScroll = React.useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const scrollStartTime = performance.now();
    const top = e.currentTarget.scrollTop;
    const now = performance.now();
    const dt = now - lastTimeRef.current;
    const dy = Math.abs(top - lastTopRef.current);
    
    if (dt > 0) {
      const velocity = dy / dt; // px per ms
      
      // Track scroll performance metrics
      performanceMonitor.trackScrollPerformance({
        velocity,
        deltaTime: dt,
        deltaY: dy,
        isFastScroll: velocity > 1.2
      });
      
      if (velocity > 1.2) {
        if (!isFastScrolling) setIsFastScrolling(true);
      }
    }
    
    lastTopRef.current = top;
    lastTimeRef.current = now;
    
    if (scrollRaf.current !== null) cancelAnimationFrame(scrollRaf.current);
    scrollRaf.current = requestAnimationFrame(() => {
      setScrollTop(top);
      // reset fast-scrolling state slightly later (next frame) to allow stabilization
      requestAnimationFrame(() => setIsFastScrolling(false));
      
      // Track scroll render time
      const scrollRenderTime = performance.now() - scrollStartTime;
      if (scrollRenderTime > 16) { // Log if slower than 60fps
        performanceMonitor.logWarning(`Slow scroll render: ${scrollRenderTime.toFixed(2)}ms`);
      }
    });
  }, [isFastScrolling, performanceMonitor]);
  React.useEffect(() => () => { if (scrollRaf.current) cancelAnimationFrame(scrollRaf.current); }, []);
  const startIndex = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - 5);
  const visibleCount = Math.ceil(viewportHeight / ROW_HEIGHT) + 4; // reduced overscan
  const endIndex = Math.min(totalRows, startIndex + visibleCount);
  const windowedRows = displayRows.slice(startIndex, endIndex);
  const offsetY = startIndex * ROW_HEIGHT;

  // Only consider "filled" tasks (non-empty title)
  const filled = termTasks.filter(r => (r.title?.trim()?.length ?? 0) > 0);
  const completed = filled.filter(r => r.status === "Completed").length;
  const pct = filled.length ? Math.round((completed / filled.length) * 100) : 0;

  // Donut chart data
  const donut = [
    { name: "done", value: pct },
    { name: "left", value: 100 - pct },
  ];

  // Optimized handlers for the memoized component
  const handleTaskUpdate = React.useCallback((taskId: string, updates: Partial<AQTask>) => {
    if (taskId.startsWith('ph:')) {
      spawnFromPlaceholder(taskId, updates);
    } else {
      updateTask(taskId, updates);
    }
  }, [spawnFromPlaceholder, updateTask]);

  const handleTaskDelete = React.useCallback((taskId: string) => {
    if (!taskId.startsWith('ph:')) {
      removeTask(taskId);
    }
  }, [removeTask]);

  // Virtual rendering for better performance - only render visible tasks
  const visibleTasks = windowedRows;

  function addRow() {
    if (!activeYear || !activeTerm) return;
    addTask({ 
      id: crypto.randomUUID(), 
      yearId: activeYear.id, 
      termId: activeTerm.id, 
      courseId: "", 
      title: "", 
      status: "Not Started", 
      dueDate: undefined, 
      dueTime: undefined, 
      grade: undefined 
    });
  }

  // Fast multi-add (not yet exposed in UI, but available for future import flows)

  // Term/Yr selection dialog
  const [termDialogOpen, setTermDialogOpen] = React.useState(false);
  
  function selectYearTerm(yId: string, tId: string) {
    setActiveYearId(yId);
    setActiveTermId(tId);
    setTermDialogOpen(false);
  }

  return (
    <div className="min-h-screen w-full relative">
      {/* Decorative gradient background layer */}
      <div className="absolute inset-0 -z-10" style={gradientStyle} />
      <div className="max-w/[1400px] mx-auto px-4 py-7 space-y-6 relative">
        {/* Header: title on first row, tabs on second; donut on right */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <CalendarDays className="h-5 w-5" />
              <h1 className="text-2xl font-bold">Task Tracker</h1>
            </div>
            <div className="mt-2 min-w-0">
              <TopTabsInline active="tasks" />
            </div>
          </div>
          <Card className="shrink-0 border-0 shadow-xl rounded-3xl bg-white/80 dark:bg-neutral-900/60 backdrop-blur-xl 
                          ring-1 ring-gray-200/50 dark:ring-gray-600/50 w-[176px] sm:w-[200px] md:w-[220px] 
                          hover:shadow-2xl transition-all duration-300">
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
              <div className="text-center text-sm mt-1 font-semibold text-gray-700 dark:text-gray-200">{pct}% Completed</div>
            </CardContent>
          </Card>
        </div>

        {/* Full-width task canvas */}
        <Card className="border-0 shadow-xl rounded-3xl bg-white/80 dark:bg-neutral-900/60 backdrop-blur-xl 
                        ring-1 ring-gray-200/50 dark:ring-gray-600/50 overflow-hidden hover:shadow-2xl transition-all duration-300">
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-gradient-to-r 
                                from-white/50 to-gray-50/30 dark:from-neutral-800/50 dark:to-neutral-900/30 backdrop-blur-md
                                border-b border-gray-200/60 dark:border-gray-600/40">
            <div>
              <div className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                {activeYear && activeTerm ? (
                  <span className="font-semibold text-gray-800 dark:text-gray-100">{activeYear.label} • {activeTerm.name}</span>
                ) : (
                  <span className="font-semibold text-gray-800 dark:text-gray-100">Current Term</span>
                )}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Dialog open={termDialogOpen} onOpenChange={setTermDialogOpen}>
                <Button
                  variant="outline"
                  className="rounded-2xl bg-gradient-to-r from-white/95 to-white/85 dark:from-gray-800/80 dark:to-gray-900/70 
                            text-gray-700 dark:text-gray-200 hover:from-cyan-50/90 hover:to-blue-50/80 dark:hover:from-cyan-950/40 dark:hover:to-blue-950/30 
                            hover:text-cyan-700 dark:hover:text-cyan-300 shadow-md hover:shadow-lg backdrop-blur-sm 
                            border border-gray-200/60 dark:border-gray-600/40 hover:border-cyan-200/60 dark:hover:border-cyan-400/30
                            transition-all duration-200 hover:scale-105 active:scale-95 hover:-translate-y-0.5 active:translate-y-0"
                  onClick={() => setTermDialogOpen(true)}
                >
                  {activeYear && activeTerm ? `${activeYear.label} • ${activeTerm.name}` : "Select Term"}
                </Button>
                <DialogContent className="max-w-md rounded-3xl bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl border-0 shadow-2xl 
                                          ring-1 ring-gray-200/50 dark:ring-gray-600/50">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-semibold text-gray-800 dark:text-gray-100">Select School Year • Term</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 max-h-[60vh] overflow-auto">
                    {years.map((y) => (
                      <div key={y.id} className="rounded-2xl bg-gradient-to-r from-white/60 to-gray-50/40 dark:from-gray-800/60 dark:to-gray-900/40 
                                                backdrop-blur-md border border-gray-200/60 dark:border-gray-600/40 p-4 shadow-md">
                        <div className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-200">{y.label}</div>
                        <div className="flex flex-wrap gap-2">
                          {y.terms.map((t) => (
                            <Button 
                              key={t.id} 
                              variant={y.id === activeYearId && t.id === activeTermId ? 'default' : 'outline'} 
                              className={`rounded-2xl transition-all duration-300 font-medium tracking-wide
                                ${y.id === activeYearId && t.id === activeTermId 
                                  ? "bg-gradient-to-r from-cyan-600/90 to-blue-600/90 dark:from-cyan-500/90 dark:to-blue-500/90 text-white shadow-lg ring-2 ring-cyan-200/50 dark:ring-cyan-400/30 backdrop-blur-md hover:from-cyan-700/95 hover:to-blue-700/95 dark:hover:from-cyan-400/95 dark:hover:to-blue-400/95" 
                                  : "bg-gradient-to-r from-white/80 to-gray-50/70 dark:from-gray-800/80 dark:to-gray-900/70 text-gray-700 dark:text-gray-200 hover:from-cyan-50/90 hover:to-blue-50/80 dark:hover:from-cyan-950/40 dark:hover:to-blue-950/30 hover:text-cyan-700 dark:hover:text-cyan-300 shadow-md hover:shadow-lg backdrop-blur-md border border-gray-200/60 dark:border-gray-600/40 hover:border-cyan-200/60 dark:hover:border-cyan-400/30"
                                }
                                hover:scale-102 active:scale-98 hover:-translate-y-0.5 active:translate-y-0`}
                              onClick={() => selectYearTerm(y.id, t.id)}
                            >
                              {t.name}
                            </Button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
              <Button 
                size="sm" 
                className="rounded-2xl bg-gradient-to-r from-green-600/90 to-emerald-600/90 dark:from-green-500/90 dark:to-emerald-500/90 
                          text-white shadow-lg ring-2 ring-green-200/50 dark:ring-green-400/30 backdrop-blur-sm border-0
                          hover:from-green-700/95 hover:to-emerald-700/95 dark:hover:from-green-400/95 dark:hover:to-emerald-400/95
                          transition-all duration-200 hover:scale-105 active:scale-95 hover:-translate-y-0.5 active:translate-y-0 
                          font-medium tracking-wide" 
                onClick={addRow}
              >
                <Plus className="h-4 w-4 mr-1"/>Add Task
              </Button>
              <Button 
                size="sm" 
                variant={sortByDeadline ? "default" : "outline"}
                className={`rounded-2xl transition-all duration-200 hover:scale-105 active:scale-95 hover:-translate-y-0.5 active:translate-y-0 
                          font-medium tracking-wide ${sortByDeadline 
                    ? "bg-gradient-to-r from-blue-600/90 to-indigo-600/90 dark:from-blue-500/90 dark:to-indigo-500/90 text-white shadow-lg ring-2 ring-blue-200/50 dark:ring-blue-400/30 backdrop-blur-sm border-0 hover:from-blue-700/95 hover:to-indigo-700/95 dark:hover:from-blue-400/95 dark:hover:to-indigo-400/95" 
                    : "bg-gradient-to-r from-white/95 to-white/85 dark:from-neutral-800/80 dark:to-neutral-900/70 text-gray-700 dark:text-gray-200 hover:from-blue-50/90 hover:to-indigo-50/80 dark:hover:from-blue-950/40 dark:hover:to-indigo-950/30 hover:text-blue-700 dark:hover:text-blue-300 shadow-md hover:shadow-lg backdrop-blur-sm border border-gray-200/60 dark:border-gray-600/40 hover:border-blue-200/60 dark:hover:border-blue-400/30"
                  }`}
                onClick={() => setSortByDeadline(!sortByDeadline)}
                title={sortByDeadline ? "Disable deadline sorting" : "Sort by closest deadline"}
              >
                <Clock className="h-4 w-4 mr-1"/>
                {sortByDeadline ? "Sorted by Deadline" : "Sort by Deadline"}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div ref={listRef} onScroll={onScroll} style={{maxHeight: '520px', overflow: 'auto'}} className="w-full overflow-x-auto rounded-2xl bg-gradient-to-r from-white/60 to-gray-50/40 dark:from-neutral-800/60 dark:to-neutral-900/40 
                          backdrop-blur-md border border-gray-200/60 dark:border-gray-600/40 shadow-lg will-change-transform">
              <table className="w-full text-xs" style={{position:'relative', willChange: 'transform'}}>
                <thead className="sticky top-0 bg-gradient-to-r from-white/80 to-gray-50/60 dark:from-neutral-800/80 dark:to-neutral-900/60 
                                backdrop-blur-md border-b border-gray-200/60 dark:border-gray-600/40">
                  <tr className="text-left">
                    <th className="px-3 py-2 w-[120px] font-semibold text-gray-700 dark:text-gray-200">Course</th>
                    <th className="px-3 py-2 w-[420px] font-semibold text-gray-700 dark:text-gray-200">Assignment / To‑do</th>
                    <th className="px-3 py-2 w-[150px] font-semibold text-gray-700 dark:text-gray-200">Status</th>
                    <th className="px-3 py-2 w-[140px] font-semibold text-gray-700 dark:text-gray-200">Due Date</th>
                    <th className="px-3 py-2 w-[110px] font-semibold text-gray-700 dark:text-gray-200">Due Time</th>
                    <th className="px-3 py-2 w-[110px] font-semibold text-gray-700 dark:text-gray-200">Days Left</th>
                    <th className="px-3 py-2 w-[90px] font-semibold text-gray-700 dark:text-gray-200">Grade</th>
                    <th className="px-3 py-2 w-[50px] font-semibold text-gray-700 dark:text-gray-200"></th>
                  </tr>
                </thead>
                <tbody style={{
                  display:'block', 
                  position:'relative', 
                  height: totalRows * ROW_HEIGHT,
                  willChange: canRenderHeavyComponents ? 'transform' : 'auto',
                  transform: 'translateZ(0)' // Force GPU acceleration when resources allow
                }}>
                  <tr style={{height: offsetY}} aria-hidden="true"><td style={{padding:0,margin:0,border:0}} /></tr>
                  {canRenderHeavyComponents ? visibleTasks.map((r) => {
                    if (isFastScrolling) {
                      return (
                        <tr key={r.id} className="border-t border-transparent">
                          <td colSpan={8} style={{height: ROW_HEIGHT}} className="px-2 py-2">
                            <div className="h-6 rounded-md bg-gradient-to-r from-gray-200/60 via-gray-100/40 to-gray-200/60 dark:from-neutral-700/40 dark:via-neutral-800/30 dark:to-neutral-700/40 animate-pulse" />
                          </td>
                        </tr>
                      );
                    }
                    return (
                      <MemoizedTaskRow
                        key={r.id}
                        task={r}
                        courseOptions={courseOptions}
                        onUpdate={handleTaskUpdate}
                        onDelete={handleTaskDelete}
                        isPlaceholder={typeof r.id === 'string' && r.id.startsWith('ph:')}
                      />
                    );
                  }) : (
                    // Show skeleton rows when resources are limited
                    <tr className="border-t border-transparent">
                      <td colSpan={8} style={{height: ROW_HEIGHT * 5}} className="px-2 py-2 text-center text-gray-500 dark:text-gray-400">
                        Loading optimized view...
                      </td>
                    </tr>
                  )}
                  <tr style={{height: (totalRows - endIndex) * ROW_HEIGHT}} aria-hidden="true"><td style={{padding:0,margin:0,border:0}} /></tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
