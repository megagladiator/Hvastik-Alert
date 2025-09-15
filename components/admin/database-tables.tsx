"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  Database, 
  Edit, 
  Trash2, 
  Eye, 
  RefreshCw,
  Search,
  Filter,
  Plus
} from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Pet {
  id: string
  type: 'lost' | 'found'
  animal_type: string
  breed: string
  name: string
  description: string
  color: string
  location: string
  latitude: number
  longitude: number
  contact_phone: string
  contact_name: string
  reward?: number
  photo_url?: string
  created_at: string
  status: 'active' | 'found' | 'archived'
  user_id?: string
  user_email?: string
}

interface User {
  id: string
  email: string
  email_confirmed_at?: string
  created_at: string
  last_sign_in_at?: string
  user_metadata?: any
}

interface AppSetting {
  id: string
  background_image_url?: string
  background_darkening_percentage?: number
  updated_at: string
}

export default function DatabaseTables() {
  const [activeTable, setActiveTable] = useState<'pets' | 'users' | 'settings'>('pets')
  const [pets, setPets] = useState<Pet[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [settings, setSettings] = useState<AppSetting[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [userFilter, setUserFilter] = useState('all')
  const [sortBy, setSortBy] = useState<'created_at' | 'name' | 'user_email'>('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const router = useRouter()

  const fetchData = async (table: string) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/admin/database-tables?table=${table}`)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Ошибка загрузки данных')
      }
      
      switch (table) {
        case 'pets':
          setPets(data.data || [])
          break
        case 'users':
          setUsers(data.data || [])
          break
        case 'settings':
          setSettings(data.data || [])
          break
      }
    } catch (err: any) {
      console.error(`Error fetching ${table}:`, err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const deleteRecord = async (table: string, id: string) => {
    if (!confirm('Вы уверены, что хотите удалить эту запись?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/database-tables`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ table, id })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Ошибка удаления')
      }

      // Обновляем данные после удаления
      fetchData(activeTable)
      alert('Запись успешно удалена!')
    } catch (err: any) {
      console.error('Error deleting record:', err)
      alert(`Ошибка удаления: ${err.message}`)
    }
  }

  const updateRecord = async (table: string, id: string, data: any) => {
    try {
      const response = await fetch(`/api/admin/database-tables`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ table, id, data })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Ошибка обновления')
      }

      // Обновляем данные после изменения
      fetchData(activeTable)
      alert('Запись успешно обновлена!')
    } catch (err: any) {
      console.error('Error updating record:', err)
      alert(`Ошибка обновления: ${err.message}`)
    }
  }

  useEffect(() => {
    fetchData(activeTable)
  }, [activeTable])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ru-RU')
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">Активно</Badge>
      case 'archived':
        return <Badge className="bg-gray-500">Архив</Badge>
      case 'found':
        return <Badge className="bg-blue-500">Найден</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'lost':
        return <Badge className="bg-red-500">Потерялся</Badge>
      case 'found':
        return <Badge className="bg-green-500">Найден</Badge>
      default:
        return <Badge variant="secondary">{type}</Badge>
    }
  }

  const filteredPets = pets
    .filter(pet => {
      // Поиск по тексту
      const matchesSearch = pet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pet.breed.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pet.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pet.contact_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (pet.user_email && pet.user_email.toLowerCase().includes(searchTerm.toLowerCase()))
      
      // Фильтр по пользователю
      const matchesUser = userFilter === 'all' || 
        (userFilter === 'anonymous' && !pet.user_id) ||
        (userFilter === 'registered' && pet.user_id) ||
        (userFilter !== 'all' && userFilter !== 'anonymous' && userFilter !== 'registered' && pet.user_id === userFilter)
      
      return matchesSearch && matchesUser
    })
    .sort((a, b) => {
      let aValue, bValue
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        case 'user_email':
          aValue = a.user_email || ''
          bValue = b.user_email || ''
          break
        case 'created_at':
        default:
          aValue = new Date(a.created_at).getTime()
          bValue = new Date(b.created_at).getTime()
          break
      }
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Управление базой данных</h2>
        <div className="flex items-center gap-2">
          <Button onClick={() => fetchData(activeTable)} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Обновить
          </Button>
        </div>
      </div>

      {/* Навигация по таблицам */}
      <div className="flex gap-2">
        <Button
          variant={activeTable === 'pets' ? 'default' : 'outline'}
          onClick={() => setActiveTable('pets')}
          className={activeTable === 'pets' ? 'bg-orange-500 hover:bg-orange-600' : ''}
        >
          <Database className="h-4 w-4 mr-2" />
          Объявления ({pets.length})
        </Button>
        <Button
          variant={activeTable === 'users' ? 'default' : 'outline'}
          onClick={() => setActiveTable('users')}
          className={activeTable === 'users' ? 'bg-orange-500 hover:bg-orange-600' : ''}
        >
          <Database className="h-4 w-4 mr-2" />
          Пользователи ({users.length})
        </Button>
        <Button
          variant={activeTable === 'settings' ? 'default' : 'outline'}
          onClick={() => setActiveTable('settings')}
          className={activeTable === 'settings' ? 'bg-orange-500 hover:bg-orange-600' : ''}
        >
          <Database className="h-4 w-4 mr-2" />
          Настройки ({settings.length})
        </Button>
      </div>

      {/* Поиск и фильтры */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-gray-500" />
          <Input
            placeholder={`Поиск в ${activeTable === 'pets' ? 'объявлениях' : activeTable === 'users' ? 'пользователях' : 'настройках'}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>

        {activeTable === 'pets' && (
          <>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={userFilter}
                onChange={(e) => setUserFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">Все пользователи</option>
                <option value="registered">Зарегистрированные</option>
                <option value="anonymous">Анонимные</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.email}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Сортировка:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="created_at">По дате</option>
                <option value="name">По имени</option>
                <option value="user_email">По пользователю</option>
              </select>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </Button>
            </div>
          </>
        )}
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4 text-center">
            <div className="text-red-600 mb-2">⚠️ Ошибка загрузки данных</div>
            <p className="text-red-500 text-sm">{error}</p>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка данных...</p>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-orange-500" />
              {activeTable === 'pets' && `Объявления (${filteredPets.length})`}
              {activeTable === 'users' && `Пользователи (${filteredUsers.length})`}
              {activeTable === 'settings' && `Настройки (${settings.length})`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeTable === 'pets' && (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Тип</TableHead>
                      <TableHead>Имя</TableHead>
                      <TableHead>Порода</TableHead>
                      <TableHead>Местоположение</TableHead>
                      <TableHead>Пользователь</TableHead>
                      <TableHead>Статус</TableHead>
                      <TableHead>Создано</TableHead>
                      <TableHead>Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPets.map((pet) => (
                      <TableRow key={pet.id}>
                        <TableCell className="font-mono text-xs">{pet.id.slice(0, 8)}...</TableCell>
                        <TableCell>{getTypeBadge(pet.type)}</TableCell>
                        <TableCell className="font-medium">{pet.name}</TableCell>
                        <TableCell>{pet.breed}</TableCell>
                        <TableCell>{pet.location}</TableCell>
                        <TableCell>
                          {pet.user_id ? (
                            <div className="text-sm">
                              <div className="font-mono text-xs text-gray-500">
                                {pet.user_id.slice(0, 8)}...
                              </div>
                              <div className="text-gray-600">
                                {pet.user_email || 'Неизвестно'}
                              </div>
                            </div>
                          ) : (
                            <Badge variant="secondary">Анонимно</Badge>
                          )}
                        </TableCell>
                        <TableCell>{getStatusBadge(pet.status)}</TableCell>
                        <TableCell className="text-sm">{formatDate(pet.created_at)}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => router.push(`/pet/${pet.id}`)}
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => router.push(`/add?id=${pet.id}&from=admin`)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => deleteRecord('pets', pet.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {activeTable === 'users' && (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Подтвержден</TableHead>
                      <TableHead>Создан</TableHead>
                      <TableHead>Последний вход</TableHead>
                      <TableHead>Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-mono text-xs">{user.id.slice(0, 8)}...</TableCell>
                        <TableCell className="font-medium">{user.email}</TableCell>
                        <TableCell>
                          {user.email_confirmed_at ? (
                            <Badge className="bg-green-500">Да</Badge>
                          ) : (
                            <Badge className="bg-red-500">Нет</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">{formatDate(user.created_at)}</TableCell>
                        <TableCell className="text-sm">
                          {user.last_sign_in_at ? formatDate(user.last_sign_in_at) : 'Никогда'}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => deleteRecord('users', user.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {activeTable === 'settings' && (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Фоновое изображение</TableHead>
                      <TableHead>Затемнение (%)</TableHead>
                      <TableHead>Обновлено</TableHead>
                      <TableHead>Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {settings.map((setting) => (
                      <TableRow key={setting.id}>
                        <TableCell className="font-mono text-xs">{setting.id.slice(0, 8)}...</TableCell>
                        <TableCell className="max-w-xs truncate">
                          {setting.background_image_url || 'Не задано'}
                        </TableCell>
                        <TableCell>{setting.background_darkening_percentage || 0}%</TableCell>
                        <TableCell className="text-sm">{formatDate(setting.updated_at)}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => router.push('/admin?tab=settings')}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
