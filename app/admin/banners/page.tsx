"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Edit, Trash2, Eye, EyeOff, Calendar, Star } from "lucide-react"
import { useBanners } from "@/hooks/use-banners"
import { toast } from "@/hooks/use-toast"

interface BannerFormData {
  title: string
  description: string
  imageUrl: string
  linkUrl: string
  type: 'veterinary' | 'shelter' | 'shop' | 'service'
  priority: number
  isActive: boolean
  startDate: string
  endDate: string
  contactInfo: {
    phone?: string
    address?: string
    workingHours?: string
  }
  style: {
    backgroundColor?: string
    textColor?: string
    borderColor?: string
  }
}

export default function AdminBannersPage() {
  const { banners, loading, error, createBanner, updateBanner, deleteBanner, refetch } = useBanners({
    activeOnly: false // Показываем все баннеры в админке
  })

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingBanner, setEditingBanner] = useState<any>(null)
  const [formData, setFormData] = useState<BannerFormData>({
    title: '',
    description: '',
    imageUrl: '',
    linkUrl: '',
    type: 'veterinary',
    priority: 1,
    isActive: true,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    contactInfo: {},
    style: {}
  })

  const handleCreateBanner = async () => {
    try {
      await createBanner(formData)
      toast({
        title: "Успех",
        description: "Баннер успешно создан",
      })
      setIsCreateDialogOpen(false)
      resetForm()
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось создать баннер",
        variant: "destructive",
      })
    }
  }

  const handleUpdateBanner = async () => {
    if (!editingBanner) return

    try {
      await updateBanner(editingBanner.id, formData)
      toast({
        title: "Успех",
        description: "Баннер успешно обновлен",
      })
      setEditingBanner(null)
      resetForm()
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить баннер",
        variant: "destructive",
      })
    }
  }

  const handleDeleteBanner = async (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить этот баннер?')) return

    try {
      await deleteBanner(id)
      toast({
        title: "Успех",
        description: "Баннер успешно удален",
      })
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить баннер",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      imageUrl: '',
      linkUrl: '',
      type: 'veterinary',
      priority: 1,
      isActive: true,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      contactInfo: {},
      style: {}
    })
  }

  const startEdit = (banner: any) => {
    setEditingBanner(banner)
    setFormData({
      title: banner.title,
      description: banner.description,
      imageUrl: banner.image_url,
      linkUrl: banner.link_url || '',
      type: banner.type,
      priority: banner.priority,
      isActive: banner.is_active,
      startDate: banner.start_date.split('T')[0],
      endDate: banner.end_date.split('T')[0],
      contactInfo: banner.contact_info || {},
      style: banner.style || {}
    })
  }

  const getTypeInfo = (type: string) => {
    switch (type) {
      case 'veterinary':
        return { label: 'Ветклиника', color: 'bg-blue-100 text-blue-800' }
      case 'shelter':
        return { label: 'Приют', color: 'bg-green-100 text-green-800' }
      case 'shop':
        return { label: 'Магазин', color: 'bg-orange-100 text-orange-800' }
      case 'service':
        return { label: 'Услуги', color: 'bg-purple-100 text-purple-800' }
      default:
        return { label: 'Реклама', color: 'bg-gray-100 text-gray-800' }
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Загрузка баннеров...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-600">Ошибка: {error}</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Управление баннерами</h1>
          <p className="text-gray-600 mt-2">Создание и управление рекламными баннерами</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Создать баннер
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Создать новый баннер</DialogTitle>
            </DialogHeader>
            <BannerForm 
              formData={formData} 
              setFormData={setFormData} 
              onSubmit={handleCreateBanner}
              submitText="Создать"
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Всего баннеров</p>
                <p className="text-2xl font-bold">{banners.length}</p>
              </div>
              <Star className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Активные</p>
                <p className="text-2xl font-bold text-green-600">
                  {banners.filter(b => b.is_active).length}
                </p>
              </div>
              <Eye className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ветклиники</p>
                <p className="text-2xl font-bold text-blue-600">
                  {banners.filter(b => b.type === 'veterinary').length}
                </p>
              </div>
              <Badge className="bg-blue-100 text-blue-800">Ветклиника</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Приюты</p>
                <p className="text-2xl font-bold text-green-600">
                  {banners.filter(b => b.type === 'shelter').length}
                </p>
              </div>
              <Badge className="bg-green-100 text-green-800">Приют</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Список баннеров */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {banners.map((banner) => {
          const typeInfo = getTypeInfo(banner.type)
          const isExpired = new Date(banner.end_date) < new Date()
          
          return (
            <Card key={banner.id} className={`${!banner.is_active ? 'opacity-50' : ''} ${isExpired ? 'border-red-200' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-2">{banner.title}</CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className={typeInfo.color}>{typeInfo.label}</Badge>
                      <Badge variant="outline" className="text-xs">
                        Приоритет: {banner.priority}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {banner.is_active ? (
                      <Eye className="h-4 w-4 text-green-500" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <p className="text-sm text-gray-600 line-clamp-2">{banner.description}</p>
                  
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar className="h-3 w-3" />
                    <span>
                      {new Date(banner.start_date).toLocaleDateString()} - {new Date(banner.end_date).toLocaleDateString()}
                    </span>
                  </div>

                  {banner.contact_info?.phone && (
                    <p className="text-xs text-gray-500">📞 {banner.contact_info.phone}</p>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => startEdit(banner)}
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Изменить
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteBanner(banner.id)}
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Удалить
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Диалог редактирования */}
      <Dialog open={!!editingBanner} onOpenChange={() => setEditingBanner(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Редактировать баннер</DialogTitle>
          </DialogHeader>
          <BannerForm 
            formData={formData} 
            setFormData={setFormData} 
            onSubmit={handleUpdateBanner}
            submitText="Сохранить"
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Компонент формы баннера
function BannerForm({ 
  formData, 
  setFormData, 
  onSubmit, 
  submitText 
}: {
  formData: BannerFormData
  setFormData: (data: BannerFormData) => void
  onSubmit: () => void
  submitText: string
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="title">Заголовок *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Название организации"
          />
        </div>
        <div>
          <Label htmlFor="type">Тип *</Label>
          <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="veterinary">Ветклиника</SelectItem>
              <SelectItem value="shelter">Приют</SelectItem>
              <SelectItem value="shop">Магазин</SelectItem>
              <SelectItem value="service">Услуги</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="description">Описание *</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Краткое описание услуг"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="imageUrl">URL изображения *</Label>
          <Input
            id="imageUrl"
            value={formData.imageUrl}
            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
            placeholder="https://example.com/image.jpg"
          />
        </div>
        <div>
          <Label htmlFor="linkUrl">URL ссылки</Label>
          <Input
            id="linkUrl"
            value={formData.linkUrl}
            onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
            placeholder="https://example.com"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="priority">Приоритет</Label>
          <Input
            id="priority"
            type="number"
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 1 })}
            min="1"
            max="10"
          />
        </div>
        <div>
          <Label htmlFor="startDate">Дата начала</Label>
          <Input
            id="startDate"
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="endDate">Дата окончания</Label>
          <Input
            id="endDate"
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="isActive"
          checked={formData.isActive}
          onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
        />
        <Label htmlFor="isActive">Активный</Label>
      </div>

      <div className="space-y-3">
        <h4 className="font-medium">Контактная информация</h4>
        <div className="grid grid-cols-1 gap-3">
          <div>
            <Label htmlFor="phone">Телефон</Label>
            <Input
              id="phone"
              value={formData.contactInfo.phone || ''}
              onChange={(e) => setFormData({ 
                ...formData, 
                contactInfo: { ...formData.contactInfo, phone: e.target.value }
              })}
              placeholder="+7 (861) 123-45-67"
            />
          </div>
          <div>
            <Label htmlFor="address">Адрес</Label>
            <Input
              id="address"
              value={formData.contactInfo.address || ''}
              onChange={(e) => setFormData({ 
                ...formData, 
                contactInfo: { ...formData.contactInfo, address: e.target.value }
              })}
              placeholder="ул. Ленина, 15, Анапа"
            />
          </div>
          <div>
            <Label htmlFor="workingHours">Часы работы</Label>
            <Input
              id="workingHours"
              value={formData.contactInfo.workingHours || ''}
              onChange={(e) => setFormData({ 
                ...formData, 
                contactInfo: { ...formData.contactInfo, workingHours: e.target.value }
              })}
              placeholder="9:00-18:00"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={() => setFormData({ ...formData })}>
          Отмена
        </Button>
        <Button onClick={onSubmit}>
          {submitText}
        </Button>
      </div>
    </div>
  )
}
