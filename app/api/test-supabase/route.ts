import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Testing Supabase connection...')
    
    // Проверяем переменные окружения
    const envCheck = {
      SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'present' : 'missing',
      SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'present' : 'missing',
      NODE_ENV: process.env.NODE_ENV
    }
    
    console.log('🔍 Environment variables:', envCheck)
    
    // Проверяем Supabase клиент
    const supabaseCheck = {
      isNull: supabase === null,
      isUndefined: supabase === undefined,
      hasAuth: supabase?.auth ? 'present' : 'missing',
      hasFrom: supabase?.from ? 'present' : 'missing'
    }
    
    console.log('🔍 Supabase client:', supabaseCheck)
    
    // Пытаемся сделать простой запрос
    let testResult = 'not attempted'
    if (supabase) {
      try {
        const { data, error } = await supabase.from('pets').select('count').limit(1)
        testResult = error ? `error: ${error.message}` : 'success'
      } catch (err: any) {
        testResult = `exception: ${err.message}`
      }
    }
    
    return NextResponse.json({
      success: true,
      environment: envCheck,
      supabase: supabaseCheck,
      testResult,
      message: 'Supabase test completed'
    })
    
  } catch (error: any) {
    console.error('❌ Error in Supabase test:', error)
    return NextResponse.json({ 
      error: 'Error testing Supabase',
      details: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}
