"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Database, 
  Users, 
  Heart, 
  Search, 
  CheckCircle, 
  Archive, 
  Settings,
  RefreshCw,
  TrendingUp,
  Calendar
} from 'lucide-react'

interface DatabaseStats {
  users: number
  pets: number
  activePets: number
  lostPets: number
  foundPets: number
  archivedPets: number
  appSettings: number
  totalSize: number
}

export default function DatabaseStats() {
  const [stats, setStats] = useState<DatabaseStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchStats = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/admin/database-stats')
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Ошибка загрузки статистики')
      }
      
      setStats(data)
      setLastUpdated(new Date())
    } catch (err: any) {
      console.error('Error fetching database stats:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Статистика базы данных</h2>
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Статистика базы данных</h2>
          <Button onClick={fetchStats} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Обновить
          </Button>
        </div>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 text-center">
            <div className="text-red-600 mb-2">⚠️ Ошибка загрузки статистики</div>
            <p className="text-red-500 text-sm mb-4">{error}</p>
            <Button onClick={fetchStats} variant="outline" size="sm">
              Попробовать снова
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Нет данных для отображения</p>
      </div>
    )
  }

  const successRate = stats.activePets > 0 ? Math.round((stats.foundPets / stats.activePets) * 100) : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Статистика базы данных</h2>
        <div className="flex items-center gap-2">
          {lastUpdated && (
            <span className="text-sm text-gray-500">
              Обновлено: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <Button onClick={fetchStats} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Обновить
          </Button>
        </div>
      </div>

      {/* Основная статистика */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Всего пользователей</p>
                <p className="text-2xl font-bold text-blue-600">{stats.users}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Всего объявлений</p>
                <p className="text-2xl font-bold text-green-600">{stats.pets}</p>
              </div>
              <Heart className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Активных объявлений</p>
                <p className="text-2xl font-bold text-orange-600">{stats.activePets}</p>
              </div>
              <Search className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Успешность поиска</p>
                <p className="text-2xl font-bold text-purple-600">{successRate}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Детальная статистика */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Search className="h-5 w-5 text-red-500" />
              Потерянные питомцы
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600 mb-2">{stats.lostPets}</div>
            <p className="text-sm text-gray-600">Активных объявлений о пропаже</p>
            <Badge variant="destructive" className="mt-2">
              Требуют внимания
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Найденные питомцы
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600 mb-2">{stats.foundPets}</div>
            <p className="text-sm text-gray-600">Питомцев, ожидающих хозяев</p>
            <Badge variant="default" className="mt-2 bg-green-500">
              Готовы к воссоединению
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Archive className="h-5 w-5 text-gray-500" />
              Архивные объявления
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-600 mb-2">{stats.archivedPets}</div>
            <p className="text-sm text-gray-600">Завершенных случаев</p>
            <Badge variant="secondary" className="mt-2">
              Успешно решены
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Системная информация */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-orange-500" />
            Системная информация
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-600">Настройки приложения</p>
              <p className="text-lg font-semibold">{stats.appSettings} записей</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">База данных</p>
              <p className="text-lg font-semibold">Supabase</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
