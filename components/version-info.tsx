"use client"

import { useState, useEffect } from "react"

interface VersionInfo {
  version: string
  buildDate: string
  buildTime: string
  description: string
}

export function VersionInfo() {
  const [versionInfo, setVersionInfo] = useState<VersionInfo | null>(null)

  useEffect(() => {
    // Загружаем информацию о версии
    fetch('/version.json')
      .then(response => response.json())
      .then(data => setVersionInfo(data))
      .catch(() => {
        // Fallback данные если файл не найден
        setVersionInfo({
          version: "1.0.1",
          buildDate: "2024-12-07",
          buildTime: "15:30:00",
          description: "Hvastik-Alert - Платформа для поиска потерянных и найденных домашних животных"
        })
      })
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
    <div className="text-center text-sm text-gray-500 py-4 border-t border-gray-200 mt-8">
      <div className="flex flex-col items-center space-y-1">
        <div className="flex items-center space-x-2">
          <span className="font-medium text-gray-600">Hvastik-Alert</span>
          <span className="px-2 py-1 bg-orange-100 text-orange-600 rounded-full text-xs font-medium">
            v{versionInfo.version}
          </span>
        </div>
        <div className="text-xs text-gray-400">
          Сборка от {formatDate(versionInfo.buildDate)} в {versionInfo.buildTime}
        </div>
        <div className="text-xs text-gray-400 max-w-md">
          {versionInfo.description}
        </div>
      </div>
    </div>
  )
}
