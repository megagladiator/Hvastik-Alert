const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔍 Проверка переменных окружения:');
console.log('URL:', supabaseUrl);
console.log('Anon Key:', supabaseAnonKey ? 'Установлен' : 'НЕ УСТАНОВЛЕН');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Отсутствуют переменные окружения');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAuth() {
  console.log('\n🧪 Тестирование аутентификации...');
  
  try {
    // Простой тест - получаем текущего пользователя
    console.log('1. Проверка текущего пользователя...');
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('❌ Ошибка получения пользователя:', userError.message);
    } else if (user) {
      console.log('✅ Пользователь найден:', user.email);
    } else {
      console.log('ℹ️  Нет активного пользователя');
    }
    
    // Тест входа с простыми данными
    console.log('\n2. Тест входа с простыми данными...');
    const testEmail = 'test@example.com';
    const testPassword = 'testpassword123';
    
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });
    
    if (loginError) {
      console.log('ℹ️  Ошибка входа (ожидаемо для тестового аккаунта):', loginError.message);
    } else {
      console.log('✅ Вход успешен:', loginData.user?.email);
    }
    
    console.log('\n✅ Тест завершен - Supabase клиент работает');
    
  } catch (error) {
    console.error('❌ Неожиданная ошибка:', error.message);
    console.error('Stack:', error.stack);
  }
}

testAuth().catch(console.error);


