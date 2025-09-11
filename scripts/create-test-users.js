const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Нужен service role key для создания пользователей

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Отсутствуют переменные окружения SUPABASE_URL или SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const testUsers = [
  {
    email: 'testuser1@example.com',
    password: 'TestPassword123!',
    user_metadata: {
      full_name: 'Тестовый Пользователь 1',
      role: 'user'
    }
  },
  {
    email: 'testuser2@example.com', 
    password: 'TestPassword123!',
    user_metadata: {
      full_name: 'Тестовый Пользователь 2',
      role: 'user'
    }
  },
  {
    email: 'testuser3@example.com',
    password: 'TestPassword123!',
    user_metadata: {
      full_name: 'Тестовый Пользователь 3',
      role: 'user'
    }
  },
  {
    email: 'testadmin@example.com',
    password: 'AdminPassword123!',
    user_metadata: {
      full_name: 'Тестовый Администратор',
      role: 'admin'
    }
  },
  {
    email: 'blockeduser@example.com',
    password: 'BlockedPassword123!',
    user_metadata: {
      full_name: 'Заблокированный Пользователь',
      role: 'user'
    }
  }
];

async function createTestUsers() {
  console.log('🚀 Начинаем создание тестовых пользователей...\n');

  for (const userData of testUsers) {
    try {
      console.log(`📝 Создаем пользователя: ${userData.email}`);
      
      const { data, error } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        user_metadata: userData.user_metadata,
        email_confirm: true // Автоматически подтверждаем email
      });

      if (error) {
        console.error(`❌ Ошибка создания пользователя ${userData.email}:`, error.message);
        continue;
      }

      console.log(`✅ Пользователь ${userData.email} создан успешно (ID: ${data.user.id})`);

      // Если это заблокированный пользователь, блокируем его
      if (userData.email === 'blockeduser@example.com') {
        const { error: blockError } = await supabase.auth.admin.updateUserById(
          data.user.id,
          { ban_duration: '876000h' } // Блокируем на 100 лет
        );
        
        if (blockError) {
          console.error(`❌ Ошибка блокировки пользователя ${userData.email}:`, blockError.message);
        } else {
          console.log(`🔒 Пользователь ${userData.email} заблокирован`);
        }
      }

    } catch (error) {
      console.error(`❌ Неожиданная ошибка для пользователя ${userData.email}:`, error.message);
    }
  }

  console.log('\n🎉 Создание тестовых пользователей завершено!');
  console.log('\n📋 Список созданных пользователей:');
  console.log('1. testuser1@example.com (Пользователь) - TestPassword123!');
  console.log('2. testuser2@example.com (Пользователь) - TestPassword123!');
  console.log('3. testuser3@example.com (Пользователь) - TestPassword123!');
  console.log('4. testadmin@example.com (Администратор) - AdminPassword123!');
  console.log('5. blockeduser@example.com (Заблокированный) - BlockedPassword123!');
  console.log('\n🔑 Для входа в админ панель используйте: agentgl007@gmail.com');
}

createTestUsers().catch(console.error);


