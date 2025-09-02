import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Star, Trophy, Target, Calendar, Award, Zap, Crown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useGamification } from '@/store/gamificationStore'

interface GamificationPanelProps {
  isOpen: boolean
  onClose: () => void
  defaultTab?: 'status' | 'badges' | 'quests'
}

const getRarityColor = (rarity: string) => {
  switch (rarity) {
    case 'common': return 'text-gray-600 border-gray-300'
    case 'rare': return 'text-blue-600 border-blue-300'
    case 'epic': return 'text-purple-600 border-purple-300'
    case 'legendary': return 'text-yellow-600 border-yellow-300'
    default: return 'text-gray-600 border-gray-300'
  }
}

const getRarityBg = (rarity: string) => {
  switch (rarity) {
    case 'common': return 'bg-gray-50 dark:bg-gray-900/20'
    case 'rare': return 'bg-blue-50 dark:bg-blue-900/20'
    case 'epic': return 'bg-purple-50 dark:bg-purple-900/20'
    case 'legendary': return 'bg-yellow-50 dark:bg-yellow-900/20'
    default: return 'bg-gray-50 dark:bg-gray-900/20'
  }
}

export function GamificationPanel({ isOpen, onClose, defaultTab = 'status' }: GamificationPanelProps) {
  const { stats, generateDailyQuests, checkAchievements } = useGamification()

  useEffect(() => {
    if (isOpen) {
      generateDailyQuests()
      checkAchievements()
    }
  }, [isOpen, generateDailyQuests, checkAchievements])

  // Map defaultTab to actual tab values
  const getTabValue = (tab: string) => {
    switch (tab) {
      case 'status': return 'overview'
      case 'badges': return 'badges'
      case 'quests': return 'quests'
      default: return 'overview'
    }
  }

  const xpProgress = ((stats.xp % 500) / 500) * 100
  const unlockedBadges = stats.badges.filter(b => b.unlocked)
  const lockedBadges = stats.badges.filter(b => !b.unlocked)
  const todayQuests = stats.dailyQuests.filter(q => q.date === new Date().toISOString().split('T')[0])
  const completedQuests = todayQuests.filter(q => q.completed)

  // Categorize badges
  const attendanceBadgeIds = ['first_class', 'attendance_streak', 'perfect_attendance', 'class_warrior', 
                             'attendance_champion', 'never_miss', 'semester_perfect', 'monthly_perfect', 
                             'attendance_legend', 'class_dedication']
  const taskBadgeIds = ['first_task', 'task_streak', 'early_bird', 'goal_crusher']
  const studyBadgeIds = ['study_warrior', 'time_keeper']
  const generalBadgeIds = ['perfect_week', 'schedule_master', 'academic_scholar', 'consistency_king', 'semester_starter']

  const getBadgeCategory = (badgeId: string) => {
    if (attendanceBadgeIds.includes(badgeId)) return 'attendance'
    if (taskBadgeIds.includes(badgeId)) return 'tasks'
    if (studyBadgeIds.includes(badgeId)) return 'study'
    return 'general'
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'attendance': return '📚'
      case 'tasks': return '✅'
      case 'study': return '📖'
      default: return '🎯'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'attendance': return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20'
      case 'tasks': return 'text-green-600 bg-green-50 dark:bg-green-900/20'
      case 'study': return 'text-purple-600 bg-purple-50 dark:bg-purple-900/20'
      default: return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20'
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: "spring", duration: 0.3 }}
          className="bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Adventurer Status</h2>
                <p className="text-neutral-600 dark:text-neutral-400">Level {stats.level} Academic Explorer</p>
              </div>
            </div>
            <Button variant="outline" size="icon" onClick={onClose} className="rounded-xl">
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            {/* Level Progress */}
            <Card className="rounded-2xl mb-6">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Star className="w-8 h-8 text-yellow-500" />
                    <div>
                      <h3 className="text-xl font-bold">Level {stats.level}</h3>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        {stats.xp} / {stats.nextLevelXp} XP
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">🔥 Current Streak</p>
                    <p className="text-2xl font-bold text-orange-600">{stats.streakDays} days</p>
                  </div>
                </div>
                
                <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-3 mb-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${xpProgress}%` }}
                    transition={{ duration: 0.8 }}
                    className="h-3 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600"
                  />
                </div>
                <p className="text-xs text-neutral-500">
                  {500 - (stats.xp % 500)} XP to next level
                </p>
              </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs defaultValue={getTabValue(defaultTab)} className="space-y-4">
              <TabsList className="grid w-full grid-cols-4 rounded-2xl">
                <TabsTrigger value="overview" className="rounded-xl bg-white/80 dark:bg-neutral-900/60">Overview</TabsTrigger>
                <TabsTrigger value="quests" className="rounded-xl bg-white/80 dark:bg-neutral-900/60">Daily Quests</TabsTrigger>
                <TabsTrigger value="badges" className="rounded-xl bg-white/80 dark:bg-neutral-900/60">Badges</TabsTrigger>
                <TabsTrigger value="stats" className="rounded-xl bg-white/80 dark:bg-neutral-900/60">Stats</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="rounded-2xl">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="w-5 h-5" />
                        Today's Progress
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Daily Quests</span>
                          <Badge variant="secondary">
                            {completedQuests.length}/{todayQuests.length}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Streak</span>
                          <Badge variant="secondary">{stats.streakDays} days</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Badges Earned</span>
                          <Badge variant="secondary">{unlockedBadges.length}/{stats.badges.length}</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="rounded-2xl">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Trophy className="w-5 h-5" />
                        Recent Achievements
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {unlockedBadges.length > 0 ? (
                        <div className="space-y-2">
                          {unlockedBadges
                            .sort((a, b) => (b.unlockedAt || '').localeCompare(a.unlockedAt || ''))
                            .slice(0, 3)
                            .map((badge) => (
                              <div key={badge.id} className="flex items-center gap-2 p-2 rounded-xl bg-neutral-50 dark:bg-neutral-800/50">
                                <span className="text-xl">{badge.icon}</span>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">{badge.name}</p>
                                  <p className="text-xs text-neutral-600 dark:text-neutral-400">
                                    {badge.unlockedAt ? new Date(badge.unlockedAt).toLocaleDateString() : ''}
                                  </p>
                                </div>
                              </div>
                            ))}
                        </div>
                      ) : (
                        <div className="text-center py-4 text-neutral-500 dark:text-neutral-400">
                          <Trophy className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No badges unlocked yet</p>
                          <p className="text-xs">Complete tasks to earn your first badge!</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="quests" className="space-y-4">
                <Card className="rounded-2xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      Today's Quests
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {todayQuests.length > 0 ? (
                      <div className="space-y-3">
                        {todayQuests.map((quest) => (
                          <div
                            key={quest.id}
                            className={`p-4 rounded-xl border transition-all ${
                              quest.completed
                                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                                : 'bg-neutral-50 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium">{quest.title}</h4>
                              <div className="flex items-center gap-2">
                                <Badge variant={quest.completed ? 'default' : 'secondary'}>
                                  {quest.progress}/{quest.target}
                                </Badge>
                                <span className="text-sm text-neutral-600 dark:text-neutral-400">
                                  +{quest.xpReward} XP
                                </span>
                              </div>
                            </div>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                              {quest.description}
                            </p>
                            <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
                              <div
                                className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 transition-all duration-300"
                                style={{ width: `${Math.min((quest.progress / quest.target) * 100, 100)}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-neutral-500 dark:text-neutral-400">
                        <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No quests available today</p>
                        <p className="text-sm">New quests will be generated tomorrow!</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="badges" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Unlocked Badges */}
                  <Card className="rounded-2xl">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Award className="w-5 h-5" />
                        Earned Badges ({unlockedBadges.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {unlockedBadges.length > 0 ? (
                        <div className="grid grid-cols-2 gap-3">
                          {unlockedBadges.map((badge) => {
                            const category = getBadgeCategory(badge.id)
                            const categoryIcon = getCategoryIcon(category)
                            const categoryColor = getCategoryColor(category)
                            
                            return (
                              <div
                                key={badge.id}
                                className={`p-3 rounded-xl border ${getRarityBg(badge.rarity)} ${getRarityColor(badge.rarity)} relative`}
                              >
                                {/* Category indicator */}
                                <div className={`absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs ${categoryColor}`}>
                                  {categoryIcon}
                                </div>
                                
                                <div className="text-center">
                                  <span className="text-2xl mb-2 block">{badge.icon}</span>
                                  <p className="font-medium text-xs mb-1">{badge.name}</p>
                                  <p className="text-xs opacity-75">{badge.description}</p>
                                  {badge.unlockedAt && (
                                    <p className="text-xs mt-1 opacity-60">
                                      {new Date(badge.unlockedAt).toLocaleDateString()}
                                    </p>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-neutral-500 dark:text-neutral-400">
                          <Award className="w-12 h-12 mx-auto mb-3 opacity-50" />
                          <p>No badges earned yet</p>
                          <p className="text-sm">Complete your first task to get started!</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Locked Badges */}
                  <Card className="rounded-2xl">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Zap className="w-5 h-5" />
                        Available Badges ({lockedBadges.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-3">
                        {lockedBadges.map((badge) => {
                          const category = getBadgeCategory(badge.id)
                          const categoryIcon = getCategoryIcon(category)
                          const categoryColor = getCategoryColor(category)
                          
                          return (
                            <div
                              key={badge.id}
                              className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50 opacity-75 relative"
                            >
                              {/* Category indicator */}
                              <div className={`absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs ${categoryColor}`}>
                                {categoryIcon}
                              </div>
                              
                              <div className="text-center">
                                <span className="text-2xl mb-2 block grayscale">{badge.icon}</span>
                                <p className="font-medium text-xs mb-1">{badge.name}</p>
                                <p className="text-xs opacity-75 mb-2">{badge.description}</p>
                                {badge.maxProgress && badge.maxProgress > 1 && (
                                  <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-1.5 mb-1">
                                    <div
                                      className="h-1.5 rounded-full bg-neutral-400"
                                      style={{ width: `${Math.min(((badge.progress || 0) / badge.maxProgress) * 100, 100)}%` }}
                                    />
                                  </div>
                                )}
                                {badge.maxProgress && badge.maxProgress > 1 && (
                                  <p className="text-xs text-neutral-500">
                                    {badge.progress || 0}/{badge.maxProgress}
                                  </p>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="stats" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Card className="rounded-2xl">
                    <CardContent className="p-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">{stats.tasksCompleted}</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Tasks Completed</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="rounded-2xl">
                    <CardContent className="p-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">{stats.tasksCompletedEarly}</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Early Completions</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="rounded-2xl">
                    <CardContent className="p-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-purple-600">{stats.studyHours}h</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Study Hours</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="rounded-2xl">
                    <CardContent className="p-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-orange-600">{stats.scheduleBlocksCompleted}</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Schedule Blocks</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="rounded-2xl">
                    <CardContent className="p-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-red-600">{stats.classesAttended}</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Classes Attended</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="rounded-2xl">
                    <CardContent className="p-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-teal-600">{stats.attendanceStreak}</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Attendance Streak</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="rounded-2xl">
                    <CardContent className="p-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-yellow-600">{stats.longestStreak}</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Longest Streak</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="rounded-2xl">
                    <CardContent className="p-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-pink-600">{stats.longestAttendanceStreak}</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Longest Attendance</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="rounded-2xl">
                    <CardContent className="p-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-indigo-600">{stats.totalXp}</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Total XP</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
