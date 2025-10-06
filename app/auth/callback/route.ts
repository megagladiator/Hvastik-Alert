import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Принудительно делаем route динамическим
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const token = requestUrl.searchParams.get('token')
  const type = requestUrl.searchParams.get('type')

  console.log('🔍 Auth Callback Route Handler - Processing...')
  console.log('Full URL:', requestUrl.href)
  console.log('Parameters:', { code: code ? 'Found' : 'Not found', token: token ? 'Found' : 'Not found', type })

  // Обработка PKCE flow (code parameter)
  if (code) {
    try {
      const supabase = createClient()
      
      console.log('🔄 Exchanging code for session (PKCE flow)...')
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('❌ Error exchanging code for session:', error)
        return NextResponse.redirect(new URL('/auth/error?message=' + encodeURIComponent(error.message), requestUrl.origin))
      }
      
      console.log('✅ Code exchanged for session successfully')
      console.log('User:', data.user?.email)
      
      // ИСПРАВЛЕНО: Перенаправляем на страницу сброса пароля с правильным URL
      return NextResponse.redirect(new URL('/auth/reset-password', requestUrl.origin))
      
    } catch (err) {
      console.error('❌ Exception in callback route:', err)
      return NextResponse.redirect(new URL('/auth/error?message=' + encodeURIComponent('Произошла ошибка при обработке ссылки'), requestUrl.origin))
    }
  }

  // Обработка Recovery/Magic Link flow (token parameter)
  if (token && type) {
    try {
      const supabase = createClient()
      
      console.log('🔄 Verifying token with type:', type)
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: type as any
      })
      
      if (error) {
        console.error('❌ Error verifying token:', error)
        return NextResponse.redirect(new URL('/auth/error?message=' + encodeURIComponent(error.message), requestUrl.origin))
      }
      
      console.log('✅ Token verified successfully')
      console.log('User:', data.user?.email)
      console.log('Token type:', type)
      
      // ИСПРАВЛЕНО: Перенаправляем на страницу сброса пароля с правильным URL
      return NextResponse.redirect(new URL('/auth/reset-password', requestUrl.origin))
      
    } catch (err) {
      console.error('❌ Exception verifying token:', err)
      return NextResponse.redirect(new URL('/auth/error?message=' + encodeURIComponent('Произошла ошибка при обработке ссылки'), requestUrl.origin))
    }
  }

  console.error('❌ No valid parameters found in callback URL')
  return NextResponse.redirect(new URL('/auth/error?message=' + encodeURIComponent('Неверная ссылка для сброса пароля'), requestUrl.origin))
}
