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
} from "firebase/firestore";
import { db } from "./firebase";

// CV Analiz Sonuçları için interface
export interface CVAnalysis {
  id?: string;
  userId: string;
  fileName: string;
  fileUrl: string;
  analysisDate: Timestamp;
  atsScore: number;
  skills: string[];
  experience: string[];
  education: string[];
  recommendations: string[];
  sector: string;
  rawText: string;
}

// Kullanıcı Profili için interface
export interface UserProfile {
  id?: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  location?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Kullanıcı İstatistikleri için interface
export interface UserStats {
  id?: string;
  userId: string;
  currentRank: number;
  totalScore: number;
  cvScore: number;
  interviewScore: number;
  badge: string;
  level: string;
  completedAnalyses: number;
  completedInterviews: number;
  totalActiveDays: number;
  streak: number;
  lastActivityDate: Date | Timestamp;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  tag?: string;
  displayName?: string;
  photoURL?: string;
}

// Basit kullanıcı profili (users koleksiyonu)
export interface BasicUserDoc {
  id?: string;
  userId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  photoURL?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  tag?: string;
}

// Mülakat Sonuçları için interface
export interface InterviewResult {
  id?: string;
  userId: string;
  interviewDate?: Timestamp;
  overallScore: number;
  cvCompatibility: number;
  stressManagement: number;
  communicationSkills: number;
  technicalKnowledge: number;
  bodyLanguage: {
    eyeContact: number;
    posture: number;
    facialExpressions: number;
  };
  feedback: string[];
  recommendations: string[];
  questions: string[];
  duration: number; // saniye cinsinden
}

// Topluluk Gönderisi (Post) için interface
export interface Post {
  id?: string;
  userId: string;
  userDisplayName: string;
  userPhotoURL: string;
  userTag: string;
  content: string;
  createdAt: Timestamp;
  likeCount: number;
  replyCount: number;
}

// Yanıt (Reply) için interface
export interface Reply {
  id?: string;
  postId: string;
  userId: string;
  userDisplayName: string;
  userPhotoURL: string;
  content: string;
  createdAt: Timestamp;
}

// Beğeni (Like) için interface
export interface Like {
  id?: string;
  postId: string;
  userId: string;
}

// Kaydetme (Bookmark) için interface
export interface Bookmark {
  id?: string;
  postId: string;
  userId: string;
}

// CV Analiz Sonuçlarını Kaydetme
export const saveCVAnalysis = async (
  analysis: Omit<CVAnalysis, "id">,
): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, "cvAnalyses"), {
      ...analysis,
      analysisDate: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error("CV analizi kaydedilirken hata:", error);
    throw error;
  }
};

