'use client'

import { useState, useEffect } from 'react'
import { useSupabaseSession } from '@/hooks/use-supabase-session'
import { useNotifications } from '@/hooks/use-notifications'
import { NotificationPopup } from '@/components/notification-popup'
import { useRouter } from 'next/navigation'

export function NotificationProvider() {
  const { session } = useSupabaseSession()
  const router = useRouter()
  const [isOnline, setIsOnline] = useState(true)

  // Отслеживаем статус онлайн/оффлайн
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Проверяем начальный статус
    setIsOnline(navigator.onLine)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const {
    notifications,
    removeNotification,
    clearAllNotifications
  } = useNotifications({
    userId: session?.user?.id,
    isOnline
  })

  const handleChatClick = (chatId: string) => {
    router.push(`/chats?chatId=${chatId}`)
  }

  // Не показываем уведомления если пользователь не авторизован
  if (!session?.user?.id) {
    return null
  }

  return (
    <NotificationPopup
      notifications={notifications}
      onClose={removeNotification}
      onChatClick={handleChatClick}
    />
  )
}
