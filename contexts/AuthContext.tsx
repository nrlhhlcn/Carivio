"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { saveUserStats, getUserStats, upsertUserDoc } from '@/lib/firestore'

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, firstName: string, lastName: string, tag: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signInWithGithub: () => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch (error) {
      throw error
    }
  }

  const signUp = async (email: string, password: string, firstName: string, lastName: string, tag: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      await updateProfile(userCredential.user, {
        displayName: `${firstName} ${lastName}`
      })

      // Initialize user stats document with defaults
      try {
        // users koleksiyonuna yaz
        await upsertUserDoc({
          userId: userCredential.user.uid,
          email,
          firstName,
          lastName,
          displayName: `${firstName} ${lastName}`,
          photoURL: userCredential.user.photoURL || undefined,
          tag,
        })

        await saveUserStats({
          userId: userCredential.user.uid,
          displayName: `${firstName} ${lastName}`,
          photoURL: userCredential.user.photoURL || undefined,
          tag,
          currentRank: 0,
          totalScore: 0,
          cvScore: 0,
          interviewScore: 0,
          badge: 'Yeni Katılımcı',
          level: 'Başlangıç',
          completedAnalyses: 0,
          completedInterviews: 0,
          totalActiveDays: 0,
          streak: 0,
          lastActivityDate: new Date(),
        })
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn('Initial userStats could not be created:', e)
      }
    } catch (error) {
      throw error
    }
  }

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider()
      const cred = await signInWithPopup(auth, provider)
      // Ensure initial stats exist for OAuth users
      try {
        const existing = await getUserStats(cred.user.uid)
        if (!existing) {
          // users koleksiyonuna da yaz
          const email = cred.user.email || ''
          const base = email.split('@')[0] || 'Kullanıcı'
          const guessName = cred.user.displayName || base.replace(/\./g, ' ')
          await upsertUserDoc({
            userId: cred.user.uid,
            email,
            displayName: guessName,
            photoURL: cred.user.photoURL || undefined,
          })

          await saveUserStats({
            userId: cred.user.uid,
            displayName: cred.user.displayName || 'Kullanıcı',
            photoURL: cred.user.photoURL || undefined,
            currentRank: 0,
            totalScore: 0,
            cvScore: 0,
            interviewScore: 0,
            badge: 'Yeni Katılımcı',
            level: 'Başlangıç',
            completedAnalyses: 0,
            completedInterviews: 0,
            totalActiveDays: 0,
            streak: 0,
            lastActivityDate: new Date(),
          })
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn('Init userStats (Google) skipped:', e)
      }
    } catch (error) {
      throw error
    }
  }

  const signInWithGithub = async () => {
    try {
      const provider = new GithubAuthProvider()
      const cred = await signInWithPopup(auth, provider)
      // Ensure initial stats exist for OAuth users
      try {
        const existing = await getUserStats(cred.user.uid)
        if (!existing) {
          const email = cred.user.email || ''
          const base = email.split('@')[0] || 'Kullanıcı'
          const guessName = cred.user.displayName || base.replace(/\./g, ' ')
          await upsertUserDoc({
            userId: cred.user.uid,
            email,
            displayName: guessName,
            photoURL: cred.user.photoURL || undefined,
          })

          await saveUserStats({
            userId: cred.user.uid,
            displayName: cred.user.displayName || 'Kullanıcı',
            photoURL: cred.user.photoURL || undefined,
            currentRank: 0,
            totalScore: 0,
            cvScore: 0,
            interviewScore: 0,
            badge: 'Yeni Katılımcı',
            level: 'Başlangıç',
            completedAnalyses: 0,
            completedInterviews: 0,
            totalActiveDays: 0,
            streak: 0,
            lastActivityDate: new Date(),
          })
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn('Init userStats (GitHub) skipped:', e)
      }
    } catch (error) {
      throw error
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
    } catch (error) {
      throw error
    }
  }

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signInWithGithub,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
