"use client"
import { usePathname, useRouter } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { useUser } from "@/hooks/use-user"
import { Badge } from "@/components/ui/badge"

export function UserEmailIndicator() {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session, status } = useSession()
  const { user, loading, isAdmin } = useUser()

  if (status === "loading" || loading) {
    return <div className="text-sm text-gray-500">Загрузка...</div>
  }

  if (session?.user && user) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex flex-col items-end">
          <span className="text-sm text-gray-600">
            {user.name || user.email}
          </span>
          <div className="flex items-center gap-1">
            <Badge 
              variant={isAdmin ? "default" : "secondary"}
              className="text-xs"
            >
              {isAdmin ? "Админ" : "Пользователь"}
            </Badge>
            <Badge 
              variant={user.status === 'active' ? "default" : "destructive"}
              className="text-xs"
            >
              {user.status === 'active' ? "Активен" : user.status}
            </Badge>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => signOut()}
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