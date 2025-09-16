import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    // Проверяем, что у нас есть серверный клиент Supabase
    if (!supabaseServer) {
      return NextResponse.json({ error: 'Supabase server client not configured' }, { status: 500 })
    }

    // Получаем статистику по всем таблицам
    const stats = {
      users: 0,
      pets: 0,
      activePets: 0,
      lostPets: 0,
      foundPets: 0,
      archivedPets: 0,
      appSettings: 0,
      totalSize: 0
    }

    try {
      // Статистика пользователей через Admin API
      try {
        const { data: usersData, error: usersError } = await supabaseServer.auth.admin.listUsers()
        if (!usersError && usersData) {
          stats.users = usersData.users.length
        }
      } catch (error) {
        console.error('Error fetching users count:', error)
      }

      // Статистика питомцев
      const { count: petsCount, error: petsError } = await supabaseServer
        .from('pets')
        .select('*', { count: 'exact', head: true })

      if (!petsError) {
        stats.pets = petsCount || 0
      }

      // Статистика активных питомцев
      const { count: activePetsCount, error: activePetsError } = await supabaseServer
        .from('pets')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')

      if (!activePetsError) {
        stats.activePets = activePetsCount || 0
      }

      // Статистика потерянных питомцев
      const { count: lostPetsCount, error: lostPetsError } = await supabaseServer
        .from('pets')
        .select('*', { count: 'exact', head: true })
        .eq('type', 'lost')
        .eq('status', 'active')

      if (!lostPetsError) {
        stats.lostPets = lostPetsCount || 0
      }

      // Статистика найденных питомцев
      const { count: foundPetsCount, error: foundPetsError } = await supabaseServer
        .from('pets')
        .select('*', { count: 'exact', head: true })
        .eq('type', 'found')
        .eq('status', 'active')

      if (!foundPetsError) {
        stats.foundPets = foundPetsCount || 0
      }

      // Статистика архивированных питомцев
      const { count: archivedPetsCount, error: archivedPetsError } = await supabaseServer
        .from('pets')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'archived')

      if (!archivedPetsError) {
        stats.archivedPets = archivedPetsCount || 0
      }

      // Статистика настроек приложения
      const { count: settingsCount, error: settingsError } = await supabaseServer
        .from('app_settings')
        .select('*', { count: 'exact', head: true })

      if (!settingsError) {
        stats.appSettings = settingsCount || 0
      }

    } catch (error) {
      console.error('Error fetching database stats:', error)
      // Возвращаем базовую статистику даже при ошибках
    }

    return NextResponse.json(stats)

  } catch (error: any) {
    console.error('Database stats API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
