"use client"

import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function TestAuthPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Тест аутентификации</h1>
      
      <div className="bg-gray-100 p-4 rounded-lg mb-6">
        <h2 className="text-lg font-semibold mb-2">Статус сессии:</h2>
        <p><strong>Статус:</strong> {status}</p>
        {session?.user ? (
          <div>
            <p><strong>Email:</strong> {session.user.email}</p>
            <p><strong>ID:</strong> {session.user.id}</p>
          </div>
        ) : (
          <p>Пользователь не аутентифицирован</p>
        )}
      </div>

      <div className="space-y-4">
        <Button onClick={() => router.push("/auth")}>
          Перейти к странице входа
        </Button>
        
        <Button onClick={() => router.push("/register")}>
          Перейти к странице регистрации
        </Button>
        
        <Button onClick={() => router.push("/cabinet")}>
          Перейти в личный кабинет
        </Button>
        
        <Button onClick={() => router.push("/")}>
          На главную
        </Button>
      </div>
    </div>
  )
}
