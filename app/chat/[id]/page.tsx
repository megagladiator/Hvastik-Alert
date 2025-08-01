"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Send, Heart, Shield, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { useChat } from "@/hooks/use-chat"

interface Pet {
  id: string
  type: "lost" | "found"
  name: string
  breed: string
  contact_name: string
  contact_phone: string
  photo_url?: string
}

export default function ChatPage() {
  const params = useParams()
  const [pet, setPet] = useState<Pet | null>(null)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [newMessage, setNewMessage] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Используем хук для чата
  const { messages, loading: chatLoading, sending, error, sendMessage } = useChat({
    petId: params.id as string,
    currentUserId: user?.id,
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

        if (petError) {
          console.error("Error fetching pet:", petError)
          // Fallback к демо данным
          setPet({
            id: params.id as string,
            type: "lost",
            name: "Рекс",
            breed: "Лабрадор",
            contact_name: "Анна",
            contact_phone: "+7 (918) 123-45-67",
            photo_url: "/placeholder.svg?height=50&width=50",
          })
        } else {
          setPet(petData)
        }
      } catch (error) {
        console.error("Error:", error)
        setPet({
          id: params.id as string,
          type: "lost",
          name: "Рекс",
          breed: "Лабрадор",
          contact_name: "Анна",
          contact_phone: "+7 (918) 123-45-67",
          photo_url: "/placeholder.svg?height=50&width=50",
        })
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

  if (loading || !pet) {
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
              <Link href={`/pet/${pet.id}`}>
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Назад
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
            <CardTitle className="flex items-center">
              <Heart className="h-5 w-5 mr-2 text-orange-500" />
              Чат с владельцем
            </CardTitle>
            <p className="text-sm text-gray-600">Обсудите детали и договоритесь о встрече</p>
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
                   return (
                     <div key={message.id} className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
                       <div
                         className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                           isCurrentUser ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-900"
                         }`}
                       >
                         <p className="text-sm">{message.text}</p>
                         <p className={`text-xs mt-1 ${isCurrentUser ? "text-orange-100" : "text-gray-500"}`}>
                           {formatTime(message.created_at)}
                         </p>
                       </div>
                     </div>
                   )
                 })
               )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="border-t p-4">
              {error && (
                <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}
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
