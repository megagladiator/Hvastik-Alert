"use client"

import { useSupabaseSession } from "@/hooks/use-supabase-session"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { safeSupabase as supabase } from "@/lib/supabase"
import { supabaseAdmin } from "@/lib/supabase-admin"

export default function TestPetCreationPage() {
  const { user, loading: authLoading, isAuthenticated } = useSupabaseSession()
  const [result, setResult] = useState<string>("")
  const [loading, setLoading] = useState(false)

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
        user_id: user?.id
      }

      console.log("User data:", user)
      console.log("User ID:", user?.id)
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
        <h2 className="text-lg font-semibold mb-2">Информация о пользователе:</h2>
        <p><strong>Статус загрузки:</strong> {authLoading ? 'Загрузка...' : 'Загружено'}</p>
        {isAuthenticated && user ? (
          <div>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>ID:</strong> {user.id}</p>
            <p><strong>Тип ID:</strong> {typeof user.id}</p>
          </div>
        ) : (
          <p>Пользователь не аутентифицирован</p>
        )}
      </div>

      <div className="mb-6">
        <Button 
          onClick={testPetCreation} 
          disabled={loading || !isAuthenticated}
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
