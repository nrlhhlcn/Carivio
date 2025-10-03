"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import Navbar from "@/components/navbar"
import ProtectedRoute from "@/components/ProtectedRoute"
import { useAuth } from "@/contexts/AuthContext"
import { saveCVAnalysisResult, saveUserStats, getUserStats } from "@/lib/firestore"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Upload,
  FileText,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  User,
  Briefcase,
  GraduationCap,
  Download,
  Eye,
  Clock,
  Star,
  Sparkles,
  Zap,
} from "lucide-react"

type SectionKey = "personalInfo" | "experience" | "education" | "skills" | "projects"
type Section = { score: number; status: "excellent" | "good" | "needs-improvement"; feedback: string }
type RecItem = { type: string; message: string; priority?: string; impact?: string }
type AnalysisResult = {
  overallScore: number
  sections: Record<SectionKey, Section>
  recommendations: RecItem[]
  templates: { name: string; price: string; popular?: boolean }[]
  raw?: any
}

export default function CVAnalysisPage() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [analysisComplete, setAnalysisComplete] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [savedFiles, setSavedFiles] = useState<Set<string>>(new Set())
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)
  const { user } = useAuth()
  
  // Global çift kaydetme koruması - daha güçlü
  const globalSavingState = useRef<Set<string>>(new Set())
  const lastSaveTime = useRef<number>(0)

  useEffect(() => {
    setIsVisible(true)
  }, [])


  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setUploadedFile(file)
      setAnalysisComplete(false)
      setShowResults(false)
      // Yeni dosya yüklendiğinde savedFiles'ı ve global state'i temizle
      setSavedFiles(new Set())
      globalSavingState.current.clear()
    }
  }

  const saveAnalysisToFirebase = async (resultOverride?: AnalysisResult) => {
    if (!user) {
      console.warn('[saveAnalysisToFirebase] user yok, kayıt atlandı')
      return
    }
    if (!uploadedFile) {
      console.warn('[saveAnalysisToFirebase] uploadedFile yok, kayıt atlandı')
      return
    }
    const resultToSave = resultOverride ?? analysisResult
    if (!resultToSave) {
      console.warn('[saveAnalysisToFirebase] analysisResult yok (ve override gelmedi), kayıt atlandı')
      return
    }

    // Zaman bazlı koruma - son 5 saniye içinde kaydetme yapıldıysa engelle
    const now = Date.now()
    if (now - lastSaveTime.current < 5000) {
      console.log(`[${now}] Son 5 saniye içinde kaydetme yapıldı, çift kaydetme önlendi`)
      return
    }

    // Unique key oluştur
    const fileKey = `${user.uid}_${uploadedFile.name}_${uploadedFile.size}_${uploadedFile.lastModified}`
    
    // Global çift kaydetme koruması - useRef ile
    if (globalSavingState.current.has(fileKey)) {
      console.log(`[${fileKey}] Bu dosya zaten kaydediliyor, çift kaydetme önlendi`)
      return
    }

    // Zaman damgasını güncelle
    lastSaveTime.current = now
    
    // Global state'e ekle
    globalSavingState.current.add(fileKey)
    setIsSaving(true)
    setSavedFiles(prev => new Set(prev).add(fileKey))

    try {
      console.log(`[${fileKey}] CV analiz sonucu kaydediliyor...`)

      // Not: Dosya Storage'a yüklenmiyor; yalnızca analiz sonucu kaydedilir

      // CV analiz sonucunu kaydet
      console.info(`[${fileKey}] Firestore cvAnalysisResults kaydı başlıyor`)
      await saveCVAnalysisResult({
        userId: user.uid,
        fileName: uploadedFile.name,
        overallScore: resultToSave.overallScore,
        sections: resultToSave.sections,
        recommendations: resultToSave.recommendations.map(r => r.message)
      })
      console.info(`[${fileKey}] Firestore cvAnalysisResults kaydı tamamlandı`)

      // Kullanıcı istatistiklerini güncelle
      console.info(`[${fileKey}] userStats okunuyor`)
      const currentStats = await getUserStats(user.uid)
      const newStats = {
        userId: user.uid,
        displayName: user.displayName || 'Kullanıcı',
        photoURL: user.photoURL || undefined,
        currentRank: currentStats?.currentRank || 12,
        totalScore: (currentStats?.totalScore || 0) + resultToSave.overallScore,
        // En yüksek CV puanını tut
        cvScore: Math.max(currentStats?.cvScore || 0, resultToSave.overallScore),
        interviewScore: currentStats?.interviewScore || 0,
        badge: currentStats?.badge || "Yeni Katılımcı",
        level: currentStats?.level || "Başlangıç",
        // Yeni analiz sayısını +1
        completedAnalyses: (currentStats?.completedAnalyses || 0) + 1,
        completedInterviews: currentStats?.completedInterviews || 0,
        totalActiveDays: currentStats?.totalActiveDays || 1,
        streak: currentStats?.streak || 1,
        lastActivityDate: new Date()
      }

      console.info(`[${fileKey}] userStats kaydı/güncellemesi başlıyor`)
      await saveUserStats(newStats)
      console.info(`[${fileKey}] userStats kaydı/güncellemesi tamamlandı`)
      
      console.log(`[${fileKey}] CV analiz sonucu ve istatistikler Firebase'e kaydedildi`)
      console.log(`[${fileKey}] Kaydedilen CV analiz sonucu:`, {
        userId: user.uid,
        fileName: uploadedFile.name,
        overallScore: resultToSave.overallScore
      })
      console.log(`[${fileKey}] Kaydedilen kullanıcı istatistikleri:`, newStats)
    } catch (error) {
      console.error('Firebase kaydetme hatası:', error)
      // Hata durumunda global state'den kaldır
      globalSavingState.current.delete(fileKey)
      setSavedFiles(prev => {
        const newSet = new Set(prev)
        newSet.delete(fileKey)
        return newSet
      })
    } finally {
      setIsSaving(false)
      // Başarılı kaydetme sonrası global state'den kaldır
      globalSavingState.current.delete(fileKey)
    }
  }

  const handleAnalyze = async () => {
    if (!uploadedFile) return

    setIsLoading(true)
    setApiError(null)
    setLoadingProgress(0)

    // Başlat: sahte progress + paralelde API çağrısı
    let done = false
    const timer = setInterval(() => {
      setLoadingProgress((p) => (p >= 95 || done ? p : p + 2))
    }, 60)

    try {
      const formData = new FormData()
      formData.append('file', uploadedFile)
      formData.append('sector', 'INFORMATION-TECHNOLOGY')

      const res = await fetch('/api/cv/score', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok || !data?.result) {
        throw new Error(data?.error || 'Analiz başarısız')
      }

      const result = data.result as any

      const overall = Math.max(0, Math.min(100, Number(result.score) || 0))
      const breakdown = result.breakdown || {}

      // Section skorlarını yaklaşık dağıtım ile oluştur
      const mapScoreToStatus = (s: number): Section["status"] => (s >= 80 ? 'excellent' : s >= 60 ? 'good' : 'needs-improvement')
      const sections: AnalysisResult["sections"] = {
        personalInfo: {
          score: Math.round((breakdown.completeness || 0) * 10),
          status: mapScoreToStatus(Math.round((breakdown.completeness || 0) * 10)),
          feedback: "İletişim/link bilgilerini zenginleştirin (LinkedIn/GitHub vb.)",
        },
        experience: {
          score: Math.min(100, Math.round(((breakdown.sections || 0) / 30) * 100)),
          status: mapScoreToStatus(Math.min(100, Math.round(((breakdown.sections || 0) / 30) * 100))),
          feedback: "İş deneyimlerinizde sayısal ve sonuç odaklı maddeler kullanın",
        },
        education: {
          score: Math.min(100, Math.round(((breakdown.formatting || 0) / 20) * 100)),
          status: mapScoreToStatus(Math.min(100, Math.round(((breakdown.formatting || 0) / 20) * 100))),
          feedback: "Eğitim ve tarih formatlarını tek tipte sunun",
        },
        skills: {
          score: Math.min(100, Math.round(((breakdown.keywords || 0) / 30) * 100)),
          status: mapScoreToStatus(Math.min(100, Math.round(((breakdown.keywords || 0) / 30) * 100))),
          feedback: "Sektöre özgü anahtar kelime ve becerileri artırın",
        },
        projects: {
          score: Math.min(100, Math.round(((breakdown.actions || 0) / 20) * 100)),
          status: mapScoreToStatus(Math.min(100, Math.round(((breakdown.actions || 0) / 20) * 100))),
          feedback: "Aksiyon fiilleriyle somut başarılar ve çıktılar ekleyin",
        },
      }

      const recsRaw = (result.recommendations || []) as RecItem[] | string[]
      const recs: RecItem[] = Array.isArray(recsRaw) && typeof recsRaw[0] === 'object'
        ? (recsRaw as RecItem[])
        : (recsRaw as string[]).map(msg => ({ type: 'improvement', message: msg }))

      const computed: AnalysisResult = {
        overallScore: overall,
        sections,
        recommendations: (recs.length ? recs : [
          { type: 'contact', message: "LinkedIn profilinizi ekleyin ve becerileri güncelleyin" },
          { type: 'content', message: "İş deneyimlerinde sayısal başarıları vurgulayın" },
        ]) as RecItem[],
        templates: [
          { name: "Basit & Temiz", price: "Ücretsiz", popular: true },
          { name: "Modern Tasarım", price: "₺25" },
          { name: "Kreatif", price: "₺35" },
          { name: "Klasik", price: "₺15" },
        ],
        raw: result,
      }

      setAnalysisResult(computed)
      done = true
      setLoadingProgress(100)
      clearInterval(timer)
      setIsLoading(false)
      setAnalysisComplete(true)
      setShowResults(true)

      // Firestore'a kaydet (state güncellenmesini beklemeden, taze sonuçla)
      await saveAnalysisToFirebase(computed)
    } catch (e) {
      done = true
      clearInterval(timer)
      setIsLoading(false)
      setLoadingProgress(0)
      console.error(e)
      setApiError("Analiz sırasında bir hata oluştu. Lütfen tekrar deneyin.")
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "excellent":
        return "text-green-600"
      case "good":
        return "text-blue-600"
      case "needs-improvement":
        return "text-orange-600"
      default:
        return "text-gray-500"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "excellent":
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case "good":
        return <CheckCircle className="w-5 h-5 text-blue-600" />
      case "needs-improvement":
        return <AlertTriangle className="w-5 h-5 text-orange-600" />
      default:
        return null
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-white">
        <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-8 pt-24">
        <div
          className={`mb-12 text-center transform transition-all duration-1000 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          <div className="inline-flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4 mr-2 animate-spin" style={{ animationDuration: "3s" }} />
            Yapay Zeka Destekli Analiz
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent mb-4">
            CV Analizi
          </h1>
          <p className="text-gray-600 text-xl max-w-2xl mx-auto">
            CV'nizi yükleyin, analiz edin ve nasıl geliştirebileceğinizi öğrenin
          </p>
          {apiError && (
            <div className="mt-4 text-red-600 text-sm">
              {apiError}
            </div>
          )}
        </div>

        {isLoading ? (
          // Loading Screen
          <div className="max-w-4xl mx-auto">
            <div className="min-h-[600px] flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 rounded-xl relative overflow-hidden">
              {/* Animated Background Elements */}
              <div className="absolute inset-0">
                <div className="absolute top-10 left-10 w-20 h-20 bg-blue-500/20 rounded-full animate-pulse"></div>
                <div className="absolute top-20 right-20 w-16 h-16 bg-purple-500/20 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
                <div className="absolute bottom-20 left-20 w-24 h-24 bg-cyan-500/20 rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
                <div className="absolute bottom-10 right-10 w-12 h-12 bg-indigo-500/20 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
              </div>
              
              <div className="text-center space-y-8 relative z-10 animate-fade-in">
                {/* Circular Progress with Glow Effect */}
                <div className="relative w-48 h-48 mx-auto animate-scale-pulse">
                  {/* Outer Glow Ring */}
                  <div className="absolute inset-0 w-48 h-48 rounded-full bg-white/10 animate-ping"></div>
                  
                  {/* Progress Ring Container */}
                  <div className="relative w-48 h-48 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 animate-rotate-slow">
                    <div className="absolute inset-2 rounded-full bg-slate-900/50"></div>
                  </div>
                  
                  {/* Main Progress Circle */}
                  <div className="absolute inset-0">
                    <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 100 100">
                      {/* Background Circle */}
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        stroke="currentColor"
                        strokeWidth="3"
                        fill="none"
                        className="text-slate-600"
                      />
                      {/* Progress Circle with Glow */}
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 45}`}
                        strokeDashoffset={`${2 * Math.PI * 45 * (1 - loadingProgress / 100)}`}
                        className="text-white transition-all duration-100 ease-out animate-pulse-glow"
                        style={{
                          filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.5)) drop-shadow(0 0 20px rgba(59,130,246,0.5))'
                        }}
                      />
                    </svg>
                  </div>
                  
                  {/* Progress Text with Pulse */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-4xl font-bold text-white drop-shadow-lg animate-pulse">
                      {Math.round(loadingProgress)}%
                    </span>
                  </div>
                  
                  {/* Rotating Dots Around Circle */}
                  <div className="absolute inset-0 animate-spin" style={{ animationDuration: '2s' }}>
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-white rounded-full animate-pulse"></div>
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-blue-300 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-purple-300 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
                    <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-cyan-300 rounded-full animate-pulse" style={{ animationDelay: '1.5s' }}></div>
                  </div>
                </div>
                
                {/* Loading Text with Typewriter Effect */}
                <div className="space-y-4 animate-slide-in-top">
                  <h2 className="text-2xl font-semibold text-white drop-shadow-lg animate-pulse">
                    CV İNCELENİYOR...
                  </h2>
                  <p className="text-slate-300 animate-fade-in">
                    Yapay zeka CV'nizi analiz ediyor, lütfen bekleyin
                  </p>
                </div>
                
                {/* Enhanced Loading Dots Animation */}
                <div className="flex justify-center space-x-2 animate-fade-in">
                  <div className="w-3 h-3 bg-white rounded-full animate-bounce shadow-lg animate-pulse-glow" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-3 h-3 bg-blue-300 rounded-full animate-bounce shadow-lg animate-pulse-glow" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-3 h-3 bg-purple-300 rounded-full animate-bounce shadow-lg animate-pulse-glow" style={{ animationDelay: '300ms' }}></div>
                  <div className="w-3 h-3 bg-cyan-300 rounded-full animate-bounce shadow-lg animate-pulse-glow" style={{ animationDelay: '450ms' }}></div>
                </div>
                
                {/* Progress Bar */}
                <div className="w-64 mx-auto animate-fade-in">
                  <div className="h-3 bg-slate-700 rounded-full overflow-hidden shadow-inner">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 rounded-full transition-all duration-100 ease-out shadow-lg animate-pulse-glow"
                      style={{ width: `${loadingProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-slate-400 mt-2 animate-pulse">
                    {Math.round(loadingProgress)}% tamamlandı
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : !showResults ? (
          <div className="max-w-4xl mx-auto">
            <Card
              className={`mb-8 border-0 shadow-xl hover:shadow-2xl transition-all duration-500 transform ${
                isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
              }`}
              style={{ animationDelay: "0.2s" }}
            >
              <CardHeader>
                <CardTitle className="flex items-center space-x-3 text-gray-900 text-xl">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                    <Upload className="w-5 h-5 text-white" />
                  </div>
                  <span>CV'nizi Yükleyin</span>
                </CardTitle>
                <CardDescription className="text-gray-600 text-lg">
                  PDF, DOC veya DOCX formatında (En fazla 5MB)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-blue-400 hover:bg-blue-50/50 transition-all duration-300 group">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="cv-upload"
                  />
                  <label htmlFor="cv-upload" className="cursor-pointer">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <FileText className="w-8 h-8 text-white" />
                    </div>
                    <p className="text-xl font-semibold text-gray-900 mb-2">Dosya seçin veya sürükleyin</p>
                    <p className="text-gray-500">PDF, DOC, DOCX kabul edilir</p>
                  </label>
                </div>

                {uploadedFile && (
                  <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl border border-blue-200 animate-in slide-in-from-top duration-500">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-green-500 rounded-xl flex items-center justify-center">
                          <FileText className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-lg">{uploadedFile.name}</p>
                          <p className="text-gray-600">{(uploadedFile.size / 1024 / 1024).toFixed(1)} MB</p>
                        </div>
                      </div>
                      <Button
                        onClick={handleAnalyze}
                        disabled={isLoading}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg font-semibold rounded-xl shadow-lg hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105 group"
                      >
                        {isLoading ? (
                          <>
                            <Clock className="w-5 h-5 mr-2 animate-spin" />
                            Analiz Ediliyor...
                          </>
                        ) : (
                          <>
                            <Zap className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
                            Analiz Et
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>


            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: User,
                  title: "Kişisel Bilgiler",
                  desc: "İletişim bilgileri ve profesyonel özet kontrol edilir.",
                  color: "from-blue-500 to-blue-600",
                  delay: "0.4s",
                },
                {
                  icon: Briefcase,
                  title: "İş Deneyimi",
                  desc: "Çalışma geçmişi ve başarılarınız değerlendirilir.",
                  color: "from-green-500 to-green-600",
                  delay: "0.6s",
                },
                {
                  icon: GraduationCap,
                  title: "Eğitim & Beceriler",
                  desc: "Eğitim geçmişi ve teknik beceriler incelenir.",
                  color: "from-orange-500 to-orange-600",
                  delay: "0.8s",
                },
              ].map((item, index) => (
                <Card
                  key={index}
                  className={`border-0 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 group ${
                    isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
                  }`}
                  style={{ animationDelay: item.delay }}
                >
                  <CardHeader>
                    <div
                      className={`w-14 h-14 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                    >
                      <item.icon className="w-7 h-7 text-white" />
                    </div>
                    <CardTitle className="text-xl text-gray-900 group-hover:text-blue-600 transition-colors">
                      {item.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600 text-base leading-relaxed">{item.desc}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto animate-in slide-in-from-bottom duration-700">
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <Card className="sticky top-8 border-0 shadow-xl hover:shadow-2xl transition-all duration-500">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-3 text-gray-900">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                        <Eye className="w-5 h-5 text-white" />
                      </div>
                      <span>Yüklenen CV</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl p-8 min-h-80 flex items-center justify-center group hover:from-blue-50 hover:to-purple-50 transition-all duration-500">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                          <FileText className="w-8 h-8 text-white" />
                        </div>
                        <p className="text-gray-700 font-semibold text-lg">{uploadedFile?.name}</p>
                        <p className="text-gray-500 mt-2">PDF Dosyası</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="lg:col-span-2">
                <Tabs defaultValue="analysis" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 bg-gray-100 p-1 rounded-xl">
                    <TabsTrigger
                      value="analysis"
                      className="text-gray-700 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg transition-all duration-300"
                    >
                      Sonuçlar
                    </TabsTrigger>
                    <TabsTrigger
                      value="recommendations"
                      className="text-gray-700 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg transition-all duration-300"
                    >
                      Öneriler
                    </TabsTrigger>
                    <TabsTrigger
                      value="templates"
                      className="text-gray-700 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg transition-all duration-300"
                    >
                      Şablonlar
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="analysis" className="space-y-6 mt-8">
                    <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-purple-50 hover:shadow-2xl transition-all duration-500">
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between text-gray-900">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center">
                              <Star className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xl">Genel Puan</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                              {analysisResult?.overallScore ?? 0}
                            </span>
                            <span className="text-gray-500 text-xl">/100</span>
                          </div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="w-full bg-gray-200 rounded-full h-4 mb-4 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-4 rounded-full transition-all duration-2000 ease-out"
                            style={{ width: `${analysisResult?.overallScore ?? 0}%` }}
                          />
                        </div>
                        {analysisResult && (
                          <p className="text-gray-600 text-lg">
                            {analysisResult.overallScore >= 80
                              ? "Harika! Küçük dokunuşlarla mükemmel hale gelebilir."
                              : analysisResult.overallScore >= 60
                                ? "İyi bir başlangıç. Önerileri uygulayarak hızlıca güçlendirebilirsiniz."
                                : "İyileştirme alanları fazla. Aşağıdaki önerileri önceliklendirin."}
                          </p>
                        )}
                      </CardContent>
                    </Card>

                    {/* Gerçek breakdown'u göster */}
                    {analysisResult?.raw?.breakdown && (
                      <Card className="border-0 shadow-xl transition-all duration-500">
                        <CardHeader>
                          <CardTitle className="text-gray-900">Skor Kırılımı</CardTitle>
                          <CardDescription className="text-gray-600">Gelişmiş analiz modülünden gelen ham kırılım</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="grid md:grid-cols-5 gap-4">
                            {[
                              { label: 'Bölümler', key: 'sections' },
                              { label: 'Biçimlendirme', key: 'formatting' },
                              { label: 'Anahtar Kelimeler', key: 'keywords' },
                              { label: 'Eylem Fiilleri', key: 'actions' },
                              { label: 'Tamamlayıcılık', key: 'completeness' },
                            ].map((item) => (
                              <div key={item.key} className="p-4 bg-gray-50 rounded-xl border">
                                <div className="text-sm text-gray-500">{item.label}</div>
                                <div className="text-2xl font-bold text-gray-900">
                                  {analysisResult.raw.breakdown[item.key] ?? 0}
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>

                  <TabsContent value="recommendations" className="space-y-4 mt-6">
                    <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-purple-50 hover:shadow-2xl transition-all duration-500">
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2 text-gray-900">
                          <TrendingUp className="w-5 h-5 text-blue-600" />
                          <span>Nasıl Geliştirebilirsiniz?</span>
                        </CardTitle>
                    <CardDescription className="text-gray-600 text-lg">
                      Bu önerileri uygulayarak CV'nizi güçlendirebilirsiniz
                    </CardDescription>
                      </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Negatif (düzeltme) öğelerini üstte göster */}
                    {analysisResult?.recommendations
                      .filter(r => (r.type || '').toLowerCase() !== 'positive')
                      .map((r, index) => (
                        <div key={`neg-${index}`} className="flex items-start justify-between p-4 bg-red-50 rounded-xl border border-red-100">
                          <div className="flex items-start space-x-3">
                            <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-xs font-bold text-red-600">!</span>
                            </div>
                            <div className="flex-1">
                              <p className="text-gray-900 font-medium leading-snug">{r.message}</p>
                              <div className="mt-1 flex items-center gap-2">
                                {r.priority && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                                    {r.priority}
                                  </span>
                                )}
                                {r.impact && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-700">
                                    {r.impact}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}

                    {/* Pozitif öğeleri altta göster */}
                    {analysisResult?.recommendations
                      .filter(r => (r.type || '').toLowerCase() === 'positive')
                      .map((r, index) => (
                        <div key={`pos-${index}`} className="flex items-start p-4 bg-green-50 rounded-xl border border-green-100">
                          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 mr-3">
                            <span className="text-xs font-bold text-green-600">✓</span>
                          </div>
                          <div className="flex-1">
                            <p className="text-gray-900 font-medium leading-snug">{r.message}</p>
                          </div>
                        </div>
                      ))}
                  </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="templates" className="space-y-4 mt-6">
                    <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-purple-50 hover:shadow-2xl transition-all duration-500">
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2 text-gray-900">
                          <Download className="w-5 h-5 text-blue-600" />
                          <span>CV Şablonları</span>
                        </CardTitle>
                        <CardDescription className="text-gray-600 text-lg">
                          Profesyonel şablonlarla CV'nizi yenileyin
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid md:grid-cols-2 gap-4">
                          {analysisResult?.templates.map((template, index) => (
                            <Card
                              key={index}
                              className="relative border-0 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 group"
                            >
                              {template.popular && (
                                <Badge className="absolute -top-2 -right-2 bg-green-600 text-white">Popüler</Badge>
                              )}
                              <CardHeader>
                                <CardTitle className="text-lg text-gray-900">{template.name}</CardTitle>
                                <CardDescription className="text-xl font-bold text-blue-600">
                                  {template.price}
                                </CardDescription>
                              </CardHeader>
                              <CardContent>
                                <Button
                                  className={`w-full ${
                                    template.price === "Ücretsiz"
                                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                                      : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                                  }`}
                                >
                                  {template.price === "Ücretsiz" ? "İndir" : "Satın Al"}
                                </Button>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        )}
      </div>
      </div>
    </ProtectedRoute>
  )
}
