import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { supabaseServer } from '@/lib/supabase-server'
import { getAuthUrl } from '@/lib/url-utils'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    if (!supabase) {
      return NextResponse.json({ error: 'Supabase not initialized' }, { status: 500 })
    }

    // Сначала проверяем существование пользователя через админ клиент
    if (supabaseServer) {
      const { data: userData, error: userError } = await supabaseServer.auth.admin.getUserByEmail(email)
      if (userError || !userData.user) {
        return NextResponse.json({ 
          error: 'Пользователь с таким email не зарегистрирован. Пожалуйста, пройдите регистрацию для доступа к личному кабинету сайта.' 
        }, { status: 404 })
      }
    }

    // Получаем URL для сброса пароля
    const resetUrl = getAuthUrl('/auth/reset-password', request)
    
    // Отправляем письмо для сброса пароля через обычный клиент
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: resetUrl,
    })
    
    console.log('Password reset request for:', email)
    console.log('Redirect URL:', resetUrl)

    if (error) {
      console.error('Error sending password reset email:', error)
      
      if (error.message.includes('User not found') || error.message.includes('not found')) {
        return NextResponse.json({ 
          error: 'Пользователь с таким email не зарегистрирован. Пожалуйста, пройдите регистрацию для доступа к личному кабинету сайта.' 
        }, { status: 404 })
      }
      
      if (error.message.includes('Invalid email')) {
        return NextResponse.json({ error: 'Неверный формат email' }, { status: 400 })
      }
      
      if (error.message.includes('Too many requests') || error.message.includes('rate limit')) {
        return NextResponse.json({ error: 'Слишком много запросов. Попробуйте позже' }, { status: 429 })
      }
      
      return NextResponse.json({ 
        error: 'Произошла ошибка при отправке письма для сброса пароля',
        details: error.message 
      }, { status: 500 })
    }

    return NextResponse.json({
      message: 'Ссылка для сброса пароля отправлена на email',
      success: true
    })

  } catch (error: any) {
    console.error('Error in forgot password API:', error)
    return NextResponse.json({ 
      error: 'Произошла ошибка при отправке письма для сброса пароля',
      details: error.message 
    }, { status: 500 })
  }
}
