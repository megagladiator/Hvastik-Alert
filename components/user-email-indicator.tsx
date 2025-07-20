"use client"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export function UserEmailIndicator() {
  const [user, setUser] = useState<any>(null)
  const pathname = usePathname()
  const router = useRouter()
  useEffect(() => {
    let unsubscribe: any = null
    async function fetchUser() {
      if (supabase) {
        const { data } = await supabase.auth.getUser()
        setUser(data.user)
        // Подписка на изменения сессии
        unsubscribe = supabase.auth.onAuthStateChange((_event, session) => {
          setUser(session?.user ?? null)
        })
      }
    }
    fetchUser()
    return () => {
      if (unsubscribe && typeof unsubscribe.unsubscribe === 'function') {
        unsubscribe.unsubscribe()
      }
    }
  }, [])

  if (!user) {
    return (
      <Button className="bg-orange-500 hover:bg-orange-600" onClick={() => router.push("/auth")}>Войти / Регистрация</Button>
    )
  }

  if (pathname === "/cabinet") {
    return (
      <div className="flex flex-col items-end gap-1">
        <div className="flex items-center gap-3">
          <span className="text-orange-600 font-semibold">{user.email}</span>
          <Button variant="outline" onClick={() => router.push("/")}>На главную</Button>
        </div>
        <Button variant="ghost" size="sm" className="mt-1 text-gray-500" onClick={async () => {
          if (supabase && supabase.auth) {
            await supabase.auth.signOut()
          }
          router.push("/")
          location.reload()
        }}>Выйти</Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-3">
        <span className="text-orange-600 font-semibold">{user.email}</span>
        <Button variant="outline" onClick={() => router.push("/cabinet")}>Личный кабинет</Button>
      </div>
      <Button variant="ghost" size="sm" className="mt-1 text-gray-500" onClick={async () => {
        if (supabase && supabase.auth) {
          await supabase.auth.signOut()
        }
        router.push("/")
        location.reload()
      }}>Выйти</Button>
    </div>
  )
} 