"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import Navbar from "@/components/navbar"
import ProtectedRoute from "@/components/ProtectedRoute"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"
import { saveInterviewResult, saveUserStats, getUserStats } from "@/lib/firestore"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Upload,
  FileText,
  MessageSquare,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Play,
  Pause,
  RotateCcw,
  TrendingUp,
  Eye,
  Brain,
  CheckCircle,
  Award,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react"

// Mock interview data
const mockQuestions = [
  "Kendinizi kısaca tanıtır mısınız?",
  "Bu pozisyona neden başvurdunuz?",
  "En büyük güçlü yönünüz nedir?",
  "Bir zorlukla karşılaştığınızda nasıl yaklaşırsınız?",
  "5 yıl sonra kendinizi nerede görüyorsunuz?",
]

const mockInterviewResult = {
  overallScore: 78,
  cvCompatibility: 85,
  stressManagement: 72,
  communicationSkills: 80,
  technicalKnowledge: 75,
  bodyLanguage: {
    eyeContact: 85,
    posture: 70,
    facialExpressions: 78,
  },
  feedback: [
    "Mükemmel göz teması kuruyorsunuz, bu güven verici",
    "Postürünüzü düzeltmeye odaklanın, daha dik oturun",
    "Teknik sorularda daha detaylı örnekler verebilirsiniz",
    "Stres yönetimi konusunda gelişim gösterebilirsiniz",
  ],
  recommendations: [
    "Teknik becerilerinizi örneklerle destekleyin",
    "Vücut dilinize dikkat edin, daha rahat durun",
    "Sorulara daha yapılandırılmış cevaplar verin",
    "Stresli durumlarda sakin kalma tekniklerini uygulayın",
  ],
  questions: [
    "Kendinizi kısaca tanıtır mısınız?",
    "Bu pozisyon için neden uygun olduğunuzu düşünüyorsunuz?",
    "En güçlü yönleriniz nelerdir?",
    "Zayıf yönleriniz nelerdir ve bunları nasıl geliştiriyorsunuz?",
    "Gelecek 5 yıl içindeki hedefleriniz nelerdir?"
  ],
}

