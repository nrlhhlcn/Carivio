"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

type Props = {
  eyeContactRatio: number
  yawDeg: number
  pitchDeg: number
}

export function GazePanel({ eyeContactRatio, yawDeg, pitchDeg }: Props) {
  const eyePct = Math.round(eyeContactRatio * 100)
  return (
    <Card>
      <CardHeader>
        <CardTitle>Göz Teması</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between mb-1 text-sm">
            <span>Göz teması oranı</span>
            <span>{eyePct}%</span>
          </div>
          <Progress value={eyePct} className="w-full" />
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="p-3 rounded-lg bg-gray-50 border">
            <div className="text-gray-500">Yaw</div>
            <div className="font-semibold">{yawDeg.toFixed(1)}°</div>
          </div>
          <div className="p-3 rounded-lg bg-gray-50 border">
            <div className="text-gray-500">Pitch</div>
            <div className="font-semibold">{pitchDeg.toFixed(1)}°</div>
          </div>
        </div>
        <ul className="list-disc pl-5 text-xs text-gray-600">
          <li>Kameraya yakın hizalanın; aşırı yana/üst‑alt bakıştan kaçının.</li>
          <li>Arada notlara bakın ama yanıt verirken kamerayla teması koruyun.</li>
        </ul>
      </CardContent>
    </Card>
  )
}


