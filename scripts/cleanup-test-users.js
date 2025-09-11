const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Отсутствуют переменные окружения SUPABASE_URL или SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const testUserEmails = [
  'testuser1@example.com',
  'testuser2@example.com', 
  'testuser3@example.com',
  'testadmin@example.com',
  'blockeduser@example.com'
];

async function cleanupTestUsers() {
  console.log('🧹 Начинаем очистку тестовых пользователей...\n');

  try {
    // Получаем всех пользователей
    const { data: users, error } = await supabase.auth.admin.listUsers();
    if (error) {
      console.error('❌ Ошибка получения пользователей:', error.message);
      return;
    }

    let deletedCount = 0;
    let notFoundCount = 0;

    for (const email of testUserEmails) {
      const user = users.users.find(u => u.email === email);
      
      if (!user) {
        console.log(`⚠️  Пользователь ${email} не найден`);
        notFoundCount++;
        continue;
      }

      try {
        console.log(`🗑️  Удаляем пользователя: ${email} (ID: ${user.id})`);
        
        const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
        
        if (deleteError) {
          console.error(`❌ Ошибка удаления ${email}:`, deleteError.message);
        } else {
          console.log(`✅ Пользователь ${email} удален успешно`);
          deletedCount++;
        }
      } catch (error) {
        console.error(`❌ Неожиданная ошибка при удалении ${email}:`, error.message);
      }
    }

    console.log('\n📊 Результаты очистки:');
    console.log(`   ✅ Удалено пользователей: ${deletedCount}`);
    console.log(`   ⚠️  Не найдено: ${notFoundCount}`);
    console.log(`   📋 Всего обработано: ${testUserEmails.length}`);

    if (deletedCount > 0) {
      console.log('\n🎉 Очистка тестовых пользователей завершена!');
    } else {
      console.log('\n💡 Тестовые пользователи не найдены или уже удалены.');
    }

  } catch (error) {
    console.error('❌ Неожиданная ошибка при очистке:', error.message);
  }
}

// Добавляем подтверждение перед удалением
console.log('⚠️  ВНИМАНИЕ: Этот скрипт удалит всех тестовых пользователей!');
console.log('📋 Будут удалены следующие пользователи:');
testUserEmails.forEach(email => console.log(`   - ${email}`));
console.log('\n❓ Продолжить? (Ctrl+C для отмены)');

// Ждем 3 секунды перед началом удаления
setTimeout(() => {
  cleanupTestUsers().catch(console.error);
}, 3000);


