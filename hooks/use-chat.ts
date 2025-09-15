import { useState, useEffect, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import { RealtimeChannel } from "@supabase/supabase-js"

interface Message {
  id: string
  chat_id: string
  sender_id: string
  sender_type: "user" | "owner"
  text: string
  created_at: string
  updated_at: string
}

interface Chat {
  id: string
  pet_id: string
  user_id: string
  owner_id: string
  status: 'active' | 'archived' | 'deleted'
  archived_at?: string
  archived_by?: string
  created_at: string
  updated_at: string
}

interface UseChatProps {
  petId: string
  currentUserId?: string
}

export function useChat({ petId, currentUserId }: UseChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [chat, setChat] = useState<Chat | null>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [realtimeChannel, setRealtimeChannel] = useState<RealtimeChannel | null>(null)

  // Получение или создание чата
  const getOrCreateChat = useCallback(async () => {
    if (!supabase || !currentUserId) return

    try {
      // Сначала пытаемся найти существующий активный чат
      const response = await fetch(`/api/chats?userId=${currentUserId}&petId=${petId}`)
      
      if (response.ok) {
        const { data: existingChats } = await response.json()
        const existingChat = existingChats?.find((chat: any) => 
          chat.pet_id === petId && 
          (chat.user_id === currentUserId || chat.owner_id === currentUserId) &&
          chat.status === 'active'
        )

        if (existingChat) {
          setChat(existingChat)
          return existingChat
        }
      }

      // Если чат не найден, получаем информацию о питомце для создания чата
      const { data: pet, error: petError } = await supabase
        .from("pets")
        .select("user_id, status")
        .eq("id", petId)
        .single()

      if (petError || !pet) {
        throw new Error("Питомец не найден")
      }

      // Проверяем, что питомец активен
      if (pet.status !== 'active') {
        throw new Error("Питомец больше не доступен для общения")
      }

      // Проверяем, не является ли текущий пользователь владельцем питомца
      // Но только если мы пытаемся создать НОВЫЙ чат
      if (pet.user_id === currentUserId) {
        throw new Error("Вы не можете создать чат с самим собой")
      }

      // Создаем новый чат через API
      const createResponse = await fetch('/api/chats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          petId: petId,
          userId: currentUserId,
          ownerId: pet.user_id,
        }),
      })

      if (!createResponse.ok) {
        const errorData = await createResponse.json()
        throw new Error(errorData.error || 'Ошибка создания чата')
      }

      const { data: newChat } = await createResponse.json()

      setChat(newChat)
      return newChat
    } catch (err) {
      console.error("Error getting/creating chat:", err)
      setError(err instanceof Error ? err.message : "Ошибка при создании чата")
      return null
    }
  }, [petId, currentUserId])

  // Загрузка сообщений
  const loadMessages = useCallback(async (chatId: string) => {
    try {
      const response = await fetch(`/api/messages?chatId=${chatId}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error("Error loading messages:", errorData)
        setError("Ошибка при загрузке сообщений")
        return
      }

      const { data } = await response.json()
      setMessages(data || [])
    } catch (err) {
      console.error("Error loading messages:", err)
      setError(err instanceof Error ? err.message : "Ошибка при загрузке сообщений")
    }
  }, [])

  // Подписка на новые сообщения в реальном времени
  const subscribeToMessages = useCallback((chatId: string) => {
    if (!supabase) return

    const channel = supabase
      .channel(`chat:${chatId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `chat_id=eq.${chatId}`,
        },
        (payload) => {
          const newMessage = payload.new as Message
          setMessages((prev) => {
            // Проверяем, нет ли уже такого сообщения (избегаем дубликатов)
            const exists = prev.some(msg => msg.id === newMessage.id)
            if (exists) return prev
            return [...prev, newMessage]
          })
        }
      )
      .subscribe()

    setRealtimeChannel(channel)
  }, [])

  // Отправка сообщения
  const sendMessage = useCallback(
    async (text: string) => {
      if (!chat || !currentUserId) return

      setSending(true)
      try {
        // Определяем тип отправителя: если текущий пользователь - владелец питомца, то "owner", иначе "user"
        const senderType = chat.owner_id === currentUserId ? "owner" : "user"

        // Отправляем в базу данных только если это не демо-чат
        if (!chat.id.startsWith('demo-')) {
          const response = await fetch('/api/messages', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              chatId: chat.id,
              senderId: currentUserId,
              senderType: senderType,
              text: text,
            }),
          })

          if (!response.ok) {
            const errorData = await response.json()
            console.error("Error sending message to database:", errorData)
            setError("Ошибка при отправке сообщения")
            return
          }

          const { data } = await response.json()

          // Добавляем сообщение локально только если оно успешно сохранено в БД
          if (data) {
            setMessages(prev => {
              // Проверяем, нет ли уже такого сообщения (избегаем дубликатов)
              const exists = prev.some(msg => msg.id === data.id)
              if (exists) return prev
              return [...prev, data]
            })
          }
        } else {
          // Для демо-чата создаем локальное сообщение
          const localMessage: Message = {
            id: `demo-${Date.now()}`,
            chat_id: chat.id,
            sender_id: currentUserId,
            sender_type: senderType,
            text: text,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
          setMessages(prev => [...prev, localMessage])
        }
      } catch (err) {
        console.error("Error sending message:", err)
        setError("Ошибка при отправке сообщения")
      } finally {
        setSending(false)
      }
    },
    [chat, currentUserId]
  )

  // Инициализация чата
  useEffect(() => {
    const initializeChat = async () => {
      setLoading(true)
      setError(null)

      const chatData = await getOrCreateChat()
      if (chatData) {
        await loadMessages(chatData.id)
        subscribeToMessages(chatData.id)
      } else {
        // Если чат не создался, создаем демо-чат для отображения сообщений
        setChat({
          id: `demo-${petId}`,
          pet_id: petId,
          user_id: currentUserId || '',
          owner_id: 'demo-owner',
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
      }

      setLoading(false)
    }

    if (currentUserId) {
      initializeChat()
    }
  }, [currentUserId, getOrCreateChat, loadMessages, subscribeToMessages, petId])

  // Очистка подписки при размонтировании
  useEffect(() => {
    return () => {
      if (realtimeChannel) {
        supabase?.removeChannel(realtimeChannel)
      }
    }
  }, [realtimeChannel])

  return {
    messages,
    chat,
    loading,
    sending,
    error,
    sendMessage,
  }
}
 