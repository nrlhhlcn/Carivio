"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

type Props = {
  uprightScore: number
  headTiltDeg: number
  shoulderTiltDeg: number
  faceVisibleRatio: number
}

export function PosturePanel({ uprightScore, headTiltDeg, shoulderTiltDeg, faceVisibleRatio }: Props) {
  const scorePct = Math.round(uprightScore * 100)
  return (
    <Card>
      <CardHeader>
        <CardTitle>Postür (Dik Durma)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between mb-1 text-sm">
            <span>Dik duruş skoru</span>
            <span>{scorePct}%</span>
          </div>
          <Progress value={scorePct} className="w-full" />
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="p-3 rounded-lg bg-gray-50 border">
            <div className="text-gray-500">Baş eğimi</div>
            <div className="font-semibold">{headTiltDeg.toFixed(1)}°</div>
          </div>
          <div className="p-3 rounded-lg bg-gray-50 border">
            <div className="text-gray-500">Omuz eğimi</div>
            <div className="font-semibold">{shoulderTiltDeg.toFixed(1)}°</div>
          </div>
          <div className="p-3 rounded-lg bg-gray-50 border">
            <div className="text-gray-500">Yüz görünürlük</div>
            <div className="font-semibold">{Math.round(faceVisibleRatio * 100)}%</div>
          </div>
        </div>
        <ul className="list-disc pl-5 text-xs text-gray-600">
          <li>Omuzları yatay ve başı omurganın üzerinde tutun.</li>
          <li>Kameraya doğru konumlanın; yüzünüz kadrajda ve aydınlık olsun.</li>
        </ul>
      </CardContent>
    </Card>
  )
}


