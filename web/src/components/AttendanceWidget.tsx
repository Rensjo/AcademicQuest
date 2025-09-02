import React, { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { CalendarCheck, Clock, MapPin, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { useAttendance, type ClassAttendance } from '@/store/attendanceStore'
import { useGamification } from '@/store/gamificationStore'
import { useTheme } from '@/store/theme'

/** CSS-only scrollbar skins (light/dark) for horizontal term scrollers. */
const scrollbarStyles = `
  .light-scrollbar::-webkit-scrollbar { width: 10px; height: 10px; }
  .light-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.05); border-radius: 5px; }
  .light-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.20); border-radius: 5px; }
  .light-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.30); }

  .dark-scrollbar::-webkit-scrollbar { width: 10px; height: 10px; }
  .dark-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.10); border-radius: 5px; }
  .dark-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.20); border-radius: 5px; }
  .dark-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.30); }
`;

export const AttendanceWidget: React.FC = () => {
  const { 
    markAttendance,
    getAttendanceStreak, 
    getLast365DaysData,
    getWeeklyAttendanceRate,
    getMonthlyAttendanceRate,
    getSemesterAttendanceRate,
    getPerfectAttendanceDays,
    getTotalAttendanceDays,
    hasUnmarkedClasses,
    getTodaysPendingClasses,
    getAttendanceForDate
  } = useAttendance()
  
  const gamification = useGamification()
  const theme = useTheme()
  
  const [showDialog, setShowDialog] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedRecord, setSelectedRecord] = useState<ClassAttendance[]>([])

  // Inject scrollbar styles and determine theme
  useEffect(() => {
    let styleElement = document.getElementById('aq-attendance-scrollbar-styles') as HTMLStyleElement;
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = 'aq-attendance-scrollbar-styles';
      document.head.appendChild(styleElement);
    }
    styleElement.textContent = scrollbarStyles;
  }, []);

  // Get scrollbar class based on theme
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark = theme.mode === 'dark' || (theme.mode === 'system' && systemDark);
  const scrollbarClass = isDark ? 'dark-scrollbar' : 'light-scrollbar';

  // Generate attendance data for the last 365 days (GitHub-style)
  const contributionData = useMemo(() => {
    const data = getLast365DaysData()
    
    // Group by weeks for the grid
    const weeks: Array<Array<{ date: string; attendanceRate: number; totalClasses: number }>> = []
    let currentWeek: Array<{ date: string; attendanceRate: number; totalClasses: number }> = []
    
    data.forEach((day, index) => {
      const dayOfWeek = new Date(day.date).getDay()
      
      if (index === 0) {
        // Fill empty days at the beginning of first week
        for (let i = 0; i < dayOfWeek; i++) {
          currentWeek.push({ date: '', attendanceRate: 0, totalClasses: 0 })
        }
      }
      
      currentWeek.push(day)
      
      if (currentWeek.length === 7) {
        weeks.push(currentWeek)
        currentWeek = []
      }
    })
    
    // Add remaining days to last week
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push({ date: '', attendanceRate: 0, totalClasses: 0 })
      }
      weeks.push(currentWeek)
    }
    
    return weeks
  }, [getLast365DaysData])

  // Get color intensity based on attendance rate
  const getIntensityColor = (rate: number, totalClasses: number) => {
    if (totalClasses === 0) return 'bg-neutral-100 dark:bg-neutral-800'
    if (rate >= 95) return 'bg-green-600 dark:bg-green-500'
    if (rate >= 80) return 'bg-green-400 dark:bg-green-400'
    if (rate >= 60) return 'bg-green-300 dark:bg-green-300'
    if (rate >= 40) return 'bg-yellow-300 dark:bg-yellow-400'
    return 'bg-red-300 dark:bg-red-400'
  }

  // Statistics
  const currentStreak = getAttendanceStreak()
  const weeklyRate = getWeeklyAttendanceRate()
  const monthlyRate = getMonthlyAttendanceRate()
  const semesterRate = getSemesterAttendanceRate()
  const perfectDays = getPerfectAttendanceDays()
  const totalDays = getTotalAttendanceDays()

  const handleDayClick = (date: string) => {
    if (!date) return
    setSelectedDate(date)
    
    // Get attendance record for this date
    const record = getAttendanceForDate(date)
    setSelectedRecord(record?.classes || [])
    setShowDialog(true)
  }

  const markClassAttendance = async (date: string, slotId: string, attended: boolean) => {
    await markAttendance(date, slotId, attended)
    
    // Update gamification
    if (attended) {
      gamification.addXP(10) // Reward attendance
    }
    
    // Refresh selected record
    const record = getAttendanceForDate(date)
    setSelectedRecord(record?.classes || [])
    
    // Check for achievements
    gamification.checkAchievements()
  }

  // Check for pending classes today
  const pendingToday = getTodaysPendingClasses()
  const today = new Date().toISOString().split('T')[0]
  const hasUnmarkedToday = hasUnmarkedClasses(today)

  return (
    <Card className="border-0 shadow-lg rounded-3xl bg-white/80 dark:bg-neutral-900/60">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CalendarCheck className="w-5 h-5" />
            <h3 className="text-lg font-semibold">Class Attendance</h3>
            {hasUnmarkedToday && (
              <Badge variant="destructive" className="ml-2">
                <AlertCircle className="w-3 h-3 mr-1" />
                Pending
              </Badge>
            )}
          </div>
          <div className="text-right">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">Current Streak</p>
            <p className="text-xl font-bold text-green-600">{currentStreak} days</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="text-center p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60">
              <p className="text-lg font-bold text-blue-600">{Math.round(weeklyRate * 100)}%</p>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">This Week</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60">
              <p className="text-lg font-bold text-green-600">{Math.round(monthlyRate * 100)}%</p>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">This Month</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60">
              <p className="text-lg font-bold text-purple-600">{Math.round(semesterRate * 100)}%</p>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">Semester</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60">
              <p className="text-lg font-bold text-orange-600">{perfectDays}/{totalDays}</p>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">Perfect Days</p>
            </div>
          </div>

          {/* Contribution Graph */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                {contributionData.reduce((acc, week) => acc + week.filter(d => d.totalClasses > 0).length, 0)} 
                {' '}class days in the last year
              </p>
              <div className="flex items-center gap-2 text-xs text-neutral-500">
                <span>Less</span>
                <div className="flex gap-1">
                  <div className="w-2.5 h-2.5 rounded-sm bg-neutral-100 dark:bg-neutral-800"></div>
                  <div className="w-2.5 h-2.5 rounded-sm bg-green-300 dark:bg-green-300"></div>
                  <div className="w-2.5 h-2.5 rounded-sm bg-green-400 dark:bg-green-400"></div>
                  <div className="w-2.5 h-2.5 rounded-sm bg-green-500 dark:bg-green-500"></div>
                  <div className="w-2.5 h-2.5 rounded-sm bg-green-600 dark:bg-green-600"></div>
                </div>
                <span>More</span>
              </div>
            </div>
            
            <div className={`flex gap-1 overflow-x-auto pb-2 ${scrollbarClass}`}>
              {contributionData.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-1">
                  {week.map((day, dayIndex) => (
                    <motion.div
                      key={`${weekIndex}-${dayIndex}`}
                      className={`w-3 h-3 rounded-sm cursor-pointer transition-all hover:ring-2 hover:ring-blue-300 ${
                        day.date ? getIntensityColor(day.attendanceRate, day.totalClasses) : 'bg-transparent'
                      }`}
                      onClick={() => handleDayClick(day.date)}
                      whileHover={{ scale: 1.2 }}
                      title={day.date ? 
                        `${day.date}: ${day.attendanceRate}% attendance (${day.totalClasses} classes)` : 
                        ''
                      }
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Pending Classes Alert */}
          {pendingToday.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800"
            >
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-yellow-600" />
                <p className="font-medium text-yellow-800 dark:text-yellow-200">
                  Pending Attendance ({pendingToday.length} classes)
                </p>
              </div>
              <div className="space-y-2">
                {pendingToday.slice(0, 3).map((classRecord, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span className="text-yellow-700 dark:text-yellow-300">
                      {classRecord.time} - {classRecord.courseName}
                    </span>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-6 px-2 text-xs border-green-300 text-green-700 hover:bg-green-50"
                        onClick={() => markClassAttendance(today, classRecord.slotId, true)}
                      >
                        <CheckCircle className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-6 px-2 text-xs border-red-300 text-red-700 hover:bg-red-50"
                        onClick={() => markClassAttendance(today, classRecord.slotId, false)}
                      >
                        <XCircle className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
                {pendingToday.length > 3 && (
                  <p className="text-xs text-yellow-600">
                    +{pendingToday.length - 3} more classes pending
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </CardContent>

      {/* Attendance Details Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarCheck className="w-5 h-5" />
              Attendance for {selectedDate}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {selectedRecord.length > 0 ? (
              selectedRecord.map((classRecord, index) => (
                <div key={index} className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/60">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-medium">{classRecord.courseName}</p>
                      <div className="flex items-center gap-4 text-sm text-neutral-600 dark:text-neutral-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {classRecord.time}
                        </span>
                        {classRecord.room && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {classRecord.room}
                          </span>
                        )}
                      </div>
                    </div>
                    <Badge 
                      variant={
                        classRecord.marked ? 
                          (classRecord.attended ? 'default' : 'destructive') : 
                          'outline'
                      }
                    >
                      {classRecord.marked ? (classRecord.attended ? 'Present' : 'Absent') : 'Pending'}
                    </Badge>
                  </div>
                  
                  {!classRecord.marked && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => markClassAttendance(selectedDate, classRecord.slotId, true)}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Present
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => markClassAttendance(selectedDate, classRecord.slotId, false)}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Absent
                      </Button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-neutral-500 dark:text-neutral-400">
                <CalendarCheck className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No classes scheduled for this day</p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
