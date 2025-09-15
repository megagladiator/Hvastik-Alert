'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

interface Notification {
  id: string
  type: 'new_message' | 'daily_summary'
  title: string
  message: string
  chatId?: string
  petName?: string
  timestamp: string
}

interface UseNotificationsProps {
  userId?: string
  isOnline: boolean
}

export function useNotifications({ userId, isOnline }: UseNotificationsProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [lastChecked, setLastChecked] = useState<string | null>(null)

  // Проверяем, показывали ли уже уведомления сегодня
  const getTodayKey = () => {
    return new Date().toDateString()
  }

  const getStoredLastChecked = () => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('lastNotificationCheck')
  }

  const setStoredLastChecked = (date: string) => {
    if (typeof window === 'undefined') return
    localStorage.setItem('lastNotificationCheck', date)
  }

  // Подписка на новые сообщения в реальном времени
  const subscribeToNewMessages = useCallback(() => {
    if (!supabase || !userId) return

    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        async (payload) => {
          const newMessage = payload.new as any
          
          // Проверяем, относится ли сообщение к текущему пользователю
          if (newMessage.sender_id !== userId) {
            // Получаем информацию о чате и питомце
            const { data: chatData } = await supabase
              .from('chats')
              .select(`
                *,
                pets!inner(
                  id,
                  name,
                  type
                )
              `)
              .eq('id', newMessage.chat_id)
              .eq('status', 'active')
              .single()

            if (chatData && (chatData.user_id === userId || chatData.owner_id === userId)) {
              const notification: Notification = {
                id: `msg-${newMessage.id}`,
                type: 'new_message',
                title: 'Новое сообщение',
                message: newMessage.text.length > 50 
                  ? `${newMessage.text.substring(0, 50)}...` 
                  : newMessage.text,
                chatId: newMessage.chat_id,
                petName: chatData.pets?.name,
                timestamp: newMessage.created_at
              }

              setNotifications(prev => {
                // Удаляем старые уведомления того же типа для того же чата
                const filtered = prev.filter(n => 
                  !(n.type === 'new_message' && n.chatId === newMessage.chat_id)
                )
                return [notification, ...filtered].slice(0, 5) // Максимум 5 уведомлений
              })
            }
          }
        }
      )
      .subscribe()

    return channel
  }, [userId])

  // Проверка на ежедневные уведомления при первом входе
  const checkDailyNotifications = useCallback(async () => {
    if (!supabase || !userId) return

    const today = getTodayKey()
    const storedLastChecked = getStoredLastChecked()

    // Если уже проверяли сегодня, не показываем ежедневные уведомления
    if (storedLastChecked === today) return

    try {
      // Получаем количество непрочитанных сообщений за последние 24 часа
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)

      const { data: unreadMessages } = await supabase
        .from('messages')
        .select(`
          id,
          chat_id,
          created_at,
          chats!inner(
            id,
            user_id,
            owner_id,
            pets!inner(
              name,
              type
            )
          )
        `)
        .gte('created_at', yesterday.toISOString())
        .neq('sender_id', userId)
        .or(`chats.user_id.eq.${userId},chats.owner_id.eq.${userId}`)

      if (unreadMessages && unreadMessages.length > 0) {
        const uniqueChats = new Set(unreadMessages.map(msg => msg.chat_id))
        
        const notification: Notification = {
          id: `daily-${today}`,
          type: 'daily_summary',
          title: 'Новые сообщения за день',
          message: `У вас ${unreadMessages.length} новых сообщений в ${uniqueChats.size} чатах`,
          timestamp: new Date().toISOString()
        }

        setNotifications(prev => {
          // Удаляем старые ежедневные уведомления
          const filtered = prev.filter(n => n.type !== 'daily_summary')
          return [notification, ...filtered].slice(0, 5)
        })
      }

      // Сохраняем дату последней проверки
      setStoredLastChecked(today)
    } catch (error) {
      console.error('Ошибка при проверке ежедневных уведомлений:', error)
    }
  }, [userId])

  // Инициализация уведомлений
  useEffect(() => {
    if (!userId) return

    let channel: any = null

    if (isOnline) {
      // Подписываемся на новые сообщения в реальном времени
      channel = subscribeToNewMessages()
    } else {
      // Проверяем ежедневные уведомления при первом входе
      checkDailyNotifications()
    }

    return () => {
      if (channel) {
        supabase?.removeChannel(channel)
      }
    }
  }, [userId, isOnline, subscribeToNewMessages, checkDailyNotifications])

  // Удаление уведомления
  const removeNotification = useCallback((notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId))
  }, [])

  // Очистка всех уведомлений
  const clearAllNotifications = useCallback(() => {
    setNotifications([])
  }, [])

  return {
    notifications,
    removeNotification,
    clearAllNotifications
  }
}
