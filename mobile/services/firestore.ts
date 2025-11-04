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
  Timestamp,
  runTransaction,
  increment,
} from 'firebase/firestore'
import { db } from '../config/firebase'

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
  tag?: string
  displayName?: string
  photoURL?: string
  isProfilePublic?: boolean
}

export interface CVAnalysis {
  id?: string
  userId: string
  fileName: string
  overallScore: number
  sections: Record<string, { score: number; status: string; feedback: string }>
  recommendations: string[]
  analysisDate: Timestamp | Date
}

export interface InterviewResult {
  id?: string
  userId: string
  interviewDate?: Timestamp | Date
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
  duration: number
}

export const saveCVAnalysisResult = async (data: {
  userId: string
  fileName: string
  overallScore: number
  sections: Record<string, { score: number; status: string; feedback: string }>
  recommendations: string[]
}) => {
  const docRef = await addDoc(collection(db, 'cvAnalysisResults'), {
    ...data,
    analysisDate: Timestamp.now(),
  })
  return docRef.id
}

export const saveInterviewResult = async (data: {
  userId: string
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
  duration: number
}) => {
  const docRef = await addDoc(collection(db, 'interviewResults'), {
    ...data,
    interviewDate: Timestamp.now(),
  })
  return docRef.id
}

export const getUserStats = async (userId: string): Promise<UserStats | null> => {
  const q = query(collection(db, 'userStats'), where('userId', '==', userId), limit(1))
  const snapshot = await getDocs(q)
  if (snapshot.empty) return null
  const doc = snapshot.docs[0]
  const data = doc.data()
  // Boolean değerleri garantile - string olarak kaydedilmişse boolean'a çevir
  const cleanData: any = { ...data }
  if (cleanData.isProfilePublic !== undefined && typeof cleanData.isProfilePublic === 'string') {
    cleanData.isProfilePublic = cleanData.isProfilePublic === 'true' || cleanData.isProfilePublic === 'True' || cleanData.isProfilePublic === '1'
  } else if (cleanData.isProfilePublic !== undefined && typeof cleanData.isProfilePublic !== 'boolean') {
    cleanData.isProfilePublic = Boolean(cleanData.isProfilePublic)
  }
  return { id: doc.id, ...cleanData } as UserStats
}

export const saveUserStats = async (stats: Partial<UserStats> & { userId: string }) => {
  const userStatsRef = collection(db, 'userStats')
  const q = query(userStatsRef, where('userId', '==', stats.userId), limit(1))
  const snapshot = await getDocs(q)

  // Boolean değerleri garantile - kesinlikle boolean olmalı
  const cleanStats: any = { ...stats }
  if (cleanStats.isProfilePublic !== undefined) {
    if (typeof cleanStats.isProfilePublic === 'string') {
      cleanStats.isProfilePublic = cleanStats.isProfilePublic === 'true' || cleanStats.isProfilePublic === 'True' || cleanStats.isProfilePublic === '1'
    } else if (typeof cleanStats.isProfilePublic !== 'boolean') {
      cleanStats.isProfilePublic = Boolean(cleanStats.isProfilePublic)
    }
    // Son kontrol: kesinlikle boolean tipinde olmalı (number gibi değerler için)
    if (typeof cleanStats.isProfilePublic !== 'boolean') {
      cleanStats.isProfilePublic = !!cleanStats.isProfilePublic
    }
  }

  if (snapshot.empty) {
    await addDoc(userStatsRef, {
      ...cleanStats,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    })
  } else {
    const docRef = snapshot.docs[0].ref
    await updateDoc(docRef, {
      ...cleanStats,
      updatedAt: Timestamp.now(),
    })
  }
}

export const getUserCVAnalysisResults = async (userId: string): Promise<CVAnalysis[]> => {
  const q = query(
    collection(db, 'cvAnalysisResults'),
    where('userId', '==', userId),
    orderBy('analysisDate', 'desc'),
    limit(20)
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as CVAnalysis))
}

export interface Post {
  id?: string
  userId: string
  userDisplayName: string
  userPhotoURL: string
  userTag: string
  content: string
  createdAt: Timestamp | Date
  likeCount: number
  replyCount: number
}

export interface Reply {
  id?: string
  postId: string
  parentReplyId?: string | null
  userId: string
  userDisplayName: string
  userPhotoURL: string
  content: string
  createdAt: Timestamp | Date
}

export const createPost = async (post: Omit<Post, 'id' | 'createdAt' | 'likeCount' | 'replyCount'>) => {
  await addDoc(collection(db, 'posts'), {
    ...post,
    createdAt: Timestamp.now(),
    likeCount: 0,
    replyCount: 0,
  })
}

export const getAllPosts = async (): Promise<Post[]> => {
  const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Post[]
}

export const getPostsByTag = async (tag: string): Promise<Post[]> => {
  const q = query(collection(db, 'posts'), where('userTag', '==', tag), orderBy('createdAt', 'desc'))
  const querySnapshot = await getDocs(q)
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Post[]
}

