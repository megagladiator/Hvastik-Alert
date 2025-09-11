"use client"
import { usePathname, useRouter } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"

export function UserEmailIndicator() {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session, status } = useSession()

  if (status === "loading") {
    return <div>Загрузка...</div>
  }

  if (session?.user) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">
          {session.user.email}
        </span>
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