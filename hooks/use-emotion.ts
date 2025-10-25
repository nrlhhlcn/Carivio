"use client"

import { useEffect, useRef, useState } from "react"

type EmotionProbs = Record<string, number>

export function useEmotion(
  videoRef: React.RefObject<HTMLVideoElement>,
  opts?: { intervalMs?: number; endpoint?: string }
) {
  const [ready, setReady] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [probs, setProbs] = useState<EmotionProbs | null>(null)
  const [top, setTop] = useState<string | null>(null)
  const timerRef = useRef<number | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  const intervalMs = opts?.intervalMs ?? 400
  const endpoint = opts?.endpoint ?? (process.env.NEXT_PUBLIC_EMOTION_API || "http://localhost:8000/emotion")

  useEffect(() => {
    canvasRef.current = document.createElement("canvas")
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current)
    }
  }, [])

  useEffect(() => {
    if (!videoRef.current) {
      console.log("[Emotion] Video ref not ready")
      return
    }
    
    console.log("[Emotion] Starting emotion analysis, endpoint:", endpoint)
    
    if (timerRef.current) window.clearInterval(timerRef.current)
    timerRef.current = window.setInterval(async () => {
      try {
        const v = videoRef.current!
        if (v.videoWidth === 0 || v.videoHeight === 0) {
          console.log("[Emotion] Video not loaded yet")
          return
        }
        
        const w = 48
        const h = 48
        const c = canvasRef.current!
        c.width = w
        c.height = h
        const ctx = c.getContext("2d")!
        // Basit crop: tüm kareyi küçült (ileride bbox ile yüz kırpımı ekleriz)
        ctx.drawImage(v, 0, 0, w, h)
        // Grayscale'e çevir (model tek kanal bekliyor)
        const imgData = ctx.getImageData(0, 0, w, h)
        const data = imgData.data
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i], g = data[i + 1], b = data[i + 2]
          const gray = 0.299 * r + 0.587 * g + 0.114 * b
          data[i] = data[i + 1] = data[i + 2] = gray
        }
        ctx.putImageData(imgData, 0, 0)
        const b64 = c.toDataURL("image/png").split(",")[1]

        console.log("[Emotion] Sending request to:", endpoint, "Image size:", b64.length)
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: b64 }),
        })
        
        if (!res.ok) {
          const errorText = await res.text()
          console.error("[Emotion] API Error:", res.status, errorText)
          throw new Error(`API Error ${res.status}: ${errorText}`)
        }
        
        const json = await res.json()
        console.log("[Emotion] Success:", json)
        setProbs(json.probs || null)
        setTop(json.top || null)
        setError(null)
      } catch (e: any) {
        console.error("[Emotion] Error:", e)
        setError(e?.message || "Emotion API error")
      }
    }, intervalMs) as unknown as number
  }, [videoRef, endpoint, intervalMs])

  return { ready, error, probs, top }
}


