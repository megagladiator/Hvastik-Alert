import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseRedirectUrls } from '@/lib/url-utils'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const redirectUrls = getSupabaseRedirectUrls(request)
    
    return NextResponse.json({
      redirectUrls,
      baseUrl: request.headers.get('origin') || request.headers.get('host'),
      protocol: request.headers.get('x-forwarded-proto') || 'http'
    })
  } catch (error) {
    console.error('Error getting Supabase config:', error)
    return NextResponse.json({ error: 'Failed to get config' }, { status: 500 })
  }
}
