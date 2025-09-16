import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

// Локальное хранилище ролей пользователей (в продакшене используйте базу данных)
const userRoles: Record<string, 'admin' | 'user'> = {
  'agentgl007@gmail.com': 'admin', // Администратор
  // Остальные пользователи по умолчанию имеют роль 'user'
}

function getUserRole(email: string): 'admin' | 'user' {
  return userRoles[email] || 'user'
}

function setUserRole(email: string, role: 'admin' | 'user'): void {
  userRoles[email] = role
}

export async function GET(request: NextRequest) {
  try {
    // Получаем токен из заголовков
    const authHeader = request.headers.get('authorization')
    console.log('Auth header:', authHeader)
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('No valid auth header')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    console.log('Token received:', token.substring(0, 20) + '...')
    
    // Проверяем токен через Supabase
    const { data: { user }, error: authError } = await supabaseServer.auth.getUser(token)
    console.log('Auth result:', { user: user?.email, error: authError })
    
    if (authError || !user) {
      console.log('Auth failed:', authError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Проверяем, что пользователь - администратор
    if (user.email !== 'agentgl007@gmail.com') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    const role = searchParams.get('role')
    const status = searchParams.get('status')

    // Получаем всех пользователей из Supabase
    console.log('Fetching users from Supabase...')
    const { data: supabaseUsers, error: usersError } = await supabaseServer.auth.admin.listUsers()
    console.log('Users fetch result:', { count: supabaseUsers?.users?.length, error: usersError })
    
    if (usersError) {
      console.error('Error fetching users:', usersError)
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
    }
    
    // Преобразуем в наш формат
    let users = supabaseUsers.users.map(user => ({
      id: user.id,
      email: user.email || '',
      name: user.user_metadata?.name || user.email || '',
      role: getUserRole(user.email || ''),
      status: user.banned_until ? 'banned' : 'active',
      emailVerified: !!user.email_confirmed_at,
      createdAt: new Date(user.created_at),
      lastLoginAt: user.last_sign_in_at ? new Date(user.last_sign_in_at) : null,
    }))

    // Фильтрация
    if (email) {
      users = users.filter(user => 
        user.email.toLowerCase().includes(email.toLowerCase())
      )
    }

    if (role && role !== 'all') {
      users = users.filter(user => user.role === role)
    }

    if (status && status !== 'all') {
      users = users.filter(user => user.status === status)
    }

    return NextResponse.json({
      users,
      total: users.length
    })

  } catch (error: any) {
    console.error('API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  return NextResponse.json({ 
    error: 'User creation through admin panel is not supported. Users must register through the client application.' 
  }, { status: 400 })
}

export async function PUT(request: NextRequest) {
  try {
    // Получаем токен из заголовков
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    
    // Проверяем токен через Supabase
    const { data: { user }, error: authError } = await supabaseServer.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Проверяем, что пользователь - администратор
    if (user.email !== 'agentgl007@gmail.com') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { id, email, name, role, status } = body

    // Обновляем роль пользователя в локальном хранилище
    if (role && email) {
      setUserRole(email, role)
    }

    // Обновляем статус пользователя в Supabase
    if (status) {
      const banned = status === 'banned'
      const { error: updateError } = await supabaseServer.auth.admin.updateUserById(id, {
        ban_duration: banned ? '876000h' : 'none' // 100 лет для бана
      })
      
      if (updateError) {
        console.error('Error updating user status:', updateError)
        return NextResponse.json({ error: 'Failed to update user status' }, { status: 500 })
      }
    }

    return NextResponse.json({
      message: 'User updated successfully'
    })

  } catch (error: any) {
    console.error('API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Получаем токен из заголовков
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    
    // Проверяем токен через Supabase
    const { data: { user }, error: authError } = await supabaseServer.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Проверяем, что пользователь - администратор
    if (user.email !== 'agentgl007@gmail.com') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Не позволяем удалять самого себя
    if (id === user.id) {
      return NextResponse.json({ error: 'Cannot delete yourself' }, { status: 400 })
    }

    // Удаляем пользователя из Supabase
    const { error: deleteError } = await supabaseServer.auth.admin.deleteUser(id)
    
    if (deleteError) {
      console.error('Error deleting user:', deleteError)
      return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 })
    }

    return NextResponse.json({
      message: 'User deleted successfully'
    })

  } catch (error: any) {
    console.error('API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
