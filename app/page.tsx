"use client"

import Navbar from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import {
  FileText,
  MessageSquare,
  Trophy,
  Users,
  CheckCircle,
  Star,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Target,
  Award,
} from "lucide-react"
import { useEffect, useState } from "react"

export default function HomePage() {
  const [isVisible, setIsVisible] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    setIsVisible(true)

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  const features = [
    {
      icon: FileText,
      title: "CV Analizi",
      description:
        "CV'nizi detaylı analiz ederek hangi alanlarda güçlü olduğunuzu ve nereleri geliştirmeniz gerektiğini öğrenin.",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      size: "large",
    },
    {
      icon: MessageSquare,
      title: "Mülakat Pratiği",
      description: "Gerçek mülakat ortamını simüle eden sistemle pratik yapın.",
      color: "text-green-600",
      bgColor: "bg-green-50",
      size: "medium",
    },
    {
      icon: Trophy,
      title: "Sıralama",
      description: "Diğer kullanıcılarla kıyaslayın ve ilerlemenizi takip edin.",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      size: "small",
    },
  ]

  const benefits = [
    "CV'nizde eksik olan kısımları bulun",
    "Mülakat sorularına hazırlanın",
    "Hangi pozisyonlara uygun olduğunuzu keşfedin",
    "Diğer adaylarla kendinizi kıyaslayın",
    "İlerlemenizi takip edin",
    "Ücretsiz başlayın, sonra karar verin",
  ]

  const stats = [
    { number: "8,247", label: "Analiz Yapıldı", icon: FileText },
    { number: "4,891", label: "Mülakat Tamamlandı", icon: MessageSquare },
    { number: "92%", label: "Memnun Kullanıcı", icon: Star },
    { number: "2,156", label: "Aktif Üye", icon: Users },
  ]

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      <Navbar />
      <section className="relative min-h-screen overflow-hidden flex items-center pt-16" style={{background: 'linear-gradient(135deg, #4300FF 0%, #0065F8 50%, #4300FF 100%)'}}>
        {/* Advanced animated background elements */}
        <div className="absolute inset-0">
          {/* Main gradient orbs with enhanced animations */}
          <div
            className="absolute w-[600px] h-[600px] rounded-full blur-3xl animate-pulse"
            style={{
              background: 'radial-gradient(circle, rgba(67, 0, 255, 0.3) 0%, rgba(0, 202, 255, 0.2) 50%, rgba(0, 255, 222, 0.3) 100%)',
              left: mousePosition.x * 0.01 + "px",
              top: mousePosition.y * 0.01 + "px",
              transform: "translate(-50%, -50%)",
              animationDuration: "4s",
            }}
          />
          <div
            className="absolute top-20 right-20 w-80 h-80 rounded-full blur-2xl animate-bounce"
            style={{background: 'radial-gradient(circle, rgba(0, 202, 255, 0.2) 0%, rgba(0, 101, 248, 0.1) 100%)', animationDuration: "6s"}}
          />
          <div
            className="absolute bottom-20 left-20 w-96 h-96 rounded-full blur-2xl animate-pulse"
            style={{background: 'radial-gradient(circle, rgba(0, 255, 222, 0.2) 0%, rgba(67, 0, 255, 0.1) 100%)', animationDelay: "2s", animationDuration: "5s"}}
          />
          
          {/* Additional floating orbs */}
          <div
            className="absolute top-1/3 left-1/4 w-64 h-64 rounded-full blur-xl animate-pulse"
            style={{background: 'radial-gradient(circle, rgba(0, 202, 255, 0.15) 0%, rgba(0, 101, 248, 0.15) 100%)', animationDelay: "1.5s", animationDuration: "7s"}}
          />
          <div
            className="absolute bottom-1/3 right-1/3 w-72 h-72 rounded-full blur-xl animate-bounce"
            style={{background: 'radial-gradient(circle, rgba(0, 255, 222, 0.15) 0%, rgba(67, 0, 255, 0.15) 100%)', animationDelay: "3s", animationDuration: "8s"}}
          />
        </div>

        {/* Enhanced floating particles with different sizes */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className={`absolute bg-white/30 rounded-full animate-pulse ${
                i % 3 === 0 ? 'w-3 h-3' : i % 2 === 0 ? 'w-2 h-2' : 'w-1 h-1'
              }`}
              style={{
                left: Math.random() * 100 + "%",
                top: Math.random() * 100 + "%",
                animationDelay: Math.random() * 4 + "s",
                animationDuration: 3 + Math.random() * 4 + "s",
              }}
            />
          ))}
        </div>

        {/* Animated grid pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
            animation: 'gridMove 20s linear infinite'
          }} />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
          <div className="text-center">
            {/* Enhanced animated badge */}
            <div
              className={`inline-flex items-center backdrop-blur-md border border-white/20 text-white px-6 py-3 rounded-full text-sm font-semibold mb-8 transform transition-all duration-1000 shadow-lg hover:scale-105 ${
                isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
              }`}
              style={{background: 'linear-gradient(135deg, rgba(67, 0, 255, 0.3) 0%, rgba(0, 202, 255, 0.2) 50%, rgba(0, 255, 222, 0.3) 100%)'}}
            >
              <Sparkles className="w-5 h-5 mr-3 animate-spin" style={{ animationDuration: "3s", color: '#00FFDE' }} />
              <span className="bg-clip-text text-transparent" style={{background: 'linear-gradient(90deg, #FFFFFF 0%, #00CAFF 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>
                Kariyerinizin geleceği burada başlıyor
              </span>
            </div>

            {/* Enhanced main heading with advanced animations */}
            <h1
              className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black mb-6 md:mb-8 text-white leading-tight transform transition-all duration-1000 delay-200 ${
                isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
              }`}
            >
              <span className="block mb-2 md:mb-4">
                CV'nizi{" "}
                <span className="bg-clip-text text-transparent animate-pulse hover:animate-none transition-all duration-300 cursor-default" style={{background: 'linear-gradient(90deg, #4300FF 0%, #00CAFF 50%, #00FFDE 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>
                  analiz edin
                </span>
              </span>
              <span className="block text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl bg-clip-text text-transparent" style={{background: 'linear-gradient(90deg, #00CAFF 0%, #FFFFFF 50%, #00FFDE 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>
                mülakatlara hazırlanın
              </span>
            </h1>

            <p
              className={`text-lg sm:text-xl lg:text-2xl mb-8 md:mb-12 max-w-5xl mx-auto leading-relaxed transform transition-all duration-1000 delay-400 px-4 ${
                isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
              }`}
              style={{color: '#00CAFF'}}
            >
              <span className="text-xl sm:text-2xl lg:text-3xl font-semibold bg-clip-text text-transparent" style={{background: 'linear-gradient(90deg, #FFFFFF 0%, #00FFDE 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>
                Yapay zeka destekli analiz
              </span>{" "}
              ile CV'nizi geliştirin, gerçekçi mülakat simülasyonları ile kendinizi test edin.
              <br />
              <span className="text-base sm:text-lg lg:text-xl font-medium mt-3 md:mt-4 block" style={{color: '#00FFDE'}}>
                ✨ Binlerce kişi kariyerini burada şekillendirdi
              </span>
            </p>

            {/* Enhanced animated buttons */}
            <div
              className={`flex flex-col sm:flex-row gap-4 sm:gap-6 md:gap-8 justify-center items-center transform transition-all duration-1000 delay-600 px-4 ${
                isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
              }`}
            >
              <Link href="/register" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto text-white px-6 sm:px-8 md:px-10 py-4 sm:py-5 text-lg sm:text-xl font-bold rounded-2xl shadow-2xl transform hover:scale-105 sm:hover:scale-110 transition-all duration-300 group relative overflow-hidden"
                  style={{background: 'linear-gradient(135deg, #4300FF 0%, #0065F8 100%)', boxShadow: '0 25px 50px -12px rgba(67, 0, 255, 0.3)'}}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <Target className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 group-hover:rotate-12 transition-transform duration-300" />
                  <span className="relative z-10">Ücretsiz Başla</span>
                  <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 ml-2 sm:ml-3 group-hover:translate-x-2 transition-transform duration-300" />
                </Button>
              </Link>
              <Link href="/cv-analiz" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto border-2 text-white px-6 sm:px-8 md:px-10 py-4 sm:py-5 text-lg sm:text-xl font-semibold backdrop-blur-md rounded-2xl transition-all duration-300 hover:scale-105 sm:hover:scale-110 group relative overflow-hidden"
                  style={{borderColor: '#00CAFF', backgroundColor: 'rgba(0, 202, 255, 0.1)', backdropFilter: 'blur(10px)'}}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <Award className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 group-hover:scale-110 transition-transform duration-300" />
                  <span className="relative z-10">Demo İzle</span>
                </Button>
              </Link>
            </div>

            {/* Enhanced floating stats */}
            <div
              className={`grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8 mt-16 sm:mt-20 md:mt-24 transform transition-all duration-1000 delay-800 px-4 ${
                isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
              }`}
            >
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="text-center group hover:scale-105 sm:hover:scale-110 transition-all duration-500 relative"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="backdrop-blur-md border border-white/20 rounded-2xl p-6 hover:border-white/30 transition-all duration-300 hover:shadow-2xl" style={{backgroundColor: 'rgba(255, 255, 255, 0.1)', boxShadow: '0 25px 50px -12px rgba(67, 0, 255, 0.2)'}}>
                    {/* Progress Bar */}
                    <div className="w-full h-2 bg-white/20 rounded-full mb-4 overflow-hidden">
                      <div 
                        className="h-2 rounded-full transition-all duration-1000 ease-out"
                        style={{
                          background: 'linear-gradient(90deg, #FFFFFF 0%, #00CAFF 50%, #00FFDE 100%)',
                          width: index === 0 ? '95%' : index === 1 ? '88%' : index === 2 ? '92%' : '85%'
                        }}
                      />
                    </div>
                    
                    <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black bg-clip-text text-transparent mb-2 sm:mb-3 transition-all duration-300" style={{background: 'linear-gradient(90deg, #FFFFFF 0%, #00CAFF 50%, #00FFDE 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>
                      {stat.number}
                    </div>
                    <div className="text-xs sm:text-sm font-semibold uppercase tracking-wider group-hover:text-white transition-colors duration-300" style={{color: '#00CAFF'}}>
                      {stat.label}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </section>

      {/* Revolutionary Features Section */}
      <section className="py-24 relative overflow-hidden" style={{background: 'linear-gradient(to bottom, #FFFFFF 0%, #F8FAFF 50%, #E6F7FF 100%)'}}>
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 rounded-full blur-3xl animate-pulse" style={{background: 'radial-gradient(circle, rgba(0, 202, 255, 0.3) 0%, rgba(0, 101, 248, 0.1) 100%)'}} />
          <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl animate-pulse" style={{background: 'radial-gradient(circle, rgba(0, 255, 222, 0.2) 0%, rgba(67, 0, 255, 0.1) 100%)', animationDelay: "2s"}} />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          {/* Section Header */}
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-6 py-3 rounded-full text-sm font-semibold mb-6 shadow-lg" style={{background: 'linear-gradient(135deg, #00CAFF 0%, #4300FF 100%)', color: '#FFFFFF'}}>
              <Sparkles className="w-4 h-4 mr-2" />
              Yapay Zeka Destekli Çözümler
            </div>
            <h2 className="text-5xl lg:text-6xl font-black text-gray-900 mb-6 leading-tight">
              Kariyerinizi{" "}
              <span className="bg-clip-text text-transparent" style={{background: 'linear-gradient(90deg, #4300FF 0%, #0065F8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>
                Dönüştürün
              </span>
            </h2>
            <p className="text-xl max-w-3xl mx-auto leading-relaxed" style={{color: '#0065F8'}}>
              Gelişmiş AI teknolojisi ile CV'nizi analiz edin, gerçekçi mülakat simülasyonları ile kendinizi test edin ve kariyerinizde bir adım öne geçin.
            </p>
          </div>

          {/* Interactive Feature Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <Card className="relative border-0 shadow-2xl hover:shadow-3xl transition-all duration-700 transform hover:-translate-y-4 hover:rotate-1 bg-white/80 backdrop-blur-sm group-hover:bg-white/90 rounded-3xl overflow-hidden">
                  
                  <CardHeader className="p-8 relative z-10">
                    <div className="flex items-center justify-between mb-6">
                      <div className={`w-16 h-16 ${feature.bgColor} rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-lg`}>
                        <feature.icon className={`w-8 h-8 ${feature.color}`} />
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-black text-gray-900 transition-colors" style={{color: '#4300FF'}}>
                          {index + 1}
                        </div>
                        <div className="text-xs text-gray-500 uppercase tracking-wider">Adım</div>
                      </div>
                    </div>
                    
                    <CardTitle className="text-2xl font-bold text-gray-900 mb-4 transition-colors" style={{color: '#4300FF'}}>
                      {feature.title}
                    </CardTitle>
                    <CardDescription className="text-lg leading-relaxed mb-6" style={{color: '#0065F8'}}>
                      {feature.description}
                    </CardDescription>
                    
                    <div className="flex items-center font-semibold transition-colors" style={{color: '#0065F8'}}>
                      <span>Detayları Gör</span>
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform" />
                    </div>
                  </CardHeader>
                  
                  {/* Hover Effect Overlay */}
                </Card>
              </div>
            ))}
          </div>

          {/* Interactive Stats Bar */}
          <div className="mt-20 bg-white/60 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/20">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center group">
                  <div className="text-4xl lg:text-5xl font-black bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300" style={{background: 'linear-gradient(90deg, #4300FF 0%, #0065F8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>
                    {stat.number}
                  </div>
                  <div className="font-semibold text-sm uppercase tracking-wider group-hover:text-gray-900 transition-colors" style={{color: '#0065F8'}}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Benefits Showcase */}
      <section className="py-24 relative overflow-hidden" style={{background: 'linear-gradient(135deg, #4300FF 0%, #0065F8 50%, #4300FF 100%)'}}>
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full" style={{background: 'linear-gradient(135deg, rgba(67, 0, 255, 0.1) 0%, rgba(0, 202, 255, 0.1) 50%, rgba(0, 255, 222, 0.1) 100%)'}} />
          <div className="absolute top-20 right-20 w-64 h-64 rounded-full blur-3xl animate-pulse" style={{background: 'radial-gradient(circle, rgba(0, 202, 255, 0.2) 0%, rgba(0, 101, 248, 0.1) 100%)'}} />
          <div className="absolute bottom-20 left-20 w-80 h-80 rounded-full blur-3xl animate-pulse" style={{background: 'radial-gradient(circle, rgba(0, 255, 222, 0.2) 0%, rgba(67, 0, 255, 0.1) 100%)', animationDelay: "3s"}} />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Side - Benefits */}
            <div>
              <div className="inline-flex items-center bg-white/10 backdrop-blur-md text-white px-6 py-3 rounded-full text-sm font-semibold mb-8 border border-white/20">
                <Target className="w-4 h-4 mr-2" />
                Neden Bizi Seçmelisiniz?
              </div>
              
              <h2 className="text-5xl lg:text-6xl font-black text-white mb-8 leading-tight">
                Kariyerinizde{" "}
                <span className="bg-clip-text text-transparent" style={{background: 'linear-gradient(90deg, #00CAFF 0%, #00FFDE 50%, #FFFFFF 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>
                  Fark Yaratın
                </span>
              </h2>
              
              <p className="text-xl mb-12 leading-relaxed" style={{color: '#00CAFF'}}>
                Yapay zeka destekli analiz ve gerçekçi simülasyonlarla kariyerinizde bir adım öne geçin. 
                Binlerce kullanıcı bu platformla hedeflerine ulaştı.
              </p>

              {/* Interactive Benefits List */}
              <div className="space-y-6">
                {benefits.map((benefit, index) => (
                  <div
                    key={index}
                    className="group flex items-start space-x-4 p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-500 hover:scale-105 cursor-pointer"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 shadow-lg" style={{background: 'linear-gradient(135deg, #4300FF 0%, #0065F8 100%)'}}>
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <span className="text-white font-semibold text-lg transition-colors" style={{color: '#FFFFFF'}}>
                        {benefit}
                      </span>
                    </div>
                    <ArrowRight className="w-5 h-5 text-white/60 group-hover:text-white group-hover:translate-x-2 transition-all duration-300" />
                  </div>
                ))}
              </div>
            </div>

            {/* Right Side - Interactive Demo */}
            <div className="relative">
              <div className="absolute inset-0 rounded-3xl blur-2xl" style={{background: 'linear-gradient(135deg, rgba(67, 0, 255, 0.2) 0%, rgba(0, 202, 255, 0.2) 100%)'}} />
              <div className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-700 transform hover:-translate-y-2">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg" style={{background: 'linear-gradient(135deg, #4300FF 0%, #0065F8 100%)'}}>
                      <TrendingUp className="w-8 h-8 text-white animate-pulse" />
                    </div>
                    <div>
                      <h3 className="font-black text-white text-2xl">CV Analiz Sonucu</h3>
                      <p className="text-sm" style={{color: '#00CAFF'}}>Gerçek zamanlı analiz</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-black" style={{color: '#00FFDE'}}>78/100</div>
                    <div className="text-xs uppercase tracking-wider" style={{color: '#00CAFF'}}>Genel Puan</div>
                  </div>
                </div>

                {/* Animated Progress Bar */}
                <div className="mb-8">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-white font-semibold">Genel Performans</span>
                    <span className="font-bold" style={{color: '#00FFDE'}}>78%</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-4 overflow-hidden">
                    <div
                      className="h-4 rounded-full transition-all duration-3000 ease-out relative"
                      style={{background: 'linear-gradient(90deg, #00CAFF 0%, #4300FF 50%, #00FFDE 100%)', width: "78%"}}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
                    </div>
                  </div>
                </div>

                {/* AI Recommendations */}
                <div className="backdrop-blur-sm rounded-2xl p-6 border border-white/20" style={{background: 'linear-gradient(135deg, rgba(67, 0, 255, 0.2) 0%, rgba(0, 202, 255, 0.2) 100%)'}}>
                  <div className="flex items-center mb-4">
                    <Sparkles className="w-5 h-5 mr-2" style={{color: '#00FFDE'}} />
                    <span className="font-semibold" style={{color: '#00FFDE'}}>AI Önerileri</span>
                  </div>
                  <p className="text-white/90 leading-relaxed">
                    <strong style={{color: '#00FFDE'}}>İyileştirme:</strong> İş deneyimleri bölümünde daha spesifik 
                    başarılarınızı belirtin. Teknik beceriler kısmını güncelleyin ve sertifikalarınızı ekleyin.
                  </p>
                </div>

                {/* Interactive Elements */}
                <div className="mt-6 flex space-x-4">
                  <button className="flex-1 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg" style={{background: 'linear-gradient(135deg, #4300FF 0%, #0065F8 100%)'}}>
                    Detaylı Rapor
                  </button>
                  <button className="px-6 py-3 border border-white/30 text-white rounded-xl hover:bg-white/10 transition-all duration-300 hover:scale-105">
                    Paylaş
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Unique CTA Section - Card-Based Design */}
      <section className="py-24 bg-gradient-to-b from-gray-50 to-white relative">
        <div className="max-w-7xl mx-auto px-6">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mb-6">
              Kariyerinizde{" "}
              <span className="bg-clip-text text-transparent" style={{background: 'linear-gradient(90deg, #4300FF 0%, #0065F8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>Fark Yaratmaya</span>{" "}
              Hazır mısınız?
            </h2>
            <p className="text-xl max-w-3xl mx-auto" style={{color: '#0065F8'}}>
              Binlerce kişi bu platformla hedeflerine ulaştı. Siz de onlardan biri olun.
            </p>
          </div>

          {/* Main CTA Cards */}
          <div className="grid lg:grid-cols-2 gap-8 mb-16">
            {/* Primary CTA Card */}
            <div className="relative group">
              <div className="absolute inset-0 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-500" style={{background: 'linear-gradient(135deg, #4300FF 0%, #0065F8 100%)'}} />
              <Card className="relative border-0 shadow-2xl hover:shadow-3xl transition-all duration-700 transform hover:-translate-y-2 bg-white rounded-3xl overflow-hidden">
                <div className="p-12 text-center">
                  <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-300 shadow-lg" style={{background: 'linear-gradient(135deg, #4300FF 0%, #0065F8 100%)'}}>
                    <Target className="w-10 h-10 text-white" />
                  </div>
                  
                  <h3 className="text-3xl font-black mb-4" style={{color: '#4300FF'}}>
                    Ücretsiz Başlayın
                  </h3>
                  
                  <p className="text-lg mb-8 leading-relaxed" style={{color: '#0065F8'}}>
                    İlk CV analiziniz tamamen ücretsiz. Hemen başlayın ve sonuçları görün.
                  </p>
                  
                  <div className="space-y-4 mb-8">
                    <div className="flex items-center justify-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span style={{color: '#0065F8'}}>Anında analiz sonucu</span>
                    </div>
                    <div className="flex items-center justify-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span style={{color: '#0065F8'}}>Detaylı iyileştirme önerileri</span>
                    </div>
                    <div className="flex items-center justify-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span style={{color: '#0065F8'}}>Kredi kartı gerektirmez</span>
                    </div>
                  </div>
                  
                  <Link href="/register" className="block">
                    <Button
                      size="lg"
                      className="w-full text-white px-8 py-4 text-xl font-bold rounded-2xl shadow-lg transform hover:scale-105 transition-all duration-300"
                      style={{background: 'linear-gradient(135deg, #4300FF 0%, #0065F8 100%)', boxShadow: '0 10px 25px -5px rgba(67, 0, 255, 0.3)'}}
                    >
                      <Users className="w-6 h-6 mr-3" />
                      Hemen Hesap Oluştur
                    </Button>
                  </Link>
                </div>
              </Card>
            </div>

            {/* Secondary CTA Card */}
            <div className="relative group">
              <div className="absolute inset-0 rounded-3xl blur-xl opacity-10 group-hover:opacity-20 transition-opacity duration-500" style={{background: 'linear-gradient(135deg, #00CAFF 0%, #4300FF 100%)'}} />
              <Card className="relative border-2 shadow-xl hover:shadow-2xl transition-all duration-700 transform hover:-translate-y-2 bg-white rounded-3xl overflow-hidden" style={{borderColor: '#00CAFF'}}>
                <div className="p-12 text-center">
                  <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-300 shadow-lg" style={{background: 'linear-gradient(135deg, #00CAFF 0%, #4300FF 100%)'}}>
                    <Award className="w-10 h-10 text-white" />
                  </div>
                  
                  <h3 className="text-3xl font-black mb-4" style={{color: '#4300FF'}}>
                    Önce Deneyin
                  </h3>
                  
                  <p className="text-lg mb-8 leading-relaxed" style={{color: '#0065F8'}}>
                    Demo versiyonunu inceleyin ve platformun gücünü keşfedin.
                  </p>
                  
                  <div className="space-y-4 mb-8">
                    <div className="flex items-center justify-center space-x-3">
                      <CheckCircle className="w-5 h-5" style={{color: '#0065F8'}} />
                      <span style={{color: '#0065F8'}}>Canlı demo deneyimi</span>
                    </div>
                    <div className="flex items-center justify-center space-x-3">
                      <CheckCircle className="w-5 h-5" style={{color: '#0065F8'}} />
                      <span style={{color: '#0065F8'}}>Örnek analiz raporu</span>
                    </div>
                    <div className="flex items-center justify-center space-x-3">
                      <CheckCircle className="w-5 h-5" style={{color: '#0065F8'}} />
                      <span style={{color: '#0065F8'}}>Kayıt gerektirmez</span>
                    </div>
                  </div>
                  
                  <Link href="/cv-analiz" className="block">
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full border-2 px-8 py-4 text-xl font-bold rounded-2xl transition-all duration-300 hover:scale-105"
                      style={{borderColor: '#00CAFF', color: '#0065F8', backgroundColor: 'transparent'}}
                    >
                      <FileText className="w-6 h-6 mr-3" />
                      Demo İzle
                    </Button>
                  </Link>
                </div>
              </Card>
            </div>
          </div>

          {/* Social Proof Section */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Binlerce Kullanıcı Bize Güveniyor
              </h3>
              <p className="text-gray-600">
                Gerçek kullanıcı deneyimleri ve başarı hikayeleri
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-4xl font-black mb-2" style={{color: '#4300FF'}}>8,247</div>
                <div className="font-semibold" style={{color: '#0065F8'}}>CV Analizi</div>
                <div className="text-sm text-gray-500 mt-1">Bu ay tamamlandı</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-black mb-2" style={{color: '#4300FF'}}>92%</div>
                <div className="font-semibold" style={{color: '#0065F8'}}>Memnuniyet</div>
                <div className="text-sm text-gray-500 mt-1">Kullanıcı oranı</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-black mb-2" style={{color: '#4300FF'}}>2,156</div>
                <div className="font-semibold" style={{color: '#0065F8'}}>Aktif Üye</div>
                <div className="text-sm text-gray-500 mt-1">Platformda</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modern Footer */}
      <footer className="text-white py-20 relative overflow-hidden" style={{background: 'linear-gradient(135deg, #4300FF 0%, #0065F8 50%, #4300FF 100%)'}}>
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full" style={{background: 'linear-gradient(135deg, rgba(67, 0, 255, 0.05) 0%, rgba(0, 202, 255, 0.05) 50%, rgba(0, 255, 222, 0.05) 100%)'}} />
          <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full blur-3xl" style={{background: 'radial-gradient(circle, rgba(0, 202, 255, 0.1) 0%, rgba(67, 0, 255, 0.05) 100%)'}} />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-12 mb-16">
            {/* Brand Section */}
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg" style={{background: 'linear-gradient(135deg, #4300FF 0%, #0065F8 100%)'}}>
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-black bg-clip-text text-transparent" style={{background: 'linear-gradient(90deg, #FFFFFF 0%, #00CAFF 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>
                  Carivio
                </span>
              </div>
              <p className="text-lg leading-relaxed mb-8 max-w-md" style={{color: '#00CAFF'}}>
                Yapay zeka destekli CV analizi ve mülakat hazırlığı ile kariyerinizde fark yaratın. 
                Binlerce kullanıcı bu platformla hedeflerine ulaştı.
              </p>
              
              {/* Social Links */}
              <div className="flex space-x-4">
                <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-white/20 transition-all duration-300 hover:scale-110 cursor-pointer">
                  <span className="text-white font-bold">f</span>
                </div>
                <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-white/20 transition-all duration-300 hover:scale-110 cursor-pointer">
                  <span className="text-white font-bold">t</span>
                </div>
                <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-white/20 transition-all duration-300 hover:scale-110 cursor-pointer">
                  <span className="text-white font-bold">in</span>
                </div>
              </div>
            </div>

            {/* Features */}
            <div>
              <h3 className="font-bold text-xl mb-6 text-white">Özellikler</h3>
              <ul className="space-y-4">
                {[
                  { name: "CV Analizi", href: "/cv-analiz", icon: FileText },
                  { name: "Mülakat Pratiği", href: "/mulakat", icon: MessageSquare },
                  { name: "Sıralama", href: "/siralama", icon: Trophy },
                ].map((item, index) => (
                  <li key={index}>
                    <Link 
                      href={item.href} 
                      className="group flex items-center space-x-3 text-gray-300 hover:text-white transition-all duration-300 hover:translate-x-2"
                    >
                      <item.icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      <span>{item.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Account */}
            <div>
              <h3 className="font-bold text-xl mb-6 text-white">Hesap</h3>
              <ul className="space-y-4">
                {[
                  { name: "Giriş Yap", href: "/login", icon: ArrowRight },
                  { name: "Kayıt Ol", href: "/register", icon: Users },
                ].map((item, index) => (
                  <li key={index}>
                    <Link 
                      href={item.href} 
                      className="group flex items-center space-x-3 text-gray-300 hover:text-white transition-all duration-300 hover:translate-x-2"
                    >
                      <item.icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      <span>{item.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="border-t border-white/10 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
                <div className="text-gray-400 text-sm mb-4 md:mb-0">
                  © 2025 Carivio - Tüm hakları saklıdır
                </div>
              <div className="flex space-x-8 text-sm">
                <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                  Gizlilik Politikası
                </Link>
                <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                  Kullanım Şartları
                </Link>
                <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                  İletişim
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
