import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp 
} from 'firebase/firestore'
import { db } from './firebase'

// CV Analiz Sonuçları için interface
export interface CVAnalysis {
  id?: string
  userId: string
  fileName: string
  fileUrl: string
  analysisDate: Timestamp
  atsScore: number
  skills: string[]
  experience: string[]
  education: string[]
  recommendations: string[]
  sector: string
  rawText: string
}

// Kullanıcı Profili için interface
export interface UserProfile {
  id?: string
  userId: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  location?: string
  linkedinUrl?: string
  githubUrl?: string
  createdAt: Timestamp
  updatedAt: Timestamp
}

// CV Analiz Sonuçlarını Kaydetme
export const saveCVAnalysis = async (analysis: Omit<CVAnalysis, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'cvAnalyses'), {
      ...analysis,
      analysisDate: Timestamp.now()
    })
    return docRef.id
  } catch (error) {
    console.error('CV analizi kaydedilirken hata:', error)
    throw error
  }
}

// Kullanıcının CV Analizlerini Getirme
export const getUserCVAnalyses = async (userId: string): Promise<CVAnalysis[]> => {
  try {
    const q = query(
      collection(db, 'cvAnalyses'),
      where('userId', '==', userId),
      orderBy('analysisDate', 'desc')
    )
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as CVAnalysis[]
  } catch (error) {
    console.error('CV analizleri getirilirken hata:', error)
    throw error
  }
}

// CV Analizini Güncelleme
export const updateCVAnalysis = async (analysisId: string, updates: Partial<CVAnalysis>): Promise<void> => {
  try {
    const docRef = doc(db, 'cvAnalyses', analysisId)
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now()
    })
  } catch (error) {
    console.error('CV analizi güncellenirken hata:', error)
    throw error
  }
}

// CV Analizini Silme
export const deleteCVAnalysis = async (analysisId: string): Promise<void> => {
  try {
    const docRef = doc(db, 'cvAnalyses', analysisId)
    await deleteDoc(docRef)
  } catch (error) {
    console.error('CV analizi silinirken hata:', error)
    throw error
  }
}

// Kullanıcı Profili Kaydetme/Güncelleme
export const saveUserProfile = async (profile: Omit<UserProfile, 'id'>): Promise<string> => {
  try {
    // Önce kullanıcının mevcut profili var mı kontrol et
    const q = query(
      collection(db, 'userProfiles'),
      where('userId', '==', profile.userId)
    )
    const querySnapshot = await getDocs(q)
    
    if (querySnapshot.empty) {
      // Yeni profil oluştur
      const docRef = await addDoc(collection(db, 'userProfiles'), {
        ...profile,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      })
      return docRef.id
    } else {
      // Mevcut profili güncelle
      const docRef = querySnapshot.docs[0].ref
      await updateDoc(docRef, {
        ...profile,
        updatedAt: Timestamp.now()
      })
      return docRef.id
    }
  } catch (error) {
    console.error('Kullanıcı profili kaydedilirken hata:', error)
    throw error
  }
}

// Kullanıcı Profilini Getirme
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const q = query(
      collection(db, 'userProfiles'),
      where('userId', '==', userId)
    )
    const querySnapshot = await getDocs(q)
    
    if (querySnapshot.empty) {
      return null
    }
    
    const doc = querySnapshot.docs[0]
    return {
      id: doc.id,
      ...doc.data()
    } as UserProfile
  } catch (error) {
    console.error('Kullanıcı profili getirilirken hata:', error)
    throw error
  }
}

