// Mobile Firebase Configuration
import { initializeApp, getApps, getApp } from 'firebase/app'
import { initializeAuth, getAuth, getReactNativePersistence } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import AsyncStorage from '@react-native-async-storage/async-storage'

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
}

// Validate Firebase config - sadece console.error kullan, throw etme (render hatasına neden olabilir)
if (!firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId) {
  console.error('❌ Firebase config eksik! Lütfen mobile/.env dosyası oluşturun ve EXPO_PUBLIC_FIREBASE_* değişkenlerini ekleyin.')
  // Render hatasına neden olmamak için throw etme, sadece uyar
}

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig)

// Initialize Auth with React Native persistence
// React Native için initializeAuth kullanılmalı (getAuth değil)
let auth
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  })
} catch (error: any) {
  // Eğer zaten initialize edilmişse, getAuth kullan
  if (error?.code === 'auth/already-initialized') {
    auth = getAuth(app)
  } else {
    console.error('Firebase Auth initialization error:', error)
    // Fallback: getAuth kullan
    auth = getAuth(app)
  }
}

export { auth }
export const db = getFirestore(app)
export const storage = getStorage(app)
export default app

