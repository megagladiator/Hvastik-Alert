"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Send, Phone, Heart } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"

interface Message {
  id: string
  sender: "user" | "owner"
  text: string
  timestamp: string
}

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
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [pet, setPet] = useState<Pet | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Demo data
    setPet({
      id: params.id as string,
      type: "lost",
      name: "Рекс",
      breed: "Лабрадор",
      contact_name: "Анна",
      contact_phone: "+7 (918) 123-45-67",
      photo_url: "/placeholder.svg?height=50&width=50",
    })

    setMessages([
      {
        id: "1",
        sender: "owner",
        text: "Здравствуйте! Спасибо, что откликнулись на объявление о Рексе.",
        timestamp: "2024-01-15T10:00:00Z",
      },
      {
        id: "2",
        sender: "user",
        text: "Привет! Я видел собаку, похожую на вашего Рекса возле парка. Можете описать особые приметы?",
        timestamp: "2024-01-15T10:05:00Z",
      },
      {
        id: "3",
        sender: "owner",
        text: "У него есть небольшой шрам на левом ухе и он носит красный ошейник с медальоном в форме кости.",
        timestamp: "2024-01-15T10:07:00Z",
      },
    ])
  }, [params.id])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    const message: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: newMessage,
      timestamp: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, message])
    setNewMessage("")

    // Simulate response
    setTimeout(() => {
      const response: Message = {
        id: (Date.now() + 1).toString(),
        sender: "owner",
        text: "Спасибо за информацию! Можете прислать фото или встретиться?",
        timestamp: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, response])
    }, 1000)
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
    })
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
            <a href={`tel:${pet.contact_phone}`}>
              <Button variant="outline" size="sm">
                <Phone className="h-4 w-4 mr-2" />
                Позвонить
              </Button>
            </a>
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
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.sender === "user" ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-900"
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                    <p className={`text-xs mt-1 ${message.sender === "user" ? "text-orange-100" : "text-gray-500"}`}>
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="border-t p-4">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Напишите сообщение..."
                  className="flex-1"
                />
                <Button type="submit" className="bg-orange-500 hover:bg-orange-600">
                  <Send className="h-4 w-4" />
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
