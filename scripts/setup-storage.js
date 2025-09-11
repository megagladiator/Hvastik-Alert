const { createClient } = require('@supabase/supabase-js')

// Настройки Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Отсутствуют переменные окружения Supabase')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupStorage() {
  console.log('🔧 Настраиваем Supabase Storage...\n')

  try {
    // Создаем bucket для фотографий питомцев
    const { data: bucketData, error: bucketError } = await supabase.storage.createBucket('pet-photos', {
      public: true,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      fileSizeLimit: 5242880, // 5MB
    })

    if (bucketError) {
      if (bucketError.message.includes('already exists')) {
        console.log('✅ Bucket "pet-photos" уже существует')
      } else {
        console.error('❌ Ошибка создания bucket:', bucketError)
        return
      }
    } else {
      console.log('✅ Bucket "pet-photos" создан успешно')
    }

    // Получаем список bucket'ов для проверки
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()
    
    if (listError) {
      console.error('❌ Ошибка получения списка bucket\'ов:', listError)
      return
    }

    console.log('\n📦 Доступные bucket\'ы:')
    buckets.forEach(bucket => {
      console.log(`   - ${bucket.name} (публичный: ${bucket.public})`)
    })

    console.log('\n✅ Настройка Storage завершена!')
    console.log('📝 Теперь можно загружать изображения в bucket "pet-photos"')

  } catch (error) {
    console.error('❌ Общая ошибка:', error)
  }
}

setupStorage()
