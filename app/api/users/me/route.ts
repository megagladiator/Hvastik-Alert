import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getUserByEmail } from '@/lib/firebase-admin'

// Локальное хранилище ролей пользователей (в продакшене используйте базу данных)
const userRoles: Record<string, 'admin' | 'user'> = {
  'agentgl007@gmail.com': 'admin', // Администратор
  // Остальные пользователи по умолчанию имеют роль 'user'
}

function getUserRole(email: string): 'admin' | 'user' {
  return userRoles[email] || 'user'
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Получаем пользователя из Firebase
    const firebaseUser = await getUserByEmail(session.user.email!)
    
    if (!firebaseUser) {
      return NextResponse.json({ error: 'User not found in Firebase' }, { status: 404 })
    }

    // Преобразуем в наш формат
    const user = {
      id: firebaseUser.uid,
      email: firebaseUser.email || '',
      name: firebaseUser.displayName || firebaseUser.email || '',
      role: getUserRole(firebaseUser.email || ''),
      status: firebaseUser.disabled ? 'banned' : 'active',
      emailVerified: firebaseUser.emailVerified,
      createdAt: new Date(firebaseUser.metadata.creationTime),
      lastLoginAt: firebaseUser.metadata.lastSignInTime ? new Date(firebaseUser.metadata.lastSignInTime) : null,
    }

    return NextResponse.json({
      user
    })

  } catch (error: any) {
    console.error('API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
