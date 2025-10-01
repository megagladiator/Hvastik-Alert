import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { accessToken, refreshToken, newPassword } = body

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

    // Если переданы токены, устанавливаем сессию
    if (accessToken && refreshToken && accessToken !== 'session-based') {
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      })

      if (sessionError) {
        console.error('Error setting session:', sessionError)
        return NextResponse.json({ 
          error: 'Ссылка для сброса пароля недействительна или истекла' 
        }, { status: 400 })
      }
    }

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

