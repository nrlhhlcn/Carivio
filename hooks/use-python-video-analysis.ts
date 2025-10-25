"use client"

import { useRef, useState, useCallback, useEffect } from 'react'

export type PythonGazeMetrics = {
  eyeContactRatio: number
  yawDeg: number  
  pitchDeg: number
  confidence: number
}

export type PythonPostureMetrics = {
  isUpright: boolean
  uprightScore: number
  headTiltDeg: number
  shoulderTiltDeg: number
  faceVisibleRatio: number
  confidence: number
}

export type PythonEmotionMetrics = {
  dominantEmotion: string
  confidence: number
  allEmotions: Record<string, number>
}

export type AnalysisResult = {
  timestamp: number
  status: string
  gaze?: PythonGazeMetrics
  posture?: PythonPostureMetrics
  emotion?: PythonEmotionMetrics
}

export function usePythonVideoAnalysis(videoRef: React.RefObject<HTMLVideoElement>) {
  const [connected, setConnected] = useState(false)
  const [gazeMetrics, setGazeMetrics] = useState<PythonGazeMetrics>({
    eyeContactRatio: 0,
    yawDeg: 0,
    pitchDeg: 0,
    confidence: 0
  })
  const [postureMetrics, setPostureMetrics] = useState<PythonPostureMetrics>({
    isUpright: false,
    uprightScore: 0,
    headTiltDeg: 0,
    shoulderTiltDeg: 0,
    faceVisibleRatio: 0,
    confidence: 0
  })
  const [emotionMetrics, setEmotionMetrics] = useState<PythonEmotionMetrics>({
    dominantEmotion: "neutral",
    confidence: 0,
    allEmotions: {}
  })
  
  const wsRef = useRef<WebSocket | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const lastFrameTimeRef = useRef<number>(0)
  
  // Create hidden canvas for frame capture
  useEffect(() => {
    const canvas = document.createElement('canvas')
    canvas.style.display = 'none'
    document.body.appendChild(canvas)
    canvasRef.current = canvas
    
    return () => {
      if (canvasRef.current && document.body.contains(canvasRef.current)) {
        document.body.removeChild(canvasRef.current)
      }
    }
  }, [])

  const connectWebSocket = useCallback(() => {
    try {
      console.log("🔗 Python video analysis WebSocket'e bağlanılıyor...")
      
      // WebSocket connection to Python FastAPI
      const ws = new WebSocket('ws://localhost:8001/ws/video-analysis')
      
      ws.onopen = () => {
        console.log("✅ Python video analysis WebSocket bağlandı!")
        setConnected(true)
        
        // Start sending frames
        startFrameCapture()
      }
      
      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data)
          
          if (message.type === 'analysis_result') {
            const result: AnalysisResult = message.data
            
            console.log("📊 Python'dan analiz sonucu geldi:", result)
            
            if (result.gaze) {
              setGazeMetrics(result.gaze)
            }
            
            if (result.posture) {
              setPostureMetrics(result.posture)
            }
            
            if (result.emotion) {
              setEmotionMetrics(result.emotion)
            }
          }
          
        } catch (e) {
          console.error("❌ WebSocket mesaj parse hatası:", e)
        }
      }
      
      ws.onclose = () => {
        console.log("🔌 Python video analysis WebSocket bağlantısı kesildi")
        setConnected(false)
        
        // Auto-reconnect after 3 seconds
        setTimeout(() => {
          console.log("🔄 Yeniden bağlanmaya çalışılıyor...")
          connectWebSocket()
        }, 3000)
      }
      
      ws.onerror = (error) => {
        console.error("❌ Python video analysis WebSocket hatası:", error)
        setConnected(false)
      }
      
      wsRef.current = ws
      
    } catch (error) {
      console.error("❌ WebSocket bağlantı hatası:", error)
    }
  }, [])

  const captureFrameAsBase64 = useCallback((): string | null => {
    const video = videoRef.current
    const canvas = canvasRef.current
    
    if (!video || !canvas || video.videoWidth === 0 || video.videoHeight === 0) {
      return null
    }
    
    try {
      // Set canvas size to match video
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      
      // Draw current video frame to canvas
      const ctx = canvas.getContext('2d')
      if (!ctx) return null
      
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      
      // Convert to base64 JPEG (more efficient than PNG)
      return canvas.toDataURL('image/jpeg', 0.8)
      
    } catch (error) {
      console.error("❌ Frame capture hatası:", error)
      return null
    }
  }, [videoRef])

  const sendFrameToAnalysis = useCallback(() => {
    const ws = wsRef.current
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      return
    }
    
    const frameData = captureFrameAsBase64()
    if (!frameData) {
      return
    }
    
    try {
      // Send frame to Python analysis
      ws.send(JSON.stringify({
        type: 'video_frame',
        frame: frameData,
        timestamp: Date.now()
      }))
      
    } catch (error) {
      console.error("❌ Frame gönderme hatası:", error)
    }
  }, [captureFrameAsBase64])

  const startFrameCapture = useCallback(() => {
    const captureLoop = () => {
      const now = performance.now()
      
      // Throttle to ~10 FPS to avoid overwhelming Python (100ms interval)
      if (now - lastFrameTimeRef.current >= 100) {
        sendFrameToAnalysis()
        lastFrameTimeRef.current = now
      }
      
      animationFrameRef.current = requestAnimationFrame(captureLoop)
    }
    
    captureLoop()
  }, [sendFrameToAnalysis])

  const stopFrameCapture = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }
  }, [])

  // Connect WebSocket when component mounts
  useEffect(() => {
    connectWebSocket()
    
    return () => {
      stopFrameCapture()
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [connectWebSocket, stopFrameCapture])

  // Monitor video ref changes
  useEffect(() => {
    if (videoRef.current && connected) {
      console.log("🎥 Video ref güncellendi, frame capture yeniden başlatılıyor")
      stopFrameCapture()
      startFrameCapture()
    }
  }, [videoRef.current, connected, startFrameCapture, stopFrameCapture])

  return {
    connected,
    gazeMetrics,
    postureMetrics,
    emotionMetrics,
    ready: connected
  }
}


