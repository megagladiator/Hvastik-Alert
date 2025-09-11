"use client"

import { useSession } from "next-auth/react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { safeSupabase as supabase } from "@/lib/supabase"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { v5 as uuidv5 } from 'uuid'

export default function TestPetCreationPage() {
  const { data: session, status } = useSession()
  const [result, setResult] = useState<string>("")
  const [loading, setLoading] = useState(false)

  // Функция для генерации UUID из NextAuth.js ID
  const generateUserId = (nextAuthId: string | undefined): string | null => {
    if (!nextAuthId) return null
    const namespace = '6ba7b810-9dad-11d1-80b4-00c04fd430c8'
    return uuidv5(nextAuthId, namespace)
  }

  const testPetCreation = async () => {
    setLoading(true)
    setResult("")

    try {
      const testPet = {
        type: "lost" as const,
        animal_type: "dog",
        breed: "Test breed",
        name: "Test pet",
        description: "Test description for debugging",
        color: "Test color",
        location: "Test location",
        latitude: 44.8951,
        longitude: 37.3142,
        contact_phone: "+7 (999) 123-45-67",
        contact_name: "Test user",
        reward: 1000,
        photo_url: "https://example.com/test.jpg",
        status: "active" as const,
        created_at: new Date().toISOString(),
        user_id: generateUserId(session?.user?.id)
      }

      console.log("Session data:", session)
      console.log("User ID:", session?.user?.id)
      console.log("Pet data:", testPet)

      if (!supabaseAdmin) {
        setResult("❌ Админский Supabase клиент не инициализирован")
        return
      }

      const { data, error } = await supabaseAdmin
        .from("pets")
        .insert([testPet])
        .select()

      if (error) {
        setResult(`❌ Ошибка: ${error.message}\nКод: ${error.code}\nДетали: ${JSON.stringify(error, null, 2)}`)
      } else {
        setResult(`✅ Успешно! ID объявления: ${data[0]?.id}`)
        
        // Удаляем тестовое объявление
        if (data[0]?.id) {
          await supabaseAdmin.from("pets").delete().eq("id", data[0].id)
          setResult(prev => prev + "\n🧹 Тестовое объявление удалено")
        }
      }
    } catch (error: any) {
      setResult(`❌ Исключение: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Тест создания объявления</h1>
      
      <div className="bg-gray-100 p-4 rounded-lg mb-6">
        <h2 className="text-lg font-semibold mb-2">Информация о сессии:</h2>
        <p><strong>Статус:</strong> {status}</p>
        {session?.user ? (
          <div>
            <p><strong>Email:</strong> {session.user.email}</p>
            <p><strong>ID:</strong> {session.user.id}</p>
            <p><strong>Тип ID:</strong> {typeof session.user.id}</p>
          </div>
        ) : (
          <p>Пользователь не аутентифицирован</p>
        )}
      </div>

      <div className="mb-6">
        <Button 
          onClick={testPetCreation} 
          disabled={loading || !session?.user}
          className="bg-orange-500 hover:bg-orange-600"
        >
          {loading ? "Тестируем..." : "Тест создания объявления"}
        </Button>
      </div>

      {result && (
        <div className="bg-white p-4 rounded-lg border">
          <h3 className="font-semibold mb-2">Результат:</h3>
          <pre className="whitespace-pre-wrap text-sm">{result}</pre>
        </div>
      )}
    </div>
  )
}
