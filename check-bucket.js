const { createClient } = require('@supabase/supabase-js')

// Настройки Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Отсутствуют переменные окружения Supabase')
  console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl)
  console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'установлен' : 'не установлен')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkBucket() {
  console.log('🔍 Проверяем bucket "pet-photos"...\n')

  try {
    // Получаем список bucket'ов
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()
    
    if (listError) {
      console.error('❌ Ошибка получения списка bucket\'ов:', listError)
      return
    }

    console.log('📦 Доступные bucket\'ы:')
    buckets.forEach(bucket => {
      console.log(`   - ${bucket.name} (публичный: ${bucket.public})`)
    })

    // Проверяем, есть ли bucket "pet-photos"
    const petPhotosBucket = buckets.find(b => b.name === 'pet-photos')
    
    if (petPhotosBucket) {
      console.log('\n✅ Bucket "pet-photos" найден!')
      console.log(`   - Публичный: ${petPhotosBucket.public}`)
      console.log(`   - Создан: ${petPhotosBucket.created_at}`)
      
      // Проверяем содержимое bucket'а
      const { data: files, error: filesError } = await supabase.storage
        .from('pet-photos')
        .list()
      
      if (filesError) {
        console.error('❌ Ошибка получения списка файлов:', filesError)
      } else {
        console.log(`\n📁 Файлов в bucket'е: ${files.length}`)
        files.forEach(file => {
          console.log(`   - ${file.name} (${file.metadata?.size || 'неизвестный размер'})`)
        })
      }
    } else {
      console.log('\n❌ Bucket "pet-photos" не найден!')
      console.log('💡 Нужно создать bucket в Supabase Dashboard')
    }

  } catch (error) {
    console.error('❌ Общая ошибка:', error)
  }
}

checkBucket()
