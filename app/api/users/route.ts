import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getAllUsers, updateUserStatus, deleteUser as firebaseDeleteUser } from '@/lib/firebase-admin'

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
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Проверяем, что пользователь - администратор
    const currentUserRole = getUserRole(session.user.email!)
    if (currentUserRole !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    const role = searchParams.get('role')
    const status = searchParams.get('status')

    // Получаем всех пользователей из Firebase
    const firebaseUsers = await getAllUsers()
    
    // Преобразуем в наш формат
    let users = firebaseUsers.map(user => ({
      id: user.uid,
      email: user.email || '',
      name: user.displayName || user.email || '',
      role: getUserRole(user.email || ''),
      status: user.disabled ? 'banned' : 'active',
      emailVerified: user.emailVerified,
      createdAt: new Date(user.metadata.creationTime),
      lastLoginAt: user.metadata.lastSignInTime ? new Date(user.metadata.lastSignInTime) : null,
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
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Проверяем, что пользователь - администратор
    const currentUserRole = getUserRole(session.user.email!)
    if (currentUserRole !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { email, name, role, status } = body

    // Проверяем, что пользователь с таким email не существует в Firebase
    const firebaseUsers = await getAllUsers()
    const existingUser = firebaseUsers.find(u => u.email === email)
    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 })
    }

    // Создание пользователей через Firebase Admin SDK не поддерживается напрямую
    // Пользователи должны регистрироваться через клиентскую часть
    return NextResponse.json({ 
      error: 'User creation through admin panel is not supported. Users must register through the client application.' 
    }, { status: 400 })

  } catch (error: any) {
    console.error('API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Проверяем, что пользователь - администратор
    const currentUserRole = getUserRole(session.user.email!)
    if (currentUserRole !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { id, email, name, role, status } = body

    // Обновляем роль пользователя в локальном хранилище
    if (role && email) {
      setUserRole(email, role)
    }

    // Обновляем статус пользователя в Firebase
    if (status) {
      const disabled = status === 'banned'
      await updateUserStatus(id, disabled)
    }

    // Получаем обновленную информацию о пользователе
    const firebaseUsers = await getAllUsers()
    const updatedUser = firebaseUsers.find(u => u.uid === id)
    
    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const user = {
      id: updatedUser.uid,
      email: updatedUser.email || '',
      name: updatedUser.displayName || updatedUser.email || '',
      role: getUserRole(updatedUser.email || ''),
      status: updatedUser.disabled ? 'banned' : 'active',
      emailVerified: updatedUser.emailVerified,
      createdAt: new Date(updatedUser.metadata.creationTime),
      lastLoginAt: updatedUser.metadata.lastSignInTime ? new Date(updatedUser.metadata.lastSignInTime) : null,
    }

    return NextResponse.json({
      user,
      message: 'User updated successfully'
    })

  } catch (error: any) {
    console.error('API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Проверяем, что пользователь - администратор
    const currentUserRole = getUserRole(session.user.email!)
    if (currentUserRole !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Получаем информацию о пользователе перед удалением
    const firebaseUsers = await getAllUsers()
    const userToDelete = firebaseUsers.find(u => u.uid === id)
    
    if (!userToDelete) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Не позволяем удалять самого себя
    if (userToDelete.email === session.user.email) {
      return NextResponse.json({ error: 'Cannot delete yourself' }, { status: 400 })
    }

    // Удаляем пользователя из Firebase
    await firebaseDeleteUser(id)

    // Удаляем роль из локального хранилища
    if (userToDelete.email) {
      delete userRoles[userToDelete.email]
    }

    return NextResponse.json({
      message: 'User deleted successfully'
    })

  } catch (error: any) {
    console.error('API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
