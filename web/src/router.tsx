import React from 'react'
import { createHashRouter, Navigate } from 'react-router-dom'
import App from './App'
const Dashboard = React.lazy(() => import('@/pages/Dashboard'))
const AcademicPlanner = React.lazy(() => import('@/pages/AcademicPlanner'))
const SchedulePlanner = React.lazy(() => import('@/pages/SchedulePlanner'))
const CoursePlanner = React.lazy(() => import('@/pages/CoursePlanner'))
const Scholarships = React.lazy(() => import('@/pages/Scholarships'))
const Textbooks = React.lazy(() => import('@/pages/Textbooks'))
const Settings = React.lazy(() => import('@/pages/Settings'))
const AppLayout = React.lazy(() => import('@/components/AppLayout'))
const Tasks = React.lazy(() => import('@/pages/Tasks'))
const PerformanceTest = React.lazy(() => import('@/pages/PerformanceTest'))


export const router = createHashRouter([
{
  path: '/',
  element: <App />,
  children: [
  { path: '', element: <React.Suspense fallback={<div className="p-8 text-xs opacity-60">Loading…</div>}><AppLayout><Dashboard/></AppLayout></React.Suspense> },
  { path: 'planner', element: <React.Suspense fallback={<div className="p-6 text-xs opacity-60">Loading planner…</div>}><AppLayout><AcademicPlanner/></AppLayout></React.Suspense> },
  { path: 'tasks', element: <React.Suspense fallback={<div className="p-6 text-xs opacity-60">Loading tasks…</div>}><AppLayout><Tasks/></AppLayout></React.Suspense> },
  { path: 'schedule', element: <React.Suspense fallback={<div className="p-6 text-xs opacity-60">Loading schedule…</div>}><AppLayout><SchedulePlanner/></AppLayout></React.Suspense> },
  { path: 'course-planner', element: <React.Suspense fallback={<div className="p-6 text-xs opacity-60">Loading course planner…</div>}><AppLayout><CoursePlanner/></AppLayout></React.Suspense> },
  { path: 'courses', element: <React.Suspense fallback={<div className="p-6 text-xs opacity-60">Loading courses…</div>}><AppLayout><CoursePlanner/></AppLayout></React.Suspense> },
    { path: 'gpa', element: <Navigate to="/" replace /> },
    { path: 'gpa-calculator', element: <Navigate to="/" replace /> },
  { path: 'scholarships', element: <React.Suspense fallback={<div className="p-6 text-xs opacity-60">Loading scholarships…</div>}><AppLayout><Scholarships/></AppLayout></React.Suspense> },
  { path: 'textbooks', element: <React.Suspense fallback={<div className="p-6 text-xs opacity-60">Loading textbooks…</div>}><AppLayout><Textbooks/></AppLayout></React.Suspense> },
  { path: 'settings', element: <React.Suspense fallback={<div className="p-6 text-xs opacity-60">Loading settings…</div>}><AppLayout><Settings/></AppLayout></React.Suspense> },
  { path: 'performance', element: <React.Suspense fallback={<div className="p-6 text-xs opacity-60">Loading performance tools…</div>}><AppLayout><PerformanceTest/></AppLayout></React.Suspense> },
  ]
}
]) 