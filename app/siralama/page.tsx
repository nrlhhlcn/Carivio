"use client"

import { useEffect, useState } from "react"
import Navbar from "@/components/navbar"
import ProtectedRoute from "@/components/ProtectedRoute"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { getLeaderboard, getCvLeaderboard, getUserProfile, getUserStats, type UserStats } from "@/lib/firestore"
import { useAuth } from "@/contexts/AuthContext"
import {
  Trophy,
  Medal,
  Award,
  Crown,
  Star,
  TrendingUp,
  Users,
  Target,
  ChevronUp,
  ChevronDown,
  FileText,
  MessageSquare,
} from "lucide-react"

// Mock leaderboard data
const mockLeaderboard = [
  {
    id: 1,
    name: "Ahmet Yılmaz",
    avatar: "/professional-man.jpg",
    score: 2850,
    cvScore: 95,
    interviewScore: 88,
    rank: 1,
    badge: "CV Canavarı",
    badgeColor: "bg-gradient-to-r from-yellow-400 to-yellow-600",
    level: "Uzman",
    completedAnalyses: 15,
    completedInterviews: 12,
    trend: "up",
  },
  {
    id: 2,
    name: "Zeynep Kaya",
    avatar: "/professional-woman-diverse.png",
    score: 2720,
    cvScore: 92,
    interviewScore: 85,
    rank: 2,
    badge: "Mülakat Şampiyonu",
    badgeColor: "bg-gradient-to-r from-blue-400 to-blue-600",
    level: "Uzman",
    completedAnalyses: 18,
    completedInterviews: 10,
    trend: "up",
  },
  {
    id: 3,
    name: "Mehmet Demir",
    avatar: "/professional-man-glasses.jpg",
    score: 2650,
    cvScore: 89,
    interviewScore: 90,
    rank: 3,
    badge: "Yükselen Yıldız",
    badgeColor: "bg-gradient-to-r from-purple-400 to-purple-600",
    level: "İleri",
    completedAnalyses: 12,
    completedInterviews: 8,
    trend: "up",
  },
  {
    id: 4,
    name: "Ayşe Özkan",
    avatar: "/professional-woman-smile.jpg",
    score: 2580,
    cvScore: 87,
    interviewScore: 82,
    rank: 4,
    badge: "Kararlı Aday",
    badgeColor: "bg-gradient-to-r from-green-400 to-green-600",
    level: "İleri",
    completedAnalyses: 14,
    completedInterviews: 9,
    trend: "stable",
  },
  {
    id: 5,
    name: "Can Arslan",
    avatar: "/young-professional-man.png",
    score: 2420,
    cvScore: 84,
    interviewScore: 79,
    rank: 5,
    badge: "Gelişen Profesyonel",
    badgeColor: "bg-gradient-to-r from-orange-400 to-orange-600",
    level: "Orta",
    completedAnalyses: 10,
    completedInterviews: 7,
    trend: "up",
  },
  {
    id: 6,
    name: "Selin Yıldız",
    avatar: "/professional-business-woman.png",
    score: 2350,
    cvScore: 81,
    interviewScore: 85,
    rank: 6,
    badge: "Motive Aday",
    badgeColor: "bg-gradient-to-r from-pink-400 to-pink-600",
    level: "Orta",
    completedAnalyses: 8,
    completedInterviews: 11,
    trend: "up",
  },
  {
    id: 7,
    name: "Emre Çelik",
    avatar: "/professional-man-suit.png",
    score: 2280,
    cvScore: 78,
    interviewScore: 83,
    rank: 7,
    badge: "Azimli Katılımcı",
    badgeColor: "bg-gradient-to-r from-indigo-400 to-indigo-600",
    level: "Orta",
    completedAnalyses: 9,
    completedInterviews: 6,
    trend: "down",
  },
  {
    id: 8,
    name: "Deniz Akar",
    avatar: "/professional-person.png",
    score: 2150,
    cvScore: 75,
    interviewScore: 80,
    rank: 8,
    badge: "Yeni Başlayan",
    badgeColor: "bg-gradient-to-r from-teal-400 to-teal-600",
    level: "Başlangıç",
    completedAnalyses: 6,
    completedInterviews: 5,
    trend: "up",
  },
]

// current user mock removed; values will be fetched dynamically

const achievements = [
  { name: "İlk CV Analizi", description: "İlk CV analizini tamamla", icon: FileText, unlocked: true },
  { name: "Mülakat Ustası", description: "5 mülakat simülasyonu tamamla", icon: MessageSquare, unlocked: false },
  { name: "Top 10", description: "İlk 10'a gir", icon: Trophy, unlocked: false },
  { name: "Sürekli Gelişim", description: "7 gün üst üste platform kullan", icon: TrendingUp, unlocked: true },
  { name: "CV Canavarı", description: "CV skorunu 90'ın üzerine çıkar", icon: Award, unlocked: false },
  { name: "Mükemmel Mülakat", description: "Mülakat skorunu 95'in üzerine çıkar", icon: Star, unlocked: false },
]

