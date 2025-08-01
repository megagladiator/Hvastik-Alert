import { useState, useEffect, useCallback } from "react"

interface Message {
  id: string
  sender_id: string
  sender_type: "user" | "owner"
  text: string
  created_at: string
}

interface Chat {
  id: string
  pet_id: string
  user_id: string
  owner_id: string
}

interface UseChatProps {
  petId: string
  currentUserId?: string
}

export function useChatSimple({ petId, currentUserId }: UseChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [chat, setChat] = useState<Chat | null>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Создание демо-чата
  const createDemoChat = useCallback(async () => {
    if (!currentUserId) return null

    // Создаем демо-чат
    const demoChat: Chat = {
      id: `demo-chat-${petId}`,
      pet_id: petId,
      user_id: currentUserId,
      owner_id: "demo-owner-id",
    }

    setChat(demoChat)
    return demoChat
  }, [petId, currentUserId])

  // Загрузка демо-сообщений
  const loadDemoMessages = useCallback(async () => {
    const demoMessages: Message[] = [
      {
        id: "1",
        sender_id: "demo-owner-id",
        sender_type: "owner",
        text: "Здравствуйте! Спасибо, что откликнулись на объявление о питомце.",
        created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 минут назад
      },
      {
        id: "2",
        sender_id: currentUserId || "demo-user-id",
        sender_type: "user",
        text: "Привет! Я видел похожего питомца. Можете описать особые приметы?",
        created_at: new Date(Date.now() - 1000 * 60 * 3).toISOString(), // 3 минуты назад
      },
      {
        id: "3",
        sender_id: "demo-owner-id",
        sender_type: "owner",
        text: "Конечно! У него есть небольшой шрам на левом ухе и он носит красный ошейник.",
        created_at: new Date(Date.now() - 1000 * 60 * 1).toISOString(), // 1 минуту назад
      },
    ]

    setMessages(demoMessages)
  }, [currentUserId])

  // Отправка сообщения (демо)
  const sendMessage = useCallback(
    async (text: string) => {
      if (!chat || !currentUserId) return

      setSending(true)
      
      // Имитируем задержку отправки
      await new Promise(resolve => setTimeout(resolve, 500))

      const newMessage: Message = {
        id: Date.now().toString(),
        sender_id: currentUserId,
        sender_type: "user",
        text,
        created_at: new Date().toISOString(),
      }

      setMessages(prev => [...prev, newMessage])

      // Имитируем ответ владельца
      setTimeout(() => {
        const responseMessage: Message = {
          id: (Date.now() + 1).toString(),
          sender_id: "demo-owner-id",
          sender_type: "owner",
          text: "Спасибо за информацию! Можете прислать фото или встретиться?",
          created_at: new Date().toISOString(),
        }
        setMessages(prev => [...prev, responseMessage])
      }, 1000)

      setSending(false)
    },
    [chat, currentUserId]
  )

  // Инициализация
  useEffect(() => {
    const initializeChat = async () => {
      setLoading(true)
      setError(null)

      try {
        const chatData = await createDemoChat()
        if (chatData) {
          await loadDemoMessages()
        }
      } catch (err) {
        console.error("Error initializing chat:", err)
        setError("Ошибка при инициализации чата")
      } finally {
        setLoading(false)
      }
    }

    if (currentUserId) {
      initializeChat()
    } else {
      setLoading(false)
    }
  }, [currentUserId, createDemoChat, loadDemoMessages])

  return {
    messages,
    chat,
    loading,
    sending,
    error,
    sendMessage,
  }
} 

interface Message {
  id: string
  sender_id: string
  sender_type: "user" | "owner"
  text: string
  created_at: string
}

interface Chat {
  id: string
  pet_id: string
  user_id: string
  owner_id: string
}

interface UseChatProps {
  petId: string
  currentUserId?: string
}

export function useChatSimple({ petId, currentUserId }: UseChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [chat, setChat] = useState<Chat | null>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Создание демо-чата
  const createDemoChat = useCallback(async () => {
    if (!currentUserId) return null

    // Создаем демо-чат
    const demoChat: Chat = {
      id: `demo-chat-${petId}`,
      pet_id: petId,
      user_id: currentUserId,
      owner_id: "demo-owner-id",
    }

    setChat(demoChat)
    return demoChat
  }, [petId, currentUserId])

  // Загрузка демо-сообщений
  const loadDemoMessages = useCallback(async () => {
    const demoMessages: Message[] = [
      {
        id: "1",
        sender_id: "demo-owner-id",
        sender_type: "owner",
        text: "Здравствуйте! Спасибо, что откликнулись на объявление о питомце.",
        created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 минут назад
      },
      {
        id: "2",
        sender_id: currentUserId || "demo-user-id",
        sender_type: "user",
        text: "Привет! Я видел похожего питомца. Можете описать особые приметы?",
        created_at: new Date(Date.now() - 1000 * 60 * 3).toISOString(), // 3 минуты назад
      },
      {
        id: "3",
        sender_id: "demo-owner-id",
        sender_type: "owner",
        text: "Конечно! У него есть небольшой шрам на левом ухе и он носит красный ошейник.",
        created_at: new Date(Date.now() - 1000 * 60 * 1).toISOString(), // 1 минуту назад
      },
    ]

    setMessages(demoMessages)
  }, [currentUserId])

  // Отправка сообщения (демо)
  const sendMessage = useCallback(
    async (text: string) => {
      if (!chat || !currentUserId) return

      setSending(true)
      
      // Имитируем задержку отправки
      await new Promise(resolve => setTimeout(resolve, 500))

      const newMessage: Message = {
        id: Date.now().toString(),
        sender_id: currentUserId,
        sender_type: "user",
        text,
        created_at: new Date().toISOString(),
      }

      setMessages(prev => [...prev, newMessage])

      // Имитируем ответ владельца
      setTimeout(() => {
        const responseMessage: Message = {
          id: (Date.now() + 1).toString(),
          sender_id: "demo-owner-id",
          sender_type: "owner",
          text: "Спасибо за информацию! Можете прислать фото или встретиться?",
          created_at: new Date().toISOString(),
        }
        setMessages(prev => [...prev, responseMessage])
      }, 1000)

      setSending(false)
    },
    [chat, currentUserId]
  )

  // Инициализация
  useEffect(() => {
    const initializeChat = async () => {
      setLoading(true)
      setError(null)

      try {
        const chatData = await createDemoChat()
        if (chatData) {
          await loadDemoMessages()
        }
      } catch (err) {
        console.error("Error initializing chat:", err)
        setError("Ошибка при инициализации чата")
      } finally {
        setLoading(false)
      }
    }

    if (currentUserId) {
      initializeChat()
    } else {
      setLoading(false)
    }
  }, [currentUserId, createDemoChat, loadDemoMessages])

  return {
    messages,
    chat,
    loading,
    sending,
    error,
    sendMessage,
  }
} 
 