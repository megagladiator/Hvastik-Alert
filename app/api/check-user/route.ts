import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Проверяем существование пользователя в auth.users
    const { data, error } = await supabase.auth.admin.listUsers()
    
    if (error) {
      console.error('Ошибка при получении пользователей:', error)
      return NextResponse.json(
        { error: 'Database error' },
        { status: 500 }
      )
    }

    // Ищем пользователя по email
    const userExists = data.users.some(user => user.email === email)

    return NextResponse.json({
      exists: userExists,
      email: email
    })

  } catch (error) {
    console.error('Ошибка при проверке пользователя:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
