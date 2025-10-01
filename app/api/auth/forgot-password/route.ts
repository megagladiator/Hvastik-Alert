import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { supabaseServer } from '@/lib/supabase-server'
import { getAuthUrl } from '@/lib/url-utils'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    console.log('🔍 Forgot password request for:', email)
    console.log('🔍 Supabase client:', !!supabase)
    console.log('🔍 Supabase server client:', !!supabaseServer)
    console.log('🔍 Environment check:')
    console.log('  - NEXT_PUBLIC_SUPABASE_URL:', !!process.env.NEXT_PUBLIC_SUPABASE_URL)
    console.log('  - NEXT_PUBLIC_SUPABASE_ANON_KEY:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    console.log('  - SUPABASE_SERVICE_ROLE_KEY:', !!process.env.SUPABASE_SERVICE_ROLE_KEY)

    if (!email) {
      console.error('❌ Email is required')
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    if (!supabase) {
      console.error('❌ Supabase client is null')
      return NextResponse.json({ error: 'Supabase not initialized' }, { status: 500 })
    }

    // Пропускаем проверку пользователя через admin API, так как она может не работать
    // Supabase сам вернет ошибку, если пользователь не найден
    console.log('🔍 Skipping user existence check via admin API')

    // Получаем URL для сброса пароля через callback
    let resetUrl = getAuthUrl('/auth/callback', request)
    
    // Принудительно используем продакшен URL если это не localhost
    if (!resetUrl.includes('localhost') && !resetUrl.includes('127.0.0.1')) {
      resetUrl = 'https://hvostikalert.ru/auth/callback'
    }
    
    console.log('🔗 Reset URL:', resetUrl)
    console.log('🔍 Environment check:', {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL_URL: process.env.VERCEL_URL,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL
    })
    console.log('🔍 Request headers:', {
      origin: request.headers.get('origin'),
      host: request.headers.get('host'),
      'x-forwarded-proto': request.headers.get('x-forwarded-proto'),
      'x-forwarded-host': request.headers.get('x-forwarded-host')
    })
    
    // Отправляем письмо для сброса пароля через обычный клиент
    console.log('📧 Sending password reset email...')
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: resetUrl,
    })
    
    console.log('📧 Password reset request result:', { email, resetUrl, error: error?.message })

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
    console.error('❌ Error in forgot password API:', error)
    console.error('❌ Error stack:', error.stack)
    return NextResponse.json({ 
      error: 'Произошла ошибка при отправке письма для сброса пароля',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 })
  }
}

