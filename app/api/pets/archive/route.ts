import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Админский клиент Supabase не настроен' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { petId, userId, status } = body

    if (!petId || !userId || !status) {
      return NextResponse.json(
        { error: 'petId, userId и status обязательны' },
        { status: 400 }
      )
    }

    // Обновляем статус объявления
    const { data, error } = await supabaseAdmin
      .from('pets')
      .update({ status })
      .eq('id', petId)
      .eq('user_id', userId) // Проверяем, что пользователь владеет объявлением
      .select()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'Объявление не найдено или у вас нет прав для его изменения' },
        { status: 404 }
      )
    }

    return NextResponse.json({ data: data[0] })
  } catch (error: any) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
