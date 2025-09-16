import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

export async function GET() {
  try {
    console.log('🔍 Проверяем координаты объявления в базе данных...')
    
    // Получаем объявление с Гостагаевской (нечувствительно к регистру)
    const { data: pets, error } = await supabase
      .from('pets')
      .select('*')
      .ilike('location', '%гостагаевская%')
    
    if (error) {
      console.error('❌ Ошибка при получении данных:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    if (!pets || pets.length === 0) {
      return NextResponse.json({ error: 'Объявление не найдено' }, { status: 404 })
    }
    
    const pet = pets[0]
    console.log('📊 Координаты в базе данных:', {
      name: pet.name,
      location: pet.location,
      latitude: pet.latitude,
      longitude: pet.longitude
    })
    
    return NextResponse.json({
      name: pet.name,
      location: pet.location,
      latitude: pet.latitude,
      longitude: pet.longitude,
      message: 'Координаты получены из базы данных'
    })
    
  } catch (error) {
    console.error('❌ Ошибка:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