// Kullanıcının CV Analizlerini Getirme
export const getUserCVAnalyses = async (
  userId: string,
): Promise<CVAnalysis[]> => {
  try {
    const q = query(
      collection(db, "cvAnalyses"),
      where("userId", "==", userId),
      orderBy("analysisDate", "desc"),
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as CVAnalysis[];
  } catch (error) {
    console.error("CV analizleri getirilirken hata:", error);
    throw error;
  }
};

// CV Analizini Güncelleme
export const updateCVAnalysis = async (
  analysisId: string,
  updates: Partial<CVAnalysis>,
): Promise<void> => {
  try {
    const docRef = doc(db, "cvAnalyses", analysisId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error("CV analizi güncellenirken hata:", error);
    throw error;
  }
};

// CV Analizini Silme
export const deleteCVAnalysis = async (analysisId: string): Promise<void> => {
  try {
    const docRef = doc(db, "cvAnalyses", analysisId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("CV analizi silinirken hata:", error);
    throw error;
  }
};

// Kullanıcı Profili Kaydetme/Güncelleme
export const saveUserProfile = async (
  profile: Omit<UserProfile, "id">,
): Promise<string> => {
  try {
    // Önce kullanıcının mevcut profili var mı kontrol et
    const q = query(
      collection(db, "userProfiles"),
      where("userId", "==", profile.userId),
    );
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      // Yeni profil oluştur
      const docRef = await addDoc(collection(db, "userProfiles"), {
        ...profile,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      return docRef.id;
    } else {
      // Mevcut profili güncelle
      const docRef = querySnapshot.docs[0].ref;
      await updateDoc(docRef, {
        ...profile,
        updatedAt: Timestamp.now(),
      });
      return docRef.id;
    }
  } catch (error) {
    console.error("Kullanıcı profili kaydedilirken hata:", error);
    throw error;
  }
};

// Kullanıcı Profilini Getirme
export const getUserProfile = async (
  userId: string,
): Promise<UserProfile | null> => {
  try {
    const q = query(
      collection(db, "userProfiles"),
      where("userId", "==", userId),
    );
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
    } as UserProfile;
  } catch (error) {
    console.error("Kullanıcı profili getirilirken hata:", error);
    throw error;
  }
};

// Kullanıcı İstatistiklerini Kaydetme/Güncelleme
export const saveUserStats = async (
  stats: Omit<UserStats, "id">,
): Promise<string> => {
  try {
    console.log("Kullanıcı istatistikleri kaydediliyor:", stats);
    const q = query(
      collection(db, "userStats"),
      where("userId", "==", stats.userId),
    );
    const querySnapshot = await getDocs(q);
    // Remove undefined fields to satisfy Firestore constraints
    const cleaned: Record<string, any> = {};
    Object.entries(stats as any).forEach(([k, v]) => {
      if (v !== undefined) cleaned[k] = v;
    });

    if (querySnapshot.empty) {
      // Yeni istatistik oluştur
      const docRef = await addDoc(collection(db, "userStats"), {
        ...cleaned,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      console.log("Yeni kullanıcı istatistikleri oluşturuldu, ID:", docRef.id);
      return docRef.id;
    } else {
      // Mevcut istatistikleri güncelle
      const docRef = querySnapshot.docs[0].ref;
      await updateDoc(docRef, {
        ...cleaned,
        updatedAt: Timestamp.now(),
      });
      console.log("Kullanıcı istatistikleri güncellendi, ID:", docRef.id);
      return docRef.id;
    }
  } catch (error) {
    console.error("Kullanıcı istatistikleri kaydedilirken hata:", error);
    throw error;
  }
};

// Kullanıcı İstatistiklerini Getirme
export const getUserStats = async (
  userId: string,
): Promise<UserStats | null> => {
  try {
    const q = query(collection(db, "userStats"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
    } as UserStats;
  } catch (error) {
    console.error("Kullanıcı istatistikleri getirilirken hata:", error);
    throw error;
  }
};

// Mülakat Sonucunu Kaydetme
export const saveInterviewResult = async (
  result: Omit<InterviewResult, "id">,
): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, "interviewResults"), {
      ...result,
      interviewDate: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Mülakat sonucu kaydedilirken hata:", error);
    throw error;
  }
};

// Kullanıcının Mülakat Sonuçlarını Getirme
export const getUserInterviewResults = async (
  userId: string,
): Promise<InterviewResult[]> => {
  try {
    const q = query(
      collection(db, "interviewResults"),
      where("userId", "==", userId),
    );
    const querySnapshot = await getDocs(q);
    const results = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as InterviewResult[];
    // Client-side sorting
    return results.sort((a, b) => {
      const dateA = a.interviewDate?.toDate?.() || new Date(0);
      const dateB = b.interviewDate?.toDate?.() || new Date(0);
      return dateB.getTime() - dateA.getTime();
    });
  } catch (error) {
    console.error("Mülakat sonuçları getirilirken hata:", error);
    throw error;
  }
};

// CV Analiz Sonucunu Kaydetme (Güncellenmiş)
export const saveCVAnalysisResult = async (result: {
  userId: string;
  fileName: string;
  overallScore: number;
  sections: {
    personalInfo: { score: number; status: string; feedback: string };
    experience: { score: number; status: string; feedback: string };
    education: { score: number; status: string; feedback: string };
    skills: { score: number; status: string; feedback: string };
    projects: { score: number; status: string; feedback: string };
  };
  recommendations: string[];
}): Promise<string> => {
  try {
    console.log("CV analiz sonucu kaydediliyor:", result);
    const docRef = await addDoc(collection(db, "cvAnalysisResults"), {
      ...result,
      analysisDate: Timestamp.now(),
    });
    console.log("CV analiz sonucu başarıyla kaydedildi, ID:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("CV analiz sonucu kaydedilirken hata:", error);
    throw error;
  }
};

// Kullanıcının CV Analiz Sonuçlarını Getirme
export const getUserCVAnalysisResults = async (
  userId: string,
): Promise<Array<{ id: string; analysisDate?: any } & Record<string, any>>> => {
  try {
    const q = query(
      collection(db, "cvAnalysisResults"),
      where("userId", "==", userId),
    );
    const querySnapshot = await getDocs(q);
    const results: Array<
      { id: string; analysisDate?: any } & Record<string, any>
    > = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as any),
    }));
    // Client-side sorting
    return results.sort((a, b) => {
      const dateA = a.analysisDate?.toDate?.() || new Date(0);
      const dateB = b.analysisDate?.toDate?.() || new Date(0);
      return dateB.getTime() - dateA.getTime();
    });
  } catch (error) {
    console.error("CV analiz sonuçları getirilirken hata:", error);
    throw error;
  }
};

// Leaderboard - en yüksek toplam puana göre sıralı kullanıcı istatistikleri
export const getLeaderboard = async (limitCount = 50): Promise<UserStats[]> => {
  try {
    const q = query(
      collection(db, "userStats"),
      orderBy("totalScore", "desc"),
      limit(limitCount),
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as any),
    })) as UserStats[];
  } catch (error) {
    console.error("Leaderboard çekilirken hata:", error);
    throw error;
  }
};

