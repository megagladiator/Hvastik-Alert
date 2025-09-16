import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { v5 as uuidv5 } from 'uuid'

// Функция для генерации UUID из NextAuth.js ID
const generateUserId = (nextAuthId: string | undefined): string | null => {
  if (!nextAuthId) return null
  const namespace = '6ba7b810-9dad-11d1-80b4-00c04fd430c8'
  return uuidv5(nextAuthId, namespace)
}

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

    // Генерируем UUID из NextAuth.js ID
    const generatedUserId = generateUserId(userId)

    // Обновляем статус объявления
    const { data, error } = await supabaseAdmin
      .from('pets')
      .update({ status })
      .eq('id', petId)
      .eq('user_id', generatedUserId) // Проверяем, что пользователь владеет объявлением
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
