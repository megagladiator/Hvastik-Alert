require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase credentials not found in environment variables');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function checkPetOwner() {
  console.log('Проверяем владельца питомца...');
  
  try {
    // Ищем питомца "питол" или похожего
    const { data: pets, error } = await supabaseAdmin
      .from('pets')
      .select('*')
      .ilike('name', '%питол%');
      
    if (error) {
      console.error('Ошибка поиска питомца:', error);
      return;
    }
    
    if (!pets || pets.length === 0) {
      console.log('❌ Питомец "питол" не найден');
      
      // Показываем всех питомцев
      const { data: allPets } = await supabaseAdmin.from('pets').select('*');
      console.log('\nВсе питомцы в базе:');
      allPets?.forEach(pet => {
        console.log(`- ${pet.name} (ID: ${pet.id}, Владелец: ${pet.user_id})`);
      });
      return;
    }
    
    const pet = pets[0];
    console.log('✅ Найден питомец:');
    console.log(`Имя: ${pet.name}`);
    console.log(`ID: ${pet.id}`);
    console.log(`Владелец (user_id): ${pet.user_id}`);
    console.log(`Статус: ${pet.status}`);
    
    // Проверяем, есть ли чаты с этим питомцем
    const { data: chats } = await supabaseAdmin
      .from('chats')
      .select('*')
      .eq('pet_id', pet.id);
      
    console.log(`\nЧатов с этим питомцем: ${chats?.length || 0}`);
    chats?.forEach(chat => {
      console.log(`- Чат ${chat.id}: Пользователь ${chat.user_id}, Владелец ${chat.owner_id}`);
    });
    
    // Проверяем, есть ли сообщения
    if (chats && chats.length > 0) {
      const { data: messages } = await supabaseAdmin
        .from('messages')
        .select('*')
        .in('chat_id', chats.map(c => c.id));
        
      console.log(`\nСообщений в чатах: ${messages?.length || 0}`);
      messages?.forEach(msg => {
        console.log(`- "${msg.text}" от ${msg.sender_id} (${msg.sender_type})`);
      });
    }
    
  } catch (err) {
    console.error('Общая ошибка:', err);
  }
}

checkPetOwner();

