import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Этот API endpoint служит для уведомления о том, что настройки были обновлены
    // В реальном приложении здесь можно было бы добавить WebSocket или Server-Sent Events
    // для мгновенного обновления всех открытых вкладок
    
    // Пока что просто возвращаем успешный ответ
    // Главная страница будет перезагружать настройки при следующем обращении
    
    return NextResponse.json({ 
      success: true, 
      message: 'Settings refresh signal sent',
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    console.error('API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
