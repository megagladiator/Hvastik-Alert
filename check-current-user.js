require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase credentials not found in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCurrentUser() {
  console.log('Проверяем текущего пользователя...');
  
  try {
    // Проверяем текущую сессию
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Ошибка при получении сессии:', sessionError);
    } else {
      console.log('Текущая сессия:', session ? 'Авторизован' : 'Не авторизован');
      if (session) {
        console.log('Пользователь:', session.user.email);
        console.log('ID:', session.user.id);
        console.log('Подтвержден:', session.user.email_confirmed_at ? 'Да' : 'Нет');
        
        // Проверяем, есть ли питомцы у этого пользователя
        const { data: userPets } = await supabase
          .from('pets')
          .select('*')
          .eq('user_id', session.user.id);
          
        console.log(`\nПитомцев у пользователя: ${userPets?.length || 0}`);
        userPets?.forEach(pet => {
          console.log(`- ${pet.name} (ID: ${pet.id}, Статус: ${pet.status})`);
        });
        
        // Проверяем чаты этого пользователя
        const { data: userChats } = await supabase
          .from('chats')
          .select(`
            *,
            pets!inner(
              id,
              name,
              breed,
              type,
              photo_url,
              contact_name,
              contact_email,
              status
            )
          `)
          .or(`user_id.eq.${session.user.id},owner_id.eq.${session.user.id}`);
          
        console.log(`\nЧатов у пользователя: ${userChats?.length || 0}`);
        userChats?.forEach(chat => {
          console.log(`- Чат с питомцем "${chat.pets?.name}" (ID: ${chat.id})`);
          console.log(`  Пользователь: ${chat.user_id}, Владелец: ${chat.owner_id}`);
          console.log(`  Вы ${chat.user_id === session.user.id ? 'пользователь' : 'владелец'}`);
        });
      }
    }
    
  } catch (err) {
    console.error('Общая ошибка:', err);
  }
}

checkCurrentUser();

