import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  console.log('🔍 Auth Callback Route Handler - Processing...')
  console.log('Full URL:', requestUrl.href)
  console.log('Code parameter:', code ? 'Found' : 'Not found')

  if (code) {
    try {
      const supabase = createClient()
      
      console.log('🔄 Exchanging code for session...')
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('❌ Error exchanging code for session:', error)
        // Перенаправляем на страницу ошибки
        return NextResponse.redirect(new URL('/auth/error?message=' + encodeURIComponent(error.message), requestUrl.origin))
      }
      
      console.log('✅ Code exchanged for session successfully')
      console.log('User:', data.user?.email)
      
      // Перенаправляем на страницу сброса пароля
      return NextResponse.redirect(new URL('/auth/reset-password', requestUrl.origin))
      
    } catch (err) {
      console.error('❌ Exception in callback route:', err)
      return NextResponse.redirect(new URL('/auth/error?message=' + encodeURIComponent('Произошла ошибка при обработке ссылки'), requestUrl.origin))
    }
  }

  console.error('❌ No code parameter found in callback URL')
  return NextResponse.redirect(new URL('/auth/error?message=' + encodeURIComponent('Код авторизации отсутствует в ссылке'), requestUrl.origin))
}
