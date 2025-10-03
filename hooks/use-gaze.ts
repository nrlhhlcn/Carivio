"use client"

import { useCallback, useEffect, useRef, useState } from "react"

type FaceDetector = any

export type GazeMetrics = {
  eyeContactRatio: number // 0..1 in recent window
  yawDeg: number
  pitchDeg: number
}

export function useGaze(videoRef: React.RefObject<HTMLVideoElement>) {
  const detectorRef = useRef<FaceDetector | null>(null)
  const rafRef = useRef<number | null>(null)
  const [ready, setReady] = useState(false)
  const [metrics, setMetrics] = useState<GazeMetrics>({ eyeContactRatio: 0, yawDeg: 0, pitchDeg: 0 })
  const windowRef = useRef<number[]>([])

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
    if (!videoRef.current || !detectorRef.current) return
    try {
      const now = performance.now()
      // Throttle ~20 FPS (50ms)
      if (now - lastTsRef.current < 50) {
        rafRef.current = requestAnimationFrame(detectLoop)
        return
      }
      lastTsRef.current = now
      const predictions = await detectorRef.current.estimateFaces({ input: videoRef.current, flipHorizontal: true })
      if (predictions && predictions[0]?.scaledMesh) {
        const { yaw, pitch, eyeContact } = estimateAngles(predictions[0].scaledMesh)
        // Sliding window (last ~2s at ~30fps -> 60 samples capped)
        const win = windowRef.current
        win.push(eyeContact)
        if (win.length > 60) win.shift()
        const avg = win.reduce((a, b) => a + b, 0) / (win.length || 1)
        setMetrics({ eyeContactRatio: avg, yawDeg: yaw, pitchDeg: pitch })
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
        const face = await import("@tensorflow-models/face-landmarks-detection")
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
        const model = face.SupportedModels.MediaPipeFaceMesh
        const detector = await face.load(model, { runtime: "tfjs", refineLandmarks: true })
        if (!canceled) {
          detectorRef.current = detector
          setReady(true)
          rafRef.current = requestAnimationFrame(detectLoop)
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error("Gaze init error", e)
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


