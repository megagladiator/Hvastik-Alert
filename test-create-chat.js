require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase credentials not found in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testCreateChat() {
  console.log('Тестируем создание чата...');
  
  try {
    // Сначала проверим, есть ли питомцы
    const { data: pets, error: petsError } = await supabase
      .from('pets')
      .select('*')
      .limit(1);
      
    if (petsError) {
      console.error('Ошибка при загрузке питомцев:', petsError);
      return;
    }
    
    if (!pets || pets.length === 0) {
      console.log('❌ Нет питомцев в базе данных');
      return;
    }
    
    console.log('✅ Найдено питомцев:', pets.length);
    const pet = pets[0];
    console.log('Первый питомец:', pet.id, pet.name);
    
    // Пытаемся создать чат
    const testUserId = 'test-user-123';
    const testOwnerId = pet.user_id;
    
    console.log('Пытаемся создать чат...');
    const { data: chat, error: chatError } = await supabase
      .from('chats')
      .insert({
        pet_id: pet.id,
        user_id: testUserId,
        owner_id: testOwnerId
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
    
  } catch (err) {
    console.error('Общая ошибка:', err);
  }
}

testCreateChat();
