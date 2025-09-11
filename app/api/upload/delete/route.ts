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
    const { fileName } = body

    if (!fileName) {
      return NextResponse.json(
        { error: 'Имя файла не указано' },
        { status: 400 }
      )
    }

    // Удаляем файл из Supabase Storage
    const { error } = await supabaseAdmin.storage
      .from('pet-photos')
      .remove([fileName])

    if (error) {
      console.error('Supabase Storage error:', error)
      return NextResponse.json(
        { error: 'Ошибка при удалении файла' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true,
      message: 'Файл успешно удален'
    })

  } catch (error: any) {
    console.error('Delete error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
