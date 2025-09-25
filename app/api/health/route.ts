import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Проверяем переменные окружения
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: {
        supabaseUrl: !!supabaseUrl,
        supabaseServiceKey: !!supabaseServiceKey,
        supabaseAnonKey: !!supabaseAnonKey,
        nodeEnv: process.env.NODE_ENV
      }
    }

    return NextResponse.json(health)
  } catch (error: any) {
    return NextResponse.json(
      { 
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
