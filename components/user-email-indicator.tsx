"use client"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useSupabaseSession } from "@/hooks/use-supabase-session"
import { supabase } from "@/lib/supabase"
import { Badge } from "@/components/ui/badge"

export function UserEmailIndicator() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, loading, isAuthenticated } = useSupabaseSession()

  const handleSignOut = async () => {
    if (supabase) {
      await supabase.auth.signOut()
      router.push("/")
    }
  }

  if (loading) {
    return <div className="text-sm text-gray-500">Загрузка...</div>
  }

  if (isAuthenticated && user) {
    const isAdmin = user.email === 'agentgl007@gmail.com'
    
    return (
      <div className="flex items-center gap-2">
        <div className="flex flex-col items-end">
          <span className="text-lg font-semibold text-amber-700">
            {user.user_metadata?.name || user.email}
          </span>
          <div className="flex items-center gap-1">
            <Badge 
              variant={isAdmin ? "default" : "secondary"}
              className="text-xs"
            >
              {isAdmin ? "Админ" : "Пользователь"}
            </Badge>
            <Badge 
              variant={user.email_confirmed_at ? "default" : "destructive"}
              className="text-xs"
            >
              {user.email_confirmed_at ? "Подтвержден" : "Не подтвержден"}
            </Badge>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleSignOut}
        >
          Выйти
        </Button>
      </div>
    )
  }

  return (
    <Button className="bg-orange-500 hover:bg-orange-600" onClick={() => router.push("/auth")}>
      Войти / Регистрация
    </Button>
  )
} 