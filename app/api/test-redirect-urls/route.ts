import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Простая проверка базового URL
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://hvostikalert.ru' 
      : 'http://localhost:3000'
    
    const currentUrl = `${baseUrl}/auth/callback`
    
    return NextResponse.json({
      currentUrl,
      baseUrl,
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        VERCEL_URL: process.env.VERCEL_URL,
        NEXTAUTH_URL: process.env.NEXTAUTH_URL
      },
      headers: {
        origin: request.headers.get('origin'),
        host: request.headers.get('host'),
        'x-forwarded-proto': request.headers.get('x-forwarded-proto'),
        'x-forwarded-host': request.headers.get('x-forwarded-host')
      },
      message: 'Test endpoint working'
    })
  } catch (error: any) {
    return NextResponse.json({ 
      error: 'Error getting redirect URLs',
      details: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}
