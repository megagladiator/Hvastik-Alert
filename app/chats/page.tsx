"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ArrowLeft, MessageCircle, Search, Heart } from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { useSearchParams } from "next/navigation"
import { Archive, Trash2, RotateCcw } from "lucide-react"
import { useUserRoles } from "@/hooks/use-user-roles"

interface Chat {
  id: string
  pet_id: string
  user_id: string
  owner_id: string
  created_at: string
  updated_at: string
  user_email?: string
  owner_email?: string
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

export default function ChatsPage() {
  const [chats, setChats] = useState<Chat[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [user, setUser] = useState<any>(null)
  const searchParams = useSearchParams()
  const targetChatId = searchParams.get('chatId')
  const { isAdmin, isAuthenticated, email, userId } = useUserRoles()

  useEffect(() => {
    const fetchUserAndChats = async () => {
      if (!supabase) return

      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      if (!user) {
        setLoading(false)
        return
      }

      // Загружаем реальные чаты из БД через API
      try {
        let response
        
        if (isAdmin) {
          // Администратор видит все чаты
          response = await fetch(`/api/chats`)
        } else {
          // Обычные пользователи видят только свои чаты
          response = await fetch(`/api/chats?userId=${user.id}`)
        }
        
        if (!response.ok) {
          const errorData = await response.json()
          console.error("Error fetching chats:", errorData)
          setChats([])
        } else {
          const { data: chatsData } = await response.json()
          console.log("Загружены чаты:", chatsData)
          setChats(chatsData || [])
        }
      } catch (error) {
        console.error("Error loading chats:", error)
        setChats([])
      }
      setLoading(false)
    }

    fetchUserAndChats()
  }, [isAdmin, isAuthenticated])

  // Автоматический переход к целевому чату
  useEffect(() => {
    if (targetChatId && chats.length > 0) {
      const targetChat = chats.find(chat => chat.id === targetChatId)
      if (targetChat) {
        // Прокручиваем к целевому чату
        const chatElement = document.getElementById(`chat-${targetChatId}`)
        if (chatElement) {
          chatElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
          // Подсвечиваем чат
          chatElement.classList.add('ring-2', 'ring-blue-500')
          setTimeout(() => {
            chatElement.classList.remove('ring-2', 'ring-blue-500')
          }, 3000)
        }
      }
    }
  }, [targetChatId, chats])

  const filteredChats = chats.filter((chat) =>
    chat.pet?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.pet?.breed.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Функция для архивирования чата
  const archiveChat = async (chatId: string, isOwner: boolean) => {
    if (!isOwner) {
      alert('Только владелец объявления может архивировать чат')
      return
    }

    try {
      const response = await fetch('/api/chats/archive', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatId: chatId,
          userId: user?.id,
          isOwner: isOwner
        }),
      })

      if (response.ok) {
        // Обновляем список чатов
        setChats(chats.filter(chat => chat.id !== chatId))
        alert('Чат архивирован')
      } else {
        const errorData = await response.json()
        alert(`Ошибка: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Ошибка архивирования чата:', error)
      alert('Ошибка при архивировании чата')
    }
  }

  // Функция для удаления чата (только для администраторов)
  const deleteChat = async (chatId: string, isAdmin: boolean) => {
    if (!isAdmin) {
      alert('Только администратор может удалять чаты')
      return
    }

    if (!confirm('Вы уверены, что хотите удалить этот чат? Это действие нельзя отменить.')) {
      return
    }

    try {
      const response = await fetch('/api/chats/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatId: chatId,
          userId: user?.id,
          isAdmin: isAdmin
        }),
      })

      if (response.ok) {
        // Обновляем список чатов
        setChats(chats.filter(chat => chat.id !== chatId))
        alert('Чат удален')
      } else {
        const errorData = await response.json()
        alert(`Ошибка: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Ошибка удаления чата:', error)
      alert('Ошибка при удалении чата')
    }
  }

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
            {user?.email === 'agentgl007@gmail.com' && (
              <Link href="/chats/archived">
                <Button variant="outline" size="sm">
                  <Archive className="h-4 w-4 mr-2" />
                  Архивированные
                </Button>
              </Link>
            )}
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
            {filteredChats.map((chat) => {
              const isOwner = chat.owner_id === user?.id
              const isAdmin = user?.email === 'agentgl007@gmail.com' // Проверка на администратора
              
              return (
                <Card 
                  key={chat.id}
                  id={`chat-${chat.id}`}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-15 h-15 rounded-lg bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500 text-lg">🐕</span>
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
                            <p className="text-xs text-blue-600">
                              💬 Ваши сообщения отправляются владельцу питомца
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
                            {isOwner && (
                              <Badge variant="outline" className="text-blue-600 border-blue-300">
                                Владелец
                              </Badge>
                            )}
                            {isAdmin && (
                              <Badge variant="outline" className="text-purple-600 border-purple-300">
                                Админ
                              </Badge>
                            )}
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
                          <span>Создан: {formatDate(chat.created_at)}</span>
                          <MessageCircle className="h-4 w-4" />
                        </div>
                      </div>
                    </div>
                    
                    {/* Кнопки управления */}
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200">
                      <Link href={`/chat/${chat.pet_id}`}>
                        <Button className="bg-blue-500 hover:bg-blue-600 text-white">
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Открыть чат
                        </Button>
                      </Link>
                      
                      <div className="flex items-center space-x-2">
                        {isOwner && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.preventDefault()
                              archiveChat(chat.id, isOwner)
                            }}
                            className="text-orange-600 border-orange-300 hover:bg-orange-50"
                          >
                            <Archive className="h-4 w-4 mr-1" />
                            Архивировать
                          </Button>
                        )}
                        
                        {isAdmin && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.preventDefault()
                              deleteChat(chat.id, isAdmin)
                            }}
                            className="text-red-600 border-red-300 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Удалить
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
 