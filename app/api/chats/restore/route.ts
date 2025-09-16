import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Админский клиент Supabase не настроен' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { chatId, userId, isOwner } = body

    if (!chatId || !userId) {
      return NextResponse.json(
        { error: 'chatId и userId обязательны' },
        { status: 400 }
      )
    }

    // Проверяем, что пользователь является владельцем объявления или администратором
    if (!isOwner) {
      return NextResponse.json(
        { error: 'Только владелец объявления или администратор может восстановить чат' },
        { status: 403 }
      )
    }

    // Восстанавливаем чат (администратор может восстанавливать любые чаты)
    const { data: restoredChat, error: restoreError } = await supabaseAdmin
      .from('chats')
      .update({
        status: 'active',
        archived_at: null,
        archived_by: null
      })
      .eq('id', chatId)
      .select()
      .single()

    if (restoreError) {
      console.error('Ошибка восстановления чата:', restoreError)
      return NextResponse.json(
        { error: restoreError.message },
        { status: 400 }
      )
    }

    if (!restoredChat) {
      return NextResponse.json(
        { error: 'Чат не найден или у вас нет прав для его восстановления' },
        { status: 404 }
      )
    }

    return NextResponse.json({ data: restoredChat })
  } catch (error: any) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
