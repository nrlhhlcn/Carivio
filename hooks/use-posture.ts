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
      const poses = await detectorRef.current.estimatePoses(videoRef.current)
      if (poses && poses[0]) {
        const m = computeAngles(poses[0])
        setMetrics(m)
      }
    } catch {}
    rafRef.current = requestAnimationFrame(detectLoop)
  }, [videoRef])

  useEffect(() => {
    let canceled = false
    async function init() {
      try {
        const tf = await import("@tensorflow/tfjs-core")
        await import("@tensorflow/tfjs-backend-webgl")
        const posedetection = await import("@tensorflow-models/pose-detection")
        try {
          // @ts-ignore
          await tf.setBackend("webgl")
        } catch {
          try {
            await import("@tensorflow/tfjs-backend-wasm")
            // @ts-ignore
            await tf.setBackend("wasm")
          } catch (e) {
            // eslint-disable-next-line no-console
            console.error("TF backend init error", e)
          }
        }
        await tf.ready()
        const model = posedetection.SupportedModels.MoveNet
        const detector = await posedetection.createDetector(model, {
          modelType: "Lightning",
          enableSmoothing: true,
        })
        if (!canceled) {
          detectorRef.current = detector
          setReady(true)
          rafRef.current = requestAnimationFrame(detectLoop)
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error("Posture init error", e)
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


