import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

export async function POST() {
  try {
    console.log('🔧 Обновляем координаты для Гостагаевской...')
    
    // Правильные координаты для Гостагаевской
    const correctCoordinates = {
      latitude: 45.02063,
      longitude: 37.50175
    }
    
    // Обновляем координаты для объявления в Гостагаевской
    const { data, error } = await supabase
      .from('pets')
      .update({
        latitude: correctCoordinates.latitude,
        longitude: correctCoordinates.longitude
      })
      .ilike('location', '%гостагаевская%')
      .select()
    
    if (error) {
      console.error('❌ Ошибка при обновлении координат:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    if (data && data.length > 0) {
      console.log('✅ Координаты успешно обновлены:', data[0])
      return NextResponse.json({ 
        success: true, 
        message: 'Координаты обновлены',
        pet: data[0],
        newCoordinates: correctCoordinates
      })
    } else {
      console.log('⚠️ Объявление с Гостагаевской не найдено')
      return NextResponse.json({ 
        success: false, 
        message: 'Объявление с Гостагаевской не найдено' 
      })
    }
  } catch (error) {
    console.error('❌ Ошибка:', error)
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 })
  }
}
