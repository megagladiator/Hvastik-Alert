const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Отсутствуют переменные окружения');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function testRealUsers() {
  console.log('🧪 Тестирование модуля с реальными данными Supabase...\n');

  try {
    // 1. Получаем список всех пользователей
    console.log('📋 1. Получение списка пользователей:');
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 50
    });

    if (error) {
      console.error('❌ Ошибка получения пользователей:', error.message);
      return;
    }

    console.log(`✅ Найдено пользователей: ${data.users.length}`);
    
    if (data.users.length === 0) {
      console.log('ℹ️  В базе данных нет пользователей');
      console.log('💡 Создайте несколько тестовых пользователей через регистрацию');
      return;
    }

    // Показываем информацию о пользователях
    data.users.forEach((user, index) => {
      const isBlocked = user.banned_until ? '🔒 Заблокирован' : '✅ Активен';
      const isAdmin = user.email === 'agentgl007@gmail.com' ? '👑 Админ' : '👤 Пользователь';
      console.log(`   ${index + 1}. ${user.email} - ${isAdmin} - ${isBlocked}`);
    });

    // 2. Тестируем блокировку пользователя (если есть не админ)
    console.log('\n🔒 2. Тестирование блокировки пользователя:');
    const nonAdminUser = data.users.find(user => user.email !== 'agentgl007@gmail.com');
    
    if (nonAdminUser) {
      console.log(`   Блокируем пользователя: ${nonAdminUser.email}`);
      
      const { error: blockError } = await supabaseAdmin.auth.admin.updateUserById(
        nonAdminUser.id,
        { ban_duration: '1h' } // Блокируем на 1 час
      );
      
      if (blockError) {
        console.error('   ❌ Ошибка блокировки:', blockError.message);
      } else {
        console.log('   ✅ Пользователь успешно заблокирован на 1 час');
        
        // Проверяем статус
        const { data: updatedUser, error: getUserError } = await supabaseAdmin.auth.admin.getUserById(nonAdminUser.id);
        if (!getUserError && updatedUser.user) {
          const isBlocked = updatedUser.user.banned_until ? '🔒 Заблокирован' : '✅ Активен';
          console.log(`   Статус после блокировки: ${isBlocked}`);
        }
      }
    } else {
      console.log('   ⚠️  Нет пользователей для тестирования блокировки (кроме админа)');
    }

    // 3. Статистика
    console.log('\n📊 3. Статистика пользователей:');
    const totalUsers = data.users.length;
    const activeUsers = data.users.filter(u => !u.banned_until).length;
    const blockedUsers = totalUsers - activeUsers;
    const adminUsers = data.users.filter(u => u.email === 'agentgl007@gmail.com').length;
    
    console.log(`   📈 Всего пользователей: ${totalUsers}`);
    console.log(`   ✅ Активных: ${activeUsers}`);
    console.log(`   🔒 Заблокированных: ${blockedUsers}`);
    console.log(`   👑 Администраторов: ${adminUsers}`);

    console.log('\n🎯 4. Рекомендации для тестирования в веб-интерфейсе:');
    console.log('   1. Откройте: http://localhost:3000');
    console.log('   2. Войдите как администратор: agentgl007@gmail.com');
    console.log('   3. Перейдите в личный кабинет: http://localhost:3000/cabinet');
    console.log('   4. Нажмите "Админ панель"');
    console.log('   5. Перейдите на вкладку "Пользователи"');
    console.log('   6. Теперь должны отображаться РЕАЛЬНЫЕ пользователи из Supabase!');
    console.log('   7. Протестируйте все функции с реальными данными');

    console.log('\n✨ Тестирование завершено!');
    console.log('💡 Модуль готов к работе с реальными данными!');

  } catch (error) {
    console.error('❌ Неожиданная ошибка:', error.message);
  }
}

testRealUsers().catch(console.error);


