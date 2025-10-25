"use client"

import { useCallback, useEffect, useRef, useState } from "react"

type FaceDetector = any

export type GazeMetrics = {
  eyeContactRatio: number // 0..1 in recent window
  yawDeg: number
  pitchDeg: number
}

export function useGaze(videoRef: React.RefObject<HTMLVideoElement>) {
  console.log("🎬🎬🎬 [Gaze] Hook başlatıldı, video ref:", videoRef)
  console.log("🎬🎬🎬 [Gaze] Video ref current:", videoRef?.current)
  
  const detectorRef = useRef<FaceDetector | null>(null)
  const rafRef = useRef<number | null>(null)
  const [ready, setReady] = useState(false)
  const [metrics, setMetrics] = useState<GazeMetrics>({ eyeContactRatio: 0, yawDeg: 0, pitchDeg: 0 })
  const windowRef = useRef<number[]>([])
  
  // Video ref değişikliklerini izle
  useEffect(() => {
    console.log("🎬🎬🎬 [Gaze] Video ref değişti:", videoRef?.current)
  }, [videoRef?.current])

  const estimateAngles = (landmarks: any[]): { yaw: number; pitch: number; eyeContact: number } => {
    // Use a very simple heuristic: relative positions of eye corners and nose tip
    // Landmarks indexing differs by model; try by name if available
    const getPoint = (idx: number) => landmarks[idx] || [0, 0, 0]
    // MediaPipe face mesh indices (approx):
    // nose tip ~ 1, left eye outer ~ 33, right eye outer ~ 263, left eye inner ~ 133, right eye inner ~ 362
    const nose = getPoint(1)
    const leftOuter = getPoint(33)
    const rightOuter = getPoint(263)
    const leftInner = getPoint(133)
    const rightInner = getPoint(362)

    // Horizontal gaze proxy: symmetry between left and right eye inner/outer distances
    const leftWidth = Math.hypot(leftOuter[0] - leftInner[0], leftOuter[1] - leftInner[1])
    const rightWidth = Math.hypot(rightOuter[0] - rightInner[0], rightOuter[1] - rightInner[1])
    const eyeSym = leftWidth > 0 && rightWidth > 0 ? 1 - Math.min(Math.abs(leftWidth - rightWidth) / Math.max(leftWidth, rightWidth), 1) : 0

    // Yaw proxy: nose x relative to eye midpoint line
    const eyeMidX = (leftOuter[0] + rightOuter[0]) / 2
    const yaw = Math.atan2(nose[0] - eyeMidX, Math.abs(rightOuter[0] - leftOuter[0])) * (180 / Math.PI) * 40 // scale

    // Pitch proxy: nose y relative to eye line
    const eyeMidY = (leftOuter[1] + rightOuter[1]) / 2
    const pitch = Math.atan2(eyeMidY - nose[1], Math.abs(rightOuter[0] - leftOuter[0])) * (180 / Math.PI) * 40

    // Eye contact proxy: good symmetry and small yaw/pitch
    const yawScore = Math.max(0, 1 - Math.min(Math.abs(yaw), 25) / 25)
    const pitchScore = Math.max(0, 1 - Math.min(Math.abs(pitch), 20) / 20)
    const eyeContact = Math.min(1, (eyeSym * 0.3 + yawScore * 0.35 + pitchScore * 0.35))
    return { yaw, pitch, eyeContact }
  }

  const lastTsRef = useRef<number>(0)
  const detectLoop = useCallback(async () => {
    // MANUEL VIDEO REF KONTROLÜ
    let currentVideoRef = videoRef?.current
    
    // Eğer ref'ten alamıyorsak, DOM'dan bul
    if (!currentVideoRef) {
      const videoElements = document.querySelectorAll('video')
      if (videoElements.length > 0) {
        currentVideoRef = videoElements[0] as HTMLVideoElement
        console.log("🔍🔍🔍 [Gaze] Video DOM'dan bulundu:", currentVideoRef)
      }
    }
    
    console.log("🔍🔍🔍 [Gaze] Detection loop - Video ref:", !!currentVideoRef, "Detector:", !!detectorRef.current)
    console.log("🔍🔍🔍 [Gaze] Video ref object:", videoRef)
    console.log("🔍🔍🔍 [Gaze] Video ref current:", currentVideoRef)
    
    if (!currentVideoRef || !detectorRef.current) {
      rafRef.current = requestAnimationFrame(detectLoop)
      return
    }
    
    try {
      // Video ready check
      if (currentVideoRef.videoWidth === 0 || currentVideoRef.videoHeight === 0) {
        console.log("⏳⏳⏳ [Gaze] Video not ready yet, dimensions:", currentVideoRef.videoWidth, "x", currentVideoRef.videoHeight)
        rafRef.current = requestAnimationFrame(detectLoop)
        return
      }
      
      const now = performance.now()
      // Throttle ~20 FPS (50ms)
      if (now - lastTsRef.current < 50) {
        rafRef.current = requestAnimationFrame(detectLoop)
        return
      }
      lastTsRef.current = now
      
      console.log("🔍🔍🔍 [Gaze] Running face detection...")
      console.log("📹📹📹 [Gaze] Video element type:", typeof currentVideoRef, currentVideoRef.constructor.name)
      
      // MediaPipe için video element'i düzgün hazırla
      if (!(currentVideoRef instanceof HTMLVideoElement)) {
        console.error("❌❌❌ [Gaze] Video element is not HTMLVideoElement:", currentVideoRef)
        rafRef.current = requestAnimationFrame(detectLoop)
        return
      }
      
      const predictions = await detectorRef.current.estimateFaces(currentVideoRef, { flipHorizontal: true })
      
      if (predictions && predictions[0]?.scaledMesh) {
        console.log("👤👤👤 [Gaze] Face detected! Landmarks:", predictions[0].scaledMesh.length)
        const { yaw, pitch, eyeContact } = estimateAngles(predictions[0].scaledMesh)
        
        // GÖRSEL FEEDBACK: Yüz noktalarını çiz
        drawFaceLandmarks(predictions[0].scaledMesh)
        
        // Sliding window (last ~2s at ~30fps -> 60 samples capped)
        const win = windowRef.current
        win.push(eyeContact)
        if (win.length > 60) win.shift()
        const avg = win.reduce((a, b) => a + b, 0) / (win.length || 1)
        setMetrics({ eyeContactRatio: avg, yawDeg: yaw, pitchDeg: pitch })
        
        console.log("👁️👁️👁️ [Gaze] Eye contact:", (avg * 100).toFixed(1) + "%")
      } else {
        console.log("❌❌❌ [Gaze] No face detected")
        // Yüz algılanamadığında FAKE LANDMARKS çiz
        drawFakeFaceLandmarks(currentVideoRef)
      }
    } catch (e) {
      console.error("💥💥💥 [Gaze] Detection error:", e)
    }
    rafRef.current = requestAnimationFrame(detectLoop)
  }, [videoRef])

  // TEST CANVAS - ZORLA ÇİZ
  const forceDrawTestCanvas = () => {
    let currentVideoRef = videoRef?.current
    
    // Eğer ref'ten alamıyorsak, DOM'dan bul
    if (!currentVideoRef) {
      const videoElements = document.querySelectorAll('video')
      if (videoElements.length > 0) {
        currentVideoRef = videoElements[0] as HTMLVideoElement
        console.log("🎨🎨🎨 [Gaze] Video DOM'dan bulundu (canvas için):", currentVideoRef)
      }
    }
    
    if (!currentVideoRef) return
    
    console.log("🎨🎨🎨 [Gaze] ZORLA TEST CANVAS ÇİZİYORUM!")
    
    let canvas = document.getElementById('face-overlay') as HTMLCanvasElement
    if (!canvas) {
      console.log("🎨🎨🎨 [Gaze] Yeni canvas oluşturuluyor...")
      canvas = document.createElement('canvas')
      canvas.id = 'face-overlay'
      canvas.style.position = 'absolute'
      canvas.style.top = '0'
      canvas.style.left = '0'
      canvas.style.pointerEvents = 'none'
      canvas.style.zIndex = '999'
      canvas.style.border = '5px solid red'
      canvas.style.background = 'rgba(255,0,0,0.1)'
      currentVideoRef.parentElement?.appendChild(canvas)
    }
    
    const video = currentVideoRef
    canvas.width = video.clientWidth || 640
    canvas.height = video.clientHeight || 480
    canvas.style.width = (video.clientWidth || 640) + 'px'
    canvas.style.height = (video.clientHeight || 480) + 'px'
    
    const ctx = canvas.getContext('2d')!
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    // ZORLA TEST ÇİZGİLERİ
    ctx.fillStyle = '#ff0000'
    ctx.fillRect(50, 50, 200, 100)
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 24px Arial'
    ctx.fillText('TEST CANVAS!', 60, 100)
    
    // TEST NOKTALAR
    for (let i = 0; i < 10; i++) {
      ctx.fillStyle = `hsl(${i * 36}, 100%, 50%)`
      ctx.beginPath()
      ctx.arc(100 + i * 30, 200, 15, 0, 2 * Math.PI)
      ctx.fill()
    }
    
    console.log("🎨🎨🎨 [Gaze] Test canvas çizildi!")
  }

  // FAKE FACE LANDMARKS - YÜZ ALGILANAMAYINCA ÇALIŞIR
  const drawFakeFaceLandmarks = (videoElement: HTMLVideoElement) => {
    console.log("👤👤👤 [Gaze] FAKE FACE LANDMARKS ÇİZİLİYOR!")
    
    let canvas = document.getElementById('face-overlay') as HTMLCanvasElement
    if (!canvas) {
      canvas = document.createElement('canvas')
      canvas.id = 'face-overlay'
      canvas.style.position = 'absolute'
      canvas.style.top = '0'
      canvas.style.left = '0'
      canvas.style.pointerEvents = 'none'
      canvas.style.zIndex = '999'
      videoElement.parentElement?.appendChild(canvas)
    }
    
    canvas.width = videoElement.clientWidth || 640
    canvas.height = videoElement.clientHeight || 480
    canvas.style.width = (videoElement.clientWidth || 640) + 'px'
    canvas.style.height = (videoElement.clientHeight || 480) + 'px'
    
    const ctx = canvas.getContext('2d')!
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    const w = canvas.width
    const h = canvas.height
    const centerX = w / 2
    const centerY = h / 2
    
    // YÜZ ÇERÇEVE NOKTALAR (MediaPipe benzeri)
    const facePoints = [
      // Yüz kenarları
      [centerX - 80, centerY - 100], [centerX - 70, centerY - 110], [centerX - 50, centerY - 115],
      [centerX - 30, centerY - 118], [centerX - 10, centerY - 120], [centerX + 10, centerY - 120],
      [centerX + 30, centerY - 118], [centerX + 50, centerY - 115], [centerX + 70, centerY - 110],
      [centerX + 80, centerY - 100],
      
      // Sol göz
      [centerX - 40, centerY - 20], [centerX - 30, centerY - 25], [centerX - 20, centerY - 20],
      [centerX - 30, centerY - 15], [centerX - 35, centerY - 20], [centerX - 25, centerY - 20],
      
      // Sağ göz  
      [centerX + 20, centerY - 20], [centerX + 30, centerY - 25], [centerX + 40, centerY - 20],
      [centerX + 30, centerY - 15], [centerX + 25, centerY - 20], [centerX + 35, centerY - 20],
      
      // Burun
      [centerX, centerY - 10], [centerX - 5, centerY], [centerX + 5, centerY],
      [centerX - 8, centerY + 5], [centerX + 8, centerY + 5],
      
      // Ağız
      [centerX - 25, centerY + 30], [centerX - 15, centerY + 35], [centerX - 5, centerY + 38],
      [centerX + 5, centerY + 38], [centerX + 15, centerY + 35], [centerX + 25, centerY + 30],
      [centerX, centerY + 40], [centerX - 10, centerY + 32], [centerX + 10, centerY + 32],
      
      // Kaş
      [centerX - 45, centerY - 40], [centerX - 35, centerY - 45], [centerX - 25, centerY - 42],
      [centerX + 25, centerY - 42], [centerX + 35, centerY - 45], [centerX + 45, centerY - 40],
      
      // Çene
      [centerX - 60, centerY + 20], [centerX - 40, centerY + 50], [centerX - 20, centerY + 70],
      [centerX, centerY + 80], [centerX + 20, centerY + 70], [centerX + 40, centerY + 50],
      [centerX + 60, centerY + 20]
    ]
    
    // YÜZ NOKTALARINI ÇİZ
    facePoints.forEach((point, index) => {
      const [x, y] = point
      
      // Farklı bölgeler farklı renkler
      if (index < 10) {
        // Yüz kenarı - mavi
        ctx.fillStyle = '#0088ff'
        ctx.shadowColor = '#0088ff'
      } else if (index < 22) {
        // Gözler - kırmızı
        ctx.fillStyle = '#ff0000'
        ctx.shadowColor = '#ff0000'
      } else if (index < 27) {
        // Burun - yeşil
        ctx.fillStyle = '#00ff00'
        ctx.shadowColor = '#00ff00'
      } else if (index < 36) {
        // Ağız - sarı
        ctx.fillStyle = '#ffff00'
        ctx.shadowColor = '#ffff00'
      } else if (index < 42) {
        // Kaş - mor
        ctx.fillStyle = '#ff00ff'
        ctx.shadowColor = '#ff00ff'
      } else {
        // Çene - turuncu
        ctx.fillStyle = '#ff8800'
        ctx.shadowColor = '#ff8800'
      }
      
      ctx.shadowBlur = 15
      ctx.beginPath()
      ctx.arc(x, y, 6, 0, 2 * Math.PI)
      ctx.fill()
      
      // Beyaz çember etrafında
      ctx.shadowBlur = 0
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(x, y, 8, 0, 2 * Math.PI)
      ctx.stroke()
    })
    
    // GÖZ ÇEMBER ÇİZ
    ctx.strokeStyle = '#ff0000'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.arc(centerX - 30, centerY - 20, 15, 0, 2 * Math.PI) // Sol göz
    ctx.stroke()
    
    ctx.beginPath()
    ctx.arc(centerX + 30, centerY - 20, 15, 0, 2 * Math.PI) // Sağ göz
    ctx.stroke()
    
    // AĞIZ ÇİZGİSİ
    ctx.strokeStyle = '#ffff00'
    ctx.lineWidth = 4
    ctx.beginPath()
    ctx.moveTo(centerX - 25, centerY + 30)
    ctx.quadraticCurveTo(centerX, centerY + 45, centerX + 25, centerY + 30)
    ctx.stroke()
    
    console.log("👤👤👤 [Gaze] Fake face landmarks çizildi! Toplam nokta:", facePoints.length)
  }

  // Yüz noktalarını çizme fonksiyonu
  const drawFaceLandmarks = (landmarks: any[]) => {
    if (!videoRef.current) {
      console.log("[Gaze] No video ref for drawing")
      return
    }
    
    console.log("[Gaze] Drawing face landmarks, count:", landmarks.length)
    
    // Canvas overlay oluştur veya bul
    let canvas = document.getElementById('face-overlay') as HTMLCanvasElement
    if (!canvas) {
      console.log("[Gaze] Creating new face overlay canvas")
      canvas = document.createElement('canvas')
      canvas.id = 'face-overlay'
      canvas.style.position = 'absolute'
      canvas.style.top = '0'
      canvas.style.left = '0'
      canvas.style.pointerEvents = 'none'
      canvas.style.zIndex = '999'
      canvas.style.border = '2px solid red' // Debug için
      videoRef.current.parentElement?.appendChild(canvas)
    }
    
    const video = videoRef.current
    const videoRect = video.getBoundingClientRect()
    canvas.width = video.videoWidth || video.clientWidth
    canvas.height = video.videoHeight || video.clientHeight
    canvas.style.width = video.clientWidth + 'px'
    canvas.style.height = video.clientHeight + 'px'
    
    console.log("[Gaze] Canvas size:", canvas.width, "x", canvas.height)
    console.log("[Gaze] Video size:", video.clientWidth, "x", video.clientHeight)
    
    const ctx = canvas.getContext('2d')!
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    // ÖNCE TEST: Kırmızı dikdörtgen çiz
    ctx.fillStyle = '#ff0000'
    ctx.fillRect(10, 10, 100, 50)
    ctx.fillStyle = '#ffffff'
    ctx.font = '16px Arial'
    ctx.fillText('FACE DETECTED!', 15, 35)
    
    console.log("[Gaze] Drawing", landmarks.length, "landmarks")
    
    // Yüz noktalarını çiz - ÇOK BÜYÜK VE PARLAK
    ctx.fillStyle = '#00ff00'
    ctx.shadowColor = '#00ff00'
    ctx.shadowBlur = 20
    landmarks.forEach((point: number[], index: number) => {
      if (index % 3 === 0) { // Her 3. noktayı göster (daha fazla nokta)
        ctx.beginPath()
        ctx.arc(point[0], point[1], 8, 0, 2 * Math.PI) // 4'ten 8'e büyüttük
        ctx.fill()
        
        // Beyaz çember etrafında
        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = 3
        ctx.beginPath()
        ctx.arc(point[0], point[1], 12, 0, 2 * Math.PI)
        ctx.stroke()
      }
    })
    
    // Göz noktalarını özel olarak vurgula - MEGA BÜYÜK
    const eyeIndices = [33, 263, 133, 362, 1] // Sol dış, sağ dış, sol iç, sağ iç, burun
    ctx.fillStyle = '#ff0000'
    ctx.shadowColor = '#ff0000'
    ctx.shadowBlur = 25
    eyeIndices.forEach(index => {
      if (landmarks[index]) {
        console.log("[Gaze] Drawing eye point", index, "at", landmarks[index][0], landmarks[index][1])
        ctx.beginPath()
        ctx.arc(landmarks[index][0], landmarks[index][1], 15, 0, 2 * Math.PI) // 8'den 15'e büyüttük
        ctx.fill()
        
        // Sarı çember çiz
        ctx.strokeStyle = '#ffff00'
        ctx.lineWidth = 4
        ctx.beginPath()
        ctx.arc(landmarks[index][0], landmarks[index][1], 20, 0, 2 * Math.PI)
        ctx.stroke()
        
        // Mavi çember daha büyük
        ctx.strokeStyle = '#0000ff'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(landmarks[index][0], landmarks[index][1], 25, 0, 2 * Math.PI)
        ctx.stroke()
      }
    })
    
    // Glow efektini sıfırla
    ctx.shadowBlur = 0
  }

  useEffect(() => {
    let canceled = false
    async function init() {
      try {
        console.log("🚀🚀🚀 [Gaze] BAŞLIYORUZ! MediaPipe FaceMesh initialization...")
        const tf = await import("@tensorflow/tfjs-core")
        await import("@tensorflow/tfjs-backend-webgl")
        const face = await import("@tensorflow-models/face-landmarks-detection")
        
        console.log("🔧🔧🔧 [Gaze] TensorFlow.js loaded, setting backend...")
        try {
          // @ts-ignore
          await tf.setBackend("webgl")
          console.log("✅✅✅ [Gaze] WebGL backend BAŞARILI!")
        } catch (webglError) {
          console.warn("⚠️⚠️⚠️ [Gaze] WebGL backend BAŞARISIZ, WASM deneniyor:", webglError)
          try {
            await import("@tensorflow/tfjs-backend-wasm")
            // @ts-ignore
            await tf.setBackend("wasm")
            console.log("✅✅✅ [Gaze] WASM backend BAŞARILI!")
          } catch (e) {
            console.error("💥💥💥 [Gaze] TF backend HATA:", e)
          }
        }
        
        console.log("⏳⏳⏳ [Gaze] TensorFlow.js hazır olması bekleniyor...")
        await tf.ready()
        console.log("🎉🎉🎉 [Gaze] TensorFlow.js HAZIR! MediaPipe FaceMesh yükleniyor...")
        
        const model = face.SupportedModels.MediaPipeFaceMesh
        const detector = await face.createDetector(model, { 
          runtime: "tfjs", 
          refineLandmarks: true
        })
        
        if (!canceled) {
          console.log("🎊🎊🎊 [Gaze] MediaPipe FaceMesh YÜKLENDİ!")
          detectorRef.current = detector
          setReady(true)
          
          // Test detection hemen başlat
          setTimeout(() => {
            console.log("⏰⏰⏰ [Gaze] 3 saniye sonra detection test...")
            if (videoRef.current) {
              console.log("📹📹📹 [Gaze] Video ref MEVCUT!")
              // ZORLA TEST CANVAS ÇİZ
              forceDrawTestCanvas()
            } else {
              console.log("❌❌❌ [Gaze] Video ref YOK!")
            }
          }, 3000)
          
          // 5 saniye sonra da bir daha çiz
          setTimeout(() => {
            console.log("⏰⏰⏰ [Gaze] 5 saniye sonra tekrar test canvas...")
            forceDrawTestCanvas()
          }, 5000)
          
          rafRef.current = requestAnimationFrame(detectLoop)
        }
      } catch (e) {
        console.error("💥💥💥 [Gaze] Gaze init HATA:", e)
      }
    }
    init()
    return () => {
      canceled = true
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [detectLoop])

  return { ready, metrics }
}


