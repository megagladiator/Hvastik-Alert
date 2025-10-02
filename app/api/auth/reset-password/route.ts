import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Password reset API called')
    
    const body = await request.json()
    const { newPassword } = body

    console.log('🔍 Request body:', { newPassword: newPassword ? 'present' : 'missing' })

    if (!newPassword) {
      console.log('❌ No password provided')
      return NextResponse.json({ 
        error: 'Новый пароль обязателен' 
      }, { status: 400 })
    }

    if (newPassword.length < 6) {
      console.log('❌ Password too short')
      return NextResponse.json({ 
        error: 'Пароль должен содержать минимум 6 символов' 
      }, { status: 400 })
    }

    if (!supabase) {
      console.log('❌ Supabase not initialized')
      return NextResponse.json({ error: 'Supabase not initialized' }, { status: 500 })
    }

    console.log('✅ Supabase client available')
    
    // Проверяем переменные окружения
    console.log('🔍 Environment check:', {
      SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'present' : 'missing',
      SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'present' : 'missing'
    })

    // ПРОСТОЙ ПОДХОД: Пытаемся обновить пароль
    console.log('🔄 Updating password...')
    
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (updateError) {
        console.error('❌ Error updating password:', updateError)
        
        if (updateError.message.includes('session_not_found') || updateError.message.includes('invalid_grant')) {
          return NextResponse.json({ 
            error: 'Ссылка для сброса пароля недействительна или истекла. Пожалуйста, запросите новую ссылку.' 
          }, { status: 400 })
        }
        
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
    } catch (updateError: any) {
      console.error('❌ Exception updating password:', updateError)
      return NextResponse.json({ 
        error: 'Произошла ошибка при обновлении пароля',
        details: updateError.message 
      }, { status: 500 })
    }
    return NextResponse.json({
      message: 'Пароль успешно обновлен',
      success: true
    })

  } catch (error: any) {
    console.error('❌ Error in reset password API:', error)
    console.error('❌ Error stack:', error.stack)
    console.error('❌ Error details:', {
      message: error.message,
      name: error.name,
      cause: error.cause
    })
    
    return NextResponse.json({ 
      error: 'Произошла ошибка при сбросе пароля',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 })
  }
}

