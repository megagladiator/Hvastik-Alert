const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Отсутствуют переменные окружения SUPABASE_URL или SUPABASE_ANON_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function createTestAdmin() {
  try {
    console.log('🔄 Создаем тестового администратора...')
    
    const { data, error } = await supabase.auth.signUp({
      email: 'admin@test.com',
      password: '123456',
      options: {
        data: {
          full_name: 'Test Admin',
          role: 'admin'
        }
      }
    })

    if (error) {
      console.error('❌ Ошибка создания:', error.message)
      return
    }

    if (data.user) {
      console.log('✅ Тестовый администратор создан!')
      console.log('📧 Email: admin@test.com')
      console.log('🔑 Пароль: 123456')
      console.log('🆔 User ID:', data.user.id)
    } else {
      console.log('⚠️ Пользователь не создан, возможно уже существует')
    }

  } catch (error) {
    console.error('❌ Ошибка:', error.message)
  }
}

createTestAdmin()


