"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  User, 
  Mail, 
  Calendar, 
  Shield, 
  ShieldCheck, 
  Ban, 
  CheckCircle, 
  Trash2,
  MoreVertical
} from "lucide-react"
import { User as UserType } from "@/hooks/use-user"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface UserCardProps {
  user: UserType
  onRoleChange: (userId: string, role: 'admin' | 'user') => void
  onStatusChange: (userId: string, status: 'active' | 'inactive' | 'banned') => void
  onDelete: (userId: string) => void
}

export default function UserCard({ user, onRoleChange, onStatusChange, onDelete }: UserCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const formatDate = (date: Date | string) => {
    if (!date) return 'Не указано'
    
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date
      if (isNaN(dateObj.getTime())) return 'Неверная дата'
      
      return dateObj.toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch (error) {
      return 'Ошибка даты'
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Активный</Badge>
      case 'banned':
        return <Badge className="bg-red-100 text-red-800">Заблокирован</Badge>
      case 'inactive':
        return <Badge className="bg-yellow-100 text-yellow-800">Неактивный</Badge>
      default:
        return <Badge variant="secondary">Неизвестно</Badge>
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-purple-100 text-purple-800">Администратор</Badge>
      case 'user':
        return <Badge className="bg-blue-100 text-blue-800">Пользователь</Badge>
      default:
        return <Badge variant="secondary">Неизвестно</Badge>
    }
  }

  const handleRoleChange = async (newRole: 'admin' | 'user') => {
    if (newRole === user.role) return
    
    setIsLoading(true)
    try {
      await onRoleChange(user.id, newRole)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusChange = async (newStatus: 'active' | 'inactive' | 'banned') => {
    if (newStatus === user.status) return
    
    setIsLoading(true)
    try {
      await onStatusChange(user.id, newStatus)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    setIsLoading(true)
    try {
      await onDelete(user.id)
      setShowDeleteDialog(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendVerification = async (email: string) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/users/send-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to send verification')
      }

      const data = await response.json()
      
      // В реальном приложении здесь должна быть отправка письма
      // Пока просто показываем ссылку в консоли
      console.log('Verification link:', data.link)
      
      alert(`Ссылка для подтверждения email отправлена на ${email}`)
    } catch (error: any) {
      console.error('Ошибка отправки подтверждения:', error)
      alert(`Ошибка: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-full">
                <User className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <CardTitle className="text-lg">{user.email}</CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  {getRoleBadge(user.role)}
                  {getStatusBadge(user.status)}
                </div>
              </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" disabled={isLoading}>
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem 
                  onClick={() => handleRoleChange(
                    user.role === 'admin' ? 'user' : 'admin'
                  )}
                  disabled={isLoading}
                >
                  {user.role === 'admin' ? (
                    <>
                      <Shield className="h-4 w-4 mr-2" />
                      Сделать пользователем
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-4 w-4 mr-2" />
                      Сделать администратором
                    </>
                  )}
                </DropdownMenuItem>
                
                <DropdownMenuItem 
                  onClick={() => handleStatusChange(
                    user.status === 'active' ? 'banned' : 'active'
                  )}
                  disabled={isLoading}
                >
                  {user.status === 'active' ? (
                    <>
                      <Ban className="h-4 w-4 mr-2" />
                      Заблокировать
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Разблокировать
                    </>
                  )}
                </DropdownMenuItem>
                
                {!user.emailVerified && (
                  <DropdownMenuItem 
                    onClick={() => handleSendVerification(user.email)}
                    disabled={isLoading}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Отправить подтверждение email
                  </DropdownMenuItem>
                )}
                
                <DropdownMenuItem 
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-red-600"
                  disabled={isLoading}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Удалить
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">Email подтвержден:</span>
              <span className={user.emailVerified ? "text-green-600" : "text-red-600"}>
                {user.emailVerified ? "Да" : "Нет"}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">Регистрация:</span>
              <span>{formatDate(user.createdAt)}</span>
            </div>
            
            {user.lastLoginAt && (
              <div className="flex items-center gap-2 col-span-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">Последний вход:</span>
                <span>{formatDate(user.lastLoginAt)}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Диалог подтверждения удаления */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить пользователя?</AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите удалить пользователя <strong>{user.email}</strong>? 
              Это действие нельзя отменить. Все данные пользователя будут удалены навсегда.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={isLoading}
            >
              {isLoading ? "Удаление..." : "Удалить"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}


