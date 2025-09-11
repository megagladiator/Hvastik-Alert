import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(request: NextRequest) {
  try {
    console.log('📤 Получен запрос на загрузку файла')
    
    if (!supabaseAdmin) {
      console.error('❌ Админский клиент Supabase не настроен')
      return NextResponse.json(
        { error: 'Админский клиент Supabase не настроен' },
        { status: 500 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    console.log('📁 Файл получен:', {
      name: file?.name,
      type: file?.type,
      size: file?.size
    })

    if (!file) {
      console.error('❌ Файл не найден в запросе')
      return NextResponse.json(
        { error: 'Файл не найден' },
        { status: 400 }
      )
    }

    // Проверяем тип файла
    if (!file.type || !file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Поддерживаются только изображения' },
        { status: 400 }
      )
    }

    // Проверяем размер файла (максимум 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Размер файла не должен превышать 5MB' },
        { status: 400 }
      )
    }

    // Генерируем уникальное имя файла
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const fileExtension = file.name.split('.').pop()
    const fileName = `pet-${timestamp}-${randomString}.${fileExtension}`

    // Конвертируем файл в ArrayBuffer
    const arrayBuffer = await file.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)

    // Проверяем, существует ли bucket, если нет - создаем
    const { data: buckets } = await supabaseAdmin.storage.listBuckets()
    const bucketExists = buckets?.some(bucket => bucket.name === 'pet-photos')
    
    if (!bucketExists) {
      console.log('📦 Создаем bucket "pet-photos"...')
      const { error: bucketError } = await supabaseAdmin.storage.createBucket('pet-photos', {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        fileSizeLimit: 5242880, // 5MB
      })
      
      if (bucketError) {
        console.error('❌ Ошибка создания bucket:', bucketError)
        return NextResponse.json(
          { error: 'Ошибка создания хранилища' },
          { status: 500 }
        )
      }
      console.log('✅ Bucket "pet-photos" создан')
    }

    // Загружаем файл в Supabase Storage
    const { data, error } = await supabaseAdmin.storage
      .from('pet-photos')
      .upload(fileName, uint8Array, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('❌ Supabase Storage error:', error)
      return NextResponse.json(
        { error: `Ошибка при загрузке файла: ${error.message}` },
        { status: 500 }
      )
    }

    console.log('✅ Файл загружен в Storage:', data)

    // Получаем публичный URL
    const { data: urlData } = supabaseAdmin.storage
      .from('pet-photos')
      .getPublicUrl(fileName)

    return NextResponse.json({ 
      success: true,
      fileName: data.path,
      url: urlData.publicUrl
    })

  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
