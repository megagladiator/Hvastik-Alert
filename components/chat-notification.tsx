"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { MessageCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface ChatNotificationProps {
  petId: string
  currentUserId?: string
  isOwner?: boolean
}

export function ChatNotification({ petId, currentUserId, isOwner = false }: ChatNotificationProps) {
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!currentUserId || !isOwner) return

    const fetchUnreadCount = async () => {
      try {
        if (!supabase) return

        // Получаем чаты для этого питомца, где текущий пользователь - владелец
        const { data: chats, error: chatsError } = await supabase
          .from("chats")
          .select("id")
          .eq("pet_id", petId)
          .eq("owner_id", currentUserId)

        if (chatsError || !chats) {
          console.error("Error fetching chats:", chatsError)
          return
        }

        // Подсчитываем непрочитанные сообщения
        let totalUnread = 0
        for (const chat of chats) {
          const { data: messages, error: messagesError } = await supabase
            .from("messages")
            .select("id")
            .eq("chat_id", chat.id)
            .eq("sender_type", "user")
            .is("read_at", null)

          if (!messagesError && messages) {
            totalUnread += messages.length
          }
        }

        setUnreadCount(totalUnread)
      } catch (error) {
        console.error("Error fetching unread count:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUnreadCount()

    // Подписка на новые сообщения в реальном времени
    if (supabase) {
      const channel = supabase
        .channel(`chat-notifications:${petId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `sender_type=eq.user`,
          },
          (payload) => {
            // Проверяем, что сообщение относится к нашему питомцу
            if (payload.new && isOwner) {
              setUnreadCount(prev => prev + 1)
            }
          }
        )
        .subscribe()

      return () => {
        if (supabase) {
          supabase.removeChannel(channel)
        }
      }
    }
  }, [petId, currentUserId, isOwner])

  if (!isOwner || loading) {
    return null
  }

  return (
    <div className="relative">
      <MessageCircle className="h-4 w-4" />
      {unreadCount > 0 && (
        <Badge 
          variant="destructive" 
          className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
        >
          {unreadCount > 99 ? "99+" : unreadCount}
        </Badge>
      )}
    </div>
  )
}
 