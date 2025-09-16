"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Send, Heart, Shield, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useParams, useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { useChat } from "@/hooks/use-chat"

interface Pet {
  id: string
  type: "lost" | "found"
  name: string
  breed: string
  contact_name: string
  contact_phone: string
  contact_email?: string
  photo_url?: string
}

export default function ChatPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const [pet, setPet] = useState<Pet | null>(null)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [newMessage, setNewMessage] = useState("")
  const [petError, setPetError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Получаем chatId и источник навигации из URL параметров
  const chatId = searchParams.get('chatId')
  const from = searchParams.get('from')

  // Используем хук для чата
  const { messages, chat, loading: chatLoading, sending, error: chatError, sendMessage } = useChat({
    petId: params.id as string,
    currentUserId: user?.id,
    existingChatId: chatId, // Передаем существующий chatId если есть
  })

  useEffect(() => {
    // Получаем информацию о пользователе
    const getUser = async () => {
      if (!supabase) return
      
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      
      if (!user) {
        // Если пользователь не авторизован, показываем демо данные
        setPet({
          id: params.id as string,
          type: "lost",
          name: "Рекс",
          breed: "Лабрадор",
          contact_name: "Анна",
          contact_phone: "+7 (918) 123-45-67",
          contact_email: "anna.petowner@example.com",
          photo_url: "/placeholder.svg?height=50&width=50",
        })
        setLoading(false)
        return
      }

      // Получаем информацию о питомце
      try {
        const { data: petData, error: petError } = await supabase
          .from("pets")
          .select("*")
          .eq("id", params.id)
          .single()

        if (petError || !petData) {
          console.error("Error fetching pet:", petError)
          // Питомец не найден - перенаправляем на страницу поиска
          window.location.href = "/search"
          return
        }

        // Проверяем, что питомец активен
        if (petData.status !== 'active') {
          // Питомец архивирован или найден - показываем сообщение
          setPet(null)
          setPetError("Этот питомец больше не доступен для общения")
        } else {
          setPet(petData)
        }
      } catch (error) {
        console.error("Error:", error)
        setPetError("Ошибка при загрузке информации о питомце")
      } finally {
        setLoading(false)
      }
    }

    getUser()
  }, [params.id])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !user) return

    await sendMessage(newMessage)
    setNewMessage("")
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Загружаем чат...</p>
        </div>
      </div>
    )
  }

  if (petError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Питомец недоступен</h2>
          <p className="text-gray-600 mb-4">{petError}</p>
          <Link href="/search">
            <Button className="bg-orange-500 hover:bg-orange-600">
              Найти других питомцев
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  if (!pet) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Загружаем чат...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Требуется авторизация</h2>
          <p className="text-gray-600 mb-4">
            Для отправки сообщений необходимо войти в систему
          </p>
          <Link href="/auth">
            <Button className="bg-orange-500 hover:bg-orange-600">
              Войти в систему
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href={from === 'admin' ? '/admin/chats' : '/chats'}>
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {from === 'admin' ? 'К админ-панели' : 'К чатам'}
                </Button>
              </Link>
              <Link href={`/pet/${pet.id}`}>
                <Button variant="outline" size="sm">
                  К объявлению
                </Button>
              </Link>
              <div className="flex items-center space-x-3">
                <img
                  src={pet.photo_url || "/placeholder.svg?height=40&width=40"}
                  alt={pet.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <h1 className="font-semibold text-gray-900">
                    {pet.name} • {pet.breed}
                  </h1>
                  <p className="text-sm text-gray-600">{pet.contact_name}</p>
                </div>
                <Badge
                  variant={pet.type === "lost" ? "destructive" : "default"}
                  className={pet.type === "lost" ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}
                >
                  {pet.type === "lost" ? "Потерялся" : "Найден"}
                </Badge>
              </div>
            </div>
            <div className="text-xs text-gray-500 flex items-center">
              <Shield className="h-3 w-3 mr-1" />
              Номер телефона скрыт для безопасности
            </div>
          </div>
        </div>
      </header>

      {/* Chat Messages */}
      <div className="flex-1 container mx-auto px-4 py-6 max-w-4xl">
        <Card className="h-full flex flex-col">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center">
                  <Heart className="h-5 w-5 mr-2 text-orange-500" />
                  Чат с владельцем
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Обсудите детали и договоритесь о встрече
                </p>
              </div>
              <Link href={from === 'admin' ? '/admin/chats' : '/chats'}>
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {from === 'admin' ? 'К админ-панели' : 'К чатам'}
                </Button>
              </Link>
            </div>
            <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="space-y-3">
                {/* Владелец питомца */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="w-3 h-3 bg-green-500 rounded-full mr-3"></span>
                    <div>
                      <p className="text-sm text-blue-800 font-medium">
                        🏠 Владелец питомца
                      </p>
                      <p className="text-sm text-blue-700">
                        <strong className="text-yellow-600">Email:</strong> <span className="text-yellow-600 font-medium">{chat?.owner_email || pet.contact_email || 'Не указан'}</span>
                      </p>
                      <p className="text-sm text-blue-700">
                        <strong>Имя:</strong> {pet.contact_name}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Абонент */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="w-3 h-3 bg-blue-500 rounded-full mr-3"></span>
                    <div>
                      <p className="text-sm text-blue-800 font-medium">
                        👤 Абонент
                      </p>
                      <p className="text-sm text-blue-700">
                        <strong className="text-yellow-600">Email:</strong> <span className="text-yellow-600 font-medium">{chat?.user_email || 'Загружается...'}</span>
                      </p>
                      <p className="text-sm text-blue-700">
                        <strong>Имя:</strong> {chat?.user_id === user?.id ? (user?.user_metadata?.full_name || 'Не указано') : (chat?.user_email?.split('@')[0] || 'Не указано')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Информация о питомце */}
                <div className="pt-2 border-t border-blue-200">
                  <p className="text-xs text-blue-600 text-center">
                    🐾 <strong>Питомец:</strong> {pet.name} • {pet.breed}
                  </p>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col p-0">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-96">
              {chatLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
                  <span className="ml-2 text-gray-600">Загружаем сообщения...</span>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center text-gray-500">
                    <Heart className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>Начните разговор первым!</p>
                    <p className="text-sm">Напишите сообщение владельцу питомца</p>
                  </div>
                </div>
                             ) : (
                 messages.map((message: any) => {
                   const isCurrentUser = message.sender_id === user?.id
                   const isOwner = message.sender_type === "owner"
                   const senderName = isCurrentUser ? "Вы" : (isOwner ? `${pet.contact_name} (владелец)` : "Абонент")
                   const senderIcon = isOwner ? "🏠" : "👤"
                   
                   return (
                     <div key={message.id} className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
                       <div className={`max-w-xs lg:max-w-md ${isCurrentUser ? "items-end" : "items-start"} flex flex-col`}>
                         {!isCurrentUser && (
                           <p className="text-xs text-gray-500 mb-1 ml-1 flex items-center">
                             <span className="mr-1">{senderIcon}</span>
                             {senderName}
                           </p>
                         )}
                         <div
                           className={`px-4 py-2 rounded-lg ${
                             isCurrentUser 
                               ? "bg-orange-500 text-white" 
                               : isOwner 
                                 ? "bg-green-100 text-green-900 border border-green-200" 
                                 : "bg-blue-100 text-blue-900 border border-blue-200"
                           }`}
                         >
                           <p className="text-sm">{message.text}</p>
                           <p className={`text-xs mt-1 ${
                             isCurrentUser 
                               ? "text-orange-100" 
                               : isOwner 
                                 ? "text-green-600" 
                                 : "text-blue-600"
                           }`}>
                             {formatTime(message.created_at)}
                           </p>
                         </div>
                         {isCurrentUser && (
                           <p className="text-xs text-gray-500 mt-1 mr-1 flex items-center">
                             <span className="mr-1">👤</span>
                             Вы
                           </p>
                         )}
                       </div>
                     </div>
                   )
                 })
               )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="border-t p-4">
              {chatError && (
                <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{chatError}</p>
                </div>
              )}
              {/* Проверяем, является ли пользователь администратором */}
              {user?.email === 'agentgl007@gmail.com' ? (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center">
                    <Shield className="h-5 w-5 text-yellow-600 mr-2" />
                    <div>
                      <p className="text-sm text-yellow-800 font-medium">
                        Режим администратора
                      </p>
                      <p className="text-xs text-yellow-700 mt-1">
                        Вы можете только просматривать переписку. Отправка сообщений отключена.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Напишите сообщение..."
                    className="flex-1"
                    disabled={sending}
                  />
                  <Button 
                    type="submit" 
                    className="bg-orange-500 hover:bg-orange-600"
                    disabled={sending || !newMessage.trim()}
                  >
                    {sending ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </form>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Safety Tips */}
        <Card className="mt-4 border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <h3 className="font-semibold text-yellow-800 mb-2">Правила безопасности</h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Встречайтесь в людных местах</li>
              <li>• Не передавайте деньги заранее</li>
              <li>• Проверьте документы на животное</li>
              <li>• Возьмите с собой друга или родственника</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
