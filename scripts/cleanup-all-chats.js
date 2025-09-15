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
  console.log('🧹 Очистка всех существующих чатов...\n');
  
  try {
    const { data: allChats, error: chatsError } = await supabase
      .from('chats')
      .select('*');
    
    if (chatsError) {
      console.error('Ошибка при получении чатов:', chatsError);
      return;
    }
    
    console.log(`📊 Найдено чатов: ${allChats?.length || 0}`);
    
    if (!allChats || allChats.length === 0) {
      console.log('✅ Чатов для удаления нет');
      return;
    }
    
    const { data: allMessages, error: messagesError } = await supabase
      .from('messages')
      .select('*');
    
    if (messagesError) {
      console.error('Ошибка при получении сообщений:', messagesError);
      return;
    }
    
    console.log(`💬 Найдено сообщений: ${allMessages?.length || 0}`);
    
    if (allMessages && allMessages.length > 0) {
      const { error: deleteMessagesError } = await supabase
        .from('messages')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');
      
      if (deleteMessagesError) {
        console.error('Ошибка при удалении сообщений:', deleteMessagesError);
      } else {
        console.log('✅ Сообщения удалены');
      }
    }
    
    const { error: deleteChatsError } = await supabase
      .from('chats')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    
    if (deleteChatsError) {
      console.error('Ошибка при удалении чатов:', deleteChatsError);
    } else {
      console.log('✅ Чаты удалены');
    }
    
    const { data: remainingChats } = await supabase
      .from('chats')
      .select('*');
    
    const { data: remainingMessages } = await supabase
      .from('messages')
      .select('*');
    
    console.log('\n📈 Результат очистки:');
    console.log(`   Осталось чатов: ${remainingChats?.length || 0}`);
    console.log(`   Осталось сообщений: ${remainingMessages?.length || 0}`);
    
    if ((remainingChats?.length || 0) === 0 && (remainingMessages?.length || 0) === 0) {
      console.log('🎉 Очистка завершена успешно!');
    } else {
      console.log('⚠️ Остались данные для удаления');
    }
    
  } catch (error) {
    console.error('Ошибка при очистке:', error);
  }
}

cleanupAllChats();
