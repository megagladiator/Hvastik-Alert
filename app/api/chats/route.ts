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
    const { petId, userId, ownerId } = body

    if (!petId || !userId || !ownerId) {
      return NextResponse.json(
        { error: 'petId, userId и ownerId обязательны' },
        { status: 400 }
      )
    }

    // Проверяем, не существует ли уже чат для этой пары пользователей и питомца
    const { data: existingChat, error: checkError } = await supabaseAdmin
      .from('chats')
      .select('*')
      .eq('pet_id', petId)
      .eq('user_id', userId)
      .eq('owner_id', ownerId)
      .eq('status', 'active')
      .limit(1)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Ошибка проверки существующего чата:', checkError)
      return NextResponse.json(
        { error: checkError.message },
        { status: 400 }
      )
    }

    // Если чат уже существует, возвращаем его
    if (existingChat) {
      return NextResponse.json({ data: existingChat })
    }

    // Проверяем лимит чатов для пользователя (максимум 10 активных чатов)
    const { data: userChats, error: limitError } = await supabaseAdmin
      .from('chats')
      .select('id')
      .or(`user_id.eq.${userId},owner_id.eq.${userId}`)
      .eq('status', 'active')

    if (limitError) {
      console.error('Ошибка проверки лимита чатов:', limitError)
      return NextResponse.json(
        { error: limitError.message },
        { status: 400 }
      )
    }

    if (userChats && userChats.length >= 10) {
      return NextResponse.json(
        { error: 'Превышен лимит чатов. Максимум 10 активных чатов на пользователя.' },
        { status: 400 }
      )
    }

    // Создаем новый чат
    const { data: chat, error: chatError } = await supabaseAdmin
      .from('chats')
      .insert({
        pet_id: petId,
        user_id: userId,
        owner_id: ownerId,
        status: 'active'
      })
      .select()
      .single()

    if (chatError) {
      console.error('Ошибка создания чата:', chatError)
      return NextResponse.json(
        { error: chatError.message },
        { status: 400 }
      )
    }

    return NextResponse.json({ data: chat })
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
    const userId = searchParams.get('userId')
    const ownerId = searchParams.get('ownerId')

    if (!userId && !ownerId) {
      return NextResponse.json(
        { error: 'userId или ownerId обязательны' },
        { status: 400 }
      )
    }

    // Ищем только активные чаты где пользователь либо user_id, либо owner_id
    let query = supabaseAdmin
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
      .eq('status', 'active')
      .order('updated_at', { ascending: false })

    if (userId && ownerId) {
      query = query.or(`user_id.eq.${userId},owner_id.eq.${ownerId}`)
    } else if (userId) {
      query = query.or(`user_id.eq.${userId},owner_id.eq.${userId}`)
    } else if (ownerId) {
      query = query.or(`user_id.eq.${ownerId},owner_id.eq.${ownerId}`)
    }

    const { data: chats, error } = await query

    if (error) {
      console.error('Ошибка загрузки чатов:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    // Фильтруем чаты с активными питомцами
    const activeChats = chats?.filter(chat => 
      chat.pets && chat.pets.status === 'active'
    ) || []

    // Получаем последние сообщения для каждого чата
    const chatsWithMessages = await Promise.all(
      activeChats.map(async (chat) => {
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
