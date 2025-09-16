require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function cleanupDuplicateChats() {
  try {
    console.log('🔍 Ищем дублирующие чаты...')
    
    // Получаем все чаты
    const { data: allChats, error: fetchError } = await supabase
      .from('chats')
      .select('*')
      .order('created_at', { ascending: true })

    if (fetchError) {
      console.error('Ошибка получения чатов:', fetchError)
      return
    }

    console.log(`📊 Найдено чатов: ${allChats.length}`)

    // Группируем чаты по pet_id, user_id, owner_id
    const chatGroups = {}
    
    allChats.forEach(chat => {
      const key = `${chat.pet_id}-${chat.user_id}-${chat.owner_id}`
      if (!chatGroups[key]) {
        chatGroups[key] = []
      }
      chatGroups[key].push(chat)
    })

    // Находим дубликаты
    const duplicates = []
    Object.values(chatGroups).forEach(group => {
      if (group.length > 1) {
        // Сортируем по дате создания (оставляем самый старый)
        group.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
        // Удаляем все кроме первого (самого старого)
        duplicates.push(...group.slice(1))
      }
    })

    console.log(`🔄 Найдено дублирующих чатов: ${duplicates.length}`)

    if (duplicates.length === 0) {
      console.log('✅ Дублирующих чатов не найдено')
      return
    }

    // Показываем дубликаты
    duplicates.forEach((chat, index) => {
      console.log(`${index + 1}. Чат ID: ${chat.id.slice(0, 8)}... | Создан: ${chat.created_at} | Статус: ${chat.status}`)
    })

    // Удаляем дубликаты
    const chatIdsToDelete = duplicates.map(chat => chat.id)
    
    const { error: deleteError } = await supabase
      .from('chats')
      .delete()
      .in('id', chatIdsToDelete)

    if (deleteError) {
      console.error('Ошибка удаления дубликатов:', deleteError)
      return
    }

    console.log(`✅ Удалено дублирующих чатов: ${duplicates.length}`)
    
    // Показываем статистику
    const { data: remainingChats } = await supabase
      .from('chats')
      .select('id')
    
    console.log(`📊 Осталось чатов: ${remainingChats.length}`)

  } catch (error) {
    console.error('Ошибка:', error)
  }
}

cleanupDuplicateChats()

