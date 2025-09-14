import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth as firebaseAuth } from "./firebase"

// Простой Telegram провайдер
const TelegramProvider = {
  id: "telegram",
  name: "Telegram",
  type: "oauth" as const,
  authorization: {
    url: "https://oauth.telegram.org/auth",
    params: {
      bot_id: process.env.TELEGRAM_BOT_TOKEN?.split(':')[0],
      origin: process.env.NEXTAUTH_URL,
      return_to: `${process.env.NEXTAUTH_URL}/api/auth/callback/telegram`,
    },
  },
  token: "https://oauth.telegram.org/token",
  userinfo: "https://oauth.telegram.org/user",
  clientId: process.env.TELEGRAM_BOT_TOKEN?.split(':')[0],
  clientSecret: process.env.TELEGRAM_BOT_TOKEN,
  profile(profile: any) {
    return {
      id: profile.id?.toString() || "telegram_user",
      name: profile.first_name || "Telegram User",
      email: `${profile.id || "user"}@telegram.local`,
      image: profile.photo_url || null,
    }
  },
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const authOptions: NextAuthOptions = {
  providers: [
    // TelegramProvider, // Временно отключен
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const userCredential = await signInWithEmailAndPassword(
            firebaseAuth,
            credentials.email,
            credentials.password
          )

          const user = userCredential.user

          // Проверяем, подтвержден ли email
          if (!user.emailVerified) {
            // Для администратора разрешаем вход без подтверждения
            if (credentials.email === 'agentgl007@gmail.com') {
              console.log('Администратор входит без подтверждения email')
            } else {
              // Для остальных пользователей требуем подтверждение
              throw new Error('EMAIL_NOT_VERIFIED')
            }
          }

          return {
            id: user.uid,
            email: user.email,
            name: user.displayName || user.email,
          }
        } catch (error: any) {
          console.error("Firebase auth error:", error)
          
          // Возвращаем специальную ошибку для неподтвержденного email
          if (error.message === 'EMAIL_NOT_VERIFIED') {
            throw new Error('EMAIL_NOT_VERIFIED')
          }
          
          return null
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
      }
      return session
    },
  },
  pages: {
    signIn: "/auth",
    error: "/auth/error",
  },
}
