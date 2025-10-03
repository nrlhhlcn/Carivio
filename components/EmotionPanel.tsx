"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type Props = {
  probs: Record<string, number> | null
  top: string | null
  error?: string | null
}

export function EmotionPanel({ probs, top, error }: Props) {
  const entries = probs ? Object.entries(probs) : []
  const ordered = entries.sort((a, b) => b[1] - a[1]).slice(0, 7)
  return (
    <Card>
      <CardHeader>
        <CardTitle>Duygu Analizi</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {error && (
          <div className="text-xs text-red-600">{error}</div>
        )}
        {top && (
          <div className="text-sm">En olası: <span className="font-semibold">{top}</span></div>
        )}
        {ordered.length > 0 ? (
          <div className="grid grid-cols-2 gap-2 text-sm">
            {ordered.map(([k, v]) => (
              <div key={k} className="flex justify-between p-2 rounded-md bg-gray-50 border">
                <span>{k}</span>
                <span>{(v * 100).toFixed(1)}%</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-xs text-gray-500">Veri bekleniyor…</div>
        )}
      </CardContent>
    </Card>
  )
}


