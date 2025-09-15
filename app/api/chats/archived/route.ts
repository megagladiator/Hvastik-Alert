import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Админский клиент Supabase не настроен' },
        { status: 500 }
      )
    }

    // Получаем архивированные чаты
    const { data: archivedChats, error } = await supabaseAdmin
      .from('chats')
      .select(`
        *,
        pets!inner(
          id,
          name,
          breed,
          type,
          status
        )
      `)
      .eq('status', 'archived')
      .order('archived_at', { ascending: false })

    if (error) {
      console.error('Ошибка загрузки архивированных чатов:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    // Получаем последние сообщения для каждого чата
    const chatsWithMessages = await Promise.all(
      (archivedChats || []).map(async (chat) => {
        const { data: lastMessage } = await supabaseAdmin
          .from('messages')
          .select('text, created_at, sender_type')
          .eq('chat_id', chat.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        return {
          ...chat,
          pet: chat.pets,
          last_message: lastMessage || null
        }
      })
    )

    return NextResponse.json({ data: chatsWithMessages })
  } catch (error: any) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
