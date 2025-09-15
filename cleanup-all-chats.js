require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase credentials not found in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanupAllChats() {
  console.log(' Очистка всех существующих чатов...\n');
  
  try {
    // 1. Получаем все чаты
    const { data: allChats, error: chatsError } = await supabase
      .from('chats')
      .select('*');
    
    if (chatsError) {
      console.error('Ошибка при получении чатов:', chatsError);
      return;
    }
    
    console.log( Найдено чатов: );
    
    if (!allChats || allChats.length === 0) {
      console.log(' Чатов для удаления нет');
      return;
    }
    
    // 2. Удаляем все чаты (сообщения удалятся автоматически из-за CASCADE)
    const { error: deleteChatsError } = await supabase
      .from('chats')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    
    if (deleteChatsError) {
      console.error('Ошибка при удалении чатов:', deleteChatsError);
    } else {
      console.log(' Чаты удалены');
    }
    
    // 3. Проверяем результат
    const { data: remainingChats } = await supabase
      .from('chats')
      .select('*');
    
    console.log( Осталось чатов: );
    
    if ((remainingChats?.length || 0) === 0) {
      console.log(' Очистка завершена успешно!');
    }
    
  } catch (error) {
    console.error('Ошибка при очистке:', error);
  }
}

cleanupAllChats();