// CV skoruna göre liderlik tablosu (en yüksek cvScore)
export const getCvLeaderboard = async (
  limitCount = 50,
): Promise<UserStats[]> => {
  try {
    const q = query(
      collection(db, "userStats"),
      orderBy("cvScore", "desc"),
      limit(limitCount),
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as any),
    })) as UserStats[];
  } catch (error) {
    console.error("CV Leaderboard çekilirken hata:", error);
    throw error;
  }
};

// USERS collection helpers
export const upsertUserDoc = async (
  user: Omit<BasicUserDoc, "id" | "createdAt" | "updatedAt">,
): Promise<string> => {
  try {
    const q = query(
      collection(db, "users"),
      where("userId", "==", user.userId),
    );
    const snap = await getDocs(q);
    // Remove undefined fields (Firestore doesn't allow undefined)
    const cleaned: Record<string, any> = {};
    Object.entries(user).forEach(([k, v]) => {
      if (v !== undefined) cleaned[k] = v;
    });
    const payload = {
      ...cleaned,
      updatedAt: Timestamp.now(),
    };
    if (snap.empty) {
      const docRef = await addDoc(collection(db, "users"), {
        ...payload,
        createdAt: Timestamp.now(),
      });
      return docRef.id;
    } else {
      const ref = snap.docs[0].ref;
      await updateDoc(ref, payload);
      return ref.id;
    }
  } catch (e) {
    console.error("users upsert error:", e);
    throw e;
  }
};

export const getUserById = async (
  userId: string,
): Promise<BasicUserDoc | null> => {
  try {
    const q = query(collection(db, "users"), where("userId", "==", userId));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const d = snap.docs[0];
    return { id: d.id, ...(d.data() as any) } as BasicUserDoc;
  } catch (e) {
    console.error("users get error:", e);
    throw e;
  }
};

// Topluluk Fonksiyonları
export const createPost = async (
  post: Omit<Post, "id" | "createdAt" | "likeCount" | "replyCount">,
) => {
  await addDoc(collection(db, "posts"), {
    ...post,
    createdAt: Timestamp.now(),
    likeCount: 0,
    replyCount: 0,
  });
};

