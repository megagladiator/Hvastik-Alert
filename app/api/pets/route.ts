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

    // Используем userId напрямую (это уже Supabase user.id)
    const finalPetData = {
      ...petData,
      user_id: userId, // Используем Supabase user.id напрямую
    }

    console.log('📝 API: Сохранение объявления:', {
      editId: editId,
      finalPetData: finalPetData,
      photo_url: finalPetData.photo_url
    })

    let data, error

    if (editId) {
      // Редактирование существующего объявления
      // Для админов разрешаем редактирование любых объявлений
      const { data: updateData, error: updateError } = await supabaseAdmin
        .from('pets')
        .update(finalPetData)
        .eq('id', editId)
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

    // Если это новое объявление (не редактирование), отправляем уведомление админу
    if (!editId && data && data[0]) {
      try {
        // Получаем email пользователя из запроса
        const userEmail = body.userEmail || null
        
        // Отправляем уведомление админу
        const notifyResponse = await fetch(`${request.nextUrl.origin}/api/admin/notify-new-pet`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            petData: data[0],
            userEmail: userEmail
          })
        })

        if (!notifyResponse.ok) {
          console.error('Failed to notify admin:', await notifyResponse.text())
        } else {
          console.log('Admin notification sent successfully')
        }
      } catch (notifyError) {
        console.error('Error sending admin notification:', notifyError)
        // Не блокируем создание объявления из-за ошибки уведомления
      }
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
