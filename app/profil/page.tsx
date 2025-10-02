"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Navbar from "@/components/navbar"
import ProtectedRoute from "@/components/ProtectedRoute"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"
import { getUserStats, getUserCVAnalysisResults, getUserInterviewResults } from "@/lib/firestore"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  User,
  Calendar,
  Edit,
  Save,
  X,
  Trophy,
  FileText,
  MessageSquare,
  TrendingUp,
  Award,
  Star,
  Target,
  Settings,
  Bell,
  Shield,
  Camera,
  CheckCircle,
  Clock,
  BarChart3,
  Zap,
} from "lucide-react"

// Mock stats data - sadece istatistikler için
const mockStats = {
  currentRank: 12,
  totalScore: 1980,
  cvScore: 72,
  interviewScore: 76,
  badge: "Yeni Katılımcı",
  level: "Başlangıç",
  completedAnalyses: 4,
  completedInterviews: 3,
  totalActiveDays: 12,
  streak: 3,
}

// Dinamik aktivite listesi oluştur - sadece gerçek verilerden
const getRecentActivity = (cvResults: any[], interviewResults: any[]) => {
  const activities = []

  // CV analiz sonuçlarından aktiviteler oluştur
  cvResults.forEach((result, index) => {
    activities.push({
      id: `cv-${result.id || index}`,
      type: "cv-analysis",
      title: "CV Analizi Tamamlandı",
      description: `Genel skor: ${result.overallScore}/100`,
      date: result.analysisDate?.toDate?.()?.toISOString()?.split('T')[0] || new Date().toISOString().split('T')[0],
      icon: FileText,
      color: "text-primary",
    })
  })

  // Mülakat sonuçlarından aktiviteler oluştur
  interviewResults.forEach((result, index) => {
    activities.push({
      id: `interview-${result.id || index}`,
      type: "interview",
      title: "Mülakat Simülasyonu",
      description: `Performans skoru: ${result.overallScore}/100`,
      date: result.interviewDate?.toDate?.()?.toISOString()?.split('T')[0] || new Date().toISOString().split('T')[0],
      icon: MessageSquare,
      color: "text-secondary",
    })
  })

  return activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

const achievements = [
  { name: "İlk CV Analizi", icon: FileText, unlocked: true, date: "2025-01-15" },
  { name: "Sürekli Gelişim", icon: TrendingUp, unlocked: true, date: "2025-01-18" },
  { name: "Mülakat Ustası", icon: MessageSquare, unlocked: false, progress: 60 },
  { name: "Top 10", icon: Trophy, unlocked: false, progress: 20 },
  { name: "CV Canavarı", icon: Award, unlocked: false, progress: 80 },
  { name: "Mükemmel Mülakat", icon: Star, unlocked: false, progress: 45 },
]

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const [userStats, setUserStats] = useState<any>(null)
  const [cvResults, setCvResults] = useState<any[]>([])
  const [interviewResults, setInterviewResults] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { toast } = useToast()

  // Firebase verilerini yükle
  useEffect(() => {
    const loadUserData = async () => {
      if (!user) return

      try {
        setLoading(true)
        
        // Kullanıcı istatistiklerini yükle
        const stats = await getUserStats(user.uid)
        setUserStats(stats)

        // CV analiz sonuçlarını yükle
        const cvResults = await getUserCVAnalysisResults(user.uid)
        setCvResults(cvResults)

        // Mülakat sonuçlarını yükle
        const interviewResults = await getUserInterviewResults(user.uid)
        setInterviewResults(interviewResults)

      } catch (error) {
        console.error('Kullanıcı verileri yüklenirken hata:', error)
      } finally {
        setLoading(false)
      }
    }

    loadUserData()
  }, [user])

  const [formData, setFormData] = useState({
    id: '',
    firstName: 'Kullanıcı',
    lastName: '',
    email: '',
    phone: '',
    location: 'Türkiye',
    joinDate: new Date().toLocaleDateString('tr-TR'),
    bio: 'Profil bilgilerinizi güncelleyin.',
    avatar: '',
    isVerified: false,
    ...mockStats,
  })

  // Kullanıcı bilgileri veya istatistikler değiştiğinde formData'yı güncelle
  useEffect(() => {
    // En son CV analizi ve mülakat skorlarını al
    const latestCvScore = cvResults.length > 0 ? cvResults[0].overallScore : 0
    const latestInterviewScore = interviewResults.length > 0 ? interviewResults[0].overallScore : 0
    
    const updatedUserData = {
      id: user?.uid || '',
      firstName: user?.displayName?.split(' ')[0] || 'Kullanıcı',
      lastName: user?.displayName?.split(' ').slice(1).join(' ') || '',
      email: user?.email || '',
      phone: user?.phoneNumber || '',
      location: 'Türkiye',
      joinDate: user?.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString('tr-TR') : new Date().toLocaleDateString('tr-TR'),
      bio: 'Profil bilgilerinizi güncelleyin.',
      avatar: user?.photoURL || '',
      isVerified: user?.emailVerified || false,
      // Firebase'den gelen istatistikleri kullan, yoksa mock verileri kullan
      ...(userStats || mockStats),
      // En son skorları kullan
      cvScore: latestCvScore,
      interviewScore: latestInterviewScore,
    }
    setFormData(updatedUserData)
  }, [user, userStats, cvResults, interviewResults])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSave = async () => {
    try {
      // Firebase'de kullanıcı profilini güncelle
      const { updateProfile } = await import('firebase/auth')
      const { auth } = await import('@/lib/firebase')
      
      if (user && auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: `${formData.firstName} ${formData.lastName}`.trim()
        })
        
        toast({
          title: "Başarılı!",
          description: "Profil bilgileriniz güncellendi.",
        })
      }
    } catch (error) {
      toast({
        title: "Hata!",
        description: "Profil güncellenirken bir hata oluştu.",
        variant: "destructive",
      })
    } finally {
      setIsEditing(false)
    }
  }

  const handleCancel = () => {
    // En son CV analizi ve mülakat skorlarını al
    const latestCvScore = cvResults.length > 0 ? cvResults[0].overallScore : 0
    const latestInterviewScore = interviewResults.length > 0 ? interviewResults[0].overallScore : 0
    
    const updatedUserData = {
      id: user?.uid || '',
      firstName: user?.displayName?.split(' ')[0] || 'Kullanıcı',
      lastName: user?.displayName?.split(' ').slice(1).join(' ') || '',
      email: user?.email || '',
      phone: user?.phoneNumber || '',
      location: 'Türkiye',
      joinDate: user?.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString('tr-TR') : new Date().toLocaleDateString('tr-TR'),
      bio: 'Profil bilgilerinizi güncelleyin.',
      avatar: user?.photoURL || '',
      isVerified: user?.emailVerified || false,
      // Firebase'den gelen istatistikleri kullan, yoksa mock verileri kullan
      ...(userStats || mockStats),
      // En son skorları kullan
      cvScore: latestCvScore,
      interviewScore: latestInterviewScore,
    }
    setFormData(updatedUserData)
    setIsEditing(false)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("tr-TR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "cv-analysis":
        return FileText
      case "interview":
        return MessageSquare
      case "achievement":
        return Award
      case "rank-up":
        return TrendingUp
      default:
        return Target
    }
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 text-gray-900">
          <Navbar />
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Profil bilgileri yükleniyor...</p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 text-gray-900">
        <Navbar />

      {/* Unique Profile Header */}
      <div className="relative overflow-hidden">
        {/* Custom Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-indigo-50/30 to-purple-50/40" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.08)_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(147,51,234,0.06)_0%,transparent_50%)]" />
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-2 h-2 bg-blue-400 rounded-full animate-pulse opacity-40"></div>
        <div className="absolute top-40 right-20 w-1 h-1 bg-purple-400 rounded-full animate-pulse opacity-30" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-20 left-1/4 w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse opacity-35" style={{animationDelay: '2s'}}></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
          {/* Unique Profile Card */}
          <div className="relative">
            {/* Main Profile Card */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/50 p-8 shadow-2xl">
              <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">
                {/* Avatar Section */}
                <div className="relative group">
                  <div className="relative">
                    {formData.avatar ? (
                      <Avatar className="w-40 h-40 rounded-2xl shadow-2xl transform group-hover:scale-105 transition-all duration-500">
                        <AvatarImage src={formData.avatar} alt={`${formData.firstName} ${formData.lastName}`} />
                        <AvatarFallback className="bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 text-5xl font-black text-white">
                          {formData.firstName[0]}{formData.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className="w-40 h-40 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl transform group-hover:scale-105 transition-all duration-500">
                        <span className="text-5xl font-black text-white">
                          {formData.firstName[0]}{formData.lastName[0]}
                        </span>
                      </div>
                    )}
                    {/* Glow Effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
                    {/* Edit Button */}
                    <div className="absolute -bottom-3 -right-3 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center border border-gray-200 hover:bg-white transition-all duration-300 cursor-pointer shadow-lg">
                      <Camera className="w-5 h-5 text-gray-600" />
                    </div>
                  </div>
                </div>

                {/* Profile Info */}
                <div className="flex-1 text-center lg:text-left">
                  <div className="mb-4">
                    <h1 className="text-5xl font-black mb-2 bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                      {formData.firstName} {formData.lastName}
                    </h1>
                    <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mb-4">
                      <span className="px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 border border-blue-200 rounded-full text-blue-700 text-sm font-medium">
                        {formData.badge}
                      </span>
                      <span className="px-4 py-2 bg-gradient-to-r from-cyan-100 to-blue-100 border border-cyan-200 rounded-full text-cyan-700 text-sm font-medium">
                        {formData.level}
                      </span>
                      {formData.isVerified && (
                        <Badge className="px-4 py-2 bg-gradient-to-r from-green-100 to-emerald-100 border border-green-200 text-green-700 text-sm font-medium">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Email Doğrulandı
                        </Badge>
                      )}
                    </div>
                    <p className="text-gray-600 text-lg leading-relaxed max-w-2xl">
                      {formData.bio}
                    </p>
                  </div>

                  {/* Stats Row */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-gray-200/50 hover:border-cyan-400/50 transition-all duration-300 group shadow-sm">
                      <div className="text-2xl font-bold text-cyan-600 mb-1 group-hover:scale-110 transition-transform duration-300">{formData.currentRank}</div>
                      <div className="text-xs text-gray-500 uppercase tracking-wider">Sıralama</div>
                    </div>
                    <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-gray-200/50 hover:border-blue-400/50 transition-all duration-300 group shadow-sm">
                      <div className="text-2xl font-bold text-blue-600 mb-1 group-hover:scale-110 transition-transform duration-300">{formData.totalScore}</div>
                      <div className="text-xs text-gray-500 uppercase tracking-wider">Toplam Puan</div>
                    </div>
                    <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-gray-200/50 hover:border-purple-400/50 transition-all duration-300 group shadow-sm">
                      <div className="text-2xl font-bold text-purple-600 mb-1 group-hover:scale-110 transition-transform duration-300">{formData.completedAnalyses}</div>
                      <div className="text-xs text-gray-500 uppercase tracking-wider">CV Analizi</div>
                    </div>
                    <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-gray-200/50 hover:border-green-400/50 transition-all duration-300 group shadow-sm">
                      <div className="text-2xl font-bold text-green-600 mb-1 group-hover:scale-110 transition-transform duration-300">{formData.completedInterviews}</div>
                      <div className="text-xs text-gray-500 uppercase tracking-wider">Mülakat</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Left Sidebar - Unique Design */}
          <div className="lg:col-span-1 space-y-6">
            {/* Action Hub */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 p-6 hover:border-cyan-400/50 transition-all duration-500 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Aksiyon Merkezi</h3>
              </div>
              <div className="space-y-3">
                <button 
                  onClick={() => setIsEditing(!isEditing)}
                  className="w-full flex items-center gap-3 p-3 bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200 rounded-xl hover:from-cyan-100 hover:to-blue-100 transition-all duration-300 group"
                >
                  <Edit className="w-4 h-4 text-cyan-600 group-hover:rotate-12 transition-transform" />
                  <span className="text-cyan-700 font-medium">{isEditing ? "Düzenlemeyi Bitir" : "Profili Düzenle"}</span>
                </button>
                <button className="w-full flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl hover:from-purple-100 hover:to-pink-100 transition-all duration-300 group">
                  <FileText className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" />
                  <span className="text-purple-700 font-medium">CV Analizi Yap</span>
                </button>
                <button className="w-full flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl hover:from-green-100 hover:to-emerald-100 transition-all duration-300 group">
                  <MessageSquare className="w-4 h-4 text-green-600 group-hover:scale-110 transition-transform" />
                  <span className="text-green-700 font-medium">Mülakat Simülasyonu</span>
                </button>
                <button className="w-full flex items-center gap-3 p-3 bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-xl hover:from-orange-100 hover:to-yellow-100 transition-all duration-300 group">
                  <Trophy className="w-4 h-4 text-orange-600 group-hover:scale-110 transition-transform" />
                  <span className="text-orange-700 font-medium">Başarımları Gör</span>
                </button>
              </div>
            </div>

            {/* Performance Ring */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 p-6 hover:border-blue-400/50 transition-all duration-500 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Performans Halkası</h3>
              </div>
              <div className="space-y-6">
                <div className="relative">
                  <div className="w-24 h-24 mx-auto relative">
                    <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="40" stroke="rgba(0,0,0,0.1)" strokeWidth="8" fill="none"/>
                      <circle cx="50" cy="50" r="40" stroke="url(#cvGradient)" strokeWidth="8" fill="none" 
                        strokeDasharray={`${2 * Math.PI * 40}`} 
                        strokeDashoffset={`${2 * Math.PI * 40 * (1 - formData.cvScore / 100)}`}
                        className="transition-all duration-2000 ease-out"/>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-lg font-bold text-cyan-600">{formData.cvScore}</span>
                    </div>
                  </div>
                  <div className="text-center mt-3">
                    <p className="text-sm text-gray-600">CV Skoru</p>
                  </div>
                </div>
                
                <div className="relative">
                  <div className="w-24 h-24 mx-auto relative">
                    <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="40" stroke="rgba(0,0,0,0.1)" strokeWidth="8" fill="none"/>
                      <circle cx="50" cy="50" r="40" stroke="url(#interviewGradient)" strokeWidth="8" fill="none" 
                        strokeDasharray={`${2 * Math.PI * 40}`} 
                        strokeDashoffset={`${2 * Math.PI * 40 * (1 - formData.interviewScore / 100)}`}
                        className="transition-all duration-2000 ease-out"/>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-lg font-bold text-green-600">{formData.interviewScore}</span>
                    </div>
                  </div>
                  <div className="text-center mt-3">
                    <p className="text-sm text-gray-600">Mülakat Skoru</p>
                  </div>
                </div>
              </div>
              
              {/* SVG Gradients */}
              <svg className="absolute opacity-0">
                <defs>
                  <linearGradient id="cvGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#06b6d4" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                  <linearGradient id="interviewGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#059669" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            {/* Activity Stream */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 p-6 hover:border-purple-400/50 transition-all duration-500 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg flex items-center justify-center">
                  <Clock className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Aktivite Akışı</h3>
              </div>
              <div className="space-y-4">
                {getRecentActivity(cvResults, interviewResults).slice(0, 3).map((activity, index) => {
                  const IconComponent = activity.icon
                  return (
                    <div key={activity.id} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50/50 hover:bg-gray-100/50 transition-all duration-300 group">
                      <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                        <IconComponent className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate group-hover:text-cyan-600 transition-colors">{activity.title}</p>
                        <p className="text-xs text-gray-500 mt-1">{formatDate(activity.date)}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-2xl p-1 shadow-lg">
                <TabsTrigger 
                  value="overview" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-500 data-[state=active]:text-white rounded-xl font-medium text-gray-600 hover:text-gray-900 transition-all duration-300"
                >
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    <span>Genel Bakış</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger 
                  value="personal"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white rounded-xl font-medium text-gray-600 hover:text-gray-900 transition-all duration-300"
                >
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>Kişisel Bilgiler</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger 
                  value="achievements"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-yellow-500 data-[state=active]:text-white rounded-xl font-medium text-gray-600 hover:text-gray-900 transition-all duration-300"
                >
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4" />
                    <span>Başarımlar</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger 
                  value="settings"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white rounded-xl font-medium text-gray-600 hover:text-gray-900 transition-all duration-300"
                >
                  <div className="flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    <span>Ayarlar</span>
                  </div>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6 mt-6">
                {/* Performance Dashboard */}
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-gray-200/50 p-8 hover:border-cyan-400/50 transition-all duration-500 shadow-xl">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <BarChart3 className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-3xl font-black text-gray-900">Performans Dashboard</h3>
                      <p className="text-gray-600">Gerçek zamanlı performans metrikleri</p>
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="relative p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 hover:border-cyan-400/50 transition-all duration-500 shadow-lg">
                          <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                                <FileText className="w-6 h-6 text-white" />
                              </div>
                              <span className="font-bold text-gray-900 text-lg">CV Analizi</span>
                            </div>
                            <div className="text-right">
                              <span className="text-3xl font-black text-cyan-600">{formData.cvScore}</span>
                              <span className="text-gray-500 text-lg">/100</span>
                            </div>
                          </div>
                          <div className="relative mb-4">
                            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                              <div 
                                className="bg-gradient-to-r from-cyan-400 to-blue-500 h-3 rounded-full transition-all duration-3000 ease-out relative"
                                style={{ width: `${formData.cvScore}%` }}
                              >
                                <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
                              </div>
                            </div>
                          </div>
                          <p className="text-gray-600 text-sm">
                            Son CV analizinizde <span className="text-cyan-600 font-semibold">{formData.cvScore} puan</span> aldınız. 
                            Hedef: <span className="text-yellow-600 font-semibold">85+ puan</span>
                          </p>
                        </div>
                      </div>
                      
                      <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="relative p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 hover:border-green-400/50 transition-all duration-500 shadow-lg">
                          <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                                <MessageSquare className="w-6 h-6 text-white" />
                              </div>
                              <span className="font-bold text-gray-900 text-lg">Mülakat</span>
                            </div>
                            <div className="text-right">
                              <span className="text-3xl font-black text-green-600">{formData.interviewScore}</span>
                              <span className="text-gray-500 text-lg">/100</span>
                            </div>
                          </div>
                          <div className="relative mb-4">
                            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                              <div 
                                className="bg-gradient-to-r from-green-400 to-emerald-500 h-3 rounded-full transition-all duration-3000 ease-out relative"
                                style={{ width: `${formData.interviewScore}%` }}
                              >
                                <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
                              </div>
                            </div>
                          </div>
                          <p className="text-gray-600 text-sm">
                            Son mülakat simülasyonunuzda <span className="text-green-600 font-semibold">{formData.interviewScore} puan</span> aldınız. 
                            Hedef: <span className="text-yellow-600 font-semibold">80+ puan</span>
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="p-6 bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl border border-purple-100">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
                              <TrendingUp className="w-5 h-5 text-white" />
                            </div>
                            <span className="font-semibold text-gray-900">Genel Trend</span>
                          </div>
                          <span className="text-2xl font-bold text-purple-600">+12%</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">
                          Son 30 günde performansınızda %12 artış gözlemlendi.
                        </p>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-xs text-green-600 font-medium">Yükseliş trendi</span>
                        </div>
                      </div>
                      
                      <div className="p-6 bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl border border-orange-100">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
                              <Target className="w-5 h-5 text-white" />
                            </div>
                            <span className="font-semibold text-gray-900">Hedefler</span>
                          </div>
                          <span className="text-2xl font-bold text-orange-600">3/5</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">
                          Bu ay belirlediğiniz 5 hedeften 3'ünü tamamladınız.
                        </p>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                          <span className="text-xs text-orange-600 font-medium">%60 tamamlandı</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Activity Timeline */}
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8">
                  <div className="flex items-center space-x-4 mb-8">
                    <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <Clock className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">Aktivite Zaman Çizelgesi</h3>
                      <p className="text-gray-600">Son aktivitelerinizin detaylı geçmişi</p>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    {(() => {
                      const activities = getRecentActivity(cvResults, interviewResults).slice(0, 5)
                      return activities.map((activity, index) => {
                        const IconComponent = activity.icon
                        return (
                          <div key={activity.id} className="relative flex items-start space-x-6">
                            {index !== activities.length - 1 && (
                              <div className="absolute left-6 top-12 w-0.5 h-16 bg-gradient-to-b from-blue-200 to-transparent"></div>
                            )}
                          <div className="relative z-10 w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg">
                            <IconComponent className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1 bg-gray-50 rounded-2xl p-6 border border-gray-100">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold text-gray-900">{activity.title}</h4>
                              <span className="text-sm text-gray-500">{formatDate(activity.date)}</span>
                            </div>
                            <p className="text-gray-600 mb-3">{activity.description}</p>
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              <span className="text-xs text-blue-600 font-medium">Tamamlandı</span>
                            </div>
                          </div>
                        </div>
                        )
                      })
                    })()}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="personal" className="space-y-6 mt-6">
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                        <User className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900">Kişisel Bilgiler</h3>
                        <p className="text-gray-600">Hesap bilgilerinizi güncelleyin ve yönetin</p>
                      </div>
                    </div>
                    {isEditing && (
                      <div className="flex space-x-3">
                        <Button onClick={handleSave} className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6">
                          <Save className="w-4 h-4 mr-2" />
                          Kaydet
                        </Button>
                        <Button onClick={handleCancel} variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 px-6">
                          <X className="w-4 h-4 mr-2" />
                          İptal
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  <div className="grid lg:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
                        <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                            <User className="w-4 h-4 text-white" />
                          </div>
                          Temel Bilgiler
                        </h4>
                        
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">Ad</Label>
                              <Input
                                id="firstName"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">Soyad</Label>
                              <Input
                                id="lastName"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white"
                              />
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-medium text-gray-700">E-posta</Label>
                            <Input
                              id="email"
                              name="email"
                              type="email"
                              value={formData.email}
                              onChange={handleInputChange}
                              disabled={!isEditing}
                              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white"
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-100">
                        <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                          <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center mr-3">
                            <Calendar className="w-4 h-4 text-white" />
                          </div>
                          Hesap Bilgileri
                        </h4>
                        
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="phone" className="text-sm font-medium text-gray-700">Telefon</Label>
                              <Input
                                id="phone"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                                className="border-gray-300 focus:border-green-500 focus:ring-green-500 bg-white"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="location" className="text-sm font-medium text-gray-700">Konum</Label>
                              <Input
                                id="location"
                                name="location"
                                value={formData.location}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                                className="border-gray-300 focus:border-green-500 focus:ring-green-500 bg-white"
                              />
                            </div>
                          </div>
                          
                          <div className="pt-4 border-t border-green-200">
                            <div className="flex items-center space-x-3 text-sm text-gray-600">
                              <Calendar className="w-4 h-4" />
                              <span>Katılım tarihi: {formatDate(formData.joinDate)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="p-6 bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl border border-purple-100">
                        <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                          <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center mr-3">
                            <FileText className="w-4 h-4 text-white" />
                          </div>
                          Profil Açıklaması
                        </h4>
                        
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="bio" className="text-sm font-medium text-gray-700">Hakkımda</Label>
                            <Textarea
                              id="bio"
                              name="bio"
                              value={formData.bio}
                              onChange={handleInputChange}
                              disabled={!isEditing}
                              rows={8}
                              className="border-gray-300 focus:border-purple-500 focus:ring-purple-500 bg-white resize-none"
                              placeholder="Kendiniz hakkında kısa bir açıklama yazın..."
                            />
                          </div>
                          
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>Maksimum 500 karakter</span>
                            <span>{formData.bio.length}/500</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-6 bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl border border-orange-100">
                        <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center mr-3">
                            <Shield className="w-4 h-4 text-white" />
                          </div>
                          Güvenlik
                        </h4>
                        
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-orange-200">
                            <div className="flex items-center space-x-3">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-sm font-medium text-gray-700">E-posta Doğrulandı</span>
                            </div>
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          </div>
                          
                          <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-orange-200">
                            <div className="flex items-center space-x-3">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-sm font-medium text-gray-700">İki Faktörlü Doğrulama</span>
                            </div>
                            <Button variant="outline" size="sm" className="text-xs">
                              Etkinleştir
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="achievements" className="space-y-6 mt-6">
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8">
                  <div className="flex items-center space-x-4 mb-8">
                    <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <Trophy className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">Başarımlarım</h3>
                      <p className="text-gray-600">Platformdaki aktiviteleriniz için kazandığınız rozetler ve ödüller</p>
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    {achievements.map((achievement, index) => (
                      <div
                        key={index}
                        className={`p-6 rounded-2xl border-2 transition-all duration-300 hover:scale-105 ${
                          achievement.unlocked 
                            ? "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-lg" 
                            : "bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200"
                        }`}
                      >
                        <div className="flex items-start space-x-4">
                          <div
                            className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg ${
                              achievement.unlocked 
                                ? "bg-gradient-to-br from-green-500 to-emerald-500" 
                                : "bg-gradient-to-br from-gray-400 to-gray-500"
                            }`}
                          >
                            <achievement.icon className="w-8 h-8 text-white" />
                          </div>
                          <div className="flex-1">
                            <h4
                              className={`font-bold text-lg mb-2 ${
                                achievement.unlocked 
                                  ? "text-gray-900" 
                                  : "text-gray-500"
                              }`}
                            >
                              {achievement.name}
                            </h4>
                            {achievement.unlocked ? (
                              <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                  <CheckCircle className="w-5 h-5 text-green-600" />
                                  <span className="text-sm text-green-600 font-medium">
                                    {achievement.date && formatDate(achievement.date)}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                  <span className="text-xs text-green-600 font-medium">Kazanıldı</span>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-3">
                                <div className="w-full bg-gray-200 rounded-full h-3">
                                  <div 
                                    className="bg-gradient-to-r from-blue-500 to-indigo-500 h-3 rounded-full transition-all duration-2000"
                                    style={{ width: `${achievement.progress}%` }}
                                  />
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-gray-600">
                                    {achievement.progress}% tamamlandı
                                  </span>
                                  <span className="text-xs text-blue-600 font-medium">
                                    {100 - (achievement.progress || 0)}% kaldı
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Achievement Stats */}
                  <div className="mt-8 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
                    <h4 className="font-semibold text-gray-900 mb-4">Başarım İstatistikleri</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">2</div>
                        <div className="text-sm text-gray-600">Kazanılan</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">4</div>
                        <div className="text-sm text-gray-600">Devam Eden</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">33%</div>
                        <div className="text-sm text-gray-600">Tamamlanma</div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="settings" className="space-y-6 mt-6">
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8">
                  <div className="flex items-center space-x-4 mb-8">
                    <div className="w-14 h-14 bg-gradient-to-br from-gray-500 to-slate-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <Settings className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">Hesap Ayarları</h3>
                      <p className="text-gray-600">Hesabınızı özelleştirin ve güvenliğinizi yönetin</p>
                    </div>
                  </div>
                  
                  <div className="grid lg:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
                        <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                            <Bell className="w-4 h-4 text-white" />
                          </div>
                          Bildirimler
                        </h4>
                        
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-blue-200">
                            <div>
                              <h5 className="font-medium text-gray-900">E-posta Bildirimleri</h5>
                              <p className="text-sm text-gray-600">Yeni özellikler ve güncellemeler</p>
                            </div>
                            <Button variant="outline" size="sm" className="border-blue-300 text-blue-700 hover:bg-blue-50">
                              Ayarla
                            </Button>
                          </div>
                          
                          <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-blue-200">
                            <div>
                              <h5 className="font-medium text-gray-900">Push Bildirimleri</h5>
                              <p className="text-sm text-gray-600">Anlık bildirimler al</p>
                            </div>
                            <Button variant="outline" size="sm" className="border-blue-300 text-blue-700 hover:bg-blue-50">
                              Etkinleştir
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-100">
                        <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                          <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center mr-3">
                            <Shield className="w-4 h-4 text-white" />
                          </div>
                          Gizlilik
                        </h4>
                        
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-green-200">
                            <div>
                              <h5 className="font-medium text-gray-900">Profil Görünürlüğü</h5>
                              <p className="text-sm text-gray-600">Profilinizi kimler görebilir</p>
                            </div>
                            <Button variant="outline" size="sm" className="border-green-300 text-green-700 hover:bg-green-50">
                              Yönet
                            </Button>
                          </div>
                          
                          <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-green-200">
                            <div>
                              <h5 className="font-medium text-gray-900">Veri Paylaşımı</h5>
                              <p className="text-sm text-gray-600">Analitik verilerinizi paylaş</p>
                            </div>
                            <Button variant="outline" size="sm" className="border-green-300 text-green-700 hover:bg-green-50">
                              Ayarla
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="p-6 bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl border border-orange-100">
                        <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center mr-3">
                            <User className="w-4 h-4 text-white" />
                          </div>
                          Güvenlik
                        </h4>
                        
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-orange-200">
                            <div>
                              <h5 className="font-medium text-gray-900">Şifre Değiştir</h5>
                              <p className="text-sm text-gray-600">Hesap güvenliğinizi güncel tutun</p>
                            </div>
                            <Button variant="outline" size="sm" className="border-orange-300 text-orange-700 hover:bg-orange-50">
                              Değiştir
                            </Button>
                          </div>
                          
                          <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-orange-200">
                            <div>
                              <h5 className="font-medium text-gray-900">İki Faktörlü Doğrulama</h5>
                              <p className="text-sm text-gray-600">Ekstra güvenlik katmanı</p>
                            </div>
                            <Button variant="outline" size="sm" className="border-orange-300 text-orange-700 hover:bg-orange-50">
                              Etkinleştir
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-6 bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl border border-purple-100">
                        <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                          <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center mr-3">
                            <FileText className="w-4 h-4 text-white" />
                          </div>
                          Veri Yönetimi
                        </h4>
                        
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-purple-200">
                            <div>
                              <h5 className="font-medium text-gray-900">Verilerimi İndir</h5>
                              <p className="text-sm text-gray-600">Hesap verilerinizi indirin</p>
                            </div>
                            <Button variant="outline" size="sm" className="border-purple-300 text-purple-700 hover:bg-purple-50">
                              İndir
                            </Button>
                          </div>
                          
                          <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-red-200">
                            <div>
                              <h5 className="font-medium text-red-900">Hesabı Sil</h5>
                              <p className="text-sm text-red-600">Hesabınızı kalıcı olarak silin</p>
                            </div>
                            <Button variant="outline" size="sm" className="border-red-300 text-red-700 hover:bg-red-50">
                              Sil
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Security Notice */}
                  <div className="mt-8 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Shield className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-blue-900 mb-2">Güvenlik Önerileri</h4>
                        <p className="text-sm text-blue-700 mb-3">
                          Hesabınızın güvenliği bizim için önemli. Şifrenizi düzenli olarak güncelleyin, 
                          kimseyle paylaşmayın ve iki faktörlü doğrulamayı etkinleştirin.
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-blue-600">
                          <span className="flex items-center space-x-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span>Güçlü şifre kullanın</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span>2FA etkinleştirin</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span>Düzenli güncelleme</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
      </div>
    </ProtectedRoute>
  )
}

