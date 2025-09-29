"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X, ExternalLink, MapPin, Phone, Clock } from "lucide-react"
import Image from "next/image"

interface Banner {
  id: string
  title: string
  description: string
  imageUrl: string
  linkUrl: string
  type: 'veterinary' | 'shelter' | 'shop' | 'service'
  priority: number
  isActive: boolean
  startDate: string
  endDate: string
  contactInfo?: {
    phone?: string
    address?: string
    workingHours?: string
  }
  style?: {
    backgroundColor?: string
    textColor?: string
    borderColor?: string
  }
}

interface BannerProps {
  banner: Banner
  onClose?: (bannerId: string) => void
  showCloseButton?: boolean
  size?: 'small' | 'medium' | 'large'
}

export function Banner({ banner, onClose, showCloseButton = true, size = 'medium' }: BannerProps) {
  const [isVisible, setIsVisible] = useState(true)

  const handleClose = () => {
    setIsVisible(false)
    onClose?.(banner.id)
  }

  const handleClick = () => {
    if (banner.linkUrl) {
      window.open(banner.linkUrl, '_blank', 'noopener,noreferrer')
    }
  }

  const getTypeInfo = (type: string) => {
    switch (type) {
      case 'veterinary':
        return { 
          label: 'Ветклиника', 
          color: 'bg-blue-500/10 text-blue-700 border-blue-200',
          icon: '🏥',
          gradient: 'from-blue-50 via-blue-100 to-indigo-50'
        }
      case 'shelter':
        return { 
          label: 'Приют', 
          color: 'bg-green-500/10 text-green-700 border-green-200',
          icon: '🏠',
          gradient: 'from-green-50 via-green-100 to-emerald-50'
        }
      case 'shop':
        return { 
          label: 'Магазин', 
          color: 'bg-orange-500/10 text-orange-700 border-orange-200',
          icon: '🛒',
          gradient: 'from-orange-50 via-orange-100 to-amber-50'
        }
      case 'service':
        return { 
          label: 'Услуги', 
          color: 'bg-purple-500/10 text-purple-700 border-purple-200',
          icon: '✂️',
          gradient: 'from-purple-50 via-purple-100 to-violet-50'
        }
      default:
        return { 
          label: 'Реклама', 
          color: 'bg-gray-500/10 text-gray-700 border-gray-200',
          icon: '📢',
          gradient: 'from-gray-50 via-gray-100 to-slate-50'
        }
    }
  }

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'h-28'
      case 'large':
        return 'h-52'
      default:
        return 'h-36'
    }
  }

  if (!isVisible) return null

  const typeInfo = getTypeInfo(banner.type)

  return (
    <div 
      className={`
        relative group cursor-pointer transition-all duration-500 hover:shadow-2xl hover:shadow-black/10 hover:-translate-y-1
        ${getSizeClasses()}
        rounded-2xl overflow-hidden
        bg-gradient-to-br ${typeInfo.gradient}
        border border-white/20
        backdrop-blur-sm
      `}
      onClick={handleClick}
    >
      {/* Close button */}
      {showCloseButton && (
        <button
          className="absolute top-3 right-3 z-20 h-7 w-7 rounded-full bg-white/90 hover:bg-white shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
          onClick={(e) => {
            e.stopPropagation()
            handleClose()
          }}
        >
          <X className="h-4 w-4 text-gray-600" />
        </button>
      )}

      {/* Type badge */}
      <div className={`absolute top-3 left-3 z-10 px-3 py-1.5 rounded-full text-xs font-medium ${typeInfo.color} backdrop-blur-sm border`}>
        <span className="mr-1">{typeInfo.icon}</span>
        {typeInfo.label}
      </div>

      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
      </div>

      <div className="relative z-10 h-full flex">
        {/* Image */}
        <div className="relative w-2/5 h-full">
          <div className="absolute inset-0 bg-gradient-to-br from-black/10 to-transparent z-10"></div>
          <Image
            src={banner.imageUrl}
            alt={banner.title}
            fill
            className="object-cover"
            onError={(e) => {
              e.currentTarget.src = '/placeholder-banner.jpg'
            }}
          />
        </div>

        {/* Content */}
        <div className="flex-1 p-5 flex flex-col justify-between">
          <div className="space-y-2">
            <h3 className="font-bold text-lg text-gray-900 leading-tight line-clamp-2">
              {banner.title}
            </h3>
            <p className="text-sm text-gray-700 leading-relaxed line-clamp-2">
              {banner.description}
            </p>
          </div>

          {/* Contact info */}
          {banner.contactInfo && (
            <div className="mt-3 space-y-1.5">
              {banner.contactInfo.phone && (
                <div className="flex items-center text-xs text-gray-600 bg-white/50 rounded-lg px-2 py-1">
                  <Phone className="h-3 w-3 mr-1.5 text-blue-500" />
                  <span className="font-medium">{banner.contactInfo.phone}</span>
                </div>
              )}
              {banner.contactInfo.address && (
                <div className="flex items-center text-xs text-gray-600 bg-white/50 rounded-lg px-2 py-1">
                  <MapPin className="h-3 w-3 mr-1.5 text-green-500" />
                  <span className="line-clamp-1">{banner.contactInfo.address}</span>
                </div>
              )}
              {banner.contactInfo.workingHours && (
                <div className="flex items-center text-xs text-gray-600 bg-white/50 rounded-lg px-2 py-1">
                  <Clock className="h-3 w-3 mr-1.5 text-orange-500" />
                  <span>{banner.contactInfo.workingHours}</span>
                </div>
              )}
            </div>
          )}

          {/* Call to action */}
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center text-xs text-gray-500">
              <ExternalLink className="h-3 w-3 mr-1" />
              <span>Подробнее</span>
            </div>
            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Hover effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/0 to-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    </div>
  )
}

