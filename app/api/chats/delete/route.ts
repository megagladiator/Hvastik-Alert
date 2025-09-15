import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function DELETE(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Админский клиент Supabase не настроен' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { chatId, userId, isAdmin } = body

    if (!chatId || !userId) {
      return NextResponse.json(
        { error: 'chatId и userId обязательны' },
        { status: 400 }
      )
    }

    // Проверяем, что пользователь является администратором
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Только администратор может удалять чаты' },
        { status: 403 }
      )
    }

    // Удаляем чат (сообщения удалятся автоматически из-за CASCADE)
    const { error: deleteError } = await supabaseAdmin
      .from('chats')
      .delete()
      .eq('id', chatId)

    if (deleteError) {
      console.error('Ошибка удаления чата:', deleteError)
      return NextResponse.json(
        { error: deleteError.message },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
