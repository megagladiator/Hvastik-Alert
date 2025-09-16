import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(request: NextRequest) {
  try {
    console.log('=== API /api/chats/archive ===')
    
    if (!supabaseAdmin) {
      console.error('Supabase admin client не настроен')
      return NextResponse.json(
        { error: 'Админский клиент Supabase не настроен' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { chatId, userId, isOwner } = body
    
    console.log('Полученные данные:', { chatId, userId, isOwner })

    if (!chatId || !userId) {
      console.error('Отсутствуют обязательные поля:', { chatId, userId })
      return NextResponse.json(
        { error: 'chatId и userId обязательны' },
        { status: 400 }
      )
    }

    // Проверяем, что пользователь является владельцем объявления или администратором
    if (!isOwner) {
      return NextResponse.json(
        { error: 'Только владелец объявления или администратор может архивировать чат' },
        { status: 403 }
      )
    }

    // Архивируем чат (администратор может архивировать любые чаты)
    console.log('Выполняем архивирование чата:', chatId)
    
    const { data: archivedChat, error: archiveError } = await supabaseAdmin
      .from('chats')
      .update({
        status: 'archived',
        archived_at: new Date().toISOString(),
        archived_by: userId
      })
      .eq('id', chatId)
      .select()
      .single()

    console.log('Результат архивирования:', { archivedChat, archiveError })

    if (archiveError) {
      console.error('Ошибка архивирования чата:', archiveError)
      return NextResponse.json(
        { error: archiveError.message },
        { status: 400 }
      )
    }

    if (!archivedChat) {
      console.error('Чат не найден после архивирования')
      return NextResponse.json(
        { error: 'Чат не найден или у вас нет прав для его архивирования' },
        { status: 404 }
      )
    }

    console.log('Чат успешно архивирован:', archivedChat)
    return NextResponse.json({ success: true, data: archivedChat })
  } catch (error: any) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
