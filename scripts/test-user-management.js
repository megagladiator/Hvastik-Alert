const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Отсутствуют переменные окружения SUPABASE_URL или SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testUserManagement() {
  console.log('🧪 Начинаем тестирование модуля управления пользователями...\n');

  // 1. Получаем список всех пользователей
  console.log('📋 1. Получение списка всех пользователей:');
  try {
    const { data: users, error } = await supabase.auth.admin.listUsers();
    if (error) {
      console.error('❌ Ошибка получения пользователей:', error.message);
      return;
    }
    
    console.log(`✅ Найдено пользователей: ${users.users.length}`);
    users.users.forEach(user => {
      const isBlocked = user.banned_until ? '🔒 Заблокирован' : '✅ Активен';
      console.log(`   - ${user.email} (${user.id}) - ${isBlocked}`);
    });
  } catch (error) {
    console.error('❌ Неожиданная ошибка:', error.message);
  }

  console.log('\n🔍 2. Тестирование поиска пользователей:');
  
  // 2. Поиск пользователей по email
  const searchTerms = ['test', 'admin', 'blocked'];
  for (const term of searchTerms) {
    try {
      const { data: users, error } = await supabase.auth.admin.listUsers();
      if (error) continue;
      
      const filteredUsers = users.users.filter(user => 
        user.email.toLowerCase().includes(term.toLowerCase())
      );
      
      console.log(`   Поиск "${term}": найдено ${filteredUsers.length} пользователей`);
      filteredUsers.forEach(user => console.log(`     - ${user.email}`));
    } catch (error) {
      console.error(`   ❌ Ошибка поиска "${term}":`, error.message);
    }
  }

  console.log('\n🔒 3. Тестирование блокировки/разблокировки:');
  
  // 3. Найдем тестового пользователя для блокировки
  try {
    const { data: users, error } = await supabase.auth.admin.listUsers();
    if (error) {
      console.error('❌ Ошибка получения пользователей для тестирования блокировки');
      return;
    }
    
    const testUser = users.users.find(user => user.email === 'testuser1@example.com');
    if (!testUser) {
      console.log('⚠️  Тестовый пользователь testuser1@example.com не найден');
      return;
    }

    console.log(`   Блокируем пользователя: ${testUser.email}`);
    const { error: blockError } = await supabase.auth.admin.updateUserById(
      testUser.id,
      { ban_duration: '1h' } // Блокируем на 1 час
    );
    
    if (blockError) {
      console.error('   ❌ Ошибка блокировки:', blockError.message);
    } else {
      console.log('   ✅ Пользователь успешно заблокирован на 1 час');
    }

    // Проверяем статус блокировки
    const { data: updatedUser, error: getUserError } = await supabase.auth.admin.getUserById(testUser.id);
    if (!getUserError && updatedUser.user) {
      const isBlocked = updatedUser.user.banned_until ? '🔒 Заблокирован' : '✅ Активен';
      console.log(`   Статус после блокировки: ${isBlocked}`);
    }

  } catch (error) {
    console.error('❌ Неожиданная ошибка при тестировании блокировки:', error.message);
  }

  console.log('\n👑 4. Тестирование изменения ролей:');
  console.log('   ⚠️  В Supabase Auth роли обычно управляются через RLS политики');
  console.log('   ⚠️  или отдельную таблицу profiles. Прямое изменение ролей');
  console.log('   ⚠️  через auth.users ограничено.');

  console.log('\n🗑️  5. Тестирование удаления пользователей:');
  console.log('   ⚠️  Удаление пользователей через клиентский API ограничено');
  console.log('   ⚠️  по соображениям безопасности. Рекомендуется использовать');
  console.log('   ⚠️  Supabase Dashboard или серверные функции.');

  console.log('\n📊 6. Статистика пользователей:');
  try {
    const { data: users, error } = await supabase.auth.admin.listUsers();
    if (!error && users.users) {
      const totalUsers = users.users.length;
      const activeUsers = users.users.filter(user => !user.banned_until).length;
      const blockedUsers = totalUsers - activeUsers;
      const adminUsers = users.users.filter(user => 
        user.email === 'agentgl007@gmail.com' || 
        user.email === 'testadmin@example.com'
      ).length;
      
      console.log(`   📈 Всего пользователей: ${totalUsers}`);
      console.log(`   ✅ Активных: ${activeUsers}`);
      console.log(`   🔒 Заблокированных: ${blockedUsers}`);
      console.log(`   👑 Администраторов: ${adminUsers}`);
    }
  } catch (error) {
    console.error('❌ Ошибка получения статистики:', error.message);
  }

  console.log('\n🎯 7. Рекомендации для полноценного тестирования:');
  console.log('   1. Откройте админ панель: http://localhost:3000/admin');
  console.log('   2. Войдите как администратор: agentgl007@gmail.com');
  console.log('   3. Перейдите на вкладку "Пользователи"');
  console.log('   4. Протестируйте поиск и фильтрацию');
  console.log('   5. Попробуйте изменить роли и статусы (в демо-режиме)');
  console.log('   6. Проверьте пагинацию при большом количестве пользователей');

  console.log('\n✨ Тестирование завершено!');
}

testUserManagement().catch(console.error);


