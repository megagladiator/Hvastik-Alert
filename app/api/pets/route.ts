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
    const { petData, userId, editId } = body

    // Генерируем UUID из NextAuth.js ID
    const generatedUserId = generateUserId(userId)

    const finalPetData = {
      ...petData,
      user_id: generatedUserId,
    }

    let data, error

    if (editId) {
      // Редактирование существующего объявления
      const { data: updateData, error: updateError } = await supabaseAdmin
        .from('pets')
        .update(finalPetData)
        .eq('id', editId)
        .eq('user_id', generatedUserId) // Проверяем, что пользователь владеет объявлением
        .select()

      data = updateData
      error = updateError
    } else {
      // Создание нового объявления
      const { data: insertData, error: insertError } = await supabaseAdmin
        .from('pets')
        .insert([finalPetData])
        .select()

      data = insertData
      error = insertError
    }

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
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