export const getPostsByTag = async (tag: string) => {
  const q = query(
    collection(db, "posts"),
    where("userTag", "==", tag),
    orderBy("createdAt", "desc"),
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Post[];
};

// Tüm gönderileri getir (etiket fark etmeksizin)
export const getAllPosts = async (): Promise<Post[]> => {
  const q = query(
    collection(db, "posts"),
    orderBy("createdAt", "desc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Post[];
};

export const likePost = async (postId: string, userId: string) => {
  await runTransaction(db, async (transaction) => {
    const postRef = doc(db, "posts", postId);
    const likeRef = doc(collection(db, "likes"));
    transaction.set(likeRef, { postId, userId });
    transaction.update(postRef, { likeCount: increment(1) });
  });
};

export const unlikePost = async (postId: string, userId: string) => {
  await runTransaction(db, async (transaction) => {
    const postRef = doc(db, "posts", postId);
    const likeQuery = query(
      collection(db, "likes"),
      where("postId", "==", postId),
      where("userId", "==", userId),
    );
    const likeSnapshot = await getDocs(likeQuery);
    likeSnapshot.docs.forEach((doc) => transaction.delete(doc.ref));
    transaction.update(postRef, { likeCount: increment(-1) });
  });
};

export const bookmarkPost = async (postId: string, userId: string) => {
  await addDoc(collection(db, "bookmarks"), { postId, userId });
};

export const unbookmarkPost = async (postId: string, userId: string) => {
  const bookmarkQuery = query(
    collection(db, "bookmarks"),
    where("postId", "==", postId),
    where("userId", "==", userId),
  );
  const bookmarkSnapshot = await getDocs(bookmarkQuery);
  bookmarkSnapshot.docs.forEach(async (doc) => await deleteDoc(doc.ref));
};

export const createReply = async (reply: Omit<Reply, "id" | "createdAt">) => {
  await runTransaction(db, async (transaction) => {
    const postRef = doc(db, "posts", reply.postId);
    const replyRef = doc(collection(db, "replies"));
    transaction.set(replyRef, {
      ...reply,
      createdAt: Timestamp.now(),
    });
    transaction.update(postRef, { replyCount: increment(1) });
  });
};

export const getRepliesByPost = async (postId: string) => {
  const q = query(
    collection(db, "replies"),
    where("postId", "==", postId),
    orderBy("createdAt", "asc"),
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Reply[];
};

export const getUserLikes = async (userId: string): Promise<string[]> => {
  const q = query(collection(db, "likes"), where("userId", "==", userId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => doc.data().postId as string);
};

export const getUserBookmarks = async (userId: string): Promise<string[]> => {
  const q = query(collection(db, "bookmarks"), where("userId", "==", userId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => doc.data().postId as string);
};

// Tek bir gönderiyi ID ile getir
export const getPostById = async (postId: string): Promise<Post | null> => {
  try {
    const ref = doc(db, "posts", postId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return { id: snap.id, ...(snap.data() as any) } as Post;
  } catch (e) {
    console.error("getPostById error:", e);
    throw e;
  }
};

// Kullanıcının oluşturduğu gönderiler
export const getPostsByUser = async (userId: string): Promise<Post[]> => {
  // Avoid composite index requirement by sorting client-side
  const q = query(collection(db, "posts"), where("userId", "==", userId));
  const snap = await getDocs(q);
  const items = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Post[];
  return items.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
};

// Belirli ID'lerdeki gönderiler (10'luk gruplar halinde)
export const getPostsByIds = async (ids: string[]): Promise<Post[]> => {
  if (ids.length === 0) return [];
  const chunks: string[][] = [];
  for (let i = 0; i < ids.length; i += 10) chunks.push(ids.slice(i, i + 10));
  const results: Post[] = [];
  for (const ch of chunks) {
    const q = query(collection(db, "posts"), where("__name__", "in", ch));
    const snap = await getDocs(q);
    results.push(...(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Post[]));
  }
  // Orijinal id sırasını korumak için sıralama
  const order = new Map(ids.map((id, idx) => [id, idx] as const));
  return results.sort((a, b) => (order.get(a.id!)! - order.get(b.id!)!));
};

// Gönderi içeriğini güncelle
export const updatePostContent = async (postId: string, content: string) => {
  const ref = doc(db, "posts", postId);
  await updateDoc(ref, { content });
};

// Gönderiyi ve ilişkili like/bookmark/reply kayıtlarını sil
export const deletePostWithRelations = async (postId: string) => {
  // delete likes
  const likesQ = query(collection(db, "likes"), where("postId", "==", postId));
  const likesSnap = await getDocs(likesQ);
  await Promise.all(likesSnap.docs.map((d) => deleteDoc(d.ref)));
  // delete bookmarks
  const bmQ = query(collection(db, "bookmarks"), where("postId", "==", postId));
  const bmSnap = await getDocs(bmQ);
  await Promise.all(bmSnap.docs.map((d) => deleteDoc(d.ref)));
  // delete replies
  const rpQ = query(collection(db, "replies"), where("postId", "==", postId));
  const rpSnap = await getDocs(rpQ);
  await Promise.all(rpSnap.docs.map((d) => deleteDoc(d.ref)));
  // finally delete post
  await deleteDoc(doc(db, "posts", postId));
};
