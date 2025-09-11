import Link from 'next/link'
import { Heart } from 'lucide-react'

export function Logo() {
  return (
    <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-all duration-300 hover:scale-105">
      <div className="relative">
        <Heart className="h-8 w-8 text-orange-500" />
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-400 rounded-full animate-pulse"></div>
      </div>
      <div className="hidden sm:block">
        <h1 className="text-xl font-bold text-gray-900 leading-tight">Хвостик Alert</h1>
        <p className="text-xs text-gray-500 leading-tight">Анапа - поиск питомцев</p>
      </div>
    </Link>
  )
}
