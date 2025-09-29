-- Создание таблицы для рекламных баннеров
CREATE TABLE IF NOT EXISTS banners (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT NOT NULL,
    link_url TEXT,
    type VARCHAR(50) NOT NULL CHECK (type IN ('veterinary', 'shelter', 'shop', 'service')),
    priority INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_date TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days'),
    contact_info JSONB,
    style JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание индексов для оптимизации запросов
CREATE INDEX IF NOT EXISTS idx_banners_active ON banners(is_active);
CREATE INDEX IF NOT EXISTS idx_banners_type ON banners(type);
CREATE INDEX IF NOT EXISTS idx_banners_priority ON banners(priority DESC);
CREATE INDEX IF NOT EXISTS idx_banners_dates ON banners(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_banners_active_dates ON banners(is_active, start_date, end_date);

-- Создание функции для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Создание триггера для автоматического обновления updated_at
DROP TRIGGER IF EXISTS update_banners_updated_at ON banners;
CREATE TRIGGER update_banners_updated_at
    BEFORE UPDATE ON banners
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Вставка тестовых данных
INSERT INTO banners (title, description, image_url, link_url, type, priority, contact_info, style) VALUES
(
    'Ветклиника "Доктор Айболит"',
    'Полный спектр ветеринарных услуг: лечение, вакцинация, стерилизация. Работаем 24/7!',
    'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&h=200&fit=crop',
    'https://example.com/vet-clinic',
    'veterinary',
    10,
    '{"phone": "+7 (861) 123-45-67", "address": "ул. Ленина, 15, Анапа", "workingHours": "24/7"}',
    '{"backgroundColor": "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", "textColor": "#ffffff", "borderColor": "#667eea"}'
),
(
    'Приют "Добрые сердца"',
    'Помогаем бездомным животным найти дом. Принимаем пожертвования и волонтеров.',
    'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&h=200&fit=crop',
    'https://example.com/shelter',
    'shelter',
    8,
    '{"phone": "+7 (861) 234-56-78", "address": "ул. Мира, 42, Анапа", "workingHours": "9:00-18:00"}',
    '{"backgroundColor": "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)", "textColor": "#ffffff", "borderColor": "#11998e"}'
),
(
    'Зоомагазин "Мурзик"',
    'Все для ваших питомцев: корма, игрушки, аксессуары. Доставка по Анапе!',
    'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&h=200&fit=crop',
    'https://example.com/pet-shop',
    'shop',
    6,
    '{"phone": "+7 (861) 345-67-89", "address": "ул. Краснодарская, 78, Анапа", "workingHours": "8:00-20:00"}',
    '{"backgroundColor": "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)", "textColor": "#ffffff", "borderColor": "#f093fb"}'
),
(
    'Груминг-салон "Пушистик"',
    'Профессиональный уход за шерстью, стрижка, мытье. Ваш питомец будет выглядеть великолепно!',
    'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&h=200&fit=crop',
    'https://example.com/grooming',
    'service',
    7,
    '{"phone": "+7 (861) 456-78-90", "address": "ул. Пушкина, 25, Анапа", "workingHours": "10:00-19:00"}',
    '{"backgroundColor": "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)", "textColor": "#ffffff", "borderColor": "#4facfe"}'
);

-- Создание RLS политик (если используется RLS)
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;

-- Политика для чтения - все могут читать активные баннеры
CREATE POLICY "Anyone can view active banners" ON banners
    FOR SELECT USING (is_active = true AND start_date <= NOW() AND end_date >= NOW());

-- Политика для админов - только админы могут создавать/обновлять/удалять
CREATE POLICY "Admins can manage banners" ON banners
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.email IN ('admin@hvostikalert.ru', 'agentgl007@gmail.com')
        )
    );

-- Комментарии к таблице и колонкам
COMMENT ON TABLE banners IS 'Таблица рекламных баннеров для ветеринарных клиник, приютов и магазинов';
COMMENT ON COLUMN banners.title IS 'Заголовок баннера';
COMMENT ON COLUMN banners.description IS 'Описание баннера';
COMMENT ON COLUMN banners.image_url IS 'URL изображения баннера';
COMMENT ON COLUMN banners.link_url IS 'URL ссылки при клике на баннер';
COMMENT ON COLUMN banners.type IS 'Тип баннера: veterinary, shelter, shop, service';
COMMENT ON COLUMN banners.priority IS 'Приоритет отображения (больше = выше)';
COMMENT ON COLUMN banners.is_active IS 'Активен ли баннер';
COMMENT ON COLUMN banners.start_date IS 'Дата начала показа';
COMMENT ON COLUMN banners.end_date IS 'Дата окончания показа';
COMMENT ON COLUMN banners.contact_info IS 'Контактная информация в JSON формате';
COMMENT ON COLUMN banners.style IS 'Стили баннера в JSON формате';
