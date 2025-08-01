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
        .select("*")
        .eq("pet_id", petId)
        .eq("user_id", currentUserId)
        .single()

      if (existingChat) {
        setChat(existingChat)
        return existingChat
      }

      // Если чат не найден, получаем информацию о питомце для создания чата
      const { data: pet, error: petError } = await supabase
        .from("pets")
        .select("user_id")
        .eq("id", petId)
        .single()

      if (petError || !pet) {
        throw new Error("Питомец не найден")
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
          setMessages((prev) => [...prev, newMessage])
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

        // Создаем локальное сообщение для мгновенного отображения
        const localMessage: Message = {
          id: `local-${Date.now()}`,
          chat_id: chat.id,
          sender_id: currentUserId,
          sender_type: senderType,
          text: text,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }

        // Добавляем сообщение локально для мгновенного отображения
        setMessages(prev => [...prev, localMessage])

        // Отправляем в базу данных только если это не демо-чат
        if (supabase && !chat.id.startsWith('demo-')) {
          const { error } = await supabase.from("messages").insert({
            chat_id: chat.id,
            sender_id: currentUserId,
            sender_type: senderType,
            text,
          })

          if (error) {
            console.error("Error sending message to database:", error)
            // Не показываем ошибку пользователю, так как сообщение уже отображается локально
          }
        }
      } catch (err) {
        console.error("Error sending message:", err)
        // Не показываем ошибку пользователю, так как сообщение уже отображается локально
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
        .select("*")
        .eq("pet_id", petId)
        .eq("user_id", currentUserId)
        .single()

      if (existingChat) {
        setChat(existingChat)
        return existingChat
      }

      // Если чат не найден, получаем информацию о питомце для создания чата
      const { data: pet, error: petError } = await supabase
        .from("pets")
        .select("user_id")
        .eq("id", petId)
        .single()

      if (petError || !pet) {
        throw new Error("Питомец не найден")
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
          setMessages((prev) => [...prev, newMessage])
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

        // Создаем локальное сообщение для мгновенного отображения
        const localMessage: Message = {
          id: `local-${Date.now()}`,
          chat_id: chat.id,
          sender_id: currentUserId,
          sender_type: senderType,
          text: text,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }

        // Добавляем сообщение локально для мгновенного отображения
        setMessages(prev => [...prev, localMessage])

        // Отправляем в базу данных только если это не демо-чат
        if (supabase && !chat.id.startsWith('demo-')) {
          const { error } = await supabase.from("messages").insert({
            chat_id: chat.id,
            sender_id: currentUserId,
            sender_type: senderType,
            text,
          })

          if (error) {
            console.error("Error sending message to database:", error)
            // Не показываем ошибку пользователю, так как сообщение уже отображается локально
          }
        }
      } catch (err) {
        console.error("Error sending message:", err)
        // Не показываем ошибку пользователю, так как сообщение уже отображается локально
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
 