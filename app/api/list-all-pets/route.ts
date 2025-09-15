import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

export async function GET() {
  try {
    console.log('🔍 Получаем все объявления из базы данных...')
    
    // Получаем все объявления
    const { data: pets, error } = await supabase
      .from('pets')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('❌ Ошибка при получении данных:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    console.log(`📊 Найдено объявлений: ${pets?.length || 0}`)
    
    if (pets && pets.length > 0) {
      pets.forEach((pet, index) => {
        console.log(`${index + 1}. ${pet.name} в ${pet.location} (${pet.latitude}, ${pet.longitude})`)
      })
    }
    
    return NextResponse.json({
      totalPets: pets?.length || 0,
      pets: pets?.map(pet => ({
        id: pet.id,
        name: pet.name,
        location: pet.location,
        latitude: pet.latitude,
        longitude: pet.longitude,
        status: pet.status,
        created_at: pet.created_at
      })) || []
    })
    
  } catch (error) {
    console.error('❌ Ошибка:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
