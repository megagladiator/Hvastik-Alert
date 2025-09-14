import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { adminAuth } from '@/lib/firebase-admin'
import { getEmailVerificationUrl } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Проверяем, что пользователь - администратор
    if (session.user.email !== 'agentgl007@gmail.com') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    if (!adminAuth) {
      return NextResponse.json({ error: 'Firebase Admin not initialized' }, { status: 500 })
    }

    // Получаем пользователя по email
    const user = await adminAuth.getUserByEmail(email)
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Генерируем ссылку для подтверждения email с универсальным URL
    const actionCodeSettings = {
      url: getEmailVerificationUrl(),
      handleCodeInApp: true,
    }

    const link = await adminAuth.generateEmailVerificationLink(email, actionCodeSettings)

    return NextResponse.json({
      message: 'Verification link generated',
      link: link,
      // В продакшене не отправляйте ссылку в ответе, отправьте письмо
    })

  } catch (error: any) {
    console.error('Error generating verification link:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
