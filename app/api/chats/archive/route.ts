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

    // Проверяем, что пользователь является владельцем объявления
    if (!isOwner) {
      return NextResponse.json(
        { error: 'Только владелец объявления может архивировать чат' },
        { status: 403 }
      )
    }

    // Архивируем чат
    const { data: archivedChat, error: archiveError } = await supabaseAdmin
      .from('chats')
      .update({
        status: 'archived',
        archived_at: new Date().toISOString(),
        archived_by: userId
      })
      .eq('id', chatId)
      .eq('owner_id', userId)
      .select()
      .single()

    if (archiveError) {
      console.error('Ошибка архивирования чата:', archiveError)
      return NextResponse.json(
        { error: archiveError.message },
        { status: 400 }
      )
    }

    if (!archivedChat) {
      return NextResponse.json(
        { error: 'Чат не найден или у вас нет прав для его архивирования' },
        { status: 404 }
      )
    }

    return NextResponse.json({ data: archivedChat })
  } catch (error: any) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