export default function InterviewSimulationPage() {
  const [currentStep, setCurrentStep] = useState<"setup" | "interview" | "results">("setup")
  const [uploadedCV, setUploadedCV] = useState<File | null>(null)
  const [jobDescription, setJobDescription] = useState("")
  const [jdFit, setJdFit] = useState<any | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const [isCameraOn, setIsCameraOn] = useState(false)
  const [isMicOn, setIsMicOn] = useState(false)
  const [interviewStarted, setInterviewStarted] = useState(false)
  const [aiSpeaking, setAiSpeaking] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [cameraPermission, setCameraPermission] = useState<"pending" | "granted" | "denied">("denied")
  const [micPermission, setMicPermission] = useState<"pending" | "granted" | "denied">("denied")
  const [permissionError, setPermissionError] = useState<string | null>(null)
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)
  const [userVideoRef, setUserVideoRef] = useState<HTMLVideoElement | null>(null)
  const [isSavingInterview, setIsSavingInterview] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()
  
  // Global çift kaydetme koruması - daha güçlü
  const globalInterviewSavingState = useRef<Set<string>>(new Set())
  const lastSaveTime = useRef<number>(0)
  const [userSpeaking, setUserSpeaking] = useState(false)
  const [audioLevel, setAudioLevel] = useState(0)
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null)
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null)
  const [frequencyData, setFrequencyData] = useState<Uint8Array>(new Uint8Array(0))
  const [timeData, setTimeData] = useState<Uint8Array>(new Uint8Array(0))
  const [silenceTimer, setSilenceTimer] = useState(0)
  const [isSilent, setIsSilent] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  // Check browser support on component mount
  useEffect(() => {
    console.log("Tarayıcı desteği kontrol ediliyor...")
    console.log("navigator.mediaDevices:", !!navigator.mediaDevices)
    console.log("getUserMedia:", !!navigator.mediaDevices?.getUserMedia)
    console.log("HTTPS:", window.location.protocol === 'https:')
    
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setPermissionError("Bu tarayıcı kamera/mikrofon erişimini desteklemiyor. Lütfen güncel bir tarayıcı kullanın.")
    } else if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
      setPermissionError("Kamera ve mikrofon erişimi için HTTPS gerekli. Lütfen güvenli bağlantı kullanın.")
    }
  }, [])

  // Timer for recording
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isRecording])

  // Cleanup camera stream when component unmounts or interview ends
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop())
      }
    }
  }, [cameraStream])

  // Update video element when stream changes
  useEffect(() => {
    if (userVideoRef && cameraStream) {
      userVideoRef.srcObject = cameraStream
      userVideoRef.play().catch(console.error)
    }
  }, [userVideoRef, cameraStream])

  // Sessizlik timer'ı yönet
  useEffect(() => {
    let interval: NodeJS.Timeout

    // Sadece kullanıcı konuşmuyor, AI konuşmuyor ve mülakat aktifken çalış
    if (isSilent && currentStep === "interview" && !aiSpeaking && !isLoading) {
      interval = setInterval(() => {
        setSilenceTimer((prev) => {
          const newTime = prev + 1
          if (newTime >= 3) {
            // 3 saniye sessizlik tamamlandı, sonraki soruya geç
            nextQuestion()
            return 0
          }
          return newTime
        })
      }, 1000)
    } else {
      setSilenceTimer(0)
    }

    return () => clearInterval(interval)
  }, [isSilent, currentStep, aiSpeaking, isLoading])

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setUploadedCV(file)
    }
  }

  const requestCameraPermission = async () => {
    console.log("Kamera izni fonksiyonu çağrıldı!")
    setPermissionError(null)
    setCameraPermission("pending")
    
    try {
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Bu tarayıcı kamera erişimini desteklemiyor.")
      }
      
      console.log("Kamera izni isteniyor...")
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      })
      
      console.log("Kamera izni verildi!")
      setCameraPermission("granted")
      setIsCameraOn(true)
      
      // Stop the stream immediately as we just needed permission
      stream.getTracks().forEach(track => track.stop())
    } catch (error) {
      console.error("Kamera izni hatası:", error)
      setCameraPermission("denied")
      setIsCameraOn(false)
      if (error instanceof Error) {
        if (error.name === "NotAllowedError") {
          setPermissionError("Kamera izni reddedildi. Lütfen tarayıcı ayarlarından izin verin.")
        } else if (error.name === "NotFoundError") {
          setPermissionError("Kamera bulunamadı. Lütfen bir kamera bağlı olduğundan emin olun.")
        } else if (error.name === "NotSupportedError") {
          setPermissionError("Bu tarayıcı kamera erişimini desteklemiyor. HTTPS kullanıyor musunuz?")
        } else {
          setPermissionError(`Kamera izni alınırken bir hata oluştu: ${error.message}`)
        }
      } else {
        setPermissionError("Bilinmeyen bir hata oluştu.")
      }
    }
  }

  const requestMicrophonePermission = async () => {
    try {
      setPermissionError(null)
      setMicPermission("pending")
      
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Bu tarayıcı mikrofon erişimini desteklemiyor.")
      }
      
      console.log("Mikrofon izni isteniyor...")
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true
        }
      })
      
      console.log("Mikrofon izni verildi!")
      setMicPermission("granted")
      setIsMicOn(true)
      
      // Stop the stream immediately as we just needed permission
      stream.getTracks().forEach(track => track.stop())
    } catch (error) {
      console.error("Mikrofon izni hatası:", error)
      setMicPermission("denied")
      setIsMicOn(false)
      if (error instanceof Error) {
        if (error.name === "NotAllowedError") {
          setPermissionError("Mikrofon izni reddedildi. Lütfen tarayıcı ayarlarından izin verin.")
        } else if (error.name === "NotFoundError") {
          setPermissionError("Mikrofon bulunamadı. Lütfen bir mikrofon bağlı olduğundan emin olun.")
        } else if (error.name === "NotSupportedError") {
          setPermissionError("Bu tarayıcı mikrofon erişimini desteklemiyor. HTTPS kullanıyor musunuz?")
        } else {
          setPermissionError(`Mikrofon izni alınırken bir hata oluştu: ${error.message}`)
        }
      } else {
        setPermissionError("Bilinmeyen bir hata oluştu.")
      }
    }
  }

  const startAudioAnalysis = (stream: MediaStream) => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const analyser = audioContext.createAnalyser()
      const microphone = audioContext.createMediaStreamSource(stream)
      
      analyser.fftSize = 256
      analyser.smoothingTimeConstant = 0.8
      microphone.connect(analyser)
      
      setAudioContext(audioContext)
      setAnalyser(analyser)
      
      // Ses seviyesi analizi
      const frequencyArray = new Uint8Array(analyser.frequencyBinCount)
      const timeArray = new Uint8Array(analyser.frequencyBinCount)
      
      const analyzeAudio = () => {
        analyser.getByteFrequencyData(frequencyArray)
        analyser.getByteTimeDomainData(timeArray)
        
        // Frekans verilerini güncelle
        setFrequencyData(new Uint8Array(frequencyArray))
        setTimeData(new Uint8Array(timeArray))
        
        // Ortalama ses seviyesini hesapla
        let sum = 0
        for (let i = 0; i < frequencyArray.length; i++) {
          sum += frequencyArray[i]
        }
        const average = sum / frequencyArray.length
        const normalizedLevel = average / 255
        
        setAudioLevel(normalizedLevel)
        
        // Konuşma tespiti (eşik değeri) - daha hassas
        const isSpeaking = normalizedLevel > 0.005
        setUserSpeaking(isSpeaking)
        
        // Sessizlik tespiti (%20'nin altı) - AI konuşurken çalışmasın
        const isSilentNow = normalizedLevel < 0.2 && !aiSpeaking
        setIsSilent(isSilentNow)
        
        // Debug için konsola yazdır
        if (isSpeaking) {
          console.log(`Ses seviyesi: ${(normalizedLevel * 100).toFixed(1)}%`)
        }
        
        if (isSilentNow && currentStep === "interview" && !aiSpeaking && !isLoading) {
          console.log(`Sessizlik tespit edildi: ${(normalizedLevel * 100).toFixed(1)}% - Timer: ${silenceTimer}/3`)
        }
        
        if (audioContext.state === 'running') {
          requestAnimationFrame(analyzeAudio)
        }
      }
      
      analyzeAudio()
      console.log("Ses analizi başlatıldı!")
    } catch (error) {
      console.error("Ses analizi hatası:", error)
    }
  }

  const startCameraStream = async () => {
    try {
      console.log("Kamera stream başlatılıyor...")
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: true
      })
      
      setCameraStream(stream)
      console.log("Kamera stream başlatıldı!")
      
      // Video element'e stream'i bağla
      if (userVideoRef) {
        userVideoRef.srcObject = stream
        userVideoRef.play()
      }
      
      // Ses analizini başlat
      startAudioAnalysis(stream)
    } catch (error) {
      console.error("Kamera stream hatası:", error)
      setPermissionError("Kamera akışı başlatılamadı.")
    }
  }

  const stopCameraStream = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop())
      setCameraStream(null)
      if (userVideoRef) {
        userVideoRef.srcObject = null
      }
    }
    
    // Ses analizini durdur
    if (audioContext && audioContext.state !== 'closed') {
      audioContext.close()
      setAudioContext(null)
      setAnalyser(null)
      setUserSpeaking(false)
      setAudioLevel(0)
    }
  }

  const startInterview = async () => {
    if (!uploadedCV || !jobDescription.trim()) return
    
    // Kamera stream'ini başlat
    await startCameraStream()
    
    setCurrentStep("interview")
    setInterviewStarted(true)
    
    // Yeni mülakat başladığında global state'i temizle
    globalInterviewSavingState.current.clear()
    
    // Loading ekranını başlat
    setIsLoading(true)
    setLoadingProgress(0)
    
    // 5 saniye boyunca progress animasyonu
    const progressInterval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          setIsLoading(false)
          // Loading bittiğinde mülakatı başlat
          setAiSpeaking(true)
          setTimeout(() => {
            setAiSpeaking(false)
            // AI konuşması bittiğinde otomatik kayıt başlat
            setTimeout(() => {
              setIsRecording(true)
            }, 500) // 0.5 saniye bekle
          }, 3000)
          return 100
        }
        return prev + 2 // Her 100ms'de %2 artır (5 saniyede %100)
      })
    }, 100) // Her 100ms'de güncelle

    // JD uyum skorunu önceden hesapla (API'ye CV+JD gönder)
    try {
      const formData = new FormData()
      formData.append('file', uploadedCV)
      formData.append('sector', 'INFORMATION-TECHNOLOGY')
      formData.append('jd_text', jobDescription)
      const res = await fetch('/api/cv/score', { method: 'POST', body: formData })
      const data = await res.json()
      if (res.ok && data?.result?.jd_fit) {
        setJdFit(data.result.jd_fit)
      }
    } catch (e) {
      console.error('JD fit hesaplanamadı', e)
    }
  }

  const nextQuestion = () => {
    if (currentQuestion < mockQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setIsRecording(false)
      setRecordingTime(0)
      setSilenceTimer(0) // Sessizlik timer'ını sıfırla
      setIsSilent(false) // Sessizlik durumunu sıfırla
      // Simulate AI speaking
      setAiSpeaking(true)
      setTimeout(() => {
        setAiSpeaking(false)
        // AI konuşması bittiğinde otomatik kayıt başlat
        setTimeout(() => {
          setIsRecording(true)
        }, 500) // 0.5 saniye bekle
      }, 3000) // 3 saniye AI konuşması
    } else {
      // Interview completed - stop camera stream
      stopCameraStream()
      setCurrentStep("results")
      setIsRecording(false)
      setSilenceTimer(0)
      setIsSilent(false)
      
      // Mülakat sonuçlarını Firebase'e kaydet
      saveInterviewToFirebase()
    }
  }

  const saveInterviewToFirebase = async () => {
    if (!user) return

    // Zaman bazlı koruma - son 5 saniye içinde kaydetme yapıldıysa engelle
    const now = Date.now()
    if (now - lastSaveTime.current < 5000) {
      console.log(`[${now}] Son 5 saniye içinde kaydetme yapıldı, çift kaydetme önlendi`)
      return
    }

    // Unique key oluştur - mülakat için
    const interviewKey = `interview_${user.uid}_${now}`
    
    // Global çift kaydetme koruması - useRef ile
    if (globalInterviewSavingState.current.has(interviewKey) || isSavingInterview) {
      console.log(`[${interviewKey}] Bu mülakat zaten kaydediliyor, çift kaydetme önlendi`)
      return
    }

    // Zaman damgasını güncelle
    lastSaveTime.current = now
    
    // Global state'e ekle
    globalInterviewSavingState.current.add(interviewKey)
    setIsSavingInterview(true)

    try {
      console.log(`[${interviewKey}] Mülakat sonucu kaydediliyor...`)
      // Mülakat sonucunu kaydet
      await saveInterviewResult({
        userId: user.uid,
        overallScore: mockInterviewResult.overallScore,
        cvCompatibility: mockInterviewResult.cvCompatibility,
        stressManagement: mockInterviewResult.stressManagement,
        communicationSkills: mockInterviewResult.communicationSkills,
        technicalKnowledge: mockInterviewResult.technicalKnowledge,
        bodyLanguage: mockInterviewResult.bodyLanguage,
        feedback: mockInterviewResult.feedback,
        recommendations: mockInterviewResult.recommendations,
        questions: mockInterviewResult.questions,
        duration: recordingTime
      })

      // Kullanıcı istatistiklerini güncelle
      const currentStats = await getUserStats(user.uid)
      const newStats = {
        userId: user.uid,
        currentRank: currentStats?.currentRank || 12,
        totalScore: (currentStats?.totalScore || 0) + mockInterviewResult.overallScore,
        cvScore: currentStats?.cvScore || 0,
        interviewScore: mockInterviewResult.overallScore,
        badge: currentStats?.badge || "Yeni Katılımcı",
        level: currentStats?.level || "Başlangıç",
        completedAnalyses: currentStats?.completedAnalyses || 0,
        completedInterviews: (currentStats?.completedInterviews || 0) + 1,
        totalActiveDays: currentStats?.totalActiveDays || 1,
        streak: currentStats?.streak || 1,
        lastActivityDate: new Date()
      }

      await saveUserStats(newStats)
      
      console.log(`[${interviewKey}] Mülakat sonucu ve istatistikler Firebase'e kaydedildi`)
      console.log(`[${interviewKey}] Kaydedilen mülakat sonucu:`, {
        userId: user.uid,
        overallScore: mockInterviewResult.overallScore,
        duration: recordingTime
      })
      console.log(`[${interviewKey}] Kaydedilen kullanıcı istatistikleri:`, newStats)
    } catch (error) {
      console.error('Firebase kaydetme hatası:', error)
      // Hata durumunda global state'den kaldır
      globalInterviewSavingState.current.delete(interviewKey)
    } finally {
      setIsSavingInterview(false)
      // Başarılı kaydetme sonrası global state'den kaldır
      globalInterviewSavingState.current.delete(interviewKey)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-secondary"
    if (score >= 60) return "text-primary"
    return "text-accent"
  }

  const getScoreStatus = (score: number) => {
    if (score >= 80) return "excellent"
    if (score >= 60) return "good"
    return "needs-improvement"
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-6 shadow-lg">
            <MessageSquare className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Mülakat Simülasyonu
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Gerçekçi mülakat deneyimi yaşayın, performansınızı ölçün ve güçlü yönlerinizi keşfedin
          </p>
        </div>

        {currentStep === "setup" && (
          <div className="max-w-4xl mx-auto space-y-8">
            {/* CV Upload */}
            <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-3 text-xl">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                    <Upload className="w-6 h-6 text-white" />
                  </div>
                  <span className="bg-gradient-to-r from-slate-700 to-slate-900 dark:from-slate-200 dark:to-slate-100 bg-clip-text text-transparent">CV Yükleme</span>
                </CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400 text-base">Mülakat simülasyonu için CV'nizi yükleyin</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-8 text-center hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-all duration-300 group">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="cv-upload"
                  />
                  <label htmlFor="cv-upload" className="cursor-pointer">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                      <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <p className="font-semibold text-slate-700 dark:text-slate-300 mb-2 text-lg">CV'nizi seçin</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">PDF, DOC, DOCX formatları desteklenir</p>
                  </label>
                </div>
                {uploadedCV && (
                  <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-800 flex items-center space-x-3 animate-in slide-in-from-top-2 duration-300">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <FileText className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="font-semibold text-slate-700 dark:text-slate-300 flex-1">{uploadedCV.name}</span>
                    <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Job Description */}
            <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-3 text-xl">
                  <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <span className="bg-gradient-to-r from-slate-700 to-slate-900 dark:from-slate-200 dark:to-slate-100 bg-clip-text text-transparent">İş İlanı</span>
                </CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400 text-base">Başvurduğunuz pozisyonun iş ilanını yapıştırın</CardDescription>
              </CardHeader>
              <CardContent>
                <Label htmlFor="job-description" className="text-slate-700 dark:text-slate-300 font-semibold">İş İlanı Metni</Label>
                <Textarea
                  id="job-description"
                  placeholder="İş ilanının tamamını buraya yapıştırın..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="min-h-32 mt-3 border-slate-300 dark:border-slate-600 focus:border-purple-500 focus:ring-purple-500/20 rounded-xl resize-none"
                />
              </CardContent>
            </Card>

            {/* Camera & Mic Setup */}
            <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-3 text-xl">
                  <div className="p-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg">
                    <Video className="w-6 h-6 text-white" />
                  </div>
                  <span className="bg-gradient-to-r from-slate-700 to-slate-900 dark:from-slate-200 dark:to-slate-100 bg-clip-text text-transparent">Kamera ve Mikrofon Ayarları</span>
                </CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400 text-base">Mülakat için kamera ve mikrofon izinlerini verin</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Camera Permission */}
                  <div className="flex items-center justify-between p-6 border border-slate-200 dark:border-slate-700 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 hover:shadow-md transition-all duration-300">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-lg">
                        <Video className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-700 dark:text-slate-300">Kamera İzni</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Mülakat sırasında görüntü kaydı için gerekli</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {cameraPermission === "granted" && (
                        <div className="flex items-center space-x-2 text-secondary">
                          <CheckCircle2 className="w-4 h-4" />
                          <span className="text-sm">İzin Verildi</span>
                        </div>
                      )}
                      {cameraPermission === "denied" && (
                        <div className="flex items-center space-x-2 text-destructive">
                          <AlertCircle className="w-4 h-4" />
                          <span className="text-sm">İzin Reddedildi</span>
                        </div>
                      )}
                      {cameraPermission === "pending" && (
                        <div className="flex items-center space-x-2 text-muted-foreground">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="text-sm">İzin Bekleniyor</span>
                        </div>
                      )}
                      <Button
                        variant={cameraPermission === "granted" ? "outline" : "default"}
                        onClick={() => {
                          console.log("Kamera butonu tıklandı!")
                          requestCameraPermission()
                        }}
                        disabled={false}
                        className={`flex items-center space-x-2 px-6 py-2 rounded-lg font-semibold transition-all duration-300 ${
                          cameraPermission === "granted" 
                            ? "border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20" 
                            : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl"
                        }`}
                      >
                        <Video className="w-4 h-4" />
                        <span>{cameraPermission === "granted" ? "İzin Verildi" : "Kamera İzni Ver"}</span>
                      </Button>
                    </div>
                  </div>

                  {/* Microphone Permission */}
                  <div className="flex items-center justify-between p-6 border border-slate-200 dark:border-slate-700 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 hover:shadow-md transition-all duration-300">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 rounded-lg">
                        <Mic className="w-6 h-6 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-700 dark:text-slate-300">Mikrofon İzni</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Mülakat sırasında ses kaydı için gerekli</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {micPermission === "granted" && (
                        <div className="flex items-center space-x-2 text-secondary">
                          <CheckCircle2 className="w-4 h-4" />
                          <span className="text-sm">İzin Verildi</span>
                        </div>
                      )}
                      {micPermission === "denied" && (
                        <div className="flex items-center space-x-2 text-destructive">
                          <AlertCircle className="w-4 h-4" />
                          <span className="text-sm">İzin Reddedildi</span>
                        </div>
                      )}
                      {micPermission === "pending" && (
                        <div className="flex items-center space-x-2 text-muted-foreground">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="text-sm">İzin Bekleniyor</span>
                        </div>
                      )}
                      <Button
                        variant={micPermission === "granted" ? "outline" : "default"}
                        onClick={() => {
                          console.log("Mikrofon butonu tıklandı!")
                          requestMicrophonePermission()
                        }}
                        disabled={false}
                        className={`flex items-center space-x-2 px-6 py-2 rounded-lg font-semibold transition-all duration-300 ${
                          micPermission === "granted" 
                            ? "border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20" 
                            : "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl"
                        }`}
                      >
                        <Mic className="w-4 h-4" />
                        <span>{micPermission === "granted" ? "İzin Verildi" : "Mikrofon İzni Ver"}</span>
                      </Button>
                    </div>
                  </div>

                  {/* Permission Error */}
                  {permissionError && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{permissionError}</AlertDescription>
                    </Alert>
                  )}

                  {/* Success Message */}
                  {cameraPermission === "granted" && micPermission === "granted" && (
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>Kamera ve mikrofon izinleri verildi! Mülakata başlayabilirsiniz.</AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Mülakat Bilgilendirmesi */}
            <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20">
              <CardContent className="pt-6">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
                      <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-1">
                      Mülakat Bilgilendirmesi
                    </h3>
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      Mülakat sırasında <strong>3 saniye sessiz kalırsanız</strong> otomatik olarak sonraki soruya geçilecektir. 
                      Bu sayede mülakat daha akıcı ilerleyecektir.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Start Interview */}
            <div className="text-center pt-8">
              <Button
                size="lg"
                onClick={startInterview}
                disabled={!uploadedCV || !jobDescription.trim() || cameraPermission !== "granted" || micPermission !== "granted"}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-12 py-4 text-lg font-semibold rounded-xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <Play className="w-6 h-6 mr-3" />
                Mülakata Başla
              </Button>
              {(!uploadedCV || !jobDescription.trim() || cameraPermission !== "granted" || micPermission !== "granted") && (
                <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    <strong>Mülakata başlamak için:</strong> CV yüklemeniz, iş ilanı girmeniz ve kamera/mikrofon izinlerini vermeniz gerekiyor.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {currentStep === "interview" && (
          <div className="max-w-6xl mx-auto">
            {isLoading ? (
              // Loading Screen
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
                      MÜLAKAT HAZIRLANIYOR...
                    </h2>
                    <p className="text-slate-300 animate-fade-in">
                      AI mülakatçı hazırlanıyor, lütfen bekleyin
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
            ) : (
              <div className="grid lg:grid-cols-3 gap-8">
              {/* Video Section */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between mb-4">
                      <CardTitle className="flex items-center space-x-2">
                        <Video className="w-5 h-5" />
                        <span>Mülakat Odası</span>
                      </CardTitle>
                      <Badge variant="secondary">
                        Soru {currentQuestion + 1}/{mockQuestions.length}
                      </Badge>
                    </div>
                    
                    {/* Current Question - Moved to top */}
                    <div className="text-center bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                      <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-3">
                        {mockQuestions[currentQuestion]}
                      </h3>
                      {aiSpeaking && (
                        <div className="flex items-center justify-center space-x-2 text-green-600 dark:text-green-400">
                          <div className="flex space-x-0.5">
                            <div className="w-1 h-3 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-1 h-5 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '100ms' }}></div>
                            <div className="w-1 h-2 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '200ms' }}></div>
                            <div className="w-1 h-6 bg-green-600 rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></div>
                            <div className="w-1 h-4 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '400ms' }}></div>
                            <div className="w-1 h-3 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '500ms' }}></div>
                            <div className="w-1 h-5 bg-green-600 rounded-full animate-pulse" style={{ animationDelay: '600ms' }}></div>
                            <div className="w-1 h-2 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '700ms' }}></div>
                            <div className="w-1 h-4 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '800ms' }}></div>
                            <div className="w-1 h-6 bg-green-600 rounded-full animate-pulse" style={{ animationDelay: '900ms' }}></div>
                          </div>
                          <span className="ml-3 text-sm font-medium">AI konuşuyor...</span>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="relative bg-gradient-to-br from-slate-100 via-blue-50 to-purple-50 dark:from-slate-800 dark:via-blue-900/20 dark:to-purple-900/20 rounded-xl aspect-video flex items-center justify-center mb-4 border border-slate-200 dark:border-slate-700 shadow-inner">
                      {/* AI Avatar */}
                      <div className="absolute top-4 left-4">
                        <div
                          className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
                            aiSpeaking
                              ? "bg-gradient-to-br from-blue-500 to-purple-600 animate-pulse scale-110 shadow-lg shadow-blue-500/30"
                              : "bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30"
                          }`}
                        >
                          <MessageSquare className={`w-8 h-8 ${aiSpeaking ? "text-white" : "text-blue-600 dark:text-blue-400"}`} />
                        </div>
                      </div>

                      {/* Sessizlik Timer Göstergesi - Sağ Üst */}
                      {isSilent && !aiSpeaking && silenceTimer > 0 && (
                        <div className="absolute top-4 right-4">
                          <div className="inline-flex items-center space-x-2 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-3 py-2 rounded-full border border-amber-200 dark:border-amber-800">
                            <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                            <span className="text-xs font-medium">
                              Ses tespit edilemedi ({3 - silenceTimer}s)
                            </span>
                          </div>
                        </div>
                      )}

                      {/* User Video */}
                      <div className="absolute bottom-4 right-4 w-32 h-24 bg-background rounded-lg border-2 border-border overflow-hidden">
                        {cameraStream ? (
                          <div className="relative w-full h-full">
                            <video
                              ref={setUserVideoRef}
                              autoPlay
                              muted
                              playsInline
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="text-center">
                              <Video className="w-6 h-6 text-muted-foreground mx-auto mb-1" />
                              <p className="text-xs text-muted-foreground">Siz</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Speaking Indicators */}
                      {(aiSpeaking || userSpeaking || isSilent) && (
                        <div className="flex flex-col items-center space-y-2">
                          {aiSpeaking && (
                            <div className="flex items-center space-x-2 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-4 py-2 rounded-full">
                              <div className="flex space-x-0.5">
                                <div className="w-1 h-2 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
                                <div className="w-1 h-4 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '100ms' }}></div>
                                <div className="w-1 h-3 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '200ms' }}></div>
                                <div className="w-1 h-5 bg-green-600 rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></div>
                                <div className="w-1 h-2 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '400ms' }}></div>
                                <div className="w-1 h-4 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '500ms' }}></div>
                                <div className="w-1 h-6 bg-green-600 rounded-full animate-pulse" style={{ animationDelay: '600ms' }}></div>
                                <div className="w-1 h-3 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '700ms' }}></div>
                              </div>
                              <span className="text-sm font-medium">AI konuşuyor...</span>
                            </div>
                          )}
                          
                          {userSpeaking && frequencyData.length > 0 && (
                            <div className="flex items-center space-x-4 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-6 py-3 rounded-full">
                              <svg width="120" height="30" className="overflow-visible">
                                <defs>
                                  <linearGradient id="waveGradientSmall" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#4ade80" />
                                    <stop offset="50%" stopColor="#22c55e" />
                                    <stop offset="100%" stopColor="#16a34a" />
                                  </linearGradient>
                                </defs>
                                <path
                                  d={(() => {
                                    const width = 120
                                    const height = 30
                                    const centerY = height / 2
                                    const step = width / (frequencyData.length / 8) // Her 8 veri noktası için bir adım
                                    
                                    let path = `M 0 ${centerY}`
                                    
                                    for (let i = 0; i < frequencyData.length / 8; i++) {
                                      const x = i * step
                                      const amplitude = (frequencyData[i * 8] / 255) * (height / 2) * 0.9
                                      const y = centerY - amplitude
                                      path += ` L ${x} ${y}`
                                    }
                                    
                                    // Alt yarı için
                                    for (let i = frequencyData.length / 8 - 1; i >= 0; i--) {
                                      const x = i * step
                                      const amplitude = (frequencyData[i * 8] / 255) * (height / 2) * 0.9
                                      const y = centerY + amplitude
                                      path += ` L ${x} ${y}`
                                    }
                                    
                                    path += ' Z'
                                    return path
                                  })()}
                                  fill="url(#waveGradientSmall)"
                                  fillOpacity="0.4"
                                  stroke="url(#waveGradientSmall)"
                                  strokeWidth="1.5"
                                  className="animate-pulse"
                                />
                              </svg>
                              <span className="text-sm font-medium">Siz konuşuyorsunuz... ({(audioLevel * 100).toFixed(0)}%)</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Recording Status */}
                    {isRecording && (
                      <div className="flex items-center justify-center">
                        <div className="flex items-center space-x-2 text-destructive">
                          <div className="w-3 h-3 bg-destructive rounded-full animate-pulse"></div>
                          <span className="font-mono">{formatTime(recordingTime)}</span>
                          <span className="text-sm text-muted-foreground">Kayıt devam ediyor...</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Progress & Info */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">İlerleme</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Progress value={((currentQuestion + 1) / mockQuestions.length) * 100} className="w-full mb-2" />
                    <p className="text-sm text-muted-foreground">
                      {currentQuestion + 1} / {mockQuestions.length} soru tamamlandı
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <Eye className="w-5 h-5 text-primary" />
                      <span>Anlık Analiz</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Göz Teması</span>
                      <span className="text-sm font-medium text-secondary">İyi</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Postür</span>
                      <span className="text-sm font-medium text-accent">Orta</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Ses Tonu</span>
                      <span className="text-sm font-medium text-primary">İyi</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <Brain className="w-5 h-5 text-secondary" />
                      <span>İpuçları</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-sm text-muted-foreground space-y-2">
                      <li>• Göz temasını koruyun</li>
                      <li>• Dik oturun ve rahat durun</li>
                      <li>• Örneklerle destekleyin</li>
                      <li>• Sakin ve net konuşun</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
            )}
          </div>
        )}

        {currentStep === "results" && (
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-secondary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Mülakat Tamamlandı!</h2>
              <p className="text-muted-foreground">Performansınızın detaylı analizi aşağıda</p>
            </div>

            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
                <TabsTrigger value="skills">Beceriler</TabsTrigger>
                <TabsTrigger value="body-language">Vücut Dili</TabsTrigger>
                <TabsTrigger value="feedback">Geri Bildirim</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Genel Skor</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-foreground mb-2">
                        {mockInterviewResult.overallScore}/100
                      </div>
                      <Progress value={mockInterviewResult.overallScore} className="w-full" />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground">CV Uyumluluğu</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-secondary mb-2">
                        {mockInterviewResult.cvCompatibility}/100
                      </div>
                      <Progress value={mockInterviewResult.cvCompatibility} className="w-full" />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Stres Yönetimi</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-accent mb-2">
                        {mockInterviewResult.stressManagement}/100
                      </div>
                      <Progress value={mockInterviewResult.stressManagement} className="w-full" />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground">İletişim</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-primary mb-2">
                        {mockInterviewResult.communicationSkills}/100
                      </div>
                      <Progress value={mockInterviewResult.communicationSkills} className="w-full" />
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="skills" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Beceri Analizi</CardTitle>
                    <CardDescription>Mülakat sırasında sergilediğiniz becerilerin değerlendirmesi</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Teknik Bilgi</span>
                        <span className={`font-semibold ${getScoreColor(mockInterviewResult.technicalKnowledge)}`}>
                          {mockInterviewResult.technicalKnowledge}/100
                        </span>
                      </div>
                      <Progress value={mockInterviewResult.technicalKnowledge} className="w-full" />
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">İletişim Becerileri</span>
                        <span className={`font-semibold ${getScoreColor(mockInterviewResult.communicationSkills)}`}>
                          {mockInterviewResult.communicationSkills}/100
                        </span>
                      </div>
                      <Progress value={mockInterviewResult.communicationSkills} className="w-full" />
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Stres Yönetimi</span>
                        <span className={`font-semibold ${getScoreColor(mockInterviewResult.stressManagement)}`}>
                          {mockInterviewResult.stressManagement}/100
                        </span>
                      </div>
                      <Progress value={mockInterviewResult.stressManagement} className="w-full" />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="body-language" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Eye className="w-5 h-5" />
                      <span>Vücut Dili Analizi</span>
                    </CardTitle>
                    <CardDescription>Kamera analizi ile tespit edilen vücut dili değerlendirmesi</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Göz Teması</span>
                        <span className={`font-semibold ${getScoreColor(mockInterviewResult.bodyLanguage.eyeContact)}`}>
                          {mockInterviewResult.bodyLanguage.eyeContact}/100
                        </span>
                      </div>
                      <Progress value={mockInterviewResult.bodyLanguage.eyeContact} className="w-full" />
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Postür</span>
                        <span className={`font-semibold ${getScoreColor(mockInterviewResult.bodyLanguage.posture)}`}>
                          {mockInterviewResult.bodyLanguage.posture}/100
                        </span>
                      </div>
                      <Progress value={mockInterviewResult.bodyLanguage.posture} className="w-full" />
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Yüz İfadeleri</span>
                        <span
                          className={`font-semibold ${getScoreColor(mockInterviewResult.bodyLanguage.facialExpressions)}`}
                        >
                          {mockInterviewResult.bodyLanguage.facialExpressions}/100
                        </span>
                      </div>
                      <Progress value={mockInterviewResult.bodyLanguage.facialExpressions} className="w-full" />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="feedback" className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2 text-secondary">
                        <CheckCircle className="w-5 h-5" />
                        <span>Güçlü Yönler</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {mockInterviewResult.feedback.map((item, index) => (
                        <div key={index} className="flex items-start space-x-2">
                          <CheckCircle className="w-4 h-4 text-secondary mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">{item}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2 text-accent">
                        <TrendingUp className="w-5 h-5" />
                        <span>Gelişim Önerileri</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {mockInterviewResult.recommendations.map((item, index) => (
                        <div key={index} className="flex items-start space-x-2">
                          <TrendingUp className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">{item}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>

                <div className="text-center">
                  <Button
                    onClick={() => {
                      stopCameraStream()
                      setCurrentStep("setup")
                      setCurrentQuestion(0)
                      setIsRecording(false)
                      setRecordingTime(0)
                      setInterviewStarted(false)
                    }}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Yeni Mülakat Başlat
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
      </div>
    </ProtectedRoute>
  )
}
