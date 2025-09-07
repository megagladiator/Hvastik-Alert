"use client"

import { useState, useEffect } from "react"
import versionData from '../version.json'

interface VersionInfo {
  version: string
  buildDate: string
  buildTime: string
  description: string
  features: string[]
  changelog: {
    [key: string]: {
      date: string
      changes: string[]
    }
  }
}

export function VersionInfo() {
  const [versionInfo, setVersionInfo] = useState<VersionInfo | null>(null)

  useEffect(() => {
    // Используем прямой импорт данных о версии
    setVersionInfo(versionData as VersionInfo)
  }, [])

  if (!versionInfo) {
    return null
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch {
      return dateString
    }
  }

  return (
    <div className="border-t border-gray-800 mt-8 pt-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center space-y-2">
          <div className="flex items-center space-x-3">
            <span className="font-semibold text-white">Hvastik-Alert</span>
            <span className="px-3 py-1 bg-orange-500 text-white rounded-full text-sm font-bold">
              v{versionInfo.version}
            </span>
          </div>
          <div className="text-sm text-gray-300">
            Сборка от {formatDate(versionInfo.buildDate)} в {versionInfo.buildTime}
          </div>
          <div className="text-xs text-gray-400 max-w-2xl text-center">
            {versionInfo.description}
          </div>
        </div>
      </div>
    </div>
  )
}
