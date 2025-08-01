"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Phone, MessageCircle, Shield, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { ChatNotification } from "./chat-notification"

interface ContactInfoProps {
  contact_name: string
  contact_phone: string
  petId: string
  showPhone?: boolean
  isOwner?: boolean
  isAdmin?: boolean
  currentUserId?: string
}

export function ContactInfo({ 
  contact_name, 
  contact_phone, 
  petId, 
  showPhone = false, 
  isOwner = false, 
  isAdmin = false,
  currentUserId
}: ContactInfoProps) {
  const [showPhoneNumber, setShowPhoneNumber] = useState(showPhone || isOwner || isAdmin)

  const canShowPhone = showPhone || isOwner || isAdmin

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Контактная информация
          {!canShowPhone && (
            <div title="Номер телефона скрыт для безопасности">
              <Shield className="h-4 w-4 text-gray-400" />
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="font-medium text-gray-900">{contact_name}</p>
          {canShowPhone ? (
            <div className="flex items-center mt-1 text-gray-600">
              <Phone className="h-4 w-4 mr-2" />
              <a href={`tel:${contact_phone}`} className="hover:text-orange-500">
                {contact_phone}
              </a>
            </div>
          ) : (
            <p className="text-sm text-gray-600 mt-1">
              Для связи используйте чат или обратитесь к администратору
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Link href={`/chat/${petId}`} className="block">
            <Button className="w-full bg-orange-500 hover:bg-orange-600">
              <div className="flex items-center justify-center w-full">
                <MessageCircle className="h-4 w-4 mr-2" />
                Написать сообщение
                {isOwner && (
                  <div className="ml-2">
                    <ChatNotification 
                      petId={petId} 
                      currentUserId={currentUserId} 
                      isOwner={isOwner} 
                    />
                  </div>
                )}
              </div>
            </Button>
          </Link>
          
          {canShowPhone ? (
            <a href={`tel:${contact_phone}`} className="block">
              <Button variant="outline" className="w-full bg-transparent">
                <Phone className="h-4 w-4 mr-2" />
                Позвонить
              </Button>
            </a>
          ) : (
            <div className="text-center">
              <p className="text-xs text-gray-500">
                Номер телефона скрыт для безопасности
              </p>
              {isOwner && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="mt-2 text-xs"
                  onClick={() => setShowPhoneNumber(!showPhoneNumber)}
                >
                  {showPhoneNumber ? (
                    <>
                      <EyeOff className="h-3 w-3 mr-1" />
                      Скрыть номер
                    </>
                  ) : (
                    <>
                      <Eye className="h-3 w-3 mr-1" />
                      Показать номер
                    </>
                  )}
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Phone, MessageCircle, Shield, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { ChatNotification } from "./chat-notification"

interface ContactInfoProps {
  contact_name: string
  contact_phone: string
  petId: string
  showPhone?: boolean
  isOwner?: boolean
  isAdmin?: boolean
  currentUserId?: string
}

export function ContactInfo({ 
  contact_name, 
  contact_phone, 
  petId, 
  showPhone = false, 
  isOwner = false, 
  isAdmin = false,
  currentUserId
}: ContactInfoProps) {
  const [showPhoneNumber, setShowPhoneNumber] = useState(showPhone || isOwner || isAdmin)

  const canShowPhone = showPhone || isOwner || isAdmin

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Контактная информация
          {!canShowPhone && (
            <div title="Номер телефона скрыт для безопасности">
              <Shield className="h-4 w-4 text-gray-400" />
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="font-medium text-gray-900">{contact_name}</p>
          {canShowPhone ? (
            <div className="flex items-center mt-1 text-gray-600">
              <Phone className="h-4 w-4 mr-2" />
              <a href={`tel:${contact_phone}`} className="hover:text-orange-500">
                {contact_phone}
              </a>
            </div>
          ) : (
            <p className="text-sm text-gray-600 mt-1">
              Для связи используйте чат или обратитесь к администратору
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Link href={`/chat/${petId}`} className="block">
            <Button className="w-full bg-orange-500 hover:bg-orange-600">
              <div className="flex items-center justify-center w-full">
                <MessageCircle className="h-4 w-4 mr-2" />
                Написать сообщение
                {isOwner && (
                  <div className="ml-2">
                    <ChatNotification 
                      petId={petId} 
                      currentUserId={currentUserId} 
                      isOwner={isOwner} 
                    />
                  </div>
                )}
              </div>
            </Button>
          </Link>
          
          {canShowPhone ? (
            <a href={`tel:${contact_phone}`} className="block">
              <Button variant="outline" className="w-full bg-transparent">
                <Phone className="h-4 w-4 mr-2" />
                Позвонить
              </Button>
            </a>
          ) : (
            <div className="text-center">
              <p className="text-xs text-gray-500">
                Номер телефона скрыт для безопасности
              </p>
              {isOwner && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="mt-2 text-xs"
                  onClick={() => setShowPhoneNumber(!showPhoneNumber)}
                >
                  {showPhoneNumber ? (
                    <>
                      <EyeOff className="h-3 w-3 mr-1" />
                      Скрыть номер
                    </>
                  ) : (
                    <>
                      <Eye className="h-3 w-3 mr-1" />
                      Показать номер
                    </>
                  )}
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 
 