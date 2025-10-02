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

// Kullanıcı İstatistikleri için interface
export interface UserStats {
  id?: string
  userId: string
  currentRank: number
  totalScore: number
  cvScore: number
  interviewScore: number
  badge: string
  level: string
  completedAnalyses: number
  completedInterviews: number
  totalActiveDays: number
  streak: number
  lastActivityDate: Date | Timestamp
  createdAt?: Timestamp
  updatedAt?: Timestamp
}

// Mülakat Sonuçları için interface
export interface InterviewResult {
  id?: string
  userId: string
  interviewDate?: Timestamp
  overallScore: number
  cvCompatibility: number
  stressManagement: number
  communicationSkills: number
  technicalKnowledge: number
  bodyLanguage: {
    eyeContact: number
    posture: number
    facialExpressions: number
  }
  feedback: string[]
  recommendations: string[]
  questions: string[]
  duration: number // saniye cinsinden
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

// Kullanıcı İstatistiklerini Kaydetme/Güncelleme
export const saveUserStats = async (stats: Omit<UserStats, 'id'>): Promise<string> => {
  try {
    console.log('Kullanıcı istatistikleri kaydediliyor:', stats)
    const q = query(
      collection(db, 'userStats'),
      where('userId', '==', stats.userId)
    )
    const querySnapshot = await getDocs(q)
    
    if (querySnapshot.empty) {
      // Yeni istatistik oluştur
      const docRef = await addDoc(collection(db, 'userStats'), {
        ...stats,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      })
      console.log('Yeni kullanıcı istatistikleri oluşturuldu, ID:', docRef.id)
      return docRef.id
    } else {
      // Mevcut istatistikleri güncelle
      const docRef = querySnapshot.docs[0].ref
      await updateDoc(docRef, {
        ...stats,
        updatedAt: Timestamp.now()
      })
      console.log('Kullanıcı istatistikleri güncellendi, ID:', docRef.id)
      return docRef.id
    }
  } catch (error) {
    console.error('Kullanıcı istatistikleri kaydedilirken hata:', error)
    throw error
  }
}

// Kullanıcı İstatistiklerini Getirme
export const getUserStats = async (userId: string): Promise<UserStats | null> => {
  try {
    const q = query(
      collection(db, 'userStats'),
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
    } as UserStats
  } catch (error) {
    console.error('Kullanıcı istatistikleri getirilirken hata:', error)
    throw error
  }
}

// Mülakat Sonucunu Kaydetme
export const saveInterviewResult = async (result: Omit<InterviewResult, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'interviewResults'), {
      ...result,
      interviewDate: Timestamp.now()
    })
    return docRef.id
  } catch (error) {
    console.error('Mülakat sonucu kaydedilirken hata:', error)
    throw error
  }
}

// Kullanıcının Mülakat Sonuçlarını Getirme
export const getUserInterviewResults = async (userId: string): Promise<InterviewResult[]> => {
  try {
    const q = query(
      collection(db, 'interviewResults'),
      where('userId', '==', userId)
    )
    const querySnapshot = await getDocs(q)
    const results = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as InterviewResult[]
    // Client-side sorting
    return results.sort((a, b) => {
      const dateA = a.interviewDate?.toDate?.() || new Date(0)
      const dateB = b.interviewDate?.toDate?.() || new Date(0)
      return dateB.getTime() - dateA.getTime()
    })
  } catch (error) {
    console.error('Mülakat sonuçları getirilirken hata:', error)
    throw error
  }
}

// CV Analiz Sonucunu Kaydetme (Güncellenmiş)
export const saveCVAnalysisResult = async (result: {
  userId: string
  fileName: string
  overallScore: number
  sections: {
    personalInfo: { score: number; status: string; feedback: string }
    experience: { score: number; status: string; feedback: string }
    education: { score: number; status: string; feedback: string }
    skills: { score: number; status: string; feedback: string }
    projects: { score: number; status: string; feedback: string }
  }
  recommendations: string[]
}): Promise<string> => {
  try {
    console.log('CV analiz sonucu kaydediliyor:', result)
    const docRef = await addDoc(collection(db, 'cvAnalysisResults'), {
      ...result,
      analysisDate: Timestamp.now()
    })
    console.log('CV analiz sonucu başarıyla kaydedildi, ID:', docRef.id)
    return docRef.id
  } catch (error) {
    console.error('CV analiz sonucu kaydedilirken hata:', error)
    throw error
  }
}

// Kullanıcının CV Analiz Sonuçlarını Getirme
export const getUserCVAnalysisResults = async (userId: string) => {
  try {
    const q = query(
      collection(db, 'cvAnalysisResults'),
      where('userId', '==', userId)
    )
    const querySnapshot = await getDocs(q)
    const results = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    // Client-side sorting
    return results.sort((a, b) => {
      const dateA = a.analysisDate?.toDate?.() || new Date(0)
      const dateB = b.analysisDate?.toDate?.() || new Date(0)
      return dateB.getTime() - dateA.getTime()
    })
  } catch (error) {
    console.error('CV analiz sonuçları getirilirken hata:', error)
    throw error
  }
}

