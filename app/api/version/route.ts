import { NextResponse } from 'next/server'
import packageJson from '../../package.json'

export async function GET() {
  try {
    const now = new Date()
    const buildDate = now.toISOString().split('T')[0] // YYYY-MM-DD
    const buildTime = now.toTimeString().split(' ')[0] // HH:MM:SS
    
    return NextResponse.json({
      version: packageJson.version,
      buildDate: buildDate,
      buildTime: buildTime,
      description: "Hvastik-Alert - Платформа для поиска потерянных и найденных домашних животных в Анапе",
      timestamp: now.toISOString()
    })
  } catch (error) {
    return NextResponse.json({
      version: "1.0.0",
      buildDate: new Date().toISOString().split('T')[0],
      buildTime: new Date().toTimeString().split(' ')[0],
      description: "Hvastik-Alert - Платформа для поиска потерянных и найденных домашних животных в Анапе",
      error: "Failed to get version info"
    })
  }
}
