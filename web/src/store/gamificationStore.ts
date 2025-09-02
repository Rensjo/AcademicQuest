import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type BadgeType = 
  | 'first_task' | 'task_streak' | 'early_bird' | 'perfect_week' | 'study_warrior'
  | 'schedule_master' | 'academic_scholar' | 'time_keeper' | 'goal_crusher'
  | 'consistency_king' | 'semester_starter' | 'perfect_attendance' | 'attendance_streak'
  | 'first_class' | 'class_warrior' | 'attendance_champion' | 'never_miss' | 'semester_perfect'
  | 'monthly_perfect' | 'attendance_legend' | 'class_dedication'

export interface Badge {
  id: BadgeType
  name: string
  description: string
  icon: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  unlocked: boolean
  unlockedAt?: string
  progress?: number
  maxProgress?: number
}

export interface DailyQuest {
  id: string
  title: string
  description: string
  type: 'task' | 'study' | 'schedule' | 'academic'
  target: number
  progress: number
  completed: boolean
  xpReward: number
  date: string
}

export interface UserStats {
  level: number
  xp: number
  nextLevelXp: number
  totalXp: number
  streakDays: number
  longestStreak: number
  tasksCompleted: number
  tasksCompletedEarly: number
  studyHours: number
  scheduleBlocksCompleted: number
  perfectWeeks: number
  classesAttended: number
  attendanceStreak: number
  longestAttendanceStreak: number
  badges: Badge[]
  dailyQuests: DailyQuest[]
  lastActiveDate: string
}

interface GamificationState {
  stats: UserStats
  updateStats: (updates: Partial<UserStats>) => void
  addXP: (amount: number) => void
  unlockBadge: (badgeId: BadgeType) => void
  completeQuest: (questId: string) => void
  generateDailyQuests: () => void
  checkAchievements: () => void
  resetStreak: () => void
  incrementStreak: () => void
}

