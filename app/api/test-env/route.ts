import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Testing environment variables...')
    
    // Проверяем все переменные окружения
    const envCheck = {
      NODE_ENV: process.env.NODE_ENV,
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'present' : 'missing',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'present' : 'missing',
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'present' : 'missing',
      VERCEL_URL: process.env.VERCEL_URL,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL
    }
    
    console.log('🔍 Environment variables:', envCheck)
    
    // Проверяем, есть ли хотя бы базовые переменные
    const hasSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co'
    const hasSupabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== 'placeholder-key'
    
    const status = {
      hasSupabaseUrl,
      hasSupabaseKey,
      isConfigured: hasSupabaseUrl && hasSupabaseKey
    }
    
    console.log('🔍 Configuration status:', status)
    
    return NextResponse.json({
      success: true,
      environment: envCheck,
      status,
      message: 'Environment test completed'
    })
    
  } catch (error: any) {
    console.error('❌ Error in environment test:', error)
    return NextResponse.json({ 
      error: 'Error testing environment',
      details: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}
