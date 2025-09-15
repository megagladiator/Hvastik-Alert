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
      // Сначала пытаемся найти существующий чат
      const { data: existingChat, error: findError } = await supabase
        .from("chats")
        .select(`
          *,
          pets!inner(
            id,
            status
          )
        `)
        .eq("pet_id", petId)
        .eq("user_id", currentUserId)
        .single()

      if (existingChat) {
        // Проверяем, что питомец все еще активен
        if (existingChat.pets && existingChat.pets.status !== 'active') {
          throw new Error("Питомец больше не доступен для общения")
        }
        setChat(existingChat)
        return existingChat
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

      // Создаем новый чат
      const { data: newChat, error: createError } = await supabase
        .from("chats")
        .insert({
          pet_id: petId,
          user_id: currentUserId,
          owner_id: pet.user_id,
        })
        .select()
        .single()

      if (createError) {
        throw createError
      }

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
    if (!supabase) return

    try {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("chat_id", chatId)
        .order("created_at", { ascending: true })

      if (error) {
        throw error
      }

      setMessages(data || [])

      // Отмечаем сообщения как прочитанные
      if (data && data.length > 0) {
        await supabase.rpc('mark_messages_as_read', { chat_id_param: chatId })
      }
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
        const senderType = chat.user_id === currentUserId ? "user" : "owner"

        // Отправляем в базу данных только если это не демо-чат
        if (supabase && !chat.id.startsWith('demo-')) {
          const { data, error } = await supabase.from("messages").insert({
            chat_id: chat.id,
            sender_id: currentUserId,
            sender_type: senderType,
            text,
          }).select().single()

          if (error) {
            console.error("Error sending message to database:", error)
            setError("Ошибка при отправке сообщения")
            return
          }

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
 