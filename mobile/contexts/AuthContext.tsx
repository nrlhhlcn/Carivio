import React, { createContext, useContext, useEffect, useState } from 'react'
import { 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithCredential,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth'
import { auth } from '../config/firebase'
import * as Google from 'expo-auth-session/providers/google'
import * as WebBrowser from 'expo-web-browser'
import { getUserStats, saveUserStats, upsertUserDoc } from '../services/firestore'

// WebBrowser'ı kapatmayı otomatikleştir
WebBrowser.maybeCompleteAuthSession()

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, firstName: string, lastName: string, tag: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Google OAuth Client IDs
// Firebase Console > Authentication > Sign-in method > Google > Web Client ID
// Google Cloud Console > APIs & Services > Credentials > OAuth 2.0 Client IDs
const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID
const GOOGLE_IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  // Google OAuth hook'u
  // Expo Go için sadece webClientId yeterli
  // Development build için iOS client ID de gerekli
  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: GOOGLE_WEB_CLIENT_ID, // Firebase Console'dan alınan Web Client ID
    iosClientId: GOOGLE_IOS_CLIENT_ID || undefined, // Google Cloud Console'dan alınan iOS Client ID (development build için)
    scopes: ['openid', 'profile', 'email'], // Gerekli scopes
  })

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false as boolean)
    })

    return () => unsubscribe()
  }, [])

  // Google OAuth response'u handle et
  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token, access_token } = response.params
      if (!id_token) {
        console.error('Google OAuth: id_token bulunamadı')
        return
      }
      const credential = GoogleAuthProvider.credential(id_token, access_token)
      signInWithCredential(auth, credential)
        .then(async (userCredential) => {
          // Kullanıcı ilk kez giriş yapıyorsa Firestore'a kayıt oluştur
          try {
            const existing = await getUserStats(userCredential.user.uid)
            if (!existing) {
              const email = userCredential.user.email || ''
              const base = email.split('@')[0] || 'Kullanıcı'
              const guessName = userCredential.user.displayName || base.replace(/\./g, ' ')
              
              // users koleksiyonuna da yaz (web'deki gibi)
              await upsertUserDoc({
                userId: userCredential.user.uid,
                email,
                displayName: guessName,
                photoURL: userCredential.user.photoURL || undefined,
              })
              
              await saveUserStats({
                userId: userCredential.user.uid,
                displayName: userCredential.user.displayName || 'Kullanıcı',
                photoURL: userCredential.user.photoURL || undefined,
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
          } catch (error) {
            console.error('User stats initialization error:', error)
          }
        })
        .catch((error) => {
          console.error('Google sign in error:', error)
        })
    } else if (response?.type === 'error') {
      console.error('Google OAuth error:', response.error)
      if (response.error?.code === '400') {
        console.error('400 Hatası: Redirect URI uyumsuzluğu olabilir. Google Cloud Console\'da Authorized redirect URIs\'yi kontrol edin.')
      }
    }
  }, [response])

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password)
  }

  const signUp = async (email: string, password: string, firstName: string, lastName: string, tag: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(userCredential.user, {
      displayName: `${firstName} ${lastName}`
    })
    // TODO: Firestore'a kullanıcı kaydı ekle
  }

  const signInWithGoogle = async () => {
    if (!GOOGLE_WEB_CLIENT_ID) {
      throw new Error(
        'Google OAuth yapılandırılmamış.\n\n' +
        'Yapılacaklar:\n' +
        '1. Firebase Console\'a git: https://console.firebase.google.com/\n' +
        '2. Authentication > Sign-in method > Google\n' +
        '3. "Web client ID" değerini kopyala\n' +
        '4. mobile/.env dosyasına ekle: EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your-client-id\n' +
        '5. Uygulamayı yeniden başlat'
      )
    }

    if (!request) {
      throw new Error('Google OAuth hazırlanıyor, lütfen tekrar deneyin')
    }

    try {
      await promptAsync()
    } catch (error: any) {
      console.error('Google sign in prompt error:', error)
      const errorMessage = error?.message || 'Bilinmeyen hata'
      
      // 400 hatası için özel mesaj
      if (errorMessage.includes('400') || errorMessage.includes('redirect_uri_mismatch')) {
        throw new Error(
          'Google OAuth 400 Hatası: Redirect URI uyumsuzluğu.\n\n' +
          'Yapılacaklar:\n' +
          '1. Google Cloud Console\'a git: https://console.cloud.google.com/\n' +
          '2. APIs & Services > Credentials > Web Client ID\'nizi açın\n' +
          '3. Authorized redirect URIs\'ye şunları ekleyin (sadece domain içeren URI\'lar):\n' +
          '   - https://auth.expo.io/@ahmet_akdmrrr/mobile\n' +
          '   - exp://127.0.0.1:8081\n' +
          '   - exp://localhost:8081\n' +
          '   NOT: carivio:// gibi scheme-only URI\'lar eklemeyin!\n' +
          '4. Save\'e tıklayın ve uygulamayı yeniden başlatın'
        )
      }
      
      throw new Error('Google ile giriş başlatılamadı: ' + errorMessage)
    }
  }

  const logout = async () => {
    await signOut(auth)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signInWithGoogle, logout }}>
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

