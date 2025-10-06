import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { petData, userEmail } = body

    if (!petData) {
      return NextResponse.json({ error: 'Pet data is required' }, { status: 400 })
    }

    // Email админа
    const adminEmail = 'agentgl007@gmail.com'

    // Формируем содержимое письма
    const emailSubject = `🆕 Новое объявление: ${petData.type === 'lost' ? 'Потерялся питомец' : 'Нашли питомца'} - ${petData.name}`
    
    const emailContent = `
Новое объявление на сайте Хвостик Alert!

📋 Детали объявления:
• Тип: ${petData.type === 'lost' ? 'Потерялся питомец' : 'Нашли питомца'}
• Имя питомца: ${petData.name}
• Порода: ${petData.breed}
• Цвет: ${petData.color}
• Местоположение: ${petData.location}
• Описание: ${petData.description}
• Контактное лицо: ${petData.contact_name}
• Телефон: ${petData.contact_phone}
${petData.reward ? `• Вознаграждение: ${petData.reward} ₽` : ''}

👤 Пользователь: ${userEmail || 'Анонимно'}
📅 Дата создания: ${new Date().toLocaleString('ru-RU')}

🔗 Ссылка на объявление: ${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/pet/${petData.id}

---
Хвостик Alert - Поиск питомцев в Анапе
    `.trim()

    // Логируем информацию о новом объявлении (временно вместо email)
    console.log('🆕 НОВОЕ ОБЪЯВЛЕНИЕ:', {
      subject: emailSubject,
      content: emailContent,
      adminEmail: adminEmail,
      timestamp: new Date().toISOString()
    })

    // TODO: Настроить отправку email через Supabase Edge Functions
    // Пока что просто логируем в консоль
    return NextResponse.json({ 
      success: true, 
      message: 'Pet created and admin notification logged (email setup pending)' 
    })

    // Если Supabase не настроен, просто возвращаем успех
    return NextResponse.json({ 
      success: true, 
      message: 'Pet created (email notification skipped - Supabase not configured)' 
    })

  } catch (error: any) {
    console.error('Notify admin API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}






