import type { Metadata } from 'next'
import './globals.css'
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { UserEmailIndicator } from "@/components/user-email-indicator"
import SupabaseKeepAlive from "@/components/supabase-keep-alive"

export const metadata: Metadata = {
  title: 'v0 App',
  description: 'Created with v0',
  generator: 'v0.dev',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className="min-h-screen bg-background font-sans antialiased">
        <header className="w-full flex justify-between items-center p-4">
          <div>
            {/* Логотип и навигация */}
          </div>
          <UserEmailIndicator />
        </header>
        {children}
        <SupabaseKeepAlive 
          config={{
            initialDelay: 5000, // 5 секунд
            interval: process.env.NODE_ENV === 'development' 
              ? 5 * 60 * 1000 // 5 минут в разработке
              : 24 * 60 * 60 * 1000, // 24 часа в продакшене
            maxRetries: 3,
            retryDelay: 10000 // 10 секунд
          }}
        />
      </body>
    </html>
  )
}
