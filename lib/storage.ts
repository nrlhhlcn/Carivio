import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject,
  getMetadata 
} from 'firebase/storage'
import { storage } from './firebase'

// CV dosyası yükleme
export const uploadCVFile = async (
  file: File, 
  userId: string, 
  fileName?: string
): Promise<{ url: string; path: string }> => {
  try {
    // Dosya adını oluştur
    const timestamp = Date.now()
    const fileExtension = file.name.split('.').pop()
    const finalFileName = fileName || `cv_${timestamp}.${fileExtension}`
    
    // Storage path'i oluştur
    const storagePath = `cv-files/${userId}/${finalFileName}`
    const storageRef = ref(storage, storagePath)
    
    // Dosyayı yükle
    const snapshot = await uploadBytes(storageRef, file)
    
    // Download URL'ini al
    const downloadURL = await getDownloadURL(snapshot.ref)
    
    return {
      url: downloadURL,
      path: storagePath
    }
  } catch (error) {
    console.error('CV dosyası yüklenirken hata:', error)
    throw error
  }
}

// Dosya silme
export const deleteCVFile = async (filePath: string): Promise<void> => {
  try {
    const fileRef = ref(storage, filePath)
    await deleteObject(fileRef)
  } catch (error) {
    console.error('CV dosyası silinirken hata:', error)
    throw error
  }
}

// Dosya metadata'sını getirme
export const getFileMetadata = async (filePath: string) => {
  try {
    const fileRef = ref(storage, filePath)
    const metadata = await getMetadata(fileRef)
    return metadata
  } catch (error) {
    console.error('Dosya metadata\'sı getirilirken hata:', error)
    throw error
  }
}

// Dosya boyutunu kontrol etme (5MB limit)
export const validateFileSize = (file: File, maxSizeMB: number = 5): boolean => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024
  return file.size <= maxSizeBytes
}

// Dosya tipini kontrol etme
export const validateFileType = (file: File): boolean => {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ]
  return allowedTypes.includes(file.type)
}

// Dosya yükleme progress'i için callback
export const uploadCVFileWithProgress = async (
  file: File,
  userId: string,
  fileName?: string,
  onProgress?: (progress: number) => void
): Promise<{ url: string; path: string }> => {
  try {
    const timestamp = Date.now()
    const fileExtension = file.name.split('.').pop()
    const finalFileName = fileName || `cv_${timestamp}.${fileExtension}`
    
    const storagePath = `cv-files/${userId}/${finalFileName}`
    const storageRef = ref(storage, storagePath)
    
    // Progress tracking için uploadBytes kullan
    const snapshot = await uploadBytes(storageRef, file)
    
    // Progress callback'i çağır
    if (onProgress) {
      onProgress(100)
    }
    
    const downloadURL = await getDownloadURL(snapshot.ref)
    
    return {
      url: downloadURL,
      path: storagePath
    }
  } catch (error) {
    console.error('CV dosyası yüklenirken hata:', error)
    throw error
  }
}

