import { NextResponse } from 'next/server'
import versionData from '../../../version.json'

export async function GET() {
  try {
    return NextResponse.json({
      version: versionData.version,
      buildDate: versionData.buildDate,
      buildTime: versionData.buildTime,
      description: versionData.description,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Failed to get version info',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}