// Banner carousel component
interface BannerCarouselProps {
  banners: Banner[]
  autoRotate?: boolean
  rotationInterval?: number
  maxBanners?: number
}

export function BannerCarousel({ 
  banners, 
  autoRotate = true, 
  rotationInterval = 10000,
  maxBanners = 3 
}: BannerCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [closedBanners, setClosedBanners] = useState<Set<string>>(new Set())

  const activeBanners = banners
    .filter(banner => banner.isActive && !closedBanners.has(banner.id))
    .sort((a, b) => b.priority - a.priority)
    .slice(0, maxBanners)

  useEffect(() => {
    if (!autoRotate || activeBanners.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeBanners.length)
    }, rotationInterval)

    return () => clearInterval(interval)
  }, [activeBanners.length, autoRotate, rotationInterval])

  const handleCloseBanner = (bannerId: string) => {
    setClosedBanners(prev => new Set([...prev, bannerId]))
    // Reset to first banner if current one was closed
    if (activeBanners[currentIndex]?.id === bannerId) {
      setCurrentIndex(0)
    }
  }

  if (activeBanners.length === 0) return null

  return (
    <div className="space-y-4">
      {/* Current banner */}
      <Banner 
        banner={activeBanners[currentIndex]} 
        onClose={handleCloseBanner}
        size="medium"
      />

      {/* Pagination dots */}
      {activeBanners.length > 1 && (
        <div className="flex justify-center space-x-2">
          {activeBanners.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex ? 'bg-blue-500' : 'bg-gray-300'
              }`}
              onClick={() => setCurrentIndex(index)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// Banner grid component for multiple banners
interface BannerGridProps {
  banners: Banner[]
  columns?: 1 | 2 | 3
  maxBanners?: number
}

export function BannerGrid({ banners, columns = 2, maxBanners = 6 }: BannerGridProps) {
  const [closedBanners, setClosedBanners] = useState<Set<string>>(new Set())

  const activeBanners = banners
    .filter(banner => banner.isActive && !closedBanners.has(banner.id))
    .sort((a, b) => b.priority - a.priority)
    .slice(0, maxBanners)

  const handleCloseBanner = (bannerId: string) => {
    setClosedBanners(prev => new Set([...prev, bannerId]))
  }

  if (activeBanners.length === 0) return null

  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
  }

  return (
    <div className={`grid ${gridCols[columns]} gap-6`}>
      {activeBanners.map((banner, index) => (
        <div 
          key={banner.id}
          className="transform transition-all duration-700 hover:scale-105"
          style={{
            animationDelay: `${index * 150}ms`,
            animation: 'fadeInUp 0.6s ease-out forwards'
          }}
        >
          <Banner 
            banner={banner} 
            onClose={handleCloseBanner}
            size="medium"
          />
        </div>
      ))}
    </div>
  )
}

