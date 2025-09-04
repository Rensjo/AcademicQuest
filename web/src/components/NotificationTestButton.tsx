import React from 'react'
import { Button } from '@/components/ui/button'
import { useNotifications, createLevelUpNotification, createBadgeNotification, createTaskCompletedNotification, createQuestCompletedNotification } from '@/store/notificationStore'
import { rewardFirstCourse, checkGPABadges, rewardScheduleSetup, checkGradeWarrior } from '@/store/gamificationHelpers'

export function NotificationTestButton() {
  const { addNotification } = useNotifications()

  console.log('🧪 NotificationTestButton is rendering')

  const testNotifications = () => {
    console.log('🧪 Testing notifications manually...')
    
    // Test task completion immediately
    addNotification(createTaskCompletedNotification(25, false))
    
    // Test early task completion after 1 second
    setTimeout(() => {
      addNotification(createTaskCompletedNotification(50, true))
    }, 1000)
    
    // Test quest completion after 2 seconds
    setTimeout(() => {
      addNotification(createQuestCompletedNotification("Complete 3 tasks", 30))
    }, 2000)
    
    // Test badge earned after 3 seconds
    setTimeout(() => {
      addNotification(createBadgeNotification("Study Warrior", "⚔️", "study_warrior"))
    }, 3000)
    
    // Test level up after 4 seconds
    setTimeout(() => {
      addNotification(createLevelUpNotification(5, 100))
    }, 4000)
  }

  const testNewBadges = () => {
    console.log('🎓 Testing new academic badges...')
    
    // Test course planner badge
    setTimeout(() => rewardFirstCourse(), 0)
    
    // Test GPA badges  
    setTimeout(() => checkGPABadges(3.2), 1000)
    
    // Test schedule setup badge
    setTimeout(() => rewardScheduleSetup(), 2000)
    
    // Test grade warrior badge
    setTimeout(() => checkGradeWarrior(5), 3000)
    
    // Test dean's list badge
    setTimeout(() => checkGPABadges(3.9), 4000)
  }

  return (
    <div className="fixed bottom-4 left-4 z-[10001] flex flex-col gap-2">
      <Button 
        onClick={testNotifications}
        className="bg-purple-600 hover:bg-purple-700 text-white shadow-2xl border-2 border-white"
        size="lg"
      >
        🧪 Test Notifications
      </Button>
      <Button 
        onClick={testNewBadges}
        className="bg-green-600 hover:bg-green-700 text-white shadow-2xl border-2 border-white"
        size="lg"
      >
        🎓 Test New Badges
      </Button>
    </div>
  )
}
