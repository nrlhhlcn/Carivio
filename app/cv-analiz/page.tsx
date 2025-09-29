"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Navbar from "@/components/navbar"
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

const mockAnalysisResult = {
  overallScore: 78,
  sections: {
    personalInfo: { score: 85, status: "good", feedback: "İletişim bilgileri tam, ancak LinkedIn profili eklenebilir" },
    experience: {
      score: 72,
      status: "needs-improvement",
      feedback: "İş deneyimleri var ama başarılar daha net belirtilmeli",
    },
    education: { score: 88, status: "excellent", feedback: "Eğitim geçmişi güçlü ve uygun" },
    skills: { score: 65, status: "needs-improvement", feedback: "Teknik beceriler güncellenip detaylandırılmalı" },
    projects: { score: 70, status: "needs-improvement", feedback: "Proje örnekleri az, daha fazla detay gerekli" },
  },
  recommendations: [
    "LinkedIn profilinizi CV'nize ekleyin",
    "İş deneyimlerinizde sayısal başarılarınızı belirtin (örn: %20 artış sağladım)",
    "Güncel teknolojileri beceriler kısmına ekleyin",
    "En az 2-3 proje örneği detaylarıyla ekleyin",
    "Referanslarınızı belirtin",
  ],
  templates: [
    { name: "Basit & Temiz", price: "Ücretsiz", popular: true },
    { name: "Modern Tasarım", price: "₺25", popular: false },
    { name: "Kreatif", price: "₺35", popular: false },
    { name: "Klasik", price: "₺15", popular: false },
  ],
}

export default function CVAnalysisPage() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisComplete, setAnalysisComplete] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  useEffect(() => {
    if (isAnalyzing) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval)
            return 100
          }
          return prev + Math.random() * 15
        })
      }, 200)
      return () => clearInterval(interval)
    } else {
      setProgress(0)
    }
  }, [isAnalyzing])

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setUploadedFile(file)
      setAnalysisComplete(false)
      setShowResults(false)
    }
  }

  const handleAnalyze = () => {
    if (!uploadedFile) return

    setIsAnalyzing(true)
    setProgress(0)
    setTimeout(() => {
      setIsAnalyzing(false)
      setAnalysisComplete(true)
      setShowResults(true)
    }, 3000)
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
        </div>

        {!showResults ? (
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
                        disabled={isAnalyzing}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg font-semibold rounded-xl shadow-lg hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105 group"
                      >
                        {isAnalyzing ? (
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

            {isAnalyzing && (
              <Card className="mb-8 border-0 shadow-xl bg-gradient-to-br from-blue-50 to-purple-50 animate-in slide-in-from-bottom duration-500">
                <CardContent className="pt-8 pb-8">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-pulse shadow-2xl">
                      <Sparkles className="w-10 h-10 text-white animate-spin" style={{ animationDuration: "2s" }} />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">CV'niz inceleniyor</h3>
                    <p className="text-gray-600 mb-6 text-lg">Yapay zeka teknolojisi ile detaylı analiz yapılıyor...</p>
                    <div className="w-full max-w-md mx-auto bg-gray-200 rounded-full h-4 mb-4 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-4 rounded-full transition-all duration-300 ease-out"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                    <p className="text-sm text-gray-500">{Math.round(Math.min(progress, 100))}% tamamlandı</p>
                  </div>
                </CardContent>
              </Card>
            )}

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
                              {mockAnalysisResult.overallScore}
                            </span>
                            <span className="text-gray-500 text-xl">/100</span>
                          </div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="w-full bg-gray-200 rounded-full h-4 mb-4 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-4 rounded-full transition-all duration-2000 ease-out"
                            style={{ width: `${mockAnalysisResult.overallScore}%` }}
                          />
                        </div>
                        <p className="text-gray-600 text-lg">
                          CV'niz iyi durumda, birkaç iyileştirme ile daha güçlü hale gelebilir.
                        </p>
                      </CardContent>
                    </Card>

                    <div className="space-y-4">
                      {Object.entries(mockAnalysisResult.sections).map(([key, section], index) => (
                        <Card
                          key={key}
                          className="border-0 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1 group animate-in slide-in-from-left"
                          style={{ animationDelay: `${index * 0.1}s` }}
                        >
                          <CardContent className="pt-6">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center space-x-4">
                                {getStatusIcon(section.status)}
                                <h3 className="font-semibold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">
                                  {key === "personalInfo" && "Kişisel Bilgiler"}
                                  {key === "experience" && "İş Deneyimi"}
                                  {key === "education" && "Eğitim"}
                                  {key === "skills" && "Beceriler"}
                                  {key === "projects" && "Projeler"}
                                </h3>
                              </div>
                              <span className={`font-bold text-xl ${getStatusColor(section.status)}`}>
                                {section.score}/100
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3 mb-3 overflow-hidden">
                              <div
                                className={`h-3 rounded-full transition-all duration-1000 ease-out ${
                                  section.status === "excellent"
                                    ? "bg-gradient-to-r from-green-400 to-green-600"
                                    : section.status === "good"
                                      ? "bg-gradient-to-r from-blue-400 to-blue-600"
                                      : "bg-gradient-to-r from-orange-400 to-orange-600"
                                }`}
                                style={{ width: `${section.score}%` }}
                              />
                            </div>
                            <p className="text-gray-600 leading-relaxed">{section.feedback}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
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
                        {mockAnalysisResult.recommendations.map((recommendation, index) => (
                          <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-xs font-medium text-blue-600">{index + 1}</span>
                            </div>
                            <p className="text-gray-700">{recommendation}</p>
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
                          {mockAnalysisResult.templates.map((template, index) => (
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
  )
}
