"use client"

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import Toast from '@/app/dashboard/toast'

interface NotificationData {
  id: string
  title: string
  message: string
  winnings: number
  betDetails: any
}

export default function BetWinNotification() {
  const [notificationQueue, setNotificationQueue] = useState<NotificationData[]>([])
  const [currentNotification, setCurrentNotification] = useState<NotificationData | null>(null)
  const [showToast, setShowToast] = useState(false)
  const [toastKey, setToastKey] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    if (notificationQueue.length > 0 && !showToast) {
      const nextNotification = notificationQueue[0]
      setCurrentNotification(nextNotification)
      setShowToast(true)
      setToastKey(prev => prev + 1)
      setNotificationQueue(prev => prev.slice(1))
    }
  }, [notificationQueue, showToast])

  useEffect(() => {
    const setupRealtimeSubscription = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser()

        if (userError) {
          console.error('Error getting user:', userError)
          return
        }

        if (!user) {
          console.log('No user found, skipping subscription')
          return
        }

        const channel = supabase
          .channel('notifications-channel')
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'notifications',
              filter: `user_id=eq.${user.id}`
            },
            (payload) => {
              const notification = payload.new as any

              if (notification.type === 'bet_won') {
                const newNotification: NotificationData = {
                  id: notification.id,
                  title: notification.title,
                  message: notification.message,
                  winnings: notification.data.winnings,
                  betDetails: notification.data
                }
                setNotificationQueue(prev => [...prev, newNotification])
              }
            }
          )
          .subscribe()

        return () => {
          supabase.removeChannel(channel)
        }
      } catch (error) {
        console.error('Error in setupRealtimeSubscription:', error)
      }
    }

    setupRealtimeSubscription()
  }, [])

  const handleCloseToast = () => {
    setShowToast(false)
    setCurrentNotification(null)
  }

  return (
    <>
      {/* Show queue count */}
      {notificationQueue.length > 0 && (
        <div className="fixed bottom-40 right-8 bg-blue-600 text-white px-3 py-1 rounded-full text-sm z-50">
          +{notificationQueue.length} more
        </div>
      )}

      <Toast
        key={toastKey}
        show={showToast}
        onClose={handleCloseToast}
        type="success"
        duration={5000}
      >
        {currentNotification && (
          <div className="space-y-2">
            <div className="font-bold text-lg">{currentNotification.title}</div>
            <div>{currentNotification.message}</div>
            <div className="text-sm">
              Winnings: <span className="font-semibold">${currentNotification.winnings}</span>
            </div>
          </div>
        )}
      </Toast>
    </>
  )
}
