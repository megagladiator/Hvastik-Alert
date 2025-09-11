"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Filter, X } from "lucide-react"
import { UserFilters, UserRole, UserStatus } from "@/types/user"

interface UserFiltersProps {
  filters: UserFilters
  onFiltersChange: (filters: UserFilters) => void
  onSearch: () => void
  onReset: () => void
}

export default function UserFiltersComponent({ 
  filters, 
  onFiltersChange, 
  onSearch, 
  onReset 
}: UserFiltersProps) {
  const [localFilters, setLocalFilters] = useState<UserFilters>(filters)

  const handleFilterChange = (key: keyof UserFilters, value: string) => {
    const newFilters = { ...localFilters, [key]: value }
    setLocalFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const handleSearch = () => {
    onSearch()
  }

  const handleReset = () => {
    const resetFilters: UserFilters = {
      search: '',
      role: 'all',
      status: 'all'
    }
    setLocalFilters(resetFilters)
    onFiltersChange(resetFilters)
    onReset()
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Фильтры и поиск
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Поиск по email */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Поиск по email
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Введите email пользователя..."
                value={localFilters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Фильтр по роли */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Роль
            </label>
            <Select
              value={localFilters.role}
              onValueChange={(value) => handleFilterChange('role', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Выберите роль" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все роли</SelectItem>
                <SelectItem value={UserRole.USER}>Пользователь</SelectItem>
                <SelectItem value={UserRole.ADMIN}>Администратор</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Фильтр по статусу */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Статус
            </label>
            <Select
              value={localFilters.status}
              onValueChange={(value) => handleFilterChange('status', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Выберите статус" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все статусы</SelectItem>
                <SelectItem value={UserStatus.ACTIVE}>Активные</SelectItem>
                <SelectItem value={UserStatus.BLOCKED}>Заблокированные</SelectItem>
                <SelectItem value={UserStatus.PENDING}>Ожидающие</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Кнопки действий */}
        <div className="flex gap-2 mt-4">
          <Button onClick={handleSearch} className="bg-orange-500 hover:bg-orange-600">
            <Search className="h-4 w-4 mr-2" />
            Поиск
          </Button>
          <Button variant="outline" onClick={handleReset}>
            <X className="h-4 w-4 mr-2" />
            Сбросить
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}