export const likePost = async (postId: string, userId: string) => {
  await runTransaction(db, async (transaction) => {
    const postRef = doc(db, 'posts', postId)
    const likeRef = doc(collection(db, 'likes'))
    transaction.set(likeRef, { postId, userId })
    transaction.update(postRef, { likeCount: increment(1) })
  })
}

export const unlikePost = async (postId: string, userId: string) => {
  await runTransaction(db, async (transaction) => {
    const postRef = doc(db, 'posts', postId)
    const likeQuery = query(collection(db, 'likes'), where('postId', '==', postId), where('userId', '==', userId))
    const likeSnapshot = await getDocs(likeQuery)
    likeSnapshot.docs.forEach((doc) => transaction.delete(doc.ref))
    transaction.update(postRef, { likeCount: increment(-1) })
  })
}

export const bookmarkPost = async (postId: string, userId: string) => {
  await addDoc(collection(db, 'bookmarks'), { postId, userId })
}

export const unbookmarkPost = async (postId: string, userId: string) => {
  const bookmarkQuery = query(collection(db, 'bookmarks'), where('postId', '==', postId), where('userId', '==', userId))
  const bookmarkSnapshot = await getDocs(bookmarkQuery)
  bookmarkSnapshot.docs.forEach(async (doc) => await deleteDoc(doc.ref))
}

export const createReply = async (reply: Omit<Reply, 'id' | 'createdAt'>) => {
  await runTransaction(db, async (transaction) => {
    const postRef = doc(db, 'posts', reply.postId)
    const replyRef = doc(collection(db, 'replies'))
    transaction.set(replyRef, {
      ...reply,
      parentReplyId: reply.parentReplyId || null,
      createdAt: Timestamp.now(),
    })
    if (!reply.parentReplyId) {
      transaction.update(postRef, { replyCount: increment(1) })
    }
  })
}

export const getRepliesByPost = async (postId: string): Promise<Reply[]> => {
  const q = query(collection(db, 'replies'), where('postId', '==', postId), orderBy('createdAt', 'asc'))
  const querySnapshot = await getDocs(q)
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    parentReplyId: doc.data().parentReplyId || null,
  })) as Reply[]
}

export const getUserLikes = async (userId: string): Promise<string[]> => {
  const q = query(collection(db, 'likes'), where('userId', '==', userId))
  const querySnapshot = await getDocs(q)
  return querySnapshot.docs.map((doc) => doc.data().postId as string)
}

export const getUserBookmarks = async (userId: string): Promise<string[]> => {
  const q = query(collection(db, 'bookmarks'), where('userId', '==', userId))
  const querySnapshot = await getDocs(q)
  return querySnapshot.docs.map((doc) => doc.data().postId as string)
}

export const getLeaderboard = async (limitCount = 50): Promise<UserStats[]> => {
  const q = query(collection(db, 'userStats'), orderBy('totalScore', 'desc'), limit(limitCount))
  const snap = await getDocs(q)
  return snap.docs.map((d) => {
    const data = d.data() as any
    // Boolean değerleri garantile - string olarak kaydedilmişse boolean'a çevir
    const cleanData: any = { ...data }
    if (cleanData.isProfilePublic !== undefined && typeof cleanData.isProfilePublic === 'string') {
      cleanData.isProfilePublic = cleanData.isProfilePublic === 'true' || cleanData.isProfilePublic === 'True' || cleanData.isProfilePublic === '1'
    } else if (cleanData.isProfilePublic !== undefined && typeof cleanData.isProfilePublic !== 'boolean') {
      cleanData.isProfilePublic = Boolean(cleanData.isProfilePublic)
    }
    return { id: d.id, ...cleanData } as UserStats
  })
}

export const getCvLeaderboard = async (limitCount = 50): Promise<UserStats[]> => {
  const q = query(collection(db, 'userStats'), orderBy('cvScore', 'desc'), limit(limitCount))
  const snap = await getDocs(q)
  return snap.docs.map((d) => {
    const data = d.data() as any
    // Boolean değerleri garantile - string olarak kaydedilmişse boolean'a çevir
    const cleanData: any = { ...data }
    if (cleanData.isProfilePublic !== undefined && typeof cleanData.isProfilePublic === 'string') {
      cleanData.isProfilePublic = cleanData.isProfilePublic === 'true' || cleanData.isProfilePublic === 'True' || cleanData.isProfilePublic === '1'
    } else if (cleanData.isProfilePublic !== undefined && typeof cleanData.isProfilePublic !== 'boolean') {
      cleanData.isProfilePublic = Boolean(cleanData.isProfilePublic)
    }
    return { id: d.id, ...cleanData } as UserStats
  })
}

export const getUserInterviewResults = async (userId: string): Promise<InterviewResult[]> => {
  const q = query(
    collection(db, 'interviewResults'),
    where('userId', '==', userId),
    orderBy('interviewDate', 'desc'),
    limit(20)
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as InterviewResult))
}