const INITIAL_BADGES: Badge[] = [
  {
    id: 'first_task',
    name: 'Getting Started',
    description: 'Complete your first task',
    icon: '🎯',
    rarity: 'common',
    unlocked: false,
    maxProgress: 1,
    progress: 0
  },
  {
    id: 'task_streak',
    name: 'Task Master',
    description: 'Complete 10 tasks in a row',
    icon: '⚡',
    rarity: 'rare',
    unlocked: false,
    maxProgress: 10,
    progress: 0
  },
  {
    id: 'early_bird',
    name: 'Early Bird',
    description: 'Complete 5 tasks before their due date',
    icon: '🌅',
    rarity: 'common',
    unlocked: false,
    maxProgress: 5,
    progress: 0
  },
  {
    id: 'perfect_week',
    name: 'Perfect Week',
    description: 'Complete all scheduled blocks for a week',
    icon: '✨',
    rarity: 'epic',
    unlocked: false,
    maxProgress: 1,
    progress: 0
  },
  {
    id: 'study_warrior',
    name: 'Study Warrior',
    description: 'Study for 25+ hours in a week',
    icon: '⚔️',
    rarity: 'rare',
    unlocked: false,
    maxProgress: 25,
    progress: 0
  },
  {
    id: 'schedule_master',
    name: 'Schedule Master',
    description: 'Complete 50 scheduled blocks',
    icon: '📅',
    rarity: 'rare',
    unlocked: false,
    maxProgress: 50,
    progress: 0
  },
  {
    id: 'academic_scholar',
    name: 'Academic Scholar',
    description: 'Maintain 3.5+ GPA for a semester',
    icon: '🎓',
    rarity: 'legendary',
    unlocked: false,
    maxProgress: 1,
    progress: 0
  },
  {
    id: 'time_keeper',
    name: 'Time Keeper',
    description: 'Log 100 study sessions',
    icon: '⏰',
    rarity: 'epic',
    unlocked: false,
    maxProgress: 100,
    progress: 0
  },
  {
    id: 'goal_crusher',
    name: 'Goal Crusher',
    description: 'Complete 100 tasks total',
    icon: '🏆',
    rarity: 'epic',
    unlocked: false,
    maxProgress: 100,
    progress: 0
  },
  {
    id: 'consistency_king',
    name: 'Consistency King',
    description: 'Maintain a 30-day streak',
    icon: '👑',
    rarity: 'legendary',
    unlocked: false,
    maxProgress: 30,
    progress: 0
  },
  {
    id: 'semester_starter',
    name: 'Semester Starter',
    description: 'Set up your first course and schedule',
    icon: '🚀',
    rarity: 'common',
    unlocked: false,
    maxProgress: 1,
    progress: 0
  },
  {
    id: 'perfect_attendance',
    name: 'Perfect Attendance',
    description: 'Attend all classes for 30 days straight',
    icon: '🎯',
    rarity: 'legendary',
    unlocked: false,
    maxProgress: 30,
    progress: 0
  },
  {
    id: 'attendance_streak',
    name: 'Class Commitment',
    description: 'Maintain a 7-day attendance streak',
    icon: '📚',
    rarity: 'rare',
    unlocked: false,
    maxProgress: 7,
    progress: 0
  },
  {
    id: 'first_class',
    name: 'First Day',
    description: 'Attend your first class',
    icon: '🎒',
    rarity: 'common',
    unlocked: false,
    maxProgress: 1,
    progress: 0
  },
  {
    id: 'class_warrior',
    name: 'Class Warrior',
    description: 'Attend 50 classes',
    icon: '⚔️',
    rarity: 'rare',
    unlocked: false,
    maxProgress: 50,
    progress: 0
  },
  {
    id: 'attendance_champion',
    name: 'Attendance Champion',
    description: 'Maintain 95%+ attendance for 30 days',
    icon: '🏆',
    rarity: 'epic',
    unlocked: false,
    maxProgress: 30,
    progress: 0
  },
  {
    id: 'never_miss',
    name: 'Never Miss',
    description: 'Attend 100 classes without missing any',
    icon: '💎',
    rarity: 'legendary',
    unlocked: false,
    maxProgress: 100,
    progress: 0
  },
  {
    id: 'semester_perfect',
    name: 'Semester Perfect',
    description: 'Perfect attendance for an entire semester (120 days)',
    icon: '👑',
    rarity: 'legendary',
    unlocked: false,
    maxProgress: 120,
    progress: 0
  },
  {
    id: 'monthly_perfect',
    name: 'Monthly Perfect',
    description: 'Perfect attendance for 30 consecutive days',
    icon: '🌟',
    rarity: 'epic',
    unlocked: false,
    maxProgress: 30,
    progress: 0
  },
  {
    id: 'attendance_legend',
    name: 'Attendance Legend',
    description: 'Maintain 90%+ attendance for a full year',
    icon: '🔥',
    rarity: 'legendary',
    unlocked: false,
    maxProgress: 365,
    progress: 0
  },
  {
    id: 'class_dedication',
    name: 'Class Dedication',
    description: 'Attend classes for 200 days total',
    icon: '📖',
    rarity: 'epic',
    unlocked: false,
    maxProgress: 200,
    progress: 0
  }
]

const XP_PER_LEVEL = 500
const calculateLevelFromXP = (xp: number): number => Math.floor(xp / XP_PER_LEVEL) + 1
const calculateNextLevelXP = (level: number): number => level * XP_PER_LEVEL

