# Настройка базы данных для чата

## Текущее состояние

Сейчас чат работает с демо-данными. Для включения реального функционала нужно настроить базу данных.

## Шаги для настройки

### 1. Выполните SQL скрипт в Supabase

Откройте SQL Editor в Supabase и выполните скрипт `scripts/create-messages-table.sql`:

```sql
-- Создание таблицы сообщений для чата
CREATE TABLE IF NOT EXISTS messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    chat_id UUID NOT NULL,
    sender_id UUID NOT NULL,
    sender_type VARCHAR(20) NOT NULL CHECK (sender_type IN ('user', 'owner')),
    text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание индексов для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);

-- Создание таблицы чатов
CREATE TABLE IF NOT EXISTS chats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    owner_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(pet_id, user_id)
);

-- Создание индексов для чатов
CREATE INDEX IF NOT EXISTS idx_chats_pet_id ON chats(pet_id);
CREATE INDEX IF NOT EXISTS idx_chats_user_id ON chats(user_id);
CREATE INDEX IF NOT EXISTS idx_chats_owner_id ON chats(owner_id);

-- Функция для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Триггеры для автоматического обновления updated_at
CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chats_updated_at BEFORE UPDATE ON chats
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) политики для сообщений
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;

-- Политики для чатов
CREATE POLICY "Users can view chats they participate in" ON chats
    FOR SELECT USING (
        auth.uid() = user_id OR auth.uid() = owner_id
    );

CREATE POLICY "Users can create chats" ON chats
    FOR INSERT WITH CHECK (
        auth.uid() = user_id
    );

-- Политики для сообщений
CREATE POLICY "Users can view messages in their chats" ON messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM chats 
            WHERE chats.id = messages.chat_id 
            AND (chats.user_id = auth.uid() OR chats.owner_id = auth.uid())
        )
    );

CREATE POLICY "Users can send messages in their chats" ON messages
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM chats 
            WHERE chats.id = messages.chat_id 
            AND (chats.user_id = auth.uid() OR chats.owner_id = auth.uid())
        )
    );
```

### 2. Включите Realtime в Supabase

1. Перейдите в Dashboard Supabase
2. Откройте Database → Replication
3. Включите Realtime для таблиц `messages` и `chats`

### 3. Переключитесь на реальный чат

После настройки базы данных замените импорт в `app/chat/[id]/page.tsx`:

```typescript
// Замените эту строку:
import { useChatSimple } from "@/hooks/use-chat-simple"

// На эту:
import { useChat } from "@/hooks/use-chat"
```

И обновите вызов хука:

```typescript
// Замените эту строку:
const { messages, loading: chatLoading, sending, error, sendMessage } = useChatSimple({

// На эту:
const { messages, loading: chatLoading, sending, error, sendMessage } = useChat({
```

### 4. Обновите страницу чатов

Аналогично обновите `app/chats/page.tsx` для работы с реальными данными.

## Проверка настройки

После выполнения всех шагов:

1. **Авторизуйтесь** в приложении
2. **Перейдите к питомцу** и нажмите "Написать сообщение"
3. **Отправьте сообщение** - оно должно сохраниться в базе данных
4. **Обновите страницу** - сообщение должно остаться

## Устранение проблем

### Ошибка "Ошибка при создании чата"
- Проверьте, что таблицы `chats` и `messages` созданы
- Убедитесь, что RLS политики настроены правильно
- Проверьте, что пользователь авторизован

### Сообщения не отправляются
- Проверьте Realtime настройки в Supabase
- Убедитесь, что таблица `messages` включена в Realtime
- Проверьте консоль браузера на ошибки

### Сообщения не обновляются в реальном времени
- Проверьте, что Realtime включен для таблицы `messages`
- Убедитесь, что фильтр в подписке правильный
- Проверьте, что `chat_id` совпадает

## Демо-режим

Если база данных не настроена, приложение работает в демо-режиме:
- Сообщения сохраняются только в памяти
- Нет реального обмена сообщениями между пользователями
- Все данные сбрасываются при перезагрузке страницы 

