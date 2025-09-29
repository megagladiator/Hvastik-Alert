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
        return { label: 'Ветклиника', color: 'bg-blue-100 text-blue-800 border-blue-200' }
      case 'shelter':
        return { label: 'Приют', color: 'bg-green-100 text-green-800 border-green-200' }
      case 'shop':
        return { label: 'Магазин', color: 'bg-orange-100 text-orange-800 border-orange-200' }
      case 'service':
        return { label: 'Услуги', color: 'bg-purple-100 text-purple-800 border-purple-200' }
      default:
        return { label: 'Реклама', color: 'bg-gray-100 text-gray-800 border-gray-200' }
    }
  }

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'h-24'
      case 'large':
        return 'h-48'
      default:
        return 'h-32'
    }
  }

  if (!isVisible) return null

  const typeInfo = getTypeInfo(banner.type)

  return (
    <Card 
      className={`
        relative overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105
        ${getSizeClasses()}
        ${banner.style?.backgroundColor || 'bg-gradient-to-r from-blue-50 to-indigo-50'}
        ${banner.style?.borderColor || 'border-blue-200'}
      `}
      onClick={handleClick}
    >
      {/* Close button */}
      {showCloseButton && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 z-10 h-6 w-6 p-0 bg-white/80 hover:bg-white"
          onClick={(e) => {
            e.stopPropagation()
            handleClose()
          }}
        >
          <X className="h-3 w-3" />
        </Button>
      )}

      {/* Type badge */}
      <Badge 
        className={`absolute top-2 left-2 z-10 ${typeInfo.color}`}
        variant="outline"
      >
        {typeInfo.label}
      </Badge>

      <div className="flex h-full">
        {/* Image */}
        <div className="relative w-1/3 h-full">
          <Image
            src={banner.imageUrl}
            alt={banner.title}
            fill
            className="object-cover"
            onError={(e) => {
              // Fallback to placeholder if image fails to load
              e.currentTarget.src = '/placeholder-banner.jpg'
            }}
          />
        </div>

        {/* Content */}
        <div className="flex-1 p-4 flex flex-col justify-between">
          <div>
            <h3 className={`font-semibold text-lg mb-2 ${banner.style?.textColor || 'text-gray-900'}`}>
              {banner.title}
            </h3>
            <p className={`text-sm ${banner.style?.textColor || 'text-gray-600'}`}>
              {banner.description}
            </p>
          </div>

          {/* Contact info */}
          {banner.contactInfo && (
            <div className="mt-2 space-y-1">
              {banner.contactInfo.phone && (
                <div className="flex items-center text-xs text-gray-500">
                  <Phone className="h-3 w-3 mr-1" />
                  {banner.contactInfo.phone}
                </div>
              )}
              {banner.contactInfo.address && (
                <div className="flex items-center text-xs text-gray-500">
                  <MapPin className="h-3 w-3 mr-1" />
                  {banner.contactInfo.address}
                </div>
              )}
              {banner.contactInfo.workingHours && (
                <div className="flex items-center text-xs text-gray-500">
                  <Clock className="h-3 w-3 mr-1" />
                  {banner.contactInfo.workingHours}
                </div>
              )}
            </div>
          )}

          {/* External link indicator */}
          <div className="flex items-center justify-end mt-2">
            <ExternalLink className="h-4 w-4 text-gray-400" />
          </div>
        </div>
      </div>
    </Card>
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
    <div className={`grid ${gridCols[columns]} gap-4`}>
      {activeBanners.map((banner) => (
        <Banner 
          key={banner.id} 
          banner={banner} 
          onClose={handleCloseBanner}
          size="small"
        />
      ))}
    </div>
  )
}