const QUEST_TEMPLATES = [
  { type: 'task', title: 'Task Champion', description: 'Complete 3 tasks today', target: 3, xp: 50 },
  { type: 'task', title: 'Early Achiever', description: 'Complete 1 task before its due date', target: 1, xp: 75 },
  { type: 'study', title: 'Study Session', description: 'Study for 2 hours today', target: 2, xp: 60 },
  { type: 'study', title: 'Focus Time', description: 'Complete 4 Pomodoro sessions', target: 4, xp: 40 },
  { type: 'schedule', title: 'Schedule Keeper', description: 'Complete 3 scheduled blocks today', target: 3, xp: 55 },
  { type: 'academic', title: 'Course Explorer', description: 'Review 1 course material', target: 1, xp: 35 }
]

// Migration function to add new badges to existing users
const migrateBadges = (existingBadges: Badge[]): Badge[] => {
  const existingIds = new Set(existingBadges.map(b => b.id))
  const newBadges = INITIAL_BADGES.filter(b => !existingIds.has(b.id))
  
  // Update existing badges with any new properties while preserving progress
  const updatedExisting = existingBadges.map(existing => {
    const current = INITIAL_BADGES.find(b => b.id === existing.id)
    if (current) {
      return {
        ...current,
        unlocked: existing.unlocked,
        unlockedAt: existing.unlockedAt,
        progress: existing.progress
      }
    }
    return existing
  })
  
  return [...updatedExisting, ...newBadges]
}

