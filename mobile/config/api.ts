// API Configuration
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000'

export const API_ENDPOINTS = {
  CV_SCORE: `${API_BASE_URL}/api/cv/score`,
  EMOTION: `${API_BASE_URL}/emotion`,
  VIDEO_ANALYSIS_WS: `ws://${API_BASE_URL.replace(/^https?:\/\//, '')}/ws/video-analysis`,
  HEALTH: `${API_BASE_URL}/health`,
}

