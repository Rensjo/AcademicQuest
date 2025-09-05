import React from 'react'
import { Button } from '@/components/ui/button-with-sound'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TestTube, Bell, Trophy, Star } from 'lucide-react'
import { useNotifications, createLevelUpNotification, createBadgeNotification, createTaskCompletedNotification, createQuestCompletedNotification } from '@/store/notificationStore'
import { useGamification } from '@/store/gamificationStore'
import { soundService } from '@/services/soundService'

export function NotificationTestPanel() {
  const { addNotification } = useNotifications()
  const { stats } = useGamification()

  const testLevelUp = () => {
    addNotification(createLevelUpNotification(stats.level + 1, 100))
    soundService.playLevelUp()
  }

  const testBadgeEarned = () => {
    addNotification(createBadgeNotification("Demo Achievement", "🎯", "demo_badge"))
    soundService.playBadgeEarned()
  }

  const testTaskCompleted = () => {
    addNotification(createTaskCompletedNotification(25, false))
    soundService.playTaskComplete()
  }

  const testQuestCompleted = () => {
    addNotification(createQuestCompletedNotification("Complete Demo Presentation", 50))
    soundService.playTaskComplete() // Use task complete sound for quest
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 opacity-30 hover:opacity-100 transition-opacity duration-300">
      <Card className="w-64 bg-gradient-to-br from-amber-50/80 to-orange-100/80 dark:from-amber-950/20 dark:to-orange-900/20 border-amber-200/50 dark:border-amber-800/30 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm text-amber-800 dark:text-amber-200">
            <TestTube className="w-4 h-4" />
            Demo Test Panel
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={testLevelUp}
              variant="outline"
              size="sm"
              className="flex items-center gap-1 text-xs bg-gradient-to-r from-green-50/80 to-emerald-50/80 dark:from-green-950/50 dark:to-emerald-950/50 border-green-200/50 dark:border-green-700/30 hover:from-green-100/90 hover:to-emerald-100/90 dark:hover:from-green-900/60 dark:hover:to-emerald-900/60"
            >
              <Star className="w-3 h-3" />
              Level
            </Button>
            
            <Button
              onClick={testBadgeEarned}
              variant="outline"
              size="sm"
              className="flex items-center gap-1 text-xs bg-gradient-to-r from-purple-50/80 to-violet-50/80 dark:from-purple-950/50 dark:to-violet-950/50 border-purple-200/50 dark:border-purple-700/30 hover:from-purple-100/90 hover:to-violet-100/90 dark:hover:from-purple-900/60 dark:hover:to-violet-900/60"
            >
              <Trophy className="w-3 h-3" />
              Badge
            </Button>
            
            <Button
              onClick={testTaskCompleted}
              variant="outline"
              size="sm"
              className="flex items-center gap-1 text-xs bg-gradient-to-r from-blue-50/80 to-cyan-50/80 dark:from-blue-950/50 dark:to-cyan-950/50 border-blue-200/50 dark:border-blue-700/30 hover:from-blue-100/90 hover:to-cyan-100/90 dark:hover:from-blue-900/60 dark:hover:to-cyan-900/60"
            >
              <Bell className="w-3 h-3" />
              Task
            </Button>
            
            <Button
              onClick={testQuestCompleted}
              variant="outline"
              size="sm"
              className="flex items-center gap-1 text-xs bg-gradient-to-r from-indigo-50/80 to-purple-50/80 dark:from-indigo-950/50 dark:to-purple-950/50 border-indigo-200/50 dark:border-indigo-700/30 hover:from-indigo-100/90 hover:to-purple-100/90 dark:hover:from-indigo-900/60 dark:hover:to-purple-900/60"
            >
              <TestTube className="w-3 h-3" />
              Quest
            </Button>
          </div>
          
          <p className="text-xs text-amber-600/80 dark:text-amber-400/60 text-center">
            Demo Controls
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