export const useGamification = create<GamificationState>()(
  persist(
    (set) => ({
      stats: {
        level: 1,
        xp: 0,
        nextLevelXp: XP_PER_LEVEL,
        totalXp: 0,
        streakDays: 0,
        longestStreak: 0,
        tasksCompleted: 0,
        tasksCompletedEarly: 0,
        studyHours: 0,
        scheduleBlocksCompleted: 0,
        perfectWeeks: 0,
        classesAttended: 0,
        attendanceStreak: 0,
        longestAttendanceStreak: 0,
        badges: INITIAL_BADGES,
        dailyQuests: [],
        lastActiveDate: new Date().toISOString().split('T')[0]
      },

      updateStats: (updates) => set((state) => ({
        stats: { ...state.stats, ...updates }
      })),

      addXP: (amount) => set((state) => {
        const newTotalXP = state.stats.totalXp + amount
        const newLevel = calculateLevelFromXP(newTotalXP)
        
        return {
          stats: {
            ...state.stats,
            xp: state.stats.xp + amount,
            totalXp: newTotalXP,
            level: newLevel,
            nextLevelXp: calculateNextLevelXP(newLevel)
          }
        }
      }),

      unlockBadge: (badgeId) => set((state) => ({
        stats: {
          ...state.stats,
          badges: state.stats.badges.map(badge =>
            badge.id === badgeId
              ? { ...badge, unlocked: true, unlockedAt: new Date().toISOString() }
              : badge
          )
        }
      })),

      completeQuest: (questId) => set((state) => ({
        stats: {
          ...state.stats,
          dailyQuests: state.stats.dailyQuests.map(quest =>
            quest.id === questId ? { ...quest, completed: true } : quest
          )
        }
      })),

      generateDailyQuests: () => set((state) => {
        const today = new Date().toISOString().split('T')[0]
        
        // Don't regenerate if quests already exist for today
        if (state.stats.dailyQuests.some(q => q.date === today)) {
          return state
        }

        // Generate 3 random quests for today
        const shuffled = [...QUEST_TEMPLATES].sort(() => 0.5 - Math.random())
        const newQuests: DailyQuest[] = shuffled.slice(0, 3).map((template, index) => ({
          id: `${today}-${index}`,
          title: template.title,
          description: template.description,
          type: template.type as 'task' | 'study' | 'schedule' | 'academic',
          target: template.target,
          progress: 0,
          completed: false,
          xpReward: template.xp,
          date: today
        }))

        return {
          stats: {
            ...state.stats,
            dailyQuests: [
              ...state.stats.dailyQuests.filter(q => q.date !== today),
              ...newQuests
            ]
          }
        }
      }),

      checkAchievements: () => set((state) => {
        const { stats } = state
        let updatedBadges = [...stats.badges]

        // Check all badge conditions
        updatedBadges = updatedBadges.map(badge => {
          if (badge.unlocked) return badge

          let shouldUnlock = false
          let newProgress = badge.progress || 0

          switch (badge.id) {
            case 'first_task':
              newProgress = stats.tasksCompleted
              shouldUnlock = stats.tasksCompleted >= 1
              break
            case 'task_streak':
              newProgress = Math.min(stats.tasksCompleted, 10)
              shouldUnlock = stats.tasksCompleted >= 10
              break
            case 'early_bird':
              newProgress = stats.tasksCompletedEarly
              shouldUnlock = stats.tasksCompletedEarly >= 5
              break
            case 'perfect_week':
              newProgress = stats.perfectWeeks
              shouldUnlock = stats.perfectWeeks >= 1
              break
            case 'study_warrior':
              newProgress = Math.min(stats.studyHours, 25)
              shouldUnlock = stats.studyHours >= 25
              break
            case 'schedule_master':
              newProgress = stats.scheduleBlocksCompleted
              shouldUnlock = stats.scheduleBlocksCompleted >= 50
              break
            case 'time_keeper':
              newProgress = Math.min(stats.scheduleBlocksCompleted, 100)
              shouldUnlock = stats.scheduleBlocksCompleted >= 100
              break
            case 'goal_crusher':
              newProgress = stats.tasksCompleted
              shouldUnlock = stats.tasksCompleted >= 100
              break
            case 'consistency_king':
              newProgress = stats.streakDays
              shouldUnlock = stats.streakDays >= 30
              break
            case 'perfect_attendance':
              newProgress = stats.attendanceStreak
              shouldUnlock = stats.attendanceStreak >= 30
              break
            case 'attendance_streak':
              newProgress = stats.attendanceStreak
              shouldUnlock = stats.attendanceStreak >= 7
              break
            case 'first_class':
              newProgress = stats.classesAttended
              shouldUnlock = stats.classesAttended >= 1
              break
            case 'class_warrior':
              newProgress = stats.classesAttended
              shouldUnlock = stats.classesAttended >= 50
              break
            case 'attendance_champion':
              // This will be checked with additional logic from attendance store
              newProgress = stats.attendanceStreak
              shouldUnlock = stats.attendanceStreak >= 30
              break
            case 'never_miss':
              newProgress = stats.classesAttended
              shouldUnlock = stats.classesAttended >= 100
              break
            case 'semester_perfect':
              newProgress = stats.attendanceStreak
              shouldUnlock = stats.attendanceStreak >= 120
              break
            case 'monthly_perfect':
              newProgress = stats.attendanceStreak
              shouldUnlock = stats.attendanceStreak >= 30
              break
            case 'attendance_legend':
              newProgress = Math.min(365, stats.classesAttended)
              shouldUnlock = stats.classesAttended >= 365
              break
            case 'class_dedication':
              newProgress = stats.classesAttended
              shouldUnlock = stats.classesAttended >= 200
              break
          }

          return {
            ...badge,
            progress: newProgress,
            unlocked: shouldUnlock,
            unlockedAt: shouldUnlock ? new Date().toISOString() : badge.unlockedAt
          }
        })

        return {
          stats: {
            ...stats,
            badges: updatedBadges
          }
        }
      }),

      resetStreak: () => set((state) => ({
        stats: {
          ...state.stats,
          streakDays: 0
        }
      })),

      incrementStreak: () => set((state) => ({
        stats: {
          ...state.stats,
          streakDays: state.stats.streakDays + 1,
          longestStreak: Math.max(state.stats.longestStreak, state.stats.streakDays + 1),
          lastActiveDate: new Date().toISOString().split('T')[0]
        }
      }))
    }),
    {
      name: 'aq:gamification',
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Migrate badges for existing users
          state.stats.badges = migrateBadges(state.stats.badges)
        }
      }
    }
  )
)
