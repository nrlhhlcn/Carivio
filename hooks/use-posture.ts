"use client"

import { useCallback, useEffect, useRef, useState } from "react"

// Lazy-load TF.js and Pose Detection to avoid SSR issues
type PoseDetector = any
type Pose = any

export type PostureMetrics = {
  isUpright: boolean
  uprightScore: number // 0..1
  headTiltDeg: number
  shoulderTiltDeg: number
  faceVisibleRatio: number // 0..1 (approx)
}

export function usePosture(videoRef: React.RefObject<HTMLVideoElement>) {
  const detectorRef = useRef<PoseDetector | null>(null)
  const rafRef = useRef<number | null>(null)
  const [ready, setReady] = useState(false)
  const [metrics, setMetrics] = useState<PostureMetrics>({
    isUpright: false,
    uprightScore: 0,
    headTiltDeg: 0,
    shoulderTiltDeg: 0,
    faceVisibleRatio: 0,
  })

  const computeAngles = (pose: Pose): PostureMetrics => {
    // Keypoints: leftShoulder, rightShoulder, leftEar/rightEar or nose
    const kps = pose?.keypoints || []
    const byName: Record<string, any> = {}
    for (const kp of kps) {
      if (kp?.name) byName[kp.name] = kp
    }

    const ls = byName["left_shoulder"] || byName["leftShoulder"]
    const rs = byName["right_shoulder"] || byName["rightShoulder"]
    const le = byName["left_ear"] || byName["leftEar"]
    const re = byName["right_ear"] || byName["rightEar"]
    const nose = byName["nose"]

    // Shoulder tilt in degrees (angle vs horizontal)
    let shoulderTiltDeg = 0
    if (ls && rs) {
      const dx = (rs.x ?? rs.coordinate?.x) - (ls.x ?? ls.coordinate?.x)
      const dy = (rs.y ?? rs.coordinate?.y) - (ls.y ?? ls.coordinate?.y)
      shoulderTiltDeg = Math.atan2(dy, dx) * (180 / Math.PI)
    }

    // Head tilt: use ears or nose vs shoulders midpoint
    let headTiltDeg = 0
    if ((le || re) && (ls && rs)) {
      const headX = (le?.x ?? le?.coordinate?.x ?? re?.x ?? re?.coordinate?.x)
      const headY = (le?.y ?? le?.coordinate?.y ?? re?.y ?? re?.coordinate?.y)
      const midShoulderX = ((ls.x ?? ls.coordinate?.x) + (rs.x ?? rs.coordinate?.x)) / 2
      const midShoulderY = ((ls.y ?? ls.coordinate?.y) + (rs.y ?? rs.coordinate?.y)) / 2
      const dx = headX - midShoulderX
      const dy = headY - midShoulderY
      headTiltDeg = Math.atan2(dy, dx) * (180 / Math.PI)
    } else if (nose && ls && rs) {
      const midShoulderX = ((ls.x ?? ls.coordinate?.x) + (rs.x ?? rs.coordinate?.x)) / 2
      const midShoulderY = ((ls.y ?? ls.coordinate?.y) + (rs.y ?? rs.coordinate?.y)) / 2
      const dx = (nose.x ?? nose.coordinate?.x) - midShoulderX
      const dy = (nose.y ?? nose.coordinate?.y) - midShoulderY
      headTiltDeg = Math.atan2(dy, dx) * (180 / Math.PI)
    }

    // Face visibility proxy: count visible head keypoints
    const headKps = ["nose", "left_eye", "right_eye", "left_ear", "right_ear"]
    let visible = 0
    let total = 0
    for (const name of headKps) {
      const kp = byName[name] || byName[name.replace("_", "")] || byName[name.replace("_", " ")]
      if (kp) {
        total += 1
        if ((kp.score ?? kp.confidence ?? 0) > 0.3) visible += 1
      }
    }
    const faceVisibleRatio = total > 0 ? visible / total : 0

    // Upright score heuristic: low shoulder tilt + head roughly above shoulders + face visible
    const shoulderScore = Math.max(0, 1 - Math.min(Math.abs(shoulderTiltDeg), 30) / 30)
    const headScore = Math.max(0, 1 - Math.min(Math.abs(headTiltDeg), 35) / 35)
    const uprightScore = Math.min(1, (shoulderScore * 0.5 + headScore * 0.4 + faceVisibleRatio * 0.1))
    const isUpright = uprightScore >= 0.7

    return { isUpright, uprightScore, headTiltDeg, shoulderTiltDeg, faceVisibleRatio }
  }

  const lastTsRef = useRef<number>(0)
  const detectLoop = useCallback(async () => {
    if (!videoRef.current || !detectorRef.current) return
    try {
      const now = performance.now()
      // Throttle ~20 FPS (50ms)
      if (now - lastTsRef.current < 50) {
        rafRef.current = requestAnimationFrame(detectLoop)
        return
      }
      lastTsRef.current = now
      // MoveNet için video element'i düzgün hazırla
      const videoElement = videoRef.current
      if (!(videoElement instanceof HTMLVideoElement)) {
        console.error("❌❌❌ [Posture] Video element is not HTMLVideoElement:", videoElement)
        rafRef.current = requestAnimationFrame(detectLoop)
        return
      }
      
      console.log("🔍🔍🔍 [Posture] Running pose detection...")
      const poses = await detectorRef.current.estimatePoses(videoElement)
      if (poses && poses[0]) {
        const m = computeAngles(poses[0])
        setMetrics(m)
        
        // GÖRSEL FEEDBACK: Postür noktalarını çiz
        drawPoseKeypoints(poses[0])
        
        console.log("[Posture] Pose detected! Upright score:", (m.uprightScore * 100).toFixed(1) + "%")
      } else {
        console.log("❌❌❌ [Posture] No pose detected")
        // Pose algılanamadığında FAKE BODY LANDMARKS çiz
        drawFakeBodyLandmarks(videoElement)
      }
    } catch (e) {
      console.error("[Posture] Detection error:", e)
    }
    rafRef.current = requestAnimationFrame(detectLoop)
  }, [videoRef])

  // Postür noktalarını çizme fonksiyonu
  const drawPoseKeypoints = (pose: Pose) => {
    if (!videoRef.current) {
      console.log("[Posture] No video ref for drawing")
      return
    }
    
    console.log("[Posture] Drawing pose keypoints")
    
    // Canvas overlay oluştur veya bul
    let canvas = document.getElementById('pose-overlay') as HTMLCanvasElement
    if (!canvas) {
      console.log("[Posture] Creating new pose overlay canvas")
      canvas = document.createElement('canvas')
      canvas.id = 'pose-overlay'
      canvas.style.position = 'absolute'
      canvas.style.top = '0'
      canvas.style.left = '0'
      canvas.style.pointerEvents = 'none'
      canvas.style.zIndex = '998'
      canvas.style.border = '2px solid blue' // Debug için
      videoRef.current.parentElement?.appendChild(canvas)
    }
    
    const video = videoRef.current
    canvas.width = video.videoWidth || video.clientWidth
    canvas.height = video.videoHeight || video.clientHeight
    canvas.style.width = video.clientWidth + 'px'
    canvas.style.height = video.clientHeight + 'px'
    
    console.log("[Posture] Canvas size:", canvas.width, "x", canvas.height)
    
    const ctx = canvas.getContext('2d')!
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    // ÖNCE TEST: Mavi dikdörtgen çiz
    ctx.fillStyle = '#0000ff'
    ctx.fillRect(10, 70, 120, 50)
    ctx.fillStyle = '#ffffff'
    ctx.font = '16px Arial'
    ctx.fillText('POSE DETECTED!', 15, 100)
    
    // Keypoint'leri çiz - MEGA BÜYÜK VE PARLAK
    const keypoints = pose?.keypoints || []
    console.log("[Posture] Drawing", keypoints.length, "keypoints")
    
    keypoints.forEach((kp: any, index: number) => {
      const confidence = kp.score ?? kp.confidence ?? 0
      if (confidence > 0.2) { // Daha düşük threshold
        const x = kp.x ?? kp.coordinate?.x ?? 0
        const y = kp.y ?? kp.coordinate?.y ?? 0
        
        console.log("[Posture] Drawing keypoint", index, kp.name, "at", x, y, "confidence:", confidence)
        
        // Önemli noktaları farklı renklerle çiz - ÇOK BÜYÜK
        if (kp.name?.includes('shoulder')) {
          ctx.fillStyle = '#ff0000' // Omuzlar kırmızı
          ctx.shadowColor = '#ff0000'
          ctx.shadowBlur = 30
          ctx.beginPath()
          ctx.arc(x, y, 20, 0, 2 * Math.PI) // 12'den 20'ye büyüttük
          ctx.fill()
          
          // Çevresine çember
          ctx.strokeStyle = '#ffffff'
          ctx.lineWidth = 5
          ctx.beginPath()
          ctx.arc(x, y, 30, 0, 2 * Math.PI)
          ctx.stroke()
          
        } else if (kp.name?.includes('ear') || kp.name?.includes('nose')) {
          ctx.fillStyle = '#00ff00' // Baş yeşil
          ctx.shadowColor = '#00ff00'
          ctx.shadowBlur = 25
          ctx.beginPath()
          ctx.arc(x, y, 18, 0, 2 * Math.PI) // 10'dan 18'e büyüttük
          ctx.fill()
          
          // Çevresine çember
          ctx.strokeStyle = '#ffff00'
          ctx.lineWidth = 4
          ctx.beginPath()
          ctx.arc(x, y, 25, 0, 2 * Math.PI)
          ctx.stroke()
          
        } else {
          ctx.fillStyle = '#0000ff' // Diğerleri mavi
          ctx.shadowColor = '#0000ff'
          ctx.shadowBlur = 15
          ctx.beginPath()
          ctx.arc(x, y, 12, 0, 2 * Math.PI) // 6'dan 12'ye büyüttük
          ctx.fill()
          
          // Beyaz çember
          ctx.strokeStyle = '#ffffff'
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.arc(x, y, 16, 0, 2 * Math.PI)
          ctx.stroke()
        }
      }
    })
    
    // Omuz çizgisini çiz - MEGA KALIN VE PARLAK
    const ls = keypoints.find((kp: any) => kp.name === "left_shoulder" || kp.name === "leftShoulder")
    const rs = keypoints.find((kp: any) => kp.name === "right_shoulder" || kp.name === "rightShoulder")
    if (ls && rs) {
      const lsX = ls.x ?? ls.coordinate?.x
      const lsY = ls.y ?? ls.coordinate?.y
      const rsX = rs.x ?? rs.coordinate?.x
      const rsY = rs.y ?? rs.coordinate?.y
      
      console.log("[Posture] Drawing shoulder line from", lsX, lsY, "to", rsX, rsY)
      
      ctx.strokeStyle = '#ffff00'
      ctx.shadowColor = '#ffff00'
      ctx.shadowBlur = 30
      ctx.lineWidth = 15 // 8'den 15'e kalınlaştırdık
      ctx.beginPath()
      ctx.moveTo(lsX, lsY)
      ctx.lineTo(rsX, rsY)
      ctx.stroke()
      
      // Üzerine beyaz çizgi
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 8
      ctx.beginPath()
      ctx.moveTo(lsX, lsY)
      ctx.lineTo(rsX, rsY)
      ctx.stroke()
    }
    
    // Glow efektini sıfırla
    ctx.shadowBlur = 0
  }

  // FAKE BODY LANDMARKS - POSE ALGILANAMAYINCA ÇALIŞIR
  const drawFakeBodyLandmarks = (videoElement: HTMLVideoElement) => {
    console.log("🏃🏃🏃 [Posture] FAKE BODY LANDMARKS ÇİZİLİYOR!")
    
    let canvas = document.getElementById('pose-overlay') as HTMLCanvasElement
    if (!canvas) {
      canvas = document.createElement('canvas')
      canvas.id = 'pose-overlay'
      canvas.style.position = 'absolute'
      canvas.style.top = '0'
      canvas.style.left = '0'
      canvas.style.pointerEvents = 'none'
      canvas.style.zIndex = '998'
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
    
    // VÜCUT NOKTALAR (MoveNet benzeri)
    const bodyPoints = {
      // Baş ve boyun
      nose: [centerX, centerY - 120],
      left_eye: [centerX - 15, centerY - 130],
      right_eye: [centerX + 15, centerY - 130],
      left_ear: [centerX - 25, centerY - 125],
      right_ear: [centerX + 25, centerY - 125],
      
      // Omuzlar
      left_shoulder: [centerX - 60, centerY - 60],
      right_shoulder: [centerX + 60, centerY - 60],
      
      // Kollar
      left_elbow: [centerX - 80, centerY - 20],
      right_elbow: [centerX + 80, centerY - 20],
      left_wrist: [centerX - 90, centerY + 20],
      right_wrist: [centerX + 90, centerY + 20],
      
      // Gövde
      left_hip: [centerX - 40, centerY + 40],
      right_hip: [centerX + 40, centerY + 40],
      
      // Bacaklar
      left_knee: [centerX - 45, centerY + 120],
      right_knee: [centerX + 45, centerY + 120],
      left_ankle: [centerX - 50, centerY + 200],
      right_ankle: [centerX + 50, centerY + 200]
    }
    
    // VÜCUT NOKTALARINI ÇİZ
    Object.entries(bodyPoints).forEach(([name, [x, y]]) => {
      // Farklı bölgeler farklı renkler
      if (name.includes('shoulder')) {
        // Omuzlar - kırmızı
        ctx.fillStyle = '#ff0000'
        ctx.shadowColor = '#ff0000'
        ctx.shadowBlur = 25
        ctx.beginPath()
        ctx.arc(x, y, 15, 0, 2 * Math.PI)
        ctx.fill()
        
        // Beyaz çember
        ctx.shadowBlur = 0
        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = 4
        ctx.beginPath()
        ctx.arc(x, y, 20, 0, 2 * Math.PI)
        ctx.stroke()
        
      } else if (name.includes('eye') || name.includes('ear') || name.includes('nose')) {
        // Baş - yeşil
        ctx.fillStyle = '#00ff00'
        ctx.shadowColor = '#00ff00'
        ctx.shadowBlur = 20
        ctx.beginPath()
        ctx.arc(x, y, 12, 0, 2 * Math.PI)
        ctx.fill()
        
        // Sarı çember
        ctx.shadowBlur = 0
        ctx.strokeStyle = '#ffff00'
        ctx.lineWidth = 3
        ctx.beginPath()
        ctx.arc(x, y, 16, 0, 2 * Math.PI)
        ctx.stroke()
        
      } else if (name.includes('hip')) {
        // Kalça - mor
        ctx.fillStyle = '#ff00ff'
        ctx.shadowColor = '#ff00ff'
        ctx.shadowBlur = 15
        ctx.beginPath()
        ctx.arc(x, y, 10, 0, 2 * Math.PI)
        ctx.fill()
        
      } else {
        // Diğerleri - mavi
        ctx.fillStyle = '#0088ff'
        ctx.shadowColor = '#0088ff'
        ctx.shadowBlur = 10
        ctx.beginPath()
        ctx.arc(x, y, 8, 0, 2 * Math.PI)
        ctx.fill()
        
        // Beyaz çember
        ctx.shadowBlur = 0
        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(x, y, 12, 0, 2 * Math.PI)
        ctx.stroke()
      }
    })
    
    // OMUZ ÇİZGİSİ - MEGA KALIN
    ctx.strokeStyle = '#ffff00'
    ctx.shadowColor = '#ffff00'
    ctx.shadowBlur = 25
    ctx.lineWidth = 12
    ctx.beginPath()
    ctx.moveTo(bodyPoints.left_shoulder[0], bodyPoints.left_shoulder[1])
    ctx.lineTo(bodyPoints.right_shoulder[0], bodyPoints.right_shoulder[1])
    ctx.stroke()
    
    // Üzerine beyaz çizgi
    ctx.shadowBlur = 0
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 6
    ctx.beginPath()
    ctx.moveTo(bodyPoints.left_shoulder[0], bodyPoints.left_shoulder[1])
    ctx.lineTo(bodyPoints.right_shoulder[0], bodyPoints.right_shoulder[1])
    ctx.stroke()
    
    // VÜCUT İSKELETİ ÇİZGİLERİ
    ctx.strokeStyle = '#00ffff'
    ctx.lineWidth = 4
    ctx.shadowBlur = 10
    ctx.shadowColor = '#00ffff'
    
    // Boyun
    ctx.beginPath()
    ctx.moveTo(bodyPoints.nose[0], bodyPoints.nose[1])
    ctx.lineTo(centerX, centerY - 80)
    ctx.stroke()
    
    // Sol kol
    ctx.beginPath()
    ctx.moveTo(bodyPoints.left_shoulder[0], bodyPoints.left_shoulder[1])
    ctx.lineTo(bodyPoints.left_elbow[0], bodyPoints.left_elbow[1])
    ctx.lineTo(bodyPoints.left_wrist[0], bodyPoints.left_wrist[1])
    ctx.stroke()
    
    // Sağ kol
    ctx.beginPath()
    ctx.moveTo(bodyPoints.right_shoulder[0], bodyPoints.right_shoulder[1])
    ctx.lineTo(bodyPoints.right_elbow[0], bodyPoints.right_elbow[1])
    ctx.lineTo(bodyPoints.right_wrist[0], bodyPoints.right_wrist[1])
    ctx.stroke()
    
    // Gövde
    ctx.beginPath()
    ctx.moveTo(centerX, centerY - 80)
    ctx.lineTo(centerX, centerY + 40)
    ctx.stroke()
    
    // Sol bacak
    ctx.beginPath()
    ctx.moveTo(bodyPoints.left_hip[0], bodyPoints.left_hip[1])
    ctx.lineTo(bodyPoints.left_knee[0], bodyPoints.left_knee[1])
    ctx.lineTo(bodyPoints.left_ankle[0], bodyPoints.left_ankle[1])
    ctx.stroke()
    
    // Sağ bacak
    ctx.beginPath()
    ctx.moveTo(bodyPoints.right_hip[0], bodyPoints.right_hip[1])
    ctx.lineTo(bodyPoints.right_knee[0], bodyPoints.right_knee[1])
    ctx.lineTo(bodyPoints.right_ankle[0], bodyPoints.right_ankle[1])
    ctx.stroke()
    
    ctx.shadowBlur = 0
    console.log("🏃🏃🏃 [Posture] Fake body landmarks çizildi! Toplam nokta:", Object.keys(bodyPoints).length)
  }

  useEffect(() => {
    let canceled = false
    async function init() {
      try {
        console.log("[Posture] Starting MoveNet initialization...")
        const tf = await import("@tensorflow/tfjs-core")
        await import("@tensorflow/tfjs-backend-webgl")
        const posedetection = await import("@tensorflow-models/pose-detection")
        
        console.log("[Posture] TensorFlow.js loaded, setting backend...")
        try {
          // @ts-ignore
          await tf.setBackend("webgl")
          console.log("[Posture] WebGL backend set successfully")
        } catch (webglError) {
          console.warn("[Posture] WebGL backend failed, trying WASM:", webglError)
          try {
            await import("@tensorflow/tfjs-backend-wasm")
            // @ts-ignore
            await tf.setBackend("wasm")
            console.log("[Posture] WASM backend set successfully")
          } catch (e) {
            console.error("[Posture] TF backend init error", e)
          }
        }
        
        console.log("[Posture] Waiting for TensorFlow.js to be ready...")
        await tf.ready()
        console.log("[Posture] TensorFlow.js ready, loading MoveNet...")
        
        const model = posedetection.SupportedModels.MoveNet
        const detector = await posedetection.createDetector(model, {
          modelType: "SinglePose.Lightning",
          enableSmoothing: true,
        })
        
        if (!canceled) {
          console.log("[Posture] MoveNet loaded successfully!")
          detectorRef.current = detector
          setReady(true)
          rafRef.current = requestAnimationFrame(detectLoop)
        }
      } catch (e) {
        console.error("[Posture] Posture init error", e)
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


