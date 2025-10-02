import { NextRequest, NextResponse } from 'next/server'
import { getAuthUrl, getAllSupabaseRedirectUrls } from '@/lib/url-utils'

export async function GET(request: NextRequest) {
  try {
    const currentUrl = getAuthUrl('/auth/callback', request)
    const allUrls = getAllSupabaseRedirectUrls()
    
    return NextResponse.json({
      currentUrl,
      allUrls,
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
      }
    })
  } catch (error: any) {
    return NextResponse.json({ 
      error: 'Error getting redirect URLs',
      details: error.message 
    }, { status: 500 })
  }
}
