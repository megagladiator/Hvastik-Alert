import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Админский клиент Supabase не настроен' },
        { status: 500 }
      )
    }

    const { searchParams } = new URL(request.url)
    const table = searchParams.get('table')

    if (!table) {
      return NextResponse.json({ error: 'Table parameter is required' }, { status: 400 })
    }

    let data, error

    switch (table) {
      case 'pets':
        const { data: petsData, error: petsError } = await supabaseAdmin
          .from('pets')
          .select('*')
          .order('created_at', { ascending: false })
        
        // Получаем email пользователей отдельно
        if (petsData && !petsError) {
          const userIds = [...new Set(petsData.map(pet => pet.user_id).filter(Boolean))]
          const userEmails: Record<string, string> = {}
          
          if (userIds.length > 0) {
            const { data: usersData } = await supabaseAdmin.auth.admin.listUsers()
            if (usersData?.users) {
              usersData.users.forEach(user => {
                userEmails[user.id] = user.email || ''
              })
            }
          }
          
          data = petsData.map(pet => ({
            ...pet,
            user_email: pet.user_id ? userEmails[pet.user_id] || null : null
          }))
        } else {
          data = petsData
        }
        error = petsError
        break

      case 'users':
        // Получаем пользователей через Admin API
        const { data: usersData, error: usersError } = await supabaseAdmin.auth.admin.listUsers()
        
        if (usersError) {
          data = []
          error = usersError
        } else {
          data = usersData?.users || []
          error = null
        }
        break

      case 'settings':
        const { data: settingsData, error: settingsError } = await supabaseAdmin
          .from('app_settings')
          .select('*')
          .order('updated_at', { ascending: false })
        
        data = settingsData
        error = settingsError
        break

      default:
        return NextResponse.json({ error: 'Invalid table name' }, { status: 400 })
    }

    if (error) {
      console.error(`Error fetching ${table}:`, error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })

  } catch (error: any) {
    console.error('Database tables API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Админский клиент Supabase не настроен' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { table, id } = body

    if (!table || !id) {
      return NextResponse.json({ error: 'Table and ID are required' }, { status: 400 })
    }

    let error

    switch (table) {
      case 'pets':
        const { error: petsError } = await supabaseAdmin
          .from('pets')
          .delete()
          .eq('id', id)
        
        error = petsError
        break

      case 'users':
        const { error: usersError } = await supabaseAdmin.auth.admin.deleteUser(id)
        error = usersError
        break

      case 'settings':
        const { error: settingsError } = await supabaseAdmin
          .from('app_settings')
          .delete()
          .eq('id', id)
        
        error = settingsError
        break

      default:
        return NextResponse.json({ error: 'Invalid table name' }, { status: 400 })
    }

    if (error) {
      console.error(`Error deleting from ${table}:`, error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Record deleted successfully' })

  } catch (error: any) {
    console.error('Delete record API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Админский клиент Supabase не настроен' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { table, id, data: updateData } = body

    if (!table || !id || !updateData) {
      return NextResponse.json({ error: 'Table, ID and data are required' }, { status: 400 })
    }

    let error

    switch (table) {
      case 'pets':
        const { error: petsError } = await supabaseAdmin
          .from('pets')
          .update(updateData)
          .eq('id', id)
        
        error = petsError
        break

      case 'users':
        const { error: usersError } = await supabaseAdmin.auth.admin.updateUserById(id, updateData)
        error = usersError
        break

      case 'settings':
        const { error: settingsError } = await supabaseAdmin
          .from('app_settings')
          .update(updateData)
          .eq('id', id)
        
        error = settingsError
        break

      default:
        return NextResponse.json({ error: 'Invalid table name' }, { status: 400 })
    }

    if (error) {
      console.error(`Error updating ${table}:`, error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Record updated successfully' })

  } catch (error: any) {
    console.error('Update record API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
