const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

async function testConnection() {
  console.log('🔍 Тестирование подключения к Supabase...\n')
  
  // Проверяем переменные окружения
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  console.log('📋 Переменные окружения:')
  console.log(`URL: ${url ? '✅ Установлен' : '❌ Не установлен'}`)
  console.log(`Key: ${key ? '✅ Установлен' : '❌ Не установлен'}\n`)
  
  if (!url || !key) {
    console.log('❌ Ошибка: Переменные окружения не настроены')
    return
  }
  
  if (url.includes('placeholder')) {
    console.log('❌ Ошибка: Используется placeholder URL')
    return
  }
  
  // Создаем клиент
  const supabase = createClient(url, key)
  console.log('✅ Клиент Supabase создан\n')
  
  // Тест 1: Простой запрос
  console.log('🧪 Тест 1: Простой запрос...')
  try {
    const startTime = Date.now()
    const { data, error } = await supabase
      .from('pets')
      .select('count')
      .limit(1)
    
    const responseTime = Date.now() - startTime
    
    if (error) {
      console.log(`❌ Ошибка: ${error.message}`)
    } else {
      console.log(`✅ Успешно! Время ответа: ${responseTime}ms`)
    }
  } catch (err) {
    console.log(`❌ Исключение: ${err.message}`)
  }
  
  // Тест 2: Проверка таблицы pets
  console.log('\n🧪 Тест 2: Таблица pets...')
  try {
    const { data, error } = await supabase
      .from('pets')
      .select('*')
      .limit(3)
    
    if (error) {
      console.log(`❌ Ошибка: ${error.message}`)
    } else {
      console.log(`✅ Успешно! Найдено записей: ${data?.length || 0}`)
      if (data && data.length > 0) {
        console.log('📄 Пример записи:', JSON.stringify(data[0], null, 2))
      }
    }
  } catch (err) {
    console.log(`❌ Исключение: ${err.message}`)
  }
  
  // Тест 3: Проверка таблицы app_settings
  console.log('\n🧪 Тест 3: Таблица app_settings...')
  try {
    const { data, error } = await supabase
      .from('app_settings')
      .select('*')
      .limit(1)
    
    if (error) {
      console.log(`❌ Ошибка: ${error.message}`)
    } else {
      console.log(`✅ Успешно! Найдено записей: ${data?.length || 0}`)
      if (data && data.length > 0) {
        console.log('📄 Настройки:', JSON.stringify(data[0], null, 2))
      }
    }
  } catch (err) {
    console.log(`❌ Исключение: ${err.message}`)
  }
  
  console.log('\n🏁 Тестирование завершено!')
}

testConnection().catch(console.error)

