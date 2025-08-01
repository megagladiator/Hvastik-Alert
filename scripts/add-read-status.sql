-- Добавление поля read_at в таблицу messages для отслеживания прочитанных сообщений
ALTER TABLE messages ADD COLUMN IF NOT EXISTS read_at TIMESTAMP WITH TIME ZONE;

-- Создание индекса для быстрого поиска непрочитанных сообщений
CREATE INDEX IF NOT EXISTS idx_messages_read_at ON messages(read_at);

-- Обновление RLS политики для поля read_at
CREATE POLICY "Users can update read status of their messages" ON messages
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM chats 
            WHERE chats.id = messages.chat_id 
            AND (chats.user_id = auth.uid() OR chats.owner_id = auth.uid())
        )
    );

-- Функция для отметки сообщений как прочитанных
CREATE OR REPLACE FUNCTION mark_messages_as_read(chat_id_param UUID)
RETURNS void AS $$
BEGIN
    UPDATE messages 
    SET read_at = NOW() 
    WHERE chat_id = chat_id_param 
    AND read_at IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 