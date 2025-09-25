"use client"

import { useState, useEffect } from 'react'
import { useUserManagement } from '../hooks/use-user-management'
import { User, UserFilters } from '../types'

interface UserListProps {
  className?: string
  showFilters?: boolean
  onUserSelect?: (user: User) => void
}

export function UserList({ className = "", showFilters = true, onUserSelect }: UserListProps) {
  const [filters, setFilters] = useState<UserFilters>({})
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  
  const { 
    users, 
    loading, 
    error, 
    fetchUsers, 
    deleteUser, 
    verifyUser, 
    suspendUser, 
    activateUser,
    clearError 
  } = useUserManagement()

  useEffect(() => {
    fetchUsers(filters)
  }, [filters])

  const handleFilterChange = (field: keyof UserFilters) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFilters(prev => ({
      ...prev,
      [field]: e.target.value || undefined
    }))
  }

  const handleUserAction = async (action: string, userId: string) => {
    try {
      switch (action) {
        case 'delete':
          if (confirm('Вы уверены, что хотите удалить этого пользователя?')) {
            await deleteUser(userId)
          }
          break
        case 'verify':
          await verifyUser(userId)
          break
        case 'suspend':
          await suspendUser(userId)
          break
        case 'activate':
          await activateUser(userId)
          break
      }
    } catch (error) {
      console.error('User action failed:', error)
    }
  }

  const handleUserClick = (user: User) => {
    setSelectedUser(user)
    onUserSelect?.(user)
  }

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800'
    }
    
    const statusLabels = {
      active: 'Активен',
      inactive: 'Заблокирован',
      pending: 'Ожидает'
    }

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusClasses[status as keyof typeof statusClasses]}`}>
        {statusLabels[status as keyof typeof statusLabels]}
      </span>
    )
  }

  const getRoleBadge = (role: string) => {
    const roleClasses = {
      admin: 'bg-purple-100 text-purple-800',
      user: 'bg-blue-100 text-blue-800'
    }

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${roleClasses[role as keyof typeof roleClasses]}`}>
        {role === 'admin' ? 'Администратор' : 'Пользователь'}
      </span>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {showFilters && (
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">Фильтры</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Поиск
              </label>
              <input
                type="text"
                value={filters.search || ''}
                onChange={handleFilterChange('search')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Поиск по email или имени"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Роль
              </label>
              <select
                value={filters.role || ''}
                onChange={handleFilterChange('role')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Все роли</option>
                <option value="admin">Администратор</option>
                <option value="user">Пользователь</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Статус
              </label>
              <select
                value={filters.status || ''}
                onChange={handleFilterChange('status')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Все статусы</option>
                <option value="active">Активен</option>
                <option value="inactive">Заблокирован</option>
                <option value="pending">Ожидает</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <button
                onClick={() => setFilters({})}
                className="w-full px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
              >
                Сбросить
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          <div className="flex justify-between items-center">
            <span>{error.message}</span>
            <button onClick={clearError} className="text-red-500 hover:text-red-700">
              ✕
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium">Пользователи ({users.length})</h3>
        </div>

        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">Загрузка пользователей...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            Пользователи не найдены
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Пользователь
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Роль
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Статус
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Дата регистрации
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr 
                    key={user.id} 
                    className={`hover:bg-gray-50 cursor-pointer ${selectedUser?.id === user.id ? 'bg-blue-50' : ''}`}
                    onClick={() => handleUserClick(user)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {user.profile?.first_name && user.profile?.last_name 
                            ? `${user.profile.first_name} ${user.profile.last_name}`
                            : user.email
                          }
                        </div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(user.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString('ru-RU')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {user.status === 'pending' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleUserAction('verify', user.id)
                            }}
                            className="text-green-600 hover:text-green-900"
                          >
                            Подтвердить
                          </button>
                        )}
                        {user.status === 'active' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleUserAction('suspend', user.id)
                            }}
                            className="text-yellow-600 hover:text-yellow-900"
                          >
                            Заблокировать
                          </button>
                        )}
                        {user.status === 'inactive' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleUserAction('activate', user.id)
                            }}
                            className="text-green-600 hover:text-green-900"
                          >
                            Активировать
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleUserAction('delete', user.id)
                          }}
                          className="text-red-600 hover:text-red-900"
                        >
                          Удалить
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default UserList