## Текущее состояние

Сейчас чат работает с демо-данными. Для включения реального функционала нужно настроить базу данных.

## Шаги для настройки

### 1. Выполните SQL скрипт в Supabase

Откройте SQL Editor в Supabase и выполните скрипт `scripts/create-messages-table.sql`:

```sql
-- Создание таблицы сообщений для чата
CREATE TABLE IF NOT EXISTS messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    chat_id UUID NOT NULL,
    sender_id UUID NOT NULL,
    sender_type VARCHAR(20) NOT NULL CHECK (sender_type IN ('user', 'owner')),
    text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание индексов для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);

-- Создание таблицы чатов
CREATE TABLE IF NOT EXISTS chats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    owner_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(pet_id, user_id)
);

-- Создание индексов для чатов
CREATE INDEX IF NOT EXISTS idx_chats_pet_id ON chats(pet_id);
CREATE INDEX IF NOT EXISTS idx_chats_user_id ON chats(user_id);
CREATE INDEX IF NOT EXISTS idx_chats_owner_id ON chats(owner_id);

-- Функция для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Триггеры для автоматического обновления updated_at
CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chats_updated_at BEFORE UPDATE ON chats
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) политики для сообщений
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;

-- Политики для чатов
CREATE POLICY "Users can view chats they participate in" ON chats
    FOR SELECT USING (
        auth.uid() = user_id OR auth.uid() = owner_id
    );

CREATE POLICY "Users can create chats" ON chats
    FOR INSERT WITH CHECK (
        auth.uid() = user_id
    );

-- Политики для сообщений
CREATE POLICY "Users can view messages in their chats" ON messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM chats 
            WHERE chats.id = messages.chat_id 
            AND (chats.user_id = auth.uid() OR chats.owner_id = auth.uid())
        )
    );

CREATE POLICY "Users can send messages in their chats" ON messages
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM chats 
            WHERE chats.id = messages.chat_id 
            AND (chats.user_id = auth.uid() OR chats.owner_id = auth.uid())
        )
    );
```

### 2. Включите Realtime в Supabase

1. Перейдите в Dashboard Supabase
2. Откройте Database → Replication
3. Включите Realtime для таблиц `messages` и `chats`

### 3. Переключитесь на реальный чат

После настройки базы данных замените импорт в `app/chat/[id]/page.tsx`:

```typescript
// Замените эту строку:
import { useChatSimple } from "@/hooks/use-chat-simple"

// На эту:
import { useChat } from "@/hooks/use-chat"
```

И обновите вызов хука:

```typescript
// Замените эту строку:
const { messages, loading: chatLoading, sending, error, sendMessage } = useChatSimple({

// На эту:
const { messages, loading: chatLoading, sending, error, sendMessage } = useChat({
```

### 4. Обновите страницу чатов

Аналогично обновите `app/chats/page.tsx` для работы с реальными данными.

## Проверка настройки

После выполнения всех шагов:

1. **Авторизуйтесь** в приложении
2. **Перейдите к питомцу** и нажмите "Написать сообщение"
3. **Отправьте сообщение** - оно должно сохраниться в базе данных
4. **Обновите страницу** - сообщение должно остаться

## Устранение проблем

### Ошибка "Ошибка при создании чата"
- Проверьте, что таблицы `chats` и `messages` созданы
- Убедитесь, что RLS политики настроены правильно
- Проверьте, что пользователь авторизован

### Сообщения не отправляются
- Проверьте Realtime настройки в Supabase
- Убедитесь, что таблица `messages` включена в Realtime
- Проверьте консоль браузера на ошибки

### Сообщения не обновляются в реальном времени
- Проверьте, что Realtime включен для таблицы `messages`
- Убедитесь, что фильтр в подписке правильный
- Проверьте, что `chat_id` совпадает

## Демо-режим

Если база данных не настроена, приложение работает в демо-режиме:
- Сообщения сохраняются только в памяти
- Нет реального обмена сообщениями между пользователями
- Все данные сбрасываются при перезагрузке страницы 
 