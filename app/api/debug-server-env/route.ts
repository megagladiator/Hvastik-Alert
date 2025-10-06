import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const envInfo = {
      NODE_ENV: process.env.NODE_ENV,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Not set',
      VERCEL_URL: process.env.VERCEL_URL,
      
      // Request info
      hostname: request.headers.get('host'),
      protocol: request.headers.get('x-forwarded-proto') || 'https',
      port: request.headers.get('x-forwarded-port') || 'default',
      origin: request.headers.get('origin') || request.headers.get('host'),
      
      // Headers that might affect URL resolution
      forwardedHost: request.headers.get('x-forwarded-host'),
      forwardedProto: request.headers.get('x-forwarded-proto'),
      forwardedPort: request.headers.get('x-forwarded-port'),
      realIp: request.headers.get('x-real-ip'),
      
      // URL from request
      requestUrl: request.url,
      requestOrigin: new URL(request.url).origin,
    }

    return NextResponse.json(envInfo)
  } catch (error: any) {
    return NextResponse.json({ 
      error: 'Failed to get environment info',
      details: error.message 
    }, { status: 500 })
  }
}
