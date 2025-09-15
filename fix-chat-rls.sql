-- Временно отключаем RLS для тестирования чатов
-- ВНИМАНИЕ: Это только для разработки!

-- Отключаем RLS для таблицы chats
ALTER TABLE chats DISABLE ROW LEVEL SECURITY;

-- Отключаем RLS для таблицы messages  
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;

-- Удаляем существующие политики
DROP POLICY IF EXISTS "Users can view chats they participate in" ON chats;
DROP POLICY IF EXISTS "Users can create chats" ON chats;
DROP POLICY IF EXISTS "Users can view messages in their chats" ON messages;
DROP POLICY IF EXISTS "Users can send messages in their chats" ON messages;

-- Проверяем результат
SELECT 'RLS отключен для chats и messages' as status;
