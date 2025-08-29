import React from 'react'
import { createBrowserRouter } from 'react-router-dom'
import Dashboard from '@/pages/Dashboard'
import AcademicPlanner from '@/pages/AcademicPlanner'
import SchedulePlanner from '@/pages/SchedulePlanner'
import CoursePlanner from '@/pages/CoursePlanner'
import GradeCalculator from '@/pages/GradeCalculator'
import GPACalculator from '@/pages/GPACalculator'
import Scholarships from '@/pages/Scholarships'
import Textbooks from '@/pages/Textbooks'
import Settings from '@/pages/Settings'
import AppLayout from '@/components/AppLayout'
import Tasks from '@/pages/Tasks'


export const router = createBrowserRouter([
{ path: '/', element: <AppLayout><Dashboard/></AppLayout> },
{ path: '/planner', element: <AppLayout><AcademicPlanner/></AppLayout> },
{ path: '/tasks', element: <AppLayout><Tasks/></AppLayout> },
{ path: '/schedule', element: <AppLayout><SchedulePlanner/></AppLayout> },
{ path: '/course-planner', element: <AppLayout><CoursePlanner/></AppLayout> },
{ path: '/grade-calculator', element: <AppLayout><GradeCalculator/></AppLayout> },
{ path: '/gpa-calculator', element: <AppLayout><GPACalculator/></AppLayout> },
{ path: '/scholarships', element: <AppLayout><Scholarships/></AppLayout> },
{ path: '/textbooks', element: <AppLayout><Textbooks/></AppLayout> },
{ path: '/settings', element: <AppLayout><Settings/></AppLayout> },
]) 