import { supabase } from './supabase'

/**
 * Проверяет, существует ли пользователь с указанным email
 * @param email - Email для проверки
 * @returns Promise<boolean> - true если пользователь существует
 */
export async function checkUserExists(email: string): Promise<boolean> {
  try {
    // Используем метод resetPasswordForEmail - он не отправляет email если пользователь не существует
    // но возвращает ошибку если пользователь не найден
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://hvostikalert.ru/auth/reset-password'
    })

    // Если ошибка содержит "User not found" - пользователь не существует
    if (error && error.message.includes('User not found')) {
      return false
    }

    // Если нет ошибки или ошибка другая - пользователь существует
    return true
  } catch (error) {
    console.error('Ошибка при проверке пользователя:', error)
    return false
  }
}

/**
 * Проверяет, может ли пользователь войти в систему (существует и активен)
 * @param email - Email пользователя
 * @param password - Пароль пользователя
 * @returns Promise<{exists: boolean, canLogin: boolean, error?: string}>
 */
export async function checkUserLogin(email: string, password: string): Promise<{
  exists: boolean
  canLogin: boolean
  error?: string
}> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      if (error.message.includes('Email not confirmed')) {
        return { exists: true, canLogin: false, error: 'Email не подтвержден' }
      } else if (error.message.includes('Invalid login credentials')) {
        return { exists: false, canLogin: false, error: 'Неверные данные' }
      } else {
        return { exists: false, canLogin: false, error: error.message }
      }
    }

    // Если вход успешен, выходим из системы
    await supabase.auth.signOut()
    
    return { exists: true, canLogin: true }
  } catch (error: any) {
    return { exists: false, canLogin: false, error: error.message }
  }
}

