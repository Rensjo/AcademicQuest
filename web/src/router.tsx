import React from 'react'
import { createBrowserRouter } from 'react-router-dom'
import Dashboard from '@/pages/Dashboard'
import AcademicPlanner from '@/pages/AcademicPlanner'
import Tasks from '@/pages/Tasks'
import SchedulePlanner from '@/pages/SchedulePlanner'
import CoursePlanner from '@/pages/CoursePlanner'
import GradeCalculator from '@/pages/GradeCalculator'
import GPACalculator from '@/pages/GPACalculator'
import Scholarships from '@/pages/Scholarships'
import Textbooks from '@/pages/Textbooks'
import Settings from '@/pages/Settings'


export const router = createBrowserRouter([
{ path: '/', element: <Dashboard/> },
{ path: '/planner', element: <AcademicPlanner/> },
{ path: '/tasks', element: <Tasks/> },
{ path: '/schedule', element: <SchedulePlanner/> },
{ path: '/course-planner', element: <CoursePlanner/> },
{ path: '/grade-calculator', element: <GradeCalculator/> },
{ path: '/gpa-calculator', element: <GPACalculator/> },
{ path: '/scholarships', element: <Scholarships/> },
{ path: '/textbooks', element: <Textbooks/> },
{ path: '/settings', element: <Settings/> },
])