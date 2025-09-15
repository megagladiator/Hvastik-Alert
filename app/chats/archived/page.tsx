"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ArrowLeft, MessageCircle, Search, Archive, RotateCcw } from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

interface ArchivedChat {
  id: string
  pet_id: string
  user_id: string
  owner_id: string
  status: string
  archived_at: string
  archived_by: string
  created_at: string
  updated_at: string
  pet?: {
    id: string
    name: string
    breed: string
    type: "lost" | "found"
  }
  last_message?: {
    text: string
    created_at: string
    sender_type: "user" | "owner"
  }
}

export default function ArchivedChatsPage() {
  const [chats, setChats] = useState<ArchivedChat[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const fetchUserAndChats = async () => {
      if (!supabase) return

      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      if (!user) {
        setLoading(false)
        return
      }

      // Проверяем, что пользователь - администратор
      if (user.email !== 'agentgl007@gmail.com') {
        setLoading(false)
        return
      }

      // Загружаем архивированные чаты
      try {
        const response = await fetch('/api/chats/archived')
        
        if (!response.ok) {
          const errorData = await response.json()
          console.error("Error fetching archived chats:", errorData)
          setChats([])
        } else {
          const { data: chatsData } = await response.json()
          console.log("Загружены архивированные чаты:", chatsData)
          setChats(chatsData || [])
        }
      } catch (error) {
        console.error("Error loading archived chats:", error)
        setChats([])
      }
      setLoading(false)
    }

    fetchUserAndChats()
  }, [])

  const filteredChats = chats.filter((chat) =>
    chat.pet?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.pet?.breed.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Функция для восстановления чата
  const restoreChat = async (chatId: string) => {
    try {
      const response = await fetch('/api/chats/restore', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatId: chatId,
          userId: user?.id,
          isOwner: true // Администратор может восстанавливать любые чаты
        }),
      })

      if (response.ok) {
        // Обновляем список чатов
        setChats(chats.filter(chat => chat.id !== chatId))
        alert('Чат восстановлен')
      } else {
        const errorData = await response.json()
        alert(`Ошибка: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Ошибка восстановления чата:', error)
      alert('Ошибка при восстановлении чата')
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return "Вчера"
    if (diffDays < 7) return `${diffDays} дн. назад`
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} нед. назад`
    return date.toLocaleDateString('ru-RU')
  }

  // Если пользователь не администратор
  if (user && user.email !== 'agentgl007@gmail.com') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Card>
            <CardContent className="p-8 text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Доступ запрещен
              </h2>
              <p className="text-gray-600 mb-4">
                Только администраторы могут просматривать архивированные чаты
              </p>
              <Link href="/chats">
                <Button className="bg-blue-500 hover:bg-blue-600">
                  Вернуться к чатам
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/chats">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Назад к чатам
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Архивированные чаты
                </h1>
                <p className="text-sm text-gray-600">
                  Управление архивированными чатами
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Поиск по архивированным чатам..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
            <span className="ml-2 text-gray-600">Загружаем архивированные чаты...</span>
          </div>
        ) : filteredChats.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Archive className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchQuery ? "Архивированные чаты не найдены" : "Нет архивированных чатов"}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchQuery 
                  ? "Попробуйте изменить поисковый запрос"
                  : "Архивированные чаты появятся здесь"
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredChats.map((chat) => (
              <Card key={chat.id} className="border-orange-200 bg-orange-50">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-15 h-15 rounded-lg bg-orange-200 flex items-center justify-center">
                      <Archive className="h-6 w-6 text-orange-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {chat.pet?.name} • {chat.pet?.breed}
                          </h3>
                          <p className="text-sm text-gray-600">
                            ID питомца: {chat.pet_id}
                          </p>
                          <p className="text-xs text-orange-600">
                            📦 Чат архивирован
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant={chat.pet?.type === "lost" ? "destructive" : "default"}
                            className={
                              chat.pet?.type === "lost" 
                                ? "bg-red-100 text-red-800" 
                                : "bg-green-100 text-green-800"
                            }
                          >
                            {chat.pet?.type === "lost" ? "Потерялся" : "Найден"}
                          </Badge>
                          <Badge variant="outline" className="text-orange-600 border-orange-300">
                            Архивирован
                          </Badge>
                        </div>
                      </div>

                      {chat.last_message && (
                        <div className="mb-2">
                          <p className="text-sm text-gray-600 truncate">
                            {chat.last_message.text}
                          </p>
                          <p className="text-xs text-gray-400">
                            {formatDate(chat.last_message.created_at)}
                          </p>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Архивирован: {formatDate(chat.archived_at)}</span>
                        <span>Создан: {formatDate(chat.created_at)}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Кнопки управления */}
                  <div className="flex items-center justify-end mt-4 pt-3 border-t border-orange-200">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => restoreChat(chat.id)}
                      className="text-green-600 border-green-300 hover:bg-green-50"
                    >
                      <RotateCcw className="h-4 w-4 mr-1" />
                      Восстановить
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
