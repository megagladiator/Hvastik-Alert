"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Settings } from "lucide-react"
import BackgroundImageSettings from "@/components/admin/background-settings"

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                На главную
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <Settings className="h-6 w-6 text-orange-500" />
              <h1 className="text-xl font-bold text-gray-900">Административная панель</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Настройки сайта</h2>
        <div className="grid grid-cols-1 gap-6">
          <BackgroundImageSettings />
          {/* Здесь можно добавить другие блоки настроек */}
        </div>
      </div>
    </div>
  )
}
