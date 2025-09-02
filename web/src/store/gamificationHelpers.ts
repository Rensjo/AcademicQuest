import { useGamification } from './gamificationStore'
import { useCallback } from 'react'

// XP rewards for different actions
export const XP_REWARDS = {
  TASK_COMPLETE: 25,
  TASK_EARLY: 50,
  TASK_ON_TIME: 35,
  STUDY_SESSION: 15,
  SCHEDULE_BLOCK: 20,
  COURSE_ADD: 30,
  DAILY_LOGIN: 10,
  WEEK_PERFECT: 100,
  CLASS_ATTENDANCE: 15,
} as const

// Helper function to check if task is completed early
export function isTaskEarly(dueDate?: string): boolean {
  if (!dueDate) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(dueDate)
  due.setHours(0, 0, 0, 0)
  return today < due
}

// Helper function to check if task is on time
export function isTaskOnTime(dueDate?: string): boolean {
  if (!dueDate) return true
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(dueDate)
  due.setHours(0, 0, 0, 0)
  return today <= due
}

// Non-hook version for use in stores
export const rewardTaskCompletion = (dueDate?: string) => {
  const store = useGamification.getState()
  const isEarly = isTaskEarly(dueDate)
  const isOnTime = isTaskOnTime(dueDate)
  
  if (isEarly) {
    store.addXP(XP_REWARDS.TASK_EARLY)
    store.updateStats({ 
      tasksCompleted: store.stats.tasksCompleted + 1,
      tasksCompletedEarly: store.stats.tasksCompletedEarly + 1 
    })
  } else if (isOnTime) {
    store.addXP(XP_REWARDS.TASK_ON_TIME)
    store.updateStats({ tasksCompleted: store.stats.tasksCompleted + 1 })
  } else {
    store.addXP(XP_REWARDS.TASK_COMPLETE)
    store.updateStats({ tasksCompleted: store.stats.tasksCompleted + 1 })
  }
  
  store.checkAchievements()
}

export const rewardStudySession = (durationMinutes: number) => {
  const store = useGamification.getState()
  const xp = Math.floor(durationMinutes / 25) * XP_REWARDS.STUDY_SESSION // XP per 25-minute session
  store.addXP(xp)
  
  const currentHours = store.stats.studyHours
  store.updateStats({ studyHours: currentHours + (durationMinutes / 60) })
  
  store.checkAchievements()
}

export const rewardClassAttendance = () => {
  const store = useGamification.getState()
  store.addXP(XP_REWARDS.CLASS_ATTENDANCE)
  store.updateStats({ 
    classesAttended: store.stats.classesAttended + 1
  })
  store.checkAchievements()
}

export const updateAttendanceStreak = (perfectDay: boolean) => {
  const store = useGamification.getState()
  if (perfectDay) {
    const newStreak = store.stats.attendanceStreak + 1
    const newLongest = Math.max(store.stats.longestAttendanceStreak, newStreak)
    store.updateStats({
      attendanceStreak: newStreak,
      longestAttendanceStreak: newLongest
    })
  } else {
    store.updateStats({
      attendanceStreak: 0
    })
  }
  store.checkAchievements()
}

// Gamification actions that can be called from anywhere in the app
export function useGamificationActions() {
  const { addXP, updateStats, checkAchievements, incrementStreak } = useGamification()

  const rewardTaskCompletionHook = useCallback((dueDate?: string) => {
    const isEarly = isTaskEarly(dueDate)
    const isOnTime = isTaskOnTime(dueDate)
    
    if (isEarly) {
      addXP(XP_REWARDS.TASK_EARLY)
      updateStats({ 
        tasksCompleted: useGamification.getState().stats.tasksCompleted + 1,
        tasksCompletedEarly: useGamification.getState().stats.tasksCompletedEarly + 1 
      })
    } else if (isOnTime) {
      addXP(XP_REWARDS.TASK_ON_TIME)
      updateStats({ tasksCompleted: useGamification.getState().stats.tasksCompleted + 1 })
    } else {
      addXP(XP_REWARDS.TASK_COMPLETE)
      updateStats({ tasksCompleted: useGamification.getState().stats.tasksCompleted + 1 })
    }
    
    checkAchievements()
  }, [addXP, updateStats, checkAchievements])

  const rewardStudySessionHook = useCallback((durationMinutes: number) => {
    const xp = Math.floor(durationMinutes / 25) * XP_REWARDS.STUDY_SESSION
    addXP(xp)
    
    const currentHours = useGamification.getState().stats.studyHours
    updateStats({ studyHours: currentHours + (durationMinutes / 60) })
    
    checkAchievements()
  }, [addXP, updateStats, checkAchievements])

  const rewardScheduleBlock = useCallback(() => {
    addXP(XP_REWARDS.SCHEDULE_BLOCK)
    updateStats({ 
      scheduleBlocksCompleted: useGamification.getState().stats.scheduleBlocksCompleted + 1 
    })
    checkAchievements()
  }, [addXP, updateStats, checkAchievements])

  const rewardCourseAdd = useCallback(() => {
    addXP(XP_REWARDS.COURSE_ADD)
    checkAchievements()
  }, [addXP, checkAchievements])

  const rewardDailyLogin = useCallback(() => {
    const today = new Date().toISOString().split('T')[0]
    const lastActive = useGamification.getState().stats.lastActiveDate
    
    if (lastActive !== today) {
      addXP(XP_REWARDS.DAILY_LOGIN)
      incrementStreak()
      checkAchievements()
    }
  }, [addXP, incrementStreak, checkAchievements])

  return {
    rewardTaskCompletion: rewardTaskCompletionHook,
    rewardStudySession: rewardStudySessionHook,
    rewardScheduleBlock,
    rewardCourseAdd,
    rewardDailyLogin,
  }
}
