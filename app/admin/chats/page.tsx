"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ArrowLeft, MessageCircle, Search, Archive, Trash2, RotateCcw, Users } from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

interface AdminChat {
  id: string
  pet_id: string
  user_id: string
  owner_id: string
  status: string
  archived_at?: string
  archived_by?: string
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
  user_email?: string
  owner_email?: string
}

export default function AdminChatsPage() {
  const [chats, setChats] = useState<AdminChat[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "archived">("all")
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

      await loadAllChats()
    }

    fetchUserAndChats()
  }, [])

  const loadAllChats = async () => {
    try {
      // Загружаем все чаты (активные и архивированные)
      const response = await fetch('/api/admin/chats')
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error("Error fetching admin chats:", errorData)
        setChats([])
      } else {
        const { data: chatsData } = await response.json()
        console.log("Загружены все чаты:", chatsData)
        setChats(chatsData || [])
      }
    } catch (error) {
      console.error("Error loading admin chats:", error)
      setChats([])
    }
    setLoading(false)
  }

  const filteredChats = chats.filter((chat) => {
    const matchesSearch = chat.pet?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         chat.pet?.breed.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         chat.user_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         chat.owner_email?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || chat.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  // Функция для архивирования чата
  const archiveChat = async (chatId: string) => {
    try {
      const response = await fetch('/api/chats/archive', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatId: chatId,
          userId: user?.id,
          isOwner: true // Администратор может архивировать любые чаты
        }),
      })

      if (response.ok) {
        await loadAllChats() // Перезагружаем список
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
        await loadAllChats() // Перезагружаем список
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

  // Функция для удаления чата
  const deleteChat = async (chatId: string) => {
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
          isAdmin: true
        }),
      })

      if (response.ok) {
        await loadAllChats() // Перезагружаем список
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
                Только администраторы могут управлять всеми чатами
              </p>
              <Link href="/chats">
                <Button className="bg-blue-500 hover:bg-blue-600">
                  Вернуться к моим чатам
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
              <Link href="/admin">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Назад в админ-панель
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Управление чатами
                </h1>
                <p className="text-sm text-gray-600">
                  Административная панель для управления всеми чатами
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-purple-600 border-purple-300">
                <Users className="h-3 w-3 mr-1" />
                Всего чатов: {chats.length}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Фильтры и поиск */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Поиск по питомцам, пользователям..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={statusFilter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("all")}
              >
                Все ({chats.length})
              </Button>
              <Button
                variant={statusFilter === "active" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("active")}
              >
                Активные ({chats.filter(c => c.status === 'active').length})
              </Button>
              <Button
                variant={statusFilter === "archived" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("archived")}
              >
                Архивированные ({chats.filter(c => c.status === 'archived').length})
              </Button>
            </div>
            <Button onClick={loadAllChats} variant="outline" size="sm">
              <RotateCcw className="h-4 w-4 mr-2" />
              Обновить
            </Button>
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
                {searchQuery ? "Чаты не найдены" : "Нет чатов"}
              </h3>
              <p className="text-gray-600">
                {searchQuery 
                  ? "Попробуйте изменить поисковый запрос"
                  : "Чаты появятся здесь после создания"
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredChats.map((chat) => (
              <Card 
                key={chat.id} 
                className={chat.status === 'archived' ? 'border-orange-200 bg-orange-50' : 'border-gray-200'}
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <div className={`w-15 h-15 rounded-lg flex items-center justify-center ${
                      chat.status === 'archived' ? 'bg-orange-200' : 'bg-gray-200'
                    }`}>
                      {chat.status === 'archived' ? (
                        <Archive className="h-6 w-6 text-orange-600" />
                      ) : (
                        <MessageCircle className="h-6 w-6 text-gray-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {chat.pet?.name} • {chat.pet?.breed}
                          </h3>
                          <p className="text-sm text-gray-600">
                            ID чата: {chat.id.slice(0, 8)}...
                          </p>
                          <div className="text-xs text-gray-500 mt-1">
                            <p>👤 Пользователь: {chat.user_email}</p>
                            <p>🏠 Владелец: {chat.owner_email}</p>
                          </div>
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
                          <Badge 
                            variant="outline" 
                            className={
                              chat.status === 'archived' 
                                ? "text-orange-600 border-orange-300" 
                                : "text-green-600 border-green-300"
                            }
                          >
                            {chat.status === 'archived' ? 'Архивирован' : 'Активен'}
                          </Badge>
                        </div>
                      </div>

                      {chat.last_message && (
                        <div className="mb-2">
                          <p className="text-sm text-gray-600 truncate">
                            {chat.last_message.text}
                          </p>
                          <p className="text-xs text-gray-400">
                            {formatDate(chat.last_message.created_at)} • 
                            {chat.last_message.sender_type === "user" ? " Пользователь" : " Владелец"}
                          </p>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Создан: {formatDate(chat.created_at)}</span>
                        {chat.archived_at && (
                          <span>Архивирован: {formatDate(chat.archived_at)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Кнопки управления */}
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200">
                    <Link href={`/chat/${chat.pet_id}`}>
                      <Button variant="outline" size="sm">
                        <MessageCircle className="h-4 w-4 mr-1" />
                        Открыть чат
                      </Button>
                    </Link>
                    
                    <div className="flex items-center space-x-2">
                      {chat.status === 'active' ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => archiveChat(chat.id)}
                          className="text-orange-600 border-orange-300 hover:bg-orange-50"
                        >
                          <Archive className="h-4 w-4 mr-1" />
                          Архивировать
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => restoreChat(chat.id)}
                          className="text-green-600 border-green-300 hover:bg-green-50"
                        >
                          <RotateCcw className="h-4 w-4 mr-1" />
                          Восстановить
                        </Button>
                      )}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteChat(chat.id)}
                        className="text-red-600 border-red-300 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Удалить
                      </Button>
                    </div>
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
