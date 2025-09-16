import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

export async function POST() {
  try {
    console.log('🔧 Исправляем координаты для объявления в Гостагаевской...')
    
    // Правильные координаты для Гостагаевской
    const correctCoordinates = {
      latitude: 45.02063,
      longitude: 37.50175
    }
    
    // Обновляем координаты для объявления в Гостагаевской (нечувствительно к регистру)
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
    
    console.log('✅ Координаты обновлены в базе данных:', data)
    
    return NextResponse.json({
      message: 'Координаты для Гостагаевской исправлены в базе данных',
      updatedData: data,
      newCoordinates: correctCoordinates
    })
    
  } catch (error) {
    console.error('❌ Ошибка:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
