/**
 * ТЕСТ МОКОВ SUPABASE
 * 
 * Проверяем, что моки Supabase работают корректно
 */

import { createClient } from '@/lib/supabase/client'

describe('🔧 Тест моков Supabase', () => {
  test('✅ Создание клиента Supabase', () => {
    const supabase = createClient()
    
    expect(supabase).toBeDefined()
    expect(supabase.auth).toBeDefined()
    expect(supabase.auth.resetPasswordForEmail).toBeDefined()
    expect(supabase.auth.exchangeCodeForSession).toBeDefined()
    expect(supabase.auth.updateUser).toBeDefined()
    expect(supabase.auth.signOut).toBeDefined()
    expect(supabase.auth.getSession).toBeDefined()
  })

  test('✅ Мок функции resetPasswordForEmail', async () => {
    const supabase = createClient()
    
    // Настраиваем мок
    const mockResult = { data: {}, error: null }
    ;(supabase.auth.resetPasswordForEmail as jest.Mock).mockResolvedValue(mockResult)
    
    const result = await supabase.auth.resetPasswordForEmail('test@example.com')
    
    expect(result).toEqual(mockResult)
    expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith('test@example.com')
  })

  test('✅ Мок функции updateUser', async () => {
    const supabase = createClient()
    
    // Настраиваем мок
    const mockResult = { data: { user: { id: '123' } }, error: null }
    ;(supabase.auth.updateUser as jest.Mock).mockResolvedValue(mockResult)
    
    const result = await supabase.auth.updateUser({ password: 'newpassword' })
    
    expect(result).toEqual(mockResult)
    expect(supabase.auth.updateUser).toHaveBeenCalledWith({ password: 'newpassword' })
  })

  test('✅ Мок функции getSession', async () => {
    const supabase = createClient()
    
    // Настраиваем мок
    const mockResult = { data: { session: null }, error: null }
    ;(supabase.auth.getSession as jest.Mock).mockResolvedValue(mockResult)
    
    const result = await supabase.auth.getSession()
    
    expect(result).toEqual(mockResult)
    expect(supabase.auth.getSession).toHaveBeenCalled()
  })
})
