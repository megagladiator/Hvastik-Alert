"use client"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useDebounce } from "@/hooks/use-debounce"
import { useRouter } from "next/navigation"

export default function AuthPage({ open = true, onOpenChange = () => {}, onAuthChange }: { open?: boolean, onOpenChange?: (open: boolean) => void, onAuthChange?: (user: any) => void }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [user, setUser] = useState<any>(null)
  const [error, setError] = useState("")
  const [mode, setMode] = useState<"login" | "register">("login")
  const [loading, setLoading] = useState(false)
  const [justRegistered, setJustRegistered] = useState(false)
  const [registeredEmail, setRegisteredEmail] = useState("")
  const [showReset, setShowReset] = useState(false)
  const [emailChecked, setEmailChecked] = useState(false)
  const [emailExists, setEmailExists] = useState<boolean | null>(null)
  const [repeatPassword, setRepeatPassword] = useState("");
  const [passwordMismatch, setPasswordMismatch] = useState(false);
  const debouncedEmail = useDebounce(email, 500)
  const router = useRouter()
  const passwordRef = useRef<HTMLInputElement>(null);

  // Показываем заглушку, если Supabase не сконфигурирован
  if (!supabase) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Авторизация недоступна</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">Регистрация и вход по e-mail доступны только при корректной настройке Supabase.</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  useEffect(() => {
    if (!supabase) return;
    const getSession = async () => {
      const { data } = await supabase.auth.getUser();
      if (data && data.user) setUser(data.user)
      else setUser(null)
    }
    getSession()
  }, [])

  useEffect(() => {
    if (!supabase || !debouncedEmail) return
    setEmailChecked(false)
    setEmailExists(null)
    // Проверяем, есть ли пользователь с таким e-mail
    const checkEmail = async () => {
      // Supabase не позволяет напрямую искать пользователей, если нет расширенных прав,
      // поэтому эмулируем проверку через попытку signIn (без пароля)
      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email: debouncedEmail, password: "invalid" })
        if (error && error.message.toLowerCase().includes("invalid login credentials")) {
          setEmailExists(true)
        } else if (error && error.message.toLowerCase().includes("user not found")) {
          setEmailExists(false)
        } else if (data && data.user) {
          setEmailExists(true)
        } else {
          setEmailExists(false)
        }
      } catch {
        setEmailExists(null)
      } finally {
        setEmailChecked(true)
      }
    }
    checkEmail()
  }, [debouncedEmail])

  useEffect(() => {
    if (open && passwordRef.current) {
      passwordRef.current.focus();
    }
  }, [open]);

  // Удаляю useEffect, который автоматически меняет режим

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setPasswordMismatch(false)
    if (!supabase) {
      setError("Supabase не сконфигурирован")
      setLoading(false)
      return;
    }
    try {
      if (mode === "register") {
        if (password !== repeatPassword) {
          setPasswordMismatch(true)
          setLoading(false)
          return
        }
        const { data, error } = await supabase.auth.signUp({ email, password })
        if (error) {
          alert('Supabase error: ' + error.message)
          const msg = error.message.toLowerCase()
          if (
            msg.includes("already") ||
            msg.includes("exists") ||
            msg.includes("зарегистрирован") ||
            msg.includes("существует")
          ) {
            setError("Пользователь с таким e-mail уже зарегистрирован. Пожалуйста, войдите.")
            return
          }
          throw error
        }
        setRegisteredEmail(email)
        setJustRegistered(true)
        setUser(null)
        if (onAuthChange) onAuthChange(null)
        router.push("/cabinet")
        return
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) {
          if (error.message && error.message.toLowerCase().includes("user not found")) {
            setError("Пользователь с таким e-mail не найден. Зарегистрируйтесь.")
            return
          }
          throw error
        }
        setUser(data.user)
        if (onAuthChange) onAuthChange(data.user)
        router.push("/cabinet")
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    if (!supabase) return
    await supabase.auth.signOut()
    setUser(null)
    setEmail("")
    setPassword("")
    if (onAuthChange) onAuthChange(null)
  }

  // Проверка текущей сессии (можно доработать через useEffect)

  // Вынесем форму в отдельную функцию
  function AuthForm() {
    return (
      <form onSubmit={handleAuth} className="space-y-4">
        <Input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          autoComplete="username"
          name="email"
          id="email"
        />
        <Input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          name="password"
          id="password"
          ref={passwordRef}
        />
        {mode === "register" && (
          <Input
            type="password"
            placeholder="Повторите пароль"
            value={repeatPassword}
            onChange={e => setRepeatPassword(e.target.value)}
            required
            autoComplete="new-password"
            name="repeat-password"
            id="repeat-password"
          />
        )}
        {passwordMismatch && (
          <div className="text-red-500 text-sm">вы ввели неверный пароль</div>
        )}
        {error && <div className="text-red-500 text-sm">{error}</div>}
        <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white" disabled={loading}>
          {mode === "register" ? "Зарегистрироваться" : "Войти"}
        </Button>
        <div className="mt-4 text-center">
          {mode === "register" ? (
            <span>Уже есть аккаунт? <button className="text-blue-600 underline" type="button" onClick={() => setMode("login")}>Войти</button></span>
          ) : (
            <span>Нет аккаунта? <button className="text-blue-600 underline" type="button" onClick={() => setMode("register")}>Зарегистрироваться</button></span>
          )}
        </div>
        {mode === "login" && (
          <button
            type="button"
            className="text-blue-600 underline text-sm mt-2"
            onClick={() => setShowReset(true)}
          >
            Забыли пароль?
          </button>
        )}
      </form>
    )
  }
  // Заготовка для восстановления пароля
  function ResetPasswordForm() {
    const [resetEmail, setResetEmail] = useState("")
    const [resetSent, setResetSent] = useState(false)
    const [resetError, setResetError] = useState("")
    const handleReset = async (e: React.FormEvent) => {
      e.preventDefault()
      setResetError("")
      try {
        if (!supabase) throw new Error("Supabase не сконфигурирован")
        const { error } = await supabase.auth.resetPasswordForEmail(resetEmail)
        if (error) throw error
        setResetSent(true)
      } catch (err: any) {
        setResetError(err.message)
      }
    }
    return (
      <div>
        {resetSent ? (
          <div className="mb-4 text-green-600">Письмо с инструкцией отправлено на {resetEmail}</div>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
            <Input
              type="email"
              placeholder="E-mail"
              value={resetEmail}
              onChange={e => setResetEmail(e.target.value)}
              required
            />
            {resetError && <div className="text-red-500 text-sm">{resetError}</div>}
            <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white">Восстановить</Button>
          </form>
        )}
        <Button variant="ghost" className="w-full mt-2" onClick={() => setShowReset(false)}>Назад</Button>
      </div>
    )
  }

  function UserCabinet({ user, onLogout }: { user: any, onLogout: () => void }) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col items-center justify-center gap-2 py-4">
          <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center text-3xl font-bold text-orange-500">
            {user.email?.[0]?.toUpperCase()}
          </div>
          <div className="text-lg font-semibold text-gray-900">{user.email}</div>
          {/* Здесь можно добавить больше информации о пользователе */}
        </div>
        <Button onClick={onLogout} className="w-full bg-orange-500 hover:bg-orange-600 text-white">Выйти</Button>
      </div>
    )
  }

  // Показываем модальное окно
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-full">
        <DialogHeader>
          <DialogTitle>{justRegistered ? "Подтвердите e-mail" : user ? "Личный кабинет" : showReset ? "Восстановление пароля" : mode === "register" ? "Регистрация" : "Вход"}</DialogTitle>
        </DialogHeader>
        {justRegistered ? (
          <div className="mb-4">На почту <b>{registeredEmail}</b> отправлено письмо для подтверждения регистрации.<br/>Пожалуйста, перейдите по ссылке из письма, затем войдите в личный кабинет.<br/><span className='text-sm text-gray-500'>Если письмо не пришло, проверьте папку "Спам".</span></div>
        ) : user ? (
          <UserCabinet user={user} onLogout={handleLogout} />
        ) : showReset ? (
          <ResetPasswordForm />
        ) : (
          <>
            <AuthForm />
          </>
        )}
      </DialogContent>
    </Dialog>
  )
} 