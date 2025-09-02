import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Calendar, TrendingUp, BarChart3, Clock, Target, Award } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from 'recharts'
import { useStudySessions, minutesByDay } from '@/store/studySessionsStore'

interface StudyHoursPanelProps {
  isOpen: boolean
  onClose: () => void
}

const COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444']

export function StudyHoursPanel({ isOpen, onClose }: StudyHoursPanelProps) {
  const { sessions } = useStudySessions()
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'term'>('week')

  // Calculate date ranges for different periods
  const dateRanges = useMemo(() => {
    const now = new Date()
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - 6)
    
    const monthStart = new Date(now)
    monthStart.setDate(now.getDate() - 29)
    
    const termStart = new Date(now)
    termStart.setMonth(now.getMonth() - 4) // ~4 months for a term
    
    return {
      week: { start: weekStart, end: now, label: '7 Days' },
      month: { start: monthStart, end: now, label: '30 Days' },
      term: { start: termStart, end: now, label: 'This Term' }
    }
  }, [])

  // Filter sessions for selected period
  const periodSessions = useMemo(() => {
    const range = dateRanges[selectedPeriod]
    return sessions.filter(s => {
      const sessionDate = new Date(s.start)
      return sessionDate >= range.start && sessionDate <= range.end
    })
  }, [sessions, selectedPeriod, dateRanges])

  // Calculate analytics for selected period
  const analytics = useMemo(() => {
    const totalMinutes = periodSessions.reduce((sum, s) => sum + s.durationMin, 0)
    const totalHours = Math.round(totalMinutes / 60 * 10) / 10
    const avgPerDay = Math.round(totalMinutes / ((dateRanges[selectedPeriod].end.getTime() - dateRanges[selectedPeriod].start.getTime()) / (1000 * 60 * 60 * 24)) * 10) / 10
    
    // Source breakdown
    const bySource = periodSessions.reduce((acc, s) => {
      acc[s.source] = (acc[s.source] || 0) + s.durationMin
      return acc
    }, {} as Record<string, number>)
    
    // Course breakdown (top 5)
    const byCourse = periodSessions.reduce((acc, s) => {
      if (s.courseId) {
        acc[s.courseId] = (acc[s.courseId] || 0) + s.durationMin
      }
      return acc
    }, {} as Record<string, number>)
    
    // Daily trend
    const dailyData = minutesByDay(periodSessions, dateRanges[selectedPeriod].start, dateRanges[selectedPeriod].end)
      .map(d => ({
        date: d.date,
        hours: Math.round(d.minutes / 60 * 10) / 10,
        day: new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' })
      }))
    
    // Study streaks
    const sortedDays = dailyData.sort((a, b) => a.date.localeCompare(b.date))
    let currentStreak = 0
    let maxStreak = 0
    let tempStreak = 0
    
    for (let i = sortedDays.length - 1; i >= 0; i--) {
      if (sortedDays[i].hours > 0) {
        tempStreak++
        if (i === sortedDays.length - 1) currentStreak = tempStreak
      } else {
        maxStreak = Math.max(maxStreak, tempStreak)
        tempStreak = 0
      }
    }
    maxStreak = Math.max(maxStreak, tempStreak)
    
    return {
      totalHours,
      totalMinutes,
      avgPerDay,
      sessionsCount: periodSessions.length,
      bySource: Object.entries(bySource).map(([source, minutes]) => ({
        source: source.charAt(0).toUpperCase() + source.slice(1),
        minutes,
        hours: Math.round(minutes / 60 * 10) / 10,
        percentage: Math.round(minutes / totalMinutes * 100)
      })).sort((a, b) => b.minutes - a.minutes),
      byCourse: Object.entries(byCourse).map(([courseId, minutes]) => ({
        courseId,
        minutes,
        hours: Math.round(minutes / 60 * 10) / 10,
        percentage: Math.round(minutes / totalMinutes * 100)
      })).sort((a, b) => b.minutes - a.minutes).slice(0, 5),
      dailyData,
      currentStreak,
      maxStreak
    }
  }, [periodSessions, dateRanges, selectedPeriod])

  // Study patterns analysis
  const patterns = useMemo(() => {
    const hourCounts = new Array(24).fill(0)
    const dayOfWeekCounts = new Array(7).fill(0) // Sunday = 0
    
    periodSessions.forEach(session => {
      const start = new Date(session.start)
      const hour = start.getHours()
      const dayOfWeek = start.getDay()
      
      hourCounts[hour] += session.durationMin
      dayOfWeekCounts[dayOfWeek] += session.durationMin
    })
    
    const peakHour = hourCounts.indexOf(Math.max(...hourCounts))
    const peakDay = dayOfWeekCounts.indexOf(Math.max(...dayOfWeekCounts))
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    
    return {
      peakHour: peakHour === 0 ? '12:00 AM' : peakHour < 12 ? `${peakHour}:00 AM` : peakHour === 12 ? '12:00 PM' : `${peakHour - 12}:00 PM`,
      peakDay: dayNames[peakDay],
      hourlyData: hourCounts.map((minutes, hour) => ({
        hour: hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`,
        minutes: Math.round(minutes),
        hours: Math.round(minutes / 60 * 10) / 10
      })),
      weeklyData: dayOfWeekCounts.map((minutes, day) => ({
        day: dayNames[day].slice(0, 3),
        fullDay: dayNames[day],
        minutes: Math.round(minutes),
        hours: Math.round(minutes / 60 * 10) / 10
      }))
    }
  }, [periodSessions])

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
          className="bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
                <BarChart3 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Study Hours Analytics</h2>
                <p className="text-neutral-600 dark:text-neutral-400">Detailed insights into your study patterns</p>
              </div>
            </div>
            <Button variant="outline" size="icon" onClick={onClose} className="rounded-xl">
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            {/* Period Selector */}
            <div className="flex gap-2 mb-6">
              {(['week', 'month', 'term'] as const).map((period) => (
                <Button
                  key={period}
                  variant={selectedPeriod === period ? 'default' : 'outline'}
                  onClick={() => setSelectedPeriod(period)}
                  className="rounded-xl"
                >
                  {dateRanges[period].label}
                </Button>
              ))}
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card className="rounded-2xl">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">Total Hours</p>
                      <p className="text-2xl font-bold text-indigo-600">{analytics.totalHours}h</p>
                    </div>
                    <Clock className="w-8 h-8 text-indigo-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">Daily Average</p>
                      <p className="text-2xl font-bold text-emerald-600">{analytics.avgPerDay}m</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-emerald-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">Sessions</p>
                      <p className="text-2xl font-bold text-purple-600">{analytics.sessionsCount}</p>
                    </div>
                    <Target className="w-8 h-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">Current Streak</p>
                      <p className="text-2xl font-bold text-orange-600">{analytics.currentStreak} days</p>
                    </div>
                    <Award className="w-8 h-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tabs for detailed analytics */}
            <Tabs defaultValue="trends" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4 rounded-2xl">
                <TabsTrigger value="trends" className="rounded-xl bg-white/80 dark:bg-neutral-900/60">Daily Trends</TabsTrigger>
                <TabsTrigger value="patterns" className="rounded-xl bg-white/80 dark:bg-neutral-900/60">Study Patterns</TabsTrigger>
                <TabsTrigger value="sources" className="rounded-xl bg-white/80 dark:bg-neutral-900/60">Sources</TabsTrigger>
                <TabsTrigger value="courses" className="rounded-xl bg-white/80 dark:bg-neutral-900/60">Courses</TabsTrigger>
              </TabsList>

              <TabsContent value="trends" className="space-y-4">
                <Card className="rounded-2xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      Daily Study Hours
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={analytics.dailyData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="day" />
                          <YAxis />
                          <Tooltip 
                            formatter={(value: number) => [`${value}h`, 'Hours']}
                            labelFormatter={(label) => `Day: ${label}`}
                          />
                          <Bar dataKey="hours" fill={COLORS[0]} radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="patterns" className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <Card className="rounded-2xl">
                    <CardHeader>
                      <CardTitle>Peak Study Times</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl">
                          <span className="font-medium">Peak Hour</span>
                          <Badge variant="secondary">{patterns.peakHour}</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                          <span className="font-medium">Peak Day</span>
                          <Badge variant="secondary">{patterns.peakDay}</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
                          <span className="font-medium">Max Streak</span>
                          <Badge variant="secondary">{analytics.maxStreak} days</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="rounded-2xl">
                    <CardHeader>
                      <CardTitle>Weekly Pattern</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={patterns.weeklyData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="day" />
                            <YAxis />
                            <Tooltip 
                              formatter={(value: number) => [`${value}h`, 'Hours']}
                              labelFormatter={(label) => `${label}`}
                            />
                            <Bar dataKey="hours" fill={COLORS[1]} radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="sources" className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <Card className="rounded-2xl">
                    <CardHeader>
                      <CardTitle>Study Sources Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {analytics.bySource.map((source, index) => (
                          <div key={source.source} className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl">
                            <div className="flex items-center gap-3">
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: COLORS[index % COLORS.length] }}
                              />
                              <span className="font-medium">{source.source}</span>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">{source.hours}h</p>
                              <p className="text-sm text-neutral-600 dark:text-neutral-400">{source.percentage}%</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="rounded-2xl">
                    <CardHeader>
                      <CardTitle>Source Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={analytics.bySource}
                              dataKey="hours"
                              nameKey="source"
                              cx="50%"
                              cy="50%"
                              outerRadius={80}
                              label={({ percentage }) => `${percentage}%`}
                            >
                              {analytics.bySource.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value: number) => [`${value}h`, 'Hours']} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="courses" className="space-y-4">
                <Card className="rounded-2xl">
                  <CardHeader>
                    <CardTitle>Top Courses by Study Time</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {analytics.byCourse.length > 0 ? (
                      <div className="space-y-3">
                        {analytics.byCourse.map((course, index) => (
                          <div key={course.courseId} className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                                {index + 1}
                              </div>
                              <span className="font-medium">{course.courseId}</span>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">{course.hours}h</p>
                              <p className="text-sm text-neutral-600 dark:text-neutral-400">{course.percentage}%</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-neutral-500 dark:text-neutral-400">
                        <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No course-specific study sessions found</p>
                        <p className="text-sm">Study sessions linked to courses will appear here</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