export default function RankingsPage() {
  const [selectedTab, setSelectedTab] = useState("leaderboard")
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const [meStats, setMeStats] = useState<UserStats | null>(null)

  const getInitials = (name: string) => {
    if (!name) return "K"
    const parts = name.trim().split(/\s+/).filter(Boolean)
    const first = parts[0]?.[0] || ""
    const second = parts[1]?.[0] || ""
    const letters = `${first}${second}` || first || "K"
    return letters.toUpperCase()
  }

  useEffect(() => {
    const load = async () => {
      try {
        // CV skoruna göre sırala
        const data = await getCvLeaderboard(50)
        const mapped = data.map((u, idx) => ({
          userId: (u as any).userId,
          rank: idx + 1,
          name: (u as any).displayName || (u as any).name || "Kullanıcı",
          avatar: (u as any).photoURL,
          totalScore: u.totalScore || 0,
          cvScore: u.cvScore || 0,
          interviewScore: u.interviewScore || 0,
          completedAnalyses: u.completedAnalyses || 0,
          completedInterviews: u.completedInterviews || 0,
        }))
        // Try enrich names from userProfiles for missing ones
        const enriched = await Promise.all(
          mapped.map(async (r) => {
            if (r.name !== "Kullanıcı" && r.name) return r
            if (!r.userId) return r
            try {
              const profile = await getUserProfile(r.userId)
              if (profile?.firstName || profile?.lastName) {
                return { ...r, name: `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || r.name }
              }
              return r
            } catch {
              return r
            }
          })
        )
        setRows(enriched)
        // fetch current user stats
        if (user?.uid) {
          try {
            const stats = await getUserStats(user.uid)
            setMeStats(stats as any)
          } catch {}
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user])

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />
      default:
        return (
          <span className="w-6 h-6 flex items-center justify-center text-sm font-bold text-muted-foreground">
            #{rank}
          </span>
        )
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <ChevronUp className="w-4 h-4 text-secondary" />
      case "down":
        return <ChevronDown className="w-4 h-4 text-destructive" />
      default:
        return <div className="w-4 h-4" />
    }
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case "Uzman":
        return "text-yellow-600 bg-yellow-100"
      case "İleri":
        return "text-blue-600 bg-blue-100"
      case "Orta":
        return "text-green-600 bg-green-100"
      case "Başlangıç":
        return "text-gray-600 bg-gray-100"
      default:
        return "text-gray-600 bg-gray-100"
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Sıralama Tablosu</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Diğer kullanıcılarla yarışın, rozetler kazanın ve kariyerinizde öne çıkın
          </p>
        </div>

        {/* Current User Stats (dynamic) */}
        <Card className="mb-8 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 border-primary/20">
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-foreground">{(() => {
                  const idx = rows.findIndex(r => r.userId === user?.uid)
                  return idx >= 0 ? idx + 1 : "-"
                })()}</div>
                <div className="text-sm text-muted-foreground">Sıralama</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">{meStats?.totalScore ?? 0}</div>
                <div className="text-sm text-muted-foreground">Toplam Puan</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-secondary">{meStats?.cvScore ?? 0}</div>
                <div className="text-sm text-muted-foreground">CV Skoru</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-accent">{meStats?.interviewScore ?? 0}</div>
                <div className="text-sm text-muted-foreground">Mülakat Skoru</div>
              </div>
            </div>
            {/* Badges removed as requested */}
          </CardContent>
        </Card>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="leaderboard">Liderlik Tablosu</TabsTrigger>
            <TabsTrigger value="achievements">Başarımlar</TabsTrigger>
            <TabsTrigger value="stats">İstatistikler</TabsTrigger>
          </TabsList>

          <TabsContent value="leaderboard" className="space-y-6">
            {/* Top 3 Podium (Firestore verisi) */}
            <div className="mb-10">
              {(() => {
                const podium = (rows.length ? rows.slice(0, 3) : mockLeaderboard.slice(0, 3)) as any[]
                if (!podium.length) return null
                const [first, second, third] = [podium[0], podium[1], podium[2]]
                return (
                  <div className="relative mx-auto max-w-4xl">
                    <div className="grid grid-cols-3 gap-4 items-end">
                      {/* 2nd */}
                      <div className="flex flex-col items-center">
                        <div className="w-full bg-gradient-to-t from-slate-100 to-white rounded-2xl border shadow-sm h-40 flex items-center justify-center">
                          {second && (
                            <div className="text-center">
                              <Avatar className="w-16 h-16 mx-auto mb-2">
                                <AvatarImage src={second?.avatar || ""} alt={second?.name} />
                                <AvatarFallback>{getInitials(second?.name)}</AvatarFallback>
                              </Avatar>
                              <div className="text-sm font-semibold">{second?.name || ""}</div>
                              <div className="text-xs text-muted-foreground">{second?.totalScore || second?.score}</div>
                            </div>
                          )}
                        </div>
                        <div className="mt-2 text-gray-500 text-sm">2</div>
                      </div>
                      {/* 1st */}
                      <div className="flex flex-col items-center">
                        <div className="w-full bg-gradient-to-t from-yellow-100 to-white rounded-2xl border shadow-md h-56 flex items-center justify-center relative">
                          {first && (
                            <div className="text-center">
                              <div className="absolute -top-4 right-4">{getRankIcon(1)}</div>
                              <Avatar className="w-20 h-20 mx-auto mb-2 ring-4 ring-yellow-200">
                                <AvatarImage src={first?.avatar || ""} alt={first?.name} />
                                <AvatarFallback>{getInitials(first?.name)}</AvatarFallback>
                              </Avatar>
                              <div className="text-base font-bold">{first?.name || ""}</div>
                              <div className="text-sm text-primary font-black">{first?.totalScore || first?.score}</div>
                            </div>
                          )}
                        </div>
                        <div className="mt-2 text-yellow-600 font-medium text-sm">1</div>
                      </div>
                      {/* 3rd */}
                      <div className="flex flex-col items-center">
                        <div className="w-full bg-gradient-to-t from-amber-100/60 to-white rounded-2xl border shadow-sm h-36 flex items-center justify-center">
                          {third && (
                            <div className="text-center">
                              <Avatar className="w-14 h-14 mx-auto mb-2">
                                <AvatarImage src={third?.avatar || ""} alt={third?.name} />
                                <AvatarFallback>{getInitials(third?.name)}</AvatarFallback>
                              </Avatar>
                              <div className="text-sm font-semibold">{third?.name || ""}</div>
                              <div className="text-xs text-muted-foreground">{third?.totalScore || third?.score}</div>
                            </div>
                          )}
                        </div>
                        <div className="mt-2 text-amber-600 text-sm">3</div>
                      </div>
                    </div>
                  </div>
                )
              })()}
            </div>

            {/* Full Leaderboard */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Trophy className="w-6 h-6 text-primary" />
                  <span>Tam Sıralama</span>
                </CardTitle>
                <CardDescription>Tüm kullanıcıların performans sıralaması</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(loading ? mockLeaderboard : rows.slice(3)).map((user: any, idx: number) => (
                    <div
                      key={`${user.rank || idx + 4}-${user.name}`}
                      className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          {getRankIcon((user.rank || (idx + 4)))}
                        </div>
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={user.avatar || ""} alt={user.name} />
                        <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-semibold text-foreground">{user.name}</h4>
                          <div className="text-xs text-muted-foreground">CV: {user.cvScore} | Mülakat: {user.interviewScore} | Tamamlanan: {user.completedAnalyses} CV, {user.completedInterviews} mülakat</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-primary">{user.totalScore || user.score}</div>
                        <div className="text-sm text-muted-foreground">Toplam Puan</div>
                      </div>
                    </div>
                  ))}

                  {/* Current user highlight removed as requested */}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Award className="w-6 h-6 text-accent" />
                  <span>Başarımlar</span>
                </CardTitle>
                <CardDescription>Platformdaki aktiviteleriniz için özel rozetler kazanın</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {achievements.map((achievement, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border-2 transition-all ${achievement.unlocked ? "bg-secondary/10 border-secondary/30" : "bg-muted/30 border-muted opacity-60"}`}
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center ${achievement.unlocked ? "bg-secondary/20" : "bg-muted"}`}
                        >
                          <achievement.icon
                            className={`w-6 h-6 ${achievement.unlocked ? "text-secondary" : "text-muted-foreground"}`}
                          />
                        </div>
                        <div className="flex-1">
                          <h4
                            className={`font-semibold ${achievement.unlocked ? "text-foreground" : "text-muted-foreground"}`}
                          >
                            {achievement.name}
                          </h4>
                          <p className="text-sm text-muted-foreground">{achievement.description}</p>
                        </div>
                        {achievement.unlocked && (
                          <Badge className="bg-secondary text-secondary-foreground">Kazanıldı</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stats" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="w-5 h-5 text-primary" />
                    <span>Topluluk</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Toplam Kullanıcı</span>
                      <span className="font-semibold">2,547</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Aktif Bu Hafta</span>
                      <span className="font-semibold">1,234</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Yeni Üyeler</span>
                      <span className="font-semibold">+89</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="w-5 h-5 text-secondary" />
                    <span>Performansın</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-muted-foreground">CV Analizi</span>
                        <span className="text-sm font-medium">{meStats?.completedAnalyses ?? 0}/20</span>
                      </div>
                      <Progress value={(((meStats?.completedAnalyses ?? 0) / 20) * 100)} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-muted-foreground">Mülakat Sim.</span>
                        <span className="text-sm font-medium">{meStats?.completedInterviews ?? 0}/15</span>
                      </div>
                      <Progress value={(((meStats?.completedInterviews ?? 0) / 15) * 100)} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-muted-foreground">Başarımlar</span>
                        <span className="text-sm font-medium">2/6</span>
                      </div>
                      <Progress value={(2 / 6) * 100} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Gelişim Grafiği</CardTitle>
                  <CardDescription>Son 30 günlük performans trendi</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-muted/30 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <TrendingUp className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Gelişim grafiği yakında eklenecek</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      </div>
    </ProtectedRoute>
  )
}
