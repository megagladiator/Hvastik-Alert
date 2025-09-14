"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { useSupabaseSession } from "@/hooks/use-supabase-session"
import BackgroundImageSettings from "@/components/admin/background-settings"
import UserList from "@/components/admin/user-list"
import DatabaseStats from "@/components/admin/database-stats"
import DatabaseTables from "@/components/admin/database-tables"
import { Settings, Users, Database, ImageIcon, Home, Table } from "lucide-react"

export default function AdminPage() {
  const { user, loading, isAuthenticated } = useSupabaseSession()
  const [activeTab, setActiveTab] = useState<string>("settings")
  const router = useRouter()

  useEffect(() => {
    // Проверяем аутентификацию через Supabase
    if (loading) return
    
    if (!isAuthenticated || !user) {
      router.push("/auth")
      return
    }

    // Проверяем, что пользователь - администратор
    const isAdmin = user.email === 'agentgl007@gmail.com'
    if (!isAdmin) {
      router.push("/")
      return
    }
  }, [user, loading, isAuthenticated, router])

  const isAdmin = user?.email === 'agentgl007@gmail.com'

  if (loading) {
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
            Статистика БД
          </Button>
          <Button
            variant={activeTab === "tables" ? "default" : "outline"}
            onClick={() => setActiveTab("tables")}
            className={activeTab === "tables" ? "bg-orange-500 hover:bg-orange-600" : ""}
          >
            <Table className="h-4 w-4 mr-2" />
            Таблицы БД
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
          <div className="max-w-7xl mx-auto">
            <DatabaseStats />
          </div>
        )}

        {activeTab === "tables" && (
          <div className="max-w-7xl mx-auto">
            <DatabaseTables />
          </div>
        )}
      </div>
    </div>
  )
}
