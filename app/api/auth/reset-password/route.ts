import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { newPassword } = body

    if (!newPassword) {
      return NextResponse.json({ 
        error: 'Новый пароль обязателен' 
      }, { status: 400 })
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ 
        error: 'Пароль должен содержать минимум 6 символов' 
      }, { status: 400 })
    }

    if (!supabase) {
      return NextResponse.json({ error: 'Supabase not initialized' }, { status: 500 })
    }

    // СТАНДАРТНЫЙ ПОДХОД SUPABASE: Просто обновляем пароль
    // Supabase автоматически проверит сессию

    // Обновляем пароль
    console.log('🔄 Updating password...')
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword
    })

    if (updateError) {
      console.error('Error updating password:', updateError)
      
      if (updateError.message.includes('Password should be at least')) {
        return NextResponse.json({ 
          error: 'Пароль слишком слабый. Используйте более сложный пароль' 
        }, { status: 400 })
      }
      
      return NextResponse.json({ 
        error: 'Произошла ошибка при обновлении пароля',
        details: updateError.message 
      }, { status: 500 })
    }

    console.log('✅ Password updated successfully')
    return NextResponse.json({
      message: 'Пароль успешно обновлен',
      success: true
    })

  } catch (error: any) {
    console.error('Error in reset password API:', error)
    return NextResponse.json({ 
      error: 'Произошла ошибка при сбросе пароля',
      details: error.message 
    }, { status: 500 })
  }
}

