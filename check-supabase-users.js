require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase credentials not found in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUsers() {
  console.log('Проверяем пользователей в Supabase Auth...');
  
  try {
    // Проверяем текущую сессию
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Ошибка при получении сессии:', sessionError);
    } else {
      console.log('Текущая сессия:', session ? 'Авторизован' : 'Не авторизован');
      if (session) {
        console.log('Пользователь:', session.user.email, 'ID:', session.user.id);
      }
    }

    // Пытаемся зарегистрировать тестового пользователя
    console.log('\nПытаемся зарегистрировать тестового пользователя...');
    const testEmail = 'test@example.com';
    const testPassword = 'test123456';
    
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
    });
    
    if (signUpError) {
      console.error('Ошибка регистрации:', signUpError.message);
    } else {
      console.log('✅ Пользователь зарегистрирован!');
      console.log('Email:', signUpData.user?.email);
      console.log('ID:', signUpData.user?.id);
      console.log('Подтвержден:', signUpData.user?.email_confirmed_at ? 'Да' : 'Нет');
      
      // Пытаемся войти
      console.log('\nПытаемся войти...');
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword,
      });
      
      if (signInError) {
        console.error('Ошибка входа:', signInError.message);
      } else {
        console.log('✅ Успешный вход!');
        console.log('Пользователь:', signInData.user.email, 'ID:', signInData.user.id);
        
        // Теперь пытаемся создать чат
        console.log('\nПытаемся создать чат...');
        
        const { data: pets } = await supabase.from('pets').select('*').limit(1);
        if (pets && pets.length > 0) {
          const pet = pets[0];
          const { v4: uuidv4 } = require('uuid');
          const testUserId = uuidv4();
          
          const { data: chat, error: chatError } = await supabase
            .from('chats')
            .insert({
              pet_id: pet.id,
              user_id: testUserId,
              owner_id: pet.user_id
            })
            .select()
            .single();
            
          if (chatError) {
            console.error('❌ Ошибка при создании чата:', chatError);
          } else {
            console.log('✅ Чат создан:', chat.id);
            
            // Пытаемся создать сообщение
            const { data: message, error: msgError } = await supabase
              .from('messages')
              .insert({
                chat_id: chat.id,
                sender_id: testUserId,
                sender_type: 'user',
                text: 'Тестовое сообщение'
              })
              .select()
              .single();
              
            if (msgError) {
              console.error('❌ Ошибка при создании сообщения:', msgError);
            } else {
              console.log('✅ Сообщение создано:', message.id);
            }
          }
        }
      }
    }
    
  } catch (err) {
    console.error('Общая ошибка:', err);
  }
}

checkUsers();
