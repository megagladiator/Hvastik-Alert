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
    const { chatId, senderId, senderType, text } = body

    if (!chatId || !senderId || !senderType || !text) {
      return NextResponse.json(
        { error: 'chatId, senderId, senderType и text обязательны' },
        { status: 400 }
      )
    }

    // Создаем сообщение
    const { data: message, error: messageError } = await supabaseAdmin
      .from('messages')
      .insert({
        chat_id: chatId,
        sender_id: senderId,
        sender_type: senderType,
        text: text,
      })
      .select()
      .single()

    if (messageError) {
      console.error('Ошибка создания сообщения:', messageError)
      return NextResponse.json(
        { error: messageError.message },
        { status: 400 }
      )
    }

    // Обновляем время последнего обновления чата
    const { error: updateError } = await supabaseAdmin
      .from('chats')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', chatId)

    if (updateError) {
      console.error('Ошибка обновления чата:', updateError)
      // Не блокируем отправку сообщения из-за этой ошибки
    }

    return NextResponse.json({ data: message })
  } catch (error: any) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Админский клиент Supabase не настроен' },
        { status: 500 }
      )
    }

    const { searchParams } = new URL(request.url)
    const chatId = searchParams.get('chatId')

    if (!chatId) {
      return NextResponse.json(
        { error: 'chatId обязателен' },
        { status: 400 }
      )
    }

    // Загружаем сообщения чата
    const { data: messages, error } = await supabaseAdmin
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Ошибка загрузки сообщений:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({ data: messages || [] })
  } catch (error: any) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
