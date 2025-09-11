import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'

// Инициализация Firebase Admin SDK только на сервере
let adminAuth: any = null

if (typeof window === 'undefined' && process.env.FIREBASE_PROJECT_ID) {
  try {
    if (!getApps().length) {
      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      })
    }
    adminAuth = getAuth()
  } catch (error) {
    console.error('Firebase Admin initialization error:', error)
  }
}

export { adminAuth }

export interface FirebaseUser {
  uid: string
  email?: string
  displayName?: string
  emailVerified: boolean
  disabled: boolean
  metadata: {
    creationTime: string
    lastSignInTime?: string
  }
  providerData: Array<{
    providerId: string
    email?: string
  }>
}

export async function getAllUsers(): Promise<FirebaseUser[]> {
  if (!adminAuth) {
    throw new Error('Firebase Admin not initialized')
  }
  
  try {
    const listUsersResult = await adminAuth.listUsers(1000) // Максимум 1000 пользователей
    return listUsersResult.users.map(user => ({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      emailVerified: user.emailVerified,
      disabled: user.disabled,
      metadata: {
        creationTime: user.metadata.creationTime,
        lastSignInTime: user.metadata.lastSignInTime,
      },
      providerData: user.providerData.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      }))
    }))
  } catch (error) {
    console.error('Error fetching users from Firebase:', error)
    throw error
  }
}

export async function getUserByEmail(email: string): Promise<FirebaseUser | null> {
  if (!adminAuth) {
    throw new Error('Firebase Admin not initialized')
  }
  
  try {
    const user = await adminAuth.getUserByEmail(email)
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      emailVerified: user.emailVerified,
      disabled: user.disabled,
      metadata: {
        creationTime: user.metadata.creationTime,
        lastSignInTime: user.metadata.lastSignInTime,
      },
      providerData: user.providerData.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      }))
    }
  } catch (error) {
    console.error('Error fetching user by email:', error)
    return null
  }
}

export async function updateUserStatus(uid: string, disabled: boolean): Promise<void> {
  if (!adminAuth) {
    throw new Error('Firebase Admin not initialized')
  }
  
  try {
    await adminAuth.updateUser(uid, { disabled })
  } catch (error) {
    console.error('Error updating user status:', error)
    throw error
  }
}

export async function deleteUser(uid: string): Promise<void> {
  if (!adminAuth) {
    throw new Error('Firebase Admin not initialized')
  }
  
  try {
    await adminAuth.deleteUser(uid)
  } catch (error) {
    console.error('Error deleting user:', error)
    throw error
  }
}
