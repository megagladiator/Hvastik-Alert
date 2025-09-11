import type { Metadata } from 'next'
import './globals.css'
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { UserEmailIndicator } from "@/components/user-email-indicator"
import SupabaseKeepAlive from "@/components/supabase-keep-alive"
import { Providers } from "@/components/providers"
import { Logo } from "@/components/logo"

export const metadata: Metadata = {
  title: 'v0 App',
  description: 'Created with v0',
  generator: 'v0.dev',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className="min-h-screen bg-background font-sans antialiased">
        <Providers>
          <header className="w-full bg-white/95 backdrop-blur-sm shadow-sm border-b sticky top-0 z-50">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
              <Logo />
              <UserEmailIndicator />
            </div>
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
        </Providers>
      </body>
    </html>
  )
}
