"use client"

import { useSupabaseSession } from "@/hooks/use-supabase-session"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function TestFlowPage() {
  const { user, loading, isAuthenticated } = useSupabaseSession()
  const router = useRouter()

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Тест полного потока аутентификации</h1>
      
      <div className="bg-gray-100 p-4 rounded-lg mb-6">
        <h2 className="text-lg font-semibold mb-2">Текущий статус:</h2>
        <p><strong>Статус загрузки:</strong> {loading ? 'Загрузка...' : 'Загружено'}</p>
        {isAuthenticated && user ? (
          <div>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>ID:</strong> {user.id}</p>
            <p className="text-green-600 font-semibold">✅ Пользователь аутентифицирован</p>
          </div>
        ) : (
          <p className="text-red-600 font-semibold">❌ Пользователь не аутентифицирован</p>
        )}
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Тестирование потока:</h3>
        
        <div className="flex gap-4">
          <Button onClick={() => router.push("/auth")}>
            🔐 Страница входа
          </Button>
          
          <Button onClick={() => router.push("/register")}>
            📝 Страница регистрации
          </Button>
          
          <Button 
            onClick={() => router.push("/cabinet")}
            disabled={!isAuthenticated}
          >
            🏠 Личный кабинет
          </Button>
          
          <Button onClick={() => router.push("/")}>
            🏡 Главная страница
          </Button>
        </div>

        {isAuthenticated && user && (
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h4 className="font-semibold text-green-800 mb-2">✅ Готово к тестированию!</h4>
            <p className="text-green-700">
              Пользователь аутентифицирован. Теперь можно:
            </p>
            <ul className="list-disc list-inside mt-2 text-green-700">
              <li>Перейти в личный кабинет</li>
              <li>Просматривать объявления</li>
              <li>Добавлять новые объявления</li>
              <li>Использовать админ-панель (если админ)</li>
            </ul>
          </div>
        )}

        {!isAuthenticated && (
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <h4 className="font-semibold text-yellow-800 mb-2">⚠️ Требуется аутентификация</h4>
            <p className="text-yellow-700">
              Для доступа к личному кабинету необходимо войти в систему.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
