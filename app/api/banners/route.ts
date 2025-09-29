import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export const dynamic = 'force-dynamic'

// GET - получить все активные баннеры
export async function GET(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Админский клиент Supabase не настроен' },
        { status: 500 }
      )
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const limit = searchParams.get('limit')
    const activeOnly = searchParams.get('activeOnly') !== 'false'

    let query = supabaseAdmin
      .from('banners')
      .select('*')
      .order('priority', { ascending: false })

    if (activeOnly) {
      const now = new Date().toISOString()
      query = query
        .eq('is_active', true)
        .lte('start_date', now)
        .gte('end_date', now)
    }

    if (type) {
      query = query.eq('type', type)
    }

    if (limit) {
      query = query.limit(parseInt(limit))
    }

    const { data: banners, error } = await query

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({ banners: banners || [] })
  } catch (error: any) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

// POST - создать новый баннер (только для админов)
export async function POST(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Админский клиент Supabase не настроен' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const {
      title,
      description,
      imageUrl,
      linkUrl,
      type,
      priority = 1,
      isActive = true,
      startDate,
      endDate,
      contactInfo,
      style
    } = body

    // Валидация обязательных полей
    if (!title || !description || !imageUrl || !type) {
      return NextResponse.json(
        { error: 'Обязательные поля: title, description, imageUrl, type' },
        { status: 400 }
      )
    }

    // Валидация типа
    const validTypes = ['veterinary', 'shelter', 'shop', 'service']
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: 'Неверный тип баннера. Доступные типы: ' + validTypes.join(', ') },
        { status: 400 }
      )
    }

    // Создание баннера
    const { data, error } = await supabaseAdmin
      .from('banners')
      .insert({
        title,
        description,
        image_url: imageUrl,
        link_url: linkUrl,
        type,
        priority,
        is_active: isActive,
        start_date: startDate || new Date().toISOString(),
        end_date: endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 дней по умолчанию
        contact_info: contactInfo,
        style: style
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({ banner: data })
  } catch (error: any) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
