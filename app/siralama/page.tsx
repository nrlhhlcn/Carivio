"use client"

import { useState } from "react"
import Navbar from "@/components/navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
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

const currentUser = {
  id: 9,
  name: "Sen",
  score: 1980,
  rank: 12,
  cvScore: 72,
  interviewScore: 76,
  badge: "Yeni Katılımcı",
  level: "Başlangıç",
  completedAnalyses: 4,
  completedInterviews: 3,
}

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

        {/* Current User Stats */}
        <Card className="mb-8 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 border-primary/20">
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-foreground">{currentUser.rank}</div>
                <div className="text-sm text-muted-foreground">Sıralama</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">{currentUser.score}</div>
                <div className="text-sm text-muted-foreground">Toplam Puan</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-secondary">{currentUser.cvScore}</div>
                <div className="text-sm text-muted-foreground">CV Skoru</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-accent">{currentUser.interviewScore}</div>
                <div className="text-sm text-muted-foreground">Mülakat Skoru</div>
              </div>
            </div>
            <div className="mt-4 text-center">
              <Badge className="bg-primary/20 text-primary border-primary/30">{currentUser.badge}</Badge>
              <Badge className={`ml-2 ${getLevelColor(currentUser.level)}`}>{currentUser.level}</Badge>
            </div>
          </CardContent>
        </Card>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="leaderboard">Liderlik Tablosu</TabsTrigger>
            <TabsTrigger value="achievements">Başarımlar</TabsTrigger>
            <TabsTrigger value="stats">İstatistikler</TabsTrigger>
          </TabsList>

          <TabsContent value="leaderboard" className="space-y-6">
            {/* Top 3 Podium */}
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              {mockLeaderboard.slice(0, 3).map((user, index) => (
                <Card
                  key={user.id}
                  className={`relative ${index === 0 ? "md:order-2 transform md:scale-105" : index === 1 ? "md:order-1" : "md:order-3"}`}
                >
                  <CardContent className="pt-6 text-center">
                    <div className="relative mb-4">
                      <Avatar className="w-20 h-20 mx-auto">
                        <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                        <AvatarFallback>
                          {user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -top-2 -right-2">{getRankIcon(user.rank)}</div>
                    </div>
                    <h3 className="font-semibold text-foreground mb-1">{user.name}</h3>
                    <div className="text-2xl font-bold text-primary mb-2">{user.score}</div>
                    <Badge className={`${user.badgeColor} text-white border-0 mb-2`}>{user.badge}</Badge>
                    <div className="text-sm text-muted-foreground">
                      CV: {user.cvScore} | Mülakat: {user.interviewScore}
                    </div>
                  </CardContent>
                </Card>
              ))}
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
                  {mockLeaderboard.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          {getRankIcon(user.rank)}
                          {getTrendIcon(user.trend)}
                        </div>
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                          <AvatarFallback>
                            {user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-semibold text-foreground">{user.name}</h4>
                          <div className="flex items-center space-x-2">
                            <Badge className={`${user.badgeColor} text-white border-0 text-xs`}>{user.badge}</Badge>
                            <Badge variant="outline" className={`text-xs ${getLevelColor(user.level)}`}>
                              {user.level}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-primary">{user.score}</div>
                        <div className="text-sm text-muted-foreground">
                          CV: {user.cvScore} | Mülakat: {user.interviewScore}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Current User Row */}
                  <div className="flex items-center justify-between p-4 rounded-lg bg-primary/10 border-2 border-primary/20">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <span className="w-6 h-6 flex items-center justify-center text-sm font-bold text-primary">
                          #{currentUser.rank}
                        </span>
                        <ChevronUp className="w-4 h-4 text-secondary" />
                      </div>
                      <Avatar className="w-12 h-12">
                        <AvatarFallback className="bg-primary text-primary-foreground">S</AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-semibold text-foreground">{currentUser.name}</h4>
                        <div className="flex items-center space-x-2">
                          <Badge className="bg-gradient-to-r from-gray-400 to-gray-600 text-white border-0 text-xs">
                            {currentUser.badge}
                          </Badge>
                          <Badge variant="outline" className={`text-xs ${getLevelColor(currentUser.level)}`}>
                            {currentUser.level}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-primary">{currentUser.score}</div>
                      <div className="text-sm text-muted-foreground">
                        CV: {currentUser.cvScore} | Mülakat: {currentUser.interviewScore}
                      </div>
                    </div>
                  </div>
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
                        <span className="text-sm font-medium">{currentUser.completedAnalyses}/20</span>
                      </div>
                      <Progress value={(currentUser.completedAnalyses / 20) * 100} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-muted-foreground">Mülakat Sim.</span>
                        <span className="text-sm font-medium">{currentUser.completedInterviews}/15</span>
                      </div>
                      <Progress value={(currentUser.completedInterviews / 15) * 100} className="h-2" />
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
  )
}
