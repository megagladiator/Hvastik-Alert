"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageCircle, Shield } from "lucide-react"
import Link from "next/link"
import { ChatNotification } from "./chat-notification"

interface ContactInfoProps {
  petId: string
  isOwner?: boolean
  currentUserId?: string
}

export function ContactInfo({ 
  petId, 
  isOwner = false,
  currentUserId
}: ContactInfoProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Связаться с владельцем
          <div title="Персональные данные скрыты для безопасности">
            <Shield className="h-4 w-4 text-gray-400" />
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-gray-600">
            Для связи с владельцем питомца используйте безопасный чат. 
            Персональные данные скрыты для вашей безопасности.
          </p>
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
        </div>
      </CardContent>
    </Card>
  )
}
 