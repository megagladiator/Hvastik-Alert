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
    contact_email?: string
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

      // Загружаем реальные чаты из БД
      try {
        const { data: chatsData, error: chatsError } = await supabase
          .from("chats")
          .select(`
            *,
            pets!inner(
              id,
              name,
              breed,
              type,
              photo_url,
              contact_name,
              contact_email,
              status
            )
          `)
          .or(`user_id.eq.${user.id},owner_id.eq.${user.id}`)
          .order("updated_at", { ascending: false })

        if (chatsError) {
          console.error("Error fetching chats:", chatsError)
          setChats([])
        } else {
          // Фильтруем чаты с активными питомцами
          const activeChats = chatsData?.filter(chat => 
            chat.pets && chat.pets.status === 'active'
          ) || []
          
          // Получаем последние сообщения для каждого чата
          const chatsWithMessages = await Promise.all(
            activeChats.map(async (chat) => {
              const { data: lastMessage } = await supabase
                .from("messages")
                .select("text, created_at, sender_type")
                .eq("chat_id", chat.id)
                .order("created_at", { ascending: false })
                .limit(1)
                .single()

              return {
                ...chat,
                pet: chat.pets,
                last_message: lastMessage || null
              }
            })
          )

          setChats(chatsWithMessages)
        }
      } catch (error) {
        console.error("Error loading chats:", error)
        setChats([])
      }
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
                              Владелец: {chat.pet?.contact_name}
                            </p>
                            {chat.pet?.contact_email && (
                              <p className="text-xs text-gray-500">
                                📧 {chat.pet.contact_email}
                              </p>
                            )}
                            <p className="text-xs text-blue-600">
                              💬 Ваши сообщения отправляются этому пользователю
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
 