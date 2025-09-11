"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Users, 
  UserPlus, 
  UserCheck, 
  UserX, 
  Calendar,
  Loader2,
  RefreshCw
} from "lucide-react"
import { useUsers, User, UserFilters } from "@/hooks/use-user"
import UserCard from "./user-card"
import UserFiltersComponent from "./user-filters"
import { useToast } from "@/hooks/use-toast"

export default function UserList() {
  const [filters, setFilters] = useState<UserFilters>({
    email: '',
    role: 'all',
    status: 'all'
  })
  const { users, loading, error, refetch, createUser, updateUser, deleteUser } = useUsers(filters)
  const { toast } = useToast()

  // Статистика вычисляется из текущих пользователей
  const stats = {
    total_users: users.length,
    active_users: users.filter(u => u.status === 'active').length,
    blocked_users: users.filter(u => u.status === 'banned').length,
    new_users_this_month: users.filter(u => {
      const monthAgo = new Date()
      monthAgo.setMonth(monthAgo.getMonth() - 1)
      return new Date(u.createdAt) > monthAgo
    }).length
  }

  const handleFiltersChange = (newFilters: UserFilters) => {
    setFilters(newFilters)
  }

  const handleSearch = () => {
    refetch()
  }

  const handleReset = () => {
    setFilters({ email: '', role: 'all', status: 'all' })
  }

  const handleRoleChange = async (userId: string, role: 'admin' | 'user') => {
    try {
      await updateUser(userId, { role })
      toast({
        title: "Успешно",
        description: "Роль пользователя изменена"
      })
    } catch (error) {
      console.error('Ошибка изменения роли:', error)
      toast({
        title: "Ошибка",
        description: "Не удалось изменить роль пользователя",
        variant: "destructive"
      })
    }
  }

  const handleStatusChange = async (userId: string, status: 'active' | 'inactive' | 'banned') => {
    try {
      await updateUser(userId, { status })
      toast({
        title: "Успешно",
        description: `Пользователь ${status === 'banned' ? 'заблокирован' : 'разблокирован'}`
      })
    } catch (error) {
      console.error('Ошибка изменения статуса:', error)
      toast({
        title: "Ошибка",
        description: "Не удалось изменить статус пользователя",
        variant: "destructive"
      })
    }
  }

  const handleDelete = async (userId: string) => {
    try {
      await deleteUser(userId)
      toast({
        title: "Успешно",
        description: "Пользователь удален"
      })
    } catch (error) {
      console.error('Ошибка удаления пользователя:', error)
      toast({
        title: "Ошибка",
        description: "Не удалось удалить пользователя",
        variant: "destructive"
      })
    }
  }

  const handleRefresh = () => {
    refetch()
  }

  return (
    <div className="space-y-6">
      {/* Статистика */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Всего пользователей</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total_users}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Активные</p>
                  <p className="text-2xl font-bold text-green-600">{stats.active_users}</p>
                </div>
                <UserCheck className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Заблокированные</p>
                  <p className="text-2xl font-bold text-red-600">{stats.blocked_users}</p>
                </div>
                <UserX className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Новые за месяц</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.new_users_this_month}</p>
                </div>
                <UserPlus className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Фильтры */}
      <UserFiltersComponent
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onSearch={handleSearch}
        onReset={handleReset}
      />

      {/* Заголовок и кнопка обновления */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Пользователи</h2>
          <p className="text-gray-600">Управление пользователями системы</p>
        </div>
        <Button onClick={handleRefresh} variant="outline" disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Обновить
        </Button>
      </div>

      {/* Список пользователей */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          <span className="ml-2 text-gray-600">Загрузка пользователей...</span>
        </div>
      ) : users.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Пользователи не найдены</h3>
            <p className="text-gray-600">
              {filters.search || filters.role !== 'all' || filters.status !== 'all'
                ? 'Попробуйте изменить фильтры поиска'
                : 'В системе пока нет зарегистрированных пользователей'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              onRoleChange={handleRoleChange}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

    </div>
  )
}


