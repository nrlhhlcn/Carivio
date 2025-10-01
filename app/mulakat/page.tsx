"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Navbar from "@/components/navbar"
import ProtectedRoute from "@/components/ProtectedRoute"
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
}

export default function InterviewSimulationPage() {
  const [currentStep, setCurrentStep] = useState<"setup" | "interview" | "results">("setup")
  const [uploadedCV, setUploadedCV] = useState<File | null>(null)
  const [jobDescription, setJobDescription] = useState("")
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const [isCameraOn, setIsCameraOn] = useState(false)
  const [isMicOn, setIsMicOn] = useState(false)
  const [interviewStarted, setInterviewStarted] = useState(false)
  const [aiSpeaking, setAiSpeaking] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)

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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setUploadedCV(file)
    }
  }

  const startInterview = () => {
    if (!uploadedCV || !jobDescription.trim()) return
    setCurrentStep("interview")
    setInterviewStarted(true)
    // Simulate AI speaking
    setAiSpeaking(true)
    setTimeout(() => setAiSpeaking(false), 3000)
  }

  const nextQuestion = () => {
    if (currentQuestion < mockQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setIsRecording(false)
      setRecordingTime(0)
      // Simulate AI speaking
      setAiSpeaking(true)
      setTimeout(() => setAiSpeaking(false), 2000)
    } else {
      // Interview completed
      setCurrentStep("results")
      setIsRecording(false)
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
      <div className="min-h-screen bg-background">
        <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Mülakat Simülasyonu</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Gerçekçi mülakat deneyimi yaşayın, performansınızı ölçün ve güçlü yönlerinizi keşfedin
          </p>
        </div>

        {currentStep === "setup" && (
          <div className="max-w-4xl mx-auto space-y-8">
            {/* CV Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Upload className="w-6 h-6 text-primary" />
                  <span>CV Yükleme</span>
                </CardTitle>
                <CardDescription>Mülakat simülasyonu için CV'nizi yükleyin</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="cv-upload"
                  />
                  <label htmlFor="cv-upload" className="cursor-pointer">
                    <FileText className="w-12 h-12 text-primary mx-auto mb-3" />
                    <p className="font-medium text-foreground mb-1">CV'nizi seçin</p>
                    <p className="text-sm text-muted-foreground">PDF, DOC, DOCX formatları</p>
                  </label>
                </div>
                {uploadedCV && (
                  <div className="mt-4 p-3 bg-muted/50 rounded-lg flex items-center space-x-3">
                    <FileText className="w-5 h-5 text-primary" />
                    <span className="font-medium text-foreground">{uploadedCV.name}</span>
                    <CheckCircle className="w-5 h-5 text-secondary" />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Job Description */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="w-6 h-6 text-secondary" />
                  <span>İş İlanı</span>
                </CardTitle>
                <CardDescription>Başvurduğunuz pozisyonun iş ilanını yapıştırın</CardDescription>
              </CardHeader>
              <CardContent>
                <Label htmlFor="job-description">İş İlanı Metni</Label>
                <Textarea
                  id="job-description"
                  placeholder="İş ilanının tamamını buraya yapıştırın..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="min-h-32 mt-2"
                />
              </CardContent>
            </Card>

            {/* Camera & Mic Setup */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Video className="w-6 h-6 text-accent" />
                  <span>Kamera ve Mikrofon Ayarları</span>
                </CardTitle>
                <CardDescription>Mülakat için kamera ve mikrofon izinlerini verin</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    variant={isCameraOn ? "default" : "outline"}
                    onClick={() => setIsCameraOn(!isCameraOn)}
                    className="flex items-center space-x-2"
                  >
                    {isCameraOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                    <span>{isCameraOn ? "Kamera Açık" : "Kamerayı Aç"}</span>
                  </Button>
                  <Button
                    variant={isMicOn ? "default" : "outline"}
                    onClick={() => setIsMicOn(!isMicOn)}
                    className="flex items-center space-x-2"
                  >
                    {isMicOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                    <span>{isMicOn ? "Mikrofon Açık" : "Mikrofonu Aç"}</span>
                  </Button>
                </div>
                {isCameraOn && isMicOn && (
                  <Alert className="mt-4">
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>Kamera ve mikrofon hazır! Mülakata başlayabilirsiniz.</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Start Interview */}
            <div className="text-center">
              <Button
                size="lg"
                onClick={startInterview}
                disabled={!uploadedCV || !jobDescription.trim() || !isCameraOn || !isMicOn}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3"
              >
                Mülakata Başla
                <Play className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {currentStep === "interview" && (
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Video Section */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center space-x-2">
                        <Video className="w-5 h-5" />
                        <span>Mülakat Odası</span>
                      </CardTitle>
                      <Badge variant="secondary">
                        Soru {currentQuestion + 1}/{mockQuestions.length}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="relative bg-muted/30 rounded-lg aspect-video flex items-center justify-center mb-4">
                      {/* AI Avatar */}
                      <div className="absolute top-4 left-4">
                        <div
                          className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
                            aiSpeaking
                              ? "bg-gradient-to-br from-primary to-secondary animate-pulse scale-110"
                              : "bg-primary/20"
                          }`}
                        >
                          <MessageSquare className={`w-8 h-8 ${aiSpeaking ? "text-white" : "text-primary"}`} />
                        </div>
                      </div>

                      {/* User Video Placeholder */}
                      <div className="absolute bottom-4 right-4 w-32 h-24 bg-background rounded-lg border-2 border-border flex items-center justify-center">
                        <div className="text-center">
                          <Video className="w-6 h-6 text-muted-foreground mx-auto mb-1" />
                          <p className="text-xs text-muted-foreground">Siz</p>
                        </div>
                      </div>

                      {/* Current Question */}
                      <div className="text-center max-w-2xl px-8">
                        <h3 className="text-2xl font-semibold text-foreground mb-4">
                          {mockQuestions[currentQuestion]}
                        </h3>
                        {aiSpeaking && (
                          <div className="flex items-center justify-center space-x-2 text-primary">
                            <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-100"></div>
                            <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-200"></div>
                            <span className="ml-2 text-sm">AI konuşuyor...</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Recording Controls */}
                    <div className="flex items-center justify-center space-x-4">
                      <Button
                        variant={isRecording ? "destructive" : "default"}
                        onClick={() => setIsRecording(!isRecording)}
                        className="flex items-center space-x-2"
                        disabled={aiSpeaking}
                      >
                        {isRecording ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        <span>{isRecording ? "Duraklat" : "Cevapla"}</span>
                      </Button>
                      {isRecording && (
                        <div className="flex items-center space-x-2 text-destructive">
                          <div className="w-3 h-3 bg-destructive rounded-full animate-pulse"></div>
                          <span className="font-mono">{formatTime(recordingTime)}</span>
                        </div>
                      )}
                      <Button variant="outline" onClick={nextQuestion} disabled={aiSpeaking}>
                        Sonraki Soru
                      </Button>
                    </div>
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
