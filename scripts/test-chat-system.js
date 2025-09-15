require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase credentials not found in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testChatSystem() {
  console.log('🧪 Тестирование системы чатов...\n');
  
  try {
    // 1. Проверяем структуру таблиц
    console.log('1️⃣ Проверка структуры таблиц...');
    
    const { data: chatsTable, error: chatsError } = await supabase
      .from('chats')
      .select('*')
      .limit(1);
    
    if (chatsError) {
      console.error('❌ Ошибка доступа к таблице chats:', chatsError.message);
      return;
    }
    
    const { data: messagesTable, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .limit(1);
    
    if (messagesError) {
      console.error('❌ Ошибка доступа к таблице messages:', messagesError.message);
      return;
    }
    
    console.log('✅ Таблицы chats и messages доступны');
    
    // 2. Проверяем пользователей
    console.log('\n2️⃣ Проверка пользователей...');
    
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError) {
      console.error('❌ Ошибка получения пользователей:', usersError.message);
      return;
    }
    
    if (!users || users.users.length === 0) {
      console.log('⚠️ Пользователи не найдены. Создайте тестовых пользователей.');
      return;
    }
    
    console.log(`✅ Найдено пользователей: ${users.users.length}`);
    users.users.forEach(user => {
      console.log(`   - ${user.email} (${user.id.slice(0, 8)}...)`);
    });
    
    // 3. Проверяем питомцев
    console.log('\n3️⃣ Проверка питомцев...');
    
    const { data: pets, error: petsError } = await supabase
      .from('pets')
      .select('*')
      .eq('status', 'active')
      .limit(5);
    
    if (petsError) {
      console.error('❌ Ошибка получения питомцев:', petsError.message);
      return;
    }
    
    if (!pets || pets.length === 0) {
      console.log('⚠️ Активные питомцы не найдены. Создайте тестовых питомцев.');
      return;
    }
    
    console.log(`✅ Найдено активных питомцев: ${pets.length}`);
    pets.forEach(pet => {
      console.log(`   - ${pet.name} (${pet.type}, владелец: ${pet.user_id.slice(0, 8)}...)`);
    });
    
    // 4. Тестируем создание чата
    console.log('\n4️⃣ Тестирование создания чата...');
    
    if (users.users.length >= 2 && pets.length >= 1) {
      const user1 = users.users[0];
      const user2 = users.users[1];
      const testPet = pets[0];
      
      // Используем пользователя, который НЕ является владельцем питомца
      const chatUser = testPet.user_id === user1.id ? user2 : user1;
      const petOwner = testPet.user_id;
      
      console.log(`Создаем чат между пользователем ${chatUser.email} и владельцем питомца ${testPet.name}`);
      
      // Тестируем API создания чата
      const chatData = {
        petId: testPet.id,
        userId: chatUser.id,
        ownerId: petOwner
      };
      
      console.log('Данные для создания чата:', chatData);
      
      // Имитируем запрос к API
      const { data: newChat, error: chatError } = await supabase
        .from('chats')
        .insert({
          pet_id: chatData.petId,
          user_id: chatData.userId,
          owner_id: chatData.ownerId,
          status: 'active'
        })
        .select()
        .single();
      
      if (chatError) {
        console.error('❌ Ошибка создания чата:', chatError.message);
      } else {
        console.log('✅ Чат создан успешно:', newChat.id);
        
        // 5. Тестируем отправку сообщения
        console.log('\n5️⃣ Тестирование отправки сообщения...');
        
        const { data: newMessage, error: messageError } = await supabase
          .from('messages')
          .insert({
            chat_id: newChat.id,
            sender_id: chatUser.id,
            sender_type: 'user',
            text: 'Тестовое сообщение от пользователя'
          })
          .select()
          .single();
        
        if (messageError) {
          console.error('❌ Ошибка отправки сообщения:', messageError.message);
        } else {
          console.log('✅ Сообщение отправлено:', newMessage.text);
        }
        
        // 6. Тестируем ответ владельца
        console.log('\n6️⃣ Тестирование ответа владельца...');
        
        const { data: ownerMessage, error: ownerMessageError } = await supabase
          .from('messages')
          .insert({
            chat_id: newChat.id,
            sender_id: petOwner,
            sender_type: 'owner',
            text: 'Ответ от владельца питомца'
          })
          .select()
          .single();
        
        if (ownerMessageError) {
          console.error('❌ Ошибка отправки ответа:', ownerMessageError.message);
        } else {
          console.log('✅ Ответ владельца отправлен:', ownerMessage.text);
        }
        
        // 7. Проверяем загрузку чатов
        console.log('\n7️⃣ Тестирование загрузки чатов...');
        
        const { data: userChats, error: userChatsError } = await supabase
          .from('chats')
          .select(`
            *,
            pets!inner(
              id,
              name,
              breed,
              type,
              status
            )
          `)
          .or(`user_id.eq.${chatUser.id},owner_id.eq.${chatUser.id}`)
          .eq('status', 'active')
          .order('updated_at', { ascending: false });
        
        if (userChatsError) {
          console.error('❌ Ошибка загрузки чатов пользователя:', userChatsError.message);
        } else {
          console.log(`✅ Загружено чатов для пользователя: ${userChats.length}`);
        }
        
        const { data: ownerChats, error: ownerChatsError } = await supabase
          .from('chats')
          .select(`
            *,
            pets!inner(
              id,
              name,
              breed,
              type,
              status
            )
          `)
          .or(`user_id.eq.${petOwner},owner_id.eq.${petOwner}`)
          .eq('status', 'active')
          .order('updated_at', { ascending: false });
        
        if (ownerChatsError) {
          console.error('❌ Ошибка загрузки чатов владельца:', ownerChatsError.message);
        } else {
          console.log(`✅ Загружено чатов для владельца: ${ownerChats.length}`);
        }
        
        // 8. Тестируем архивирование
        console.log('\n8️⃣ Тестирование архивирования чата...');
        
        const { data: archivedChat, error: archiveError } = await supabase
          .from('chats')
          .update({
            status: 'archived',
            archived_at: new Date().toISOString(),
            archived_by: petOwner
          })
          .eq('id', newChat.id)
          .eq('owner_id', petOwner)
          .select()
          .single();
        
        if (archiveError) {
          console.error('❌ Ошибка архивирования чата:', archiveError.message);
        } else {
          console.log('✅ Чат архивирован:', archivedChat.status);
        }
        
        // 9. Тестируем восстановление
        console.log('\n9️⃣ Тестирование восстановления чата...');
        
        const { data: restoredChat, error: restoreError } = await supabase
          .from('chats')
          .update({
            status: 'active',
            archived_at: null,
            archived_by: null
          })
          .eq('id', newChat.id)
          .eq('owner_id', petOwner)
          .select()
          .single();
        
        if (restoreError) {
          console.error('❌ Ошибка восстановления чата:', restoreError.message);
        } else {
          console.log('✅ Чат восстановлен:', restoredChat.status);
        }
        
        // 10. Очистка тестовых данных
        console.log('\n🧹 Очистка тестовых данных...');
        
        await supabase.from('messages').delete().eq('chat_id', newChat.id);
        await supabase.from('chats').delete().eq('id', newChat.id);
        
        console.log('✅ Тестовые данные очищены');
      }
    } else {
      console.log('⚠️ Недостаточно данных для полного тестирования');
    }
    
    console.log('\n🎉 Тестирование системы чатов завершено!');
    
  } catch (error) {
    console.error('❌ Ошибка при тестировании:', error);
  }
}

testChatSystem();
