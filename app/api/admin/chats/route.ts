import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Админский клиент Supabase не настроен' },
        { status: 500 }
      )
    }

    // Получаем все чаты (активные и архивированные)
    const { data: allChats, error } = await supabaseAdmin
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
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('Ошибка загрузки всех чатов:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    // Получаем email адреса пользователей
    const userIds = new Set<string>()
    allChats?.forEach(chat => {
      userIds.add(chat.user_id)
      userIds.add(chat.owner_id)
    })

    const userIdsArray = Array.from(userIds)
    const { data: users } = await supabaseAdmin.auth.admin.listUsers()
    
    const userEmailMap = new Map<string, string>()
    users?.users.forEach(user => {
      if (userIdsArray.includes(user.id)) {
        userEmailMap.set(user.id, user.email || 'Неизвестно')
      }
    })

    // Получаем последние сообщения для каждого чата
    const chatsWithMessages = await Promise.all(
      (allChats || []).map(async (chat) => {
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
          last_message: lastMessage || null,
          user_email: userEmailMap.get(chat.user_id) || 'Неизвестно',
          owner_email: userEmailMap.get(chat.owner_id) || 'Неизвестно'
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
