import type { Metadata } from 'next'
import './globals.css'
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { UserEmailIndicator } from "@/components/user-email-indicator"

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
      </body>
    </html>
  )
}
