"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import Link from "next/link"

export default function CabinetPage() {
  const [user, setUser] = useState<any>(null)
  const [ads, setAds] = useState<any[]>([])
  const [sort, setSort] = useState<string>("newest")
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>("active")
  const router = useRouter()

  useEffect(() => {
    async function fetchUserAndAds() {
      if (!supabase) return
      const { data: userData, error: userError } = await supabase.auth.getUser()
      if (!userData?.user) {
        router.push("/")
        return
      }
      setUser(userData.user)
      // Получаем объявления пользователя (только с user_id текущего пользователя)
      const { data: pets, error: petsError } = await supabase
        .from("pets")
        .select("*")
        .eq("user_id", userData.user.id)
      setAds(pets || [])
      setLoading(false)
    }
    fetchUserAndAds()
  }, [router])

  const handleSort = (value: string) => {
    setSort(value)
    let sorted = [...ads]
    if (value === "newest") sorted.sort((a, b) => b.created_at.localeCompare(a.created_at))
    if (value === "oldest") sorted.sort((a, b) => a.created_at.localeCompare(b.created_at))
    setAds(sorted)
  }

  const handleArchive = async (id: string) => {
    if (!supabase) return
    await supabase.from("pets").update({ status: "archived" }).eq("id", id)
    setAds(ads.map(ad => ad.id === id ? { ...ad, status: "archived" } : ad))
  }

  const handleUnarchive = async (id: string) => {
    if (!supabase) return
    await supabase.from("pets").update({ status: "active" }).eq("id", id)
    setAds(ads.map(ad => ad.id === id ? { ...ad, status: "active" } : ad))
  }

  const handleEdit = (id: string) => {
    router.push(`/add?id=${id}`)
  }

  const isAdmin = user?.email === 'agentgl007@gmail.com'

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Личный кабинет</h1>
          <div className="flex items-center gap-4">
            {isAdmin && (
              <Link href="/admin">
                <Button variant="outline" className="border-orange-500 text-orange-500 hover:bg-orange-50">
                  Админ панель
                </Button>
              </Link>
            )}
            <span className="text-orange-600 font-medium">{user?.email}</span>
          </div>
        </div>
      </header>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Мои объявления</h2>
          <div className="flex items-center gap-4">
            <Link href="/add">
              <Button className="bg-orange-500 hover:bg-orange-600 text-white">Добавить объявление</Button>
            </Link>
            <Select value={sort} onValueChange={handleSort}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Сначала новые</SelectItem>
                <SelectItem value="oldest">Сначала старые</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Активные</SelectItem>
                <SelectItem value="archived">Архив</SelectItem>
                <SelectItem value="all">Все</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        {loading ? (
          <div>Загрузка...</div>
        ) : (
          <div className="space-y-4">
            {ads.filter(ad => filter === "all" ? true : ad.status === filter).map(ad => (
              <Card key={ad.id} className="flex flex-col md:flex-row items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  {ad.photo_url && <img src={ad.photo_url} alt="" className="w-20 h-20 object-cover rounded-lg" />}
                  <div>
                    <div className="font-semibold text-lg">{ad.name}</div>
                    <div className="text-gray-600 text-sm">{ad.breed} • {ad.animal_type}</div>
                    <div className="text-gray-500 text-xs">{new Date(ad.created_at).toLocaleString()}</div>
                    <Badge className={ad.status === "archived" ? "bg-gray-400" : "bg-orange-500"}>{ad.status === "archived" ? "В архиве" : "Активно"}</Badge>
                  </div>
                </div>
                <div className="flex flex-col gap-2 mt-4 md:mt-0">
                  <Button variant="outline" onClick={() => handleEdit(ad.id)} disabled={ad.status === "archived"}>Редактировать</Button>
                  {ad.status === "archived"
                    ? <Button variant="default" onClick={() => handleUnarchive(ad.id)}>Вернуть из архива</Button>
                    : <Button variant="destructive" onClick={() => handleArchive(ad.id)}>В архив</Button>
                  }
                </div>
              </Card>
            ))}
            {ads.length === 0 && <div className="text-gray-500">У вас пока нет объявлений.</div>}
          </div>
        )}
      </div>
    </div>
  )
} 