import { supabase } from './supabase'
import { User, UserStats, UserFilters, UserRole, UserStatus } from '@/types/user'

export class UserAPI {
  // Получить список всех пользователей
  static async getUsers(filters?: UserFilters, page = 1, limit = 20): Promise<{ users: User[], total: number }> {
    try {
      // Простые демо-данные для тестирования
      const demoUsers: User[] = [
        {
          id: 'admin-1',
          email: 'agentgl007@gmail.com',
          created_at: '2024-01-01T10:00:00Z',
          last_sign_in: new Date().toISOString(),
          email_confirmed: true,
          status: UserStatus.ACTIVE,
          role: UserRole.ADMIN,
          pets_count: 5,
          chats_count: 12
        },
        {
          id: 'user-1',
          email: 'testuser1@gmail.com',
          created_at: '2024-01-02T11:00:00Z',
          last_sign_in: '2024-01-07T15:30:00Z',
          email_confirmed: true,
          status: UserStatus.ACTIVE,
          role: UserRole.USER,
          pets_count: 2,
          chats_count: 3
        },
        {
          id: 'user-2',
          email: 'testuser2@gmail.com',
          created_at: '2024-01-03T12:00:00Z',
          last_sign_in: '2024-01-06T14:20:00Z',
          email_confirmed: true,
          status: UserStatus.ACTIVE,
          role: UserRole.USER,
          pets_count: 1,
          chats_count: 1
        }
      ]

      // Применяем фильтры
      let filteredUsers = demoUsers

      if (filters?.search) {
        filteredUsers = filteredUsers.filter(user => 
          user.email.toLowerCase().includes(filters.search.toLowerCase())
        )
      }

      if (filters?.role && filters.role !== 'all') {
        filteredUsers = filteredUsers.filter(user => user.role === filters.role)
      }

      if (filters?.status && filters.status !== 'all') {
        filteredUsers = filteredUsers.filter(user => user.status === filters.status)
      }

      // Пагинация
      const startIndex = (page - 1) * limit
      const endIndex = startIndex + limit
      const paginatedUsers = filteredUsers.slice(startIndex, endIndex)

      return {
        users: paginatedUsers,
        total: filteredUsers.length
      }
    } catch (error) {
      console.error('Ошибка получения пользователей:', error)
      throw error
    }
  }

  // Получить статистику пользователей
  static async getUserStats(): Promise<UserStats> {
    try {
      // Демо-статистика
      const stats: UserStats = {
        total_users: 6,
        active_users: 5,
        blocked_users: 1,
        new_users_today: 0,
        new_users_this_week: 2,
        new_users_this_month: 6
      }

      return stats
    } catch (error) {
      console.error('Ошибка получения статистики:', error)
      throw error
    }
  }

  // Изменить роль пользователя
  static async updateUserRole(userId: string, role: UserRole): Promise<void> {
    try {
      // Демо-режим: симулируем изменение роли
      console.log(`[ДЕМО] Роль пользователя ${userId} изменена на ${role}`)
      
      // В реальном приложении здесь можно:
      // 1. Сохранить роль в отдельной таблице user_roles
      // 2. Или использовать user_metadata в Supabase
      // 3. Или использовать service role key для изменения через auth.admin
      
    } catch (error) {
      console.error('Ошибка изменения роли:', error)
      throw error
    }
  }

  // Заблокировать/разблокировать пользователя
  static async updateUserStatus(userId: string, status: UserStatus): Promise<void> {
    try {
      // Демо-режим: симулируем изменение статуса
      console.log(`[ДЕМО] Статус пользователя ${userId} изменен на ${status}`)
    } catch (error) {
      console.error('Ошибка изменения статуса:', error)
      throw error
    }
  }

  // Удалить пользователя
  static async deleteUser(userId: string): Promise<void> {
    try {
      // Демо-режим: симулируем удаление пользователя
      console.log(`[ДЕМО] Пользователь ${userId} удален`)
    } catch (error) {
      console.error('Ошибка удаления пользователя:', error)
      throw error
    }
  }
}
