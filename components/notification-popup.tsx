'use client'

import { useState, useEffect } from 'react'
import { X, MessageCircle } from 'lucide-react'

interface Notification {
  id: string
  type: 'new_message' | 'daily_summary'
  title: string
  message: string
  chatId?: string
  petName?: string
  timestamp: string
}

interface NotificationPopupProps {
  notifications: Notification[]
  onClose: (notificationId: string) => void
  onChatClick?: (chatId: string) => void
}

export function NotificationPopup({ 
  notifications, 
  onClose, 
  onChatClick 
}: NotificationPopupProps) {
  const [visibleNotifications, setVisibleNotifications] = useState<Notification[]>([])

  useEffect(() => {
    // Показываем только последние 3 уведомления
    setVisibleNotifications(notifications.slice(0, 3))
  }, [notifications])

  if (visibleNotifications.length === 0) {
    return null
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm">
      {visibleNotifications.map((notification) => (
        <div
          key={notification.id}
          className="bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-blue-200 rounded-lg shadow-lg p-5 animate-in slide-in-from-right duration-300 hover:shadow-xl transition-all"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                {notification.type === 'new_message' ? (
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                    <MessageCircle className="h-4 w-4 text-white" />
                  </div>
                ) : (
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                    <MessageCircle className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>
              <div>
                <h4 className="text-sm font-bold text-blue-800">
                  {notification.title}
                </h4>
                <p className="text-xs text-blue-600">
                  {new Date(notification.timestamp).toLocaleTimeString('ru-RU', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
            <button
              onClick={() => onClose(notification.id)}
              className="flex-shrink-0 text-blue-400 hover:text-blue-600 transition-colors p-1 rounded-full hover:bg-blue-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          
          <div className="mb-3">
            <p className="text-sm text-gray-700 leading-relaxed">
              {notification.message}
            </p>
            {notification.petName && (
              <p className="text-xs text-blue-600 mt-2 font-medium">
                🐾 Питомец: {notification.petName}
              </p>
            )}
          </div>
          
          {notification.chatId && onChatClick && (
            <button
              onClick={() => {
                onChatClick(notification.chatId!)
                onClose(notification.id)
              }}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-2 px-4 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg text-sm"
            >
              Перейти к чату →
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
