import { initializeApp, getApps, getApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Runtime env validation to provide clearer diagnostics in dev
const requiredEnvVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
]

const missing = requiredEnvVars.filter((key) => !process.env[key as keyof NodeJS.ProcessEnv])
if (missing.length > 0) {
  // eslint-disable-next-line no-console
  console.error(
    `Firebase config missing env vars: ${missing.join(', ')}. Did you create .env.local and restart the dev server?`
  )
}

// Initialize once (works in Next.js RSC/Client environments)
const app = getApps().length ? getApp() : initializeApp(firebaseConfig)

// Firebase servislerini export et
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)
export default app

