"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import BackgroundImageSettings from "@/components/admin/background-settings"
import UserList from "@/components/admin/user-list"
import { Settings, Users, Database, ImageIcon, Home } from "lucide-react"

export default function AdminPage() {
  const { data: session, status } = useSession()
  const [activeTab, setActiveTab] = useState<string>("settings")
  const router = useRouter()

  useEffect(() => {
    // Проверяем аутентификацию через NextAuth
    if (status === "loading") return
    
    if (!session?.user) {
      router.push("/auth")
      return
    }
  }, [session, status, router])

  const isAdmin = session?.user?.email === 'agentgl007@gmail.com'

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка админ панели...</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center">
        <Card className="w-full max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Доступ запрещен</h1>
            <p className="text-gray-600 mb-6">У вас нет прав для доступа к админ панели.</p>
            <Button onClick={() => router.push("/")} className="bg-orange-500 hover:bg-orange-600">
              Вернуться на главную
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Settings className="h-8 w-8 text-orange-500" />
            <h1 className="text-2xl font-bold text-gray-900">Админ панель</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              onClick={() => router.push("/")}
              className="flex items-center gap-2"
            >
              <Home className="h-4 w-4" />
              На главную
            </Button>
            <span className="text-orange-600 font-medium">{session?.user?.email}</span>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Навигация по вкладкам */}
        <div className="flex gap-2 mb-8">
          <Button
            variant={activeTab === "settings" ? "default" : "outline"}
            onClick={() => setActiveTab("settings")}
            className={activeTab === "settings" ? "bg-orange-500 hover:bg-orange-600" : ""}
          >
            <ImageIcon className="h-4 w-4 mr-2" />
            Настройки фона
          </Button>
          <Button
            variant={activeTab === "users" ? "default" : "outline"}
            onClick={() => setActiveTab("users")}
            className={activeTab === "users" ? "bg-orange-500 hover:bg-orange-600" : ""}
          >
            <Users className="h-4 w-4 mr-2" />
            Пользователи
          </Button>
          <Button
            variant={activeTab === "database" ? "default" : "outline"}
            onClick={() => setActiveTab("database")}
            className={activeTab === "database" ? "bg-orange-500 hover:bg-orange-600" : ""}
          >
            <Database className="h-4 w-4 mr-2" />
            База данных
          </Button>
        </div>

        {/* Контент вкладок */}
        {activeTab === "settings" && (
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5 text-orange-500" />
                  Настройки приложения
                </CardTitle>
              </CardHeader>
              <CardContent>
                <BackgroundImageSettings />
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "users" && (
          <div className="max-w-7xl mx-auto">
            <UserList />
          </div>
        )}

        {activeTab === "database" && (
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-orange-500" />
                  Статистика базы данных
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Функция статистики базы данных будет добавлена в следующих версиях.</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
