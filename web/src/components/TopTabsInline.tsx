import React from "react";
import { Button } from "@/components/ui/button";
import { useLocation, useNavigate } from "react-router-dom";

export type TopTabKey =
  | "dashboard"
  | "planner"
  | "tasks"
  | "schedule"
  | "courses"
  | "scholarships"
  | "textbooks"
  | "settings";

export default function TopTabsInline({ active }: { active?: TopTabKey }) {
  const navigate = useNavigate();
  const location = useLocation();
  const tabs = [
    { key: "dashboard" as const, label: "Dashboard", path: "/" },
    { key: "planner" as const, label: "Academic Planner", path: "/planner" },
    { key: "tasks" as const, label: "Task Tracker", path: "/tasks" },
    { key: "schedule" as const, label: "Schedule Planner", path: "/schedule" },
  { key: "courses" as const, label: "Course Planner", path: "/course-planner" },
    
    { key: "scholarships" as const, label: "Scholarships", path: "/scholarships" },
    { key: "textbooks" as const, label: "Textbooks", path: "/textbooks" },
    { key: "settings" as const, label: "Settings", path: "/settings" },
  ];

  // Infer active tab from URL if not provided
  const path = location.pathname;
  const inferred: TopTabKey | undefined = (() => {
    if (path === "/") return "dashboard";
    if (path.startsWith("/planner")) return "planner";
    if (path.startsWith("/tasks")) return "tasks";
    if (path.startsWith("/schedule")) return "schedule";
    if (path.startsWith("/course-planner") || path.startsWith("/courses")) return "courses";
    if (path.startsWith("/scholarships")) return "scholarships";
    if (path.startsWith("/textbooks")) return "textbooks";
    if (path.startsWith("/settings")) return "settings";
    return undefined;
  })();
  const activeKey = active ?? inferred;

  return (
    <div className="flex items-center gap-2 flex-nowrap whitespace-nowrap overflow-x-auto">
      {tabs.map((t) => (
        <Button
          key={t.key}
          variant={activeKey === t.key ? "default" : "outline"}
          className={`h-9 rounded-full ${activeKey === t.key ? "" : "bg-white/70 dark:bg-neutral-900/60"}`}
          onClick={() => navigate(t.path)}
        >
          {t.label}
        </Button>
      ))}
    </div>
  );
}
