"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ArrowLeft, MessageCircle, Search, Heart } from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

interface Chat {
  id: string
  pet_id: string
  user_id: string
  owner_id: string
  created_at: string
  updated_at: string
  pet?: {
    id: string
    name: string
    breed: string
    type: "lost" | "found"
    photo_url?: string
    contact_name: string
  }
  last_message?: {
    text: string
    created_at: string
    sender_type: "user" | "owner"
  }
}

export default function ChatsPage() {
  const [chats, setChats] = useState<Chat[]>([])
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

      // Демо-данные для чатов
      const demoChats = [
        {
          id: "demo-chat-1",
          pet_id: "1",
          user_id: user.id,
          owner_id: "demo-owner-1",
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 часа назад
          updated_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 минут назад
          pet: {
            id: "1",
            name: "Рекс",
            breed: "Лабрадор",
            type: "lost" as const,
            photo_url: "/placeholder.svg?height=60&width=60",
            contact_name: "Анна",
          },
          last_message: {
            text: "Спасибо за информацию! Можете прислать фото?",
            created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
            sender_type: "owner" as const,
          },
        },
        {
          id: "demo-chat-2",
          pet_id: "2",
          user_id: user.id,
          owner_id: "demo-owner-2",
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 день назад
          updated_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 минут назад
          pet: {
            id: "2",
            name: "Мурка",
            breed: "Персидская",
            type: "found" as const,
            photo_url: "/placeholder.svg?height=60&width=60",
            contact_name: "Михаил",
          },
          last_message: {
            text: "Да, это похоже на моего питомца!",
            created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
            sender_type: "user" as const,
          },
        },
      ]

      setChats(demoChats)
      setLoading(false)
    }

    fetchUserAndChats()
  }, [])

  const filteredChats = chats.filter((chat) =>
    chat.pet?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.pet?.breed.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.pet?.contact_name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) return "Вчера"
    if (diffDays <= 7) return `${diffDays} дн. назад`
    return date.toLocaleDateString("ru-RU", { day: "numeric", month: "short" })
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <MessageCircle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Требуется авторизация</h2>
          <p className="text-gray-600 mb-4">
            Для просмотра чатов необходимо войти в систему
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Назад
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <MessageCircle className="h-6 w-6 text-orange-500" />
                <h1 className="text-xl font-bold text-gray-900">Мои чаты</h1>
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
              placeholder="Поиск по питомцам..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
            <span className="ml-2 text-gray-600">Загружаем чаты...</span>
          </div>
        ) : filteredChats.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchQuery ? "Чаты не найдены" : "У вас пока нет чатов"}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchQuery 
                  ? "Попробуйте изменить поисковый запрос"
                  : "Начните общение с владельцами питомцев"
                }
              </p>
              {!searchQuery && (
                <Link href="/search">
                  <Button className="bg-orange-500 hover:bg-orange-600">
                    Найти питомцев
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredChats.map((chat) => (
              <Link key={chat.id} href={`/chat/${chat.pet_id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-4">
                      <img
                        src={chat.pet?.photo_url || "/placeholder.svg?height=60&width=60"}
                        alt={chat.pet?.name}
                        className="w-15 h-15 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {chat.pet?.name} • {chat.pet?.breed}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {chat.pet?.contact_name}
                            </p>
                          </div>
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
                          <span>Создан: {formatDate(chat.created_at)}</span>
                          <MessageCircle className="h-4 w-4" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
 