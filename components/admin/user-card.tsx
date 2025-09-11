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
import { User as UserType, UserRole, UserStatus } from "@/types/user"
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
  onRoleChange: (userId: string, role: UserRole) => void
  onStatusChange: (userId: string, status: UserStatus) => void
  onDelete: (userId: string) => void
}

export default function UserCard({ user, onRoleChange, onStatusChange, onDelete }: UserCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (status: UserStatus) => {
    switch (status) {
      case UserStatus.ACTIVE:
        return <Badge className="bg-green-100 text-green-800">Активный</Badge>
      case UserStatus.BLOCKED:
        return <Badge className="bg-red-100 text-red-800">Заблокирован</Badge>
      case UserStatus.PENDING:
        return <Badge className="bg-yellow-100 text-yellow-800">Ожидает</Badge>
      default:
        return <Badge variant="secondary">Неизвестно</Badge>
    }
  }

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return <Badge className="bg-purple-100 text-purple-800">Администратор</Badge>
      case UserRole.USER:
        return <Badge className="bg-blue-100 text-blue-800">Пользователь</Badge>
      default:
        return <Badge variant="secondary">Неизвестно</Badge>
    }
  }

  const handleRoleChange = async (newRole: UserRole) => {
    if (newRole === user.role) return
    
    setIsLoading(true)
    try {
      await onRoleChange(user.id, newRole)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusChange = async (newStatus: UserStatus) => {
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
                    user.role === UserRole.ADMIN ? UserRole.USER : UserRole.ADMIN
                  )}
                  disabled={isLoading}
                >
                  {user.role === UserRole.ADMIN ? (
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
                    user.status === UserStatus.ACTIVE ? UserStatus.BLOCKED : UserStatus.ACTIVE
                  )}
                  disabled={isLoading}
                >
                  {user.status === UserStatus.ACTIVE ? (
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
              <span className={user.email_confirmed ? "text-green-600" : "text-red-600"}>
                {user.email_confirmed ? "Да" : "Нет"}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">Регистрация:</span>
              <span>{formatDate(user.created_at)}</span>
            </div>
            
            {user.last_sign_in && (
              <div className="flex items-center gap-2 col-span-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">Последний вход:</span>
                <span>{formatDate(user.last_sign_in)}</span>
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


