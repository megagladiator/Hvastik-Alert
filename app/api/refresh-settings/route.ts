import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, safeSupabaseAdmin } from '@/lib/supabase-admin'

export async function GET(request: NextRequest) {
  try {
    const client = supabaseAdmin || safeSupabaseAdmin
    
    // Получаем настройки приложения из базы данных
    const { data, error } = await client
      .from('app_settings')
      .select('*')
      .eq('id', 'default')
      .single()

    if (error) {
      console.error('Error fetching app settings:', error)
      // Возвращаем настройки по умолчанию
      return NextResponse.json({
        background_image_url: "/view-cats-dogs-showing-friendship (1) — копия.jpg",
        background_darkening_percentage: 30
      })
    }

    return NextResponse.json({
      background_image_url: data?.background_image_url || "/view-cats-dogs-showing-friendship (1) — копия.jpg",
      background_darkening_percentage: data?.background_darkening_percentage || 30
    })
  } catch (error: any) {
    console.error('API error:', error)
    return NextResponse.json({ 
      background_image_url: "/view-cats-dogs-showing-friendship (1) — копия.jpg",
      background_darkening_percentage: 30
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Этот API endpoint служит для уведомления о том, что настройки были обновлены
    return NextResponse.json({ 
      success: true, 
      message: 'Settings refresh signal sent',
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    console.error('API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
