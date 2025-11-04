// CV Analysis Service
import { API_ENDPOINTS } from '../config/api'

export interface CVScoreResult {
  ok: boolean
  result: {
    file: string
    sector: string
    score: number
    breakdown: {
      sections: number
      formatting: number
      keywords: number
      actions: number
      completeness: number
    }
    recommendations: string[]
  }
}

export const analyzeCV = async (
  fileUri: string,
  sector: string = 'INFORMATION-TECHNOLOGY',
  jdText?: string
): Promise<CVScoreResult> => {
  // React Native FormData
  const formData = new FormData()
  
  // File URI'yi FormData'ya ekle
  formData.append('file', {
    uri: fileUri,
    type: 'application/pdf',
    name: 'cv.pdf',
  } as any)
  
  formData.append('sector', sector)
  
  if (jdText) {
    formData.append('jd_text', jdText)
  }

  const response = await fetch(API_ENDPOINTS.CV_SCORE, {
    method: 'POST',
    body: formData,
    // Content-Type header'ını ekleme - FormData otomatik ekler
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'CV analizi başarısız')
  }

  return await response.json()
}

