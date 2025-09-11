const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Отсутствуют переменные окружения SUPABASE_URL или SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const testUsers = [
  {
    email: 'testuser1@gmail.com',
    password: 'TestPassword123!'
  },
  {
    email: 'testuser2@gmail.com', 
    password: 'TestPassword123!'
  },
  {
    email: 'testuser3@gmail.com',
    password: 'TestPassword123!'
  },
  {
    email: 'testadmin@gmail.com',
    password: 'AdminPassword123!'
  },
  {
    email: 'blockeduser@gmail.com',
    password: 'BlockedPassword123!'
  }
];

async function createTestUsers() {
  console.log('🚀 Начинаем создание тестовых пользователей с реальными email...\n');

  for (const userData of testUsers) {
    try {
      console.log(`📝 Регистрируем пользователя: ${userData.email}`);
      
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          emailRedirectTo: undefined // Отключаем редирект для тестовых пользователей
        }
      });

      if (error) {
        if (error.message.includes('already registered') || error.message.includes('already been registered')) {
          console.log(`⚠️  Пользователь ${userData.email} уже существует`);
        } else {
          console.error(`❌ Ошибка регистрации ${userData.email}:`, error.message);
        }
        continue;
      }

      console.log(`✅ Пользователь ${userData.email} зарегистрирован успешно`);
      
      // Попробуем войти, чтобы подтвердить аккаунт
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: userData.email,
        password: userData.password
      });

      if (signInError) {
        console.log(`⚠️  Не удалось войти как ${userData.email}:`, signInError.message);
      } else {
        console.log(`🔑 Успешный вход как ${userData.email}`);
        // Выходим из аккаунта
        await supabase.auth.signOut();
      }

    } catch (error) {
      console.error(`❌ Неожиданная ошибка для пользователя ${userData.email}:`, error.message);
    }
  }

  console.log('\n🎉 Создание тестовых пользователей завершено!');
  console.log('\n📋 Список созданных пользователей:');
  console.log('1. testuser1@gmail.com (Пользователь) - TestPassword123!');
  console.log('2. testuser2@gmail.com (Пользователь) - TestPassword123!');
  console.log('3. testuser3@gmail.com (Пользователь) - TestPassword123!');
  console.log('4. testadmin@gmail.com (Пользователь) - AdminPassword123!');
  console.log('5. blockeduser@gmail.com (Пользователь) - BlockedPassword123!');
  console.log('\n🔑 Для входа в админ панель используйте: agentgl007@gmail.com');
  console.log('\n📝 Примечание: Все пользователи созданы с ролью "user" по умолчанию.');
  console.log('📝 Для изменения ролей используйте админ панель или Supabase Dashboard.');
  console.log('\n🧪 Теперь можно тестировать модуль управления пользователями!');
}

createTestUsers().catch(console.error);


