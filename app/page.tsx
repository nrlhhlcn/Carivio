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
      href: "/cv-analiz",
    },
    {
      icon: MessageSquare,
      title: "Mülakat Pratiği",
      description: "Gerçek mülakat ortamını simüle eden sistemle pratik yapın.",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      size: "medium",
      href: "/mulakat",
    },
    {
      icon: Trophy,
      title: "Sıralama",
      description: "Diğer kullanıcılarla kıyaslayın ve ilerlemenizi takip edin.",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      size: "small",
      href: "/siralama",
    },
    {
      icon: Sparkles,
      title: "CV Oluştur",
      description: "Profesyonel görünümlü bir CV'yi adım adım kolayca oluşturun.",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      size: "medium",
      href: "/cv-olustur",
    },
    {
      icon: Users,
      title: "Topluluk",
      description: "Soru sorun, tecrübelerinizi paylaşın ve diğer adaylarla etkileşime geçin.",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      size: "small",
      href: "/topluluk",
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

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-8 md:py-12">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Text Content */}
            <div className="text-center lg:text-left">
            {/* Enhanced animated badge */}
            <div
              className={`inline-flex items-center backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded-full text-xs md:text-sm font-semibold mb-4 md:mb-6 transform transition-all duration-1000 shadow-lg hover:scale-105 ${
                isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
              }`}
              style={{background: 'linear-gradient(135deg, rgba(67, 0, 255, 0.3) 0%, rgba(0, 202, 255, 0.2) 50%, rgba(0, 255, 222, 0.3) 100%)'}}
            >
              <Sparkles className="w-4 h-4 mr-2 animate-spin" style={{ animationDuration: "3s", color: '#00FFDE' }} />
              <span className="bg-clip-text text-transparent" style={{background: 'linear-gradient(90deg, #FFFFFF 0%, #00CAFF 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>
                Kariyerinizin geleceği burada başlıyor
              </span>
            </div>

            {/* Enhanced main heading with advanced animations */}
            <h1
              className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-4 md:mb-6 text-white leading-tight transform transition-all duration-1000 delay-200 ${
                isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
              }`}
            >
              <span className="block mb-2">
                CV'nizi{" "}
                <span className="bg-clip-text text-transparent animate-pulse hover:animate-none transition-all duration-300 cursor-default" style={{background: 'linear-gradient(90deg, #4300FF 0%, #00CAFF 50%, #00FFDE 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>
                  analiz edin
                </span>
              </span>
              <span className="block text-2xl sm:text-3xl md:text-4xl lg:text-5xl bg-clip-text text-transparent" style={{background: 'linear-gradient(90deg, #00CAFF 0%, #FFFFFF 50%, #00FFDE 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>
                mülakatlara hazırlanın
              </span>
            </h1>

            <p
              className={`text-base sm:text-lg md:text-xl mb-6 md:mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed transform transition-all duration-1000 delay-400 ${
                isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
              }`}
              style={{color: '#00CAFF'}}
            >
              <span className="text-lg sm:text-xl md:text-2xl font-semibold bg-clip-text text-transparent" style={{background: 'linear-gradient(90deg, #FFFFFF 0%, #00FFDE 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>
                Yapay zeka destekli analiz
              </span>{" "}
              ile CV'nizi geliştirin, gerçekçi mülakat simülasyonları ile kendinizi test edin.
              <br />
              <span className="text-sm sm:text-base md:text-lg font-medium mt-2 block" style={{color: '#00FFDE'}}>
                ✨ Binlerce kişi kariyerini burada şekillendirdi
              </span>
            </p>

            {/* Enhanced animated buttons */}
            <div
              className={`flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start items-center transform transition-all duration-1000 delay-600 ${
                isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
              }`}
            >
              <Link href="/register" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto text-white px-6 py-3 text-base md:text-lg font-bold rounded-xl shadow-xl transform hover:scale-105 transition-all duration-300 group relative overflow-hidden"
                  style={{background: 'linear-gradient(135deg, #4300FF 0%, #0065F8 100%)', boxShadow: '0 10px 30px -5px rgba(67, 0, 255, 0.4)'}}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <Target className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform duration-300" />
                  <span className="relative z-10">Ücretsiz Başla</span>
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform duration-300" />
                </Button>
              </Link>
              <Link href="/cv-analiz" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto border-2 text-white px-6 py-3 text-base md:text-lg font-semibold backdrop-blur-md rounded-xl transition-all duration-300 hover:scale-105 group relative overflow-hidden"
                  style={{borderColor: '#FFFFFF', backgroundColor: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(10px)'}}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <Award className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
                  <span className="relative z-10">Demo İzle</span>
                </Button>
              </Link>
            </div>

            {/* Enhanced floating stats */}
            <div
              className={`grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mt-8 md:mt-10 transform transition-all duration-1000 delay-800 ${
                isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
              }`}
            >
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="text-center group hover:scale-105 sm:hover:scale-110 transition-all duration-500 relative h-full flex flex-col"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="backdrop-blur-md border border-white/30 rounded-xl p-4 hover:border-white/40 transition-all duration-300 hover:shadow-xl flex-1 flex flex-col justify-between h-full" style={{backgroundColor: 'rgba(255, 255, 255, 0.15)'}}>
                    {/* Progress Bar */}
                    <div className="w-full h-1.5 bg-white/30 rounded-full mb-3 overflow-hidden">
                      <div 
                        className="h-1.5 rounded-full transition-all duration-1000 ease-out"
                        style={{
                          background: 'linear-gradient(90deg, #FFFFFF 0%, #00CAFF 100%)',
                          width: index === 0 ? '95%' : index === 1 ? '88%' : index === 2 ? '92%' : '85%'
                        }}
                      />
                    </div>
                    
                    <div className="flex-1 flex flex-col justify-center">
                      <div className="text-xl sm:text-2xl md:text-3xl font-black bg-clip-text text-transparent mb-1.5 transition-all duration-300" style={{background: 'linear-gradient(90deg, #FFFFFF 0%, #00CAFF 50%, #00FFDE 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>
                        {stat.number}
                      </div>
                      <div className="text-xs font-semibold uppercase tracking-wider text-white/90 transition-colors duration-300 leading-tight">
                        {stat.label}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

            {/* Right Side - Hero Image */}
            <div className="relative mt-12 lg:mt-0" style={{ perspective: '1000px' }}>
              <div 
                className={`relative z-10 transform transition-all duration-1000 hover:scale-105 ${
                  isVisible ? "translate-y-0 opacity-100 scale-100" : "translate-y-10 opacity-0 scale-75"
                }`} 
                style={{ 
                  transitionDelay: "1000ms",
                  transformStyle: 'preserve-3d',
                  animation: isVisible ? 'zoomInFromBack 1.2s ease-out 1s forwards' : 'none'
                }}
              >
                {/* Decorative blur effects */}
                <div className={`absolute -inset-4 bg-gradient-to-r from-blue-400/20 via-purple-500/20 to-cyan-400/20 rounded-3xl blur-2xl animate-pulse ${
                  isVisible ? "scale-100 opacity-100" : "scale-50 opacity-0"
                }`} style={{ transition: 'all 1.5s ease-out', transitionDelay: '1.2s' }} />
                <div className={`absolute -inset-2 bg-white/10 rounded-3xl blur-xl ${
                  isVisible ? "scale-100 opacity-100" : "scale-50 opacity-0"
                }`} style={{ transition: 'all 1.5s ease-out', transitionDelay: '1.2s' }} />
                
                {/* Image Container */}
                <div 
                  className={`relative rounded-2xl overflow-hidden shadow-2xl border border-white/20 backdrop-blur-sm bg-white/5 p-3 md:p-4 ${
                    isVisible ? "scale-100 opacity-100" : "scale-50 opacity-0"
                  }`}
                  style={{ 
                    transition: 'all 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    transitionDelay: '1s',
                    transformOrigin: 'center center'
                  }}
                >
                  <img 
                    src="/resim-4.png" 
                    alt="CV Analiz ve Geliştirme - Profesyonel CV hazırlama ve analiz" 
                    className="w-full h-auto rounded-xl object-cover transform transition-transform duration-700 hover:scale-[1.02]"
                    style={{
                      animation: isVisible ? 'zoomInImage 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) 1s both' : 'none'
                    }}
                  />
                  
                  {/* Floating badge on image */}
                  <div 
                    className={`absolute top-4 right-4 md:top-6 md:right-6 bg-white/90 backdrop-blur-md px-3 py-1.5 md:px-4 md:py-2 rounded-full shadow-lg border border-white/20 ${
                      isVisible ? "scale-100 opacity-100" : "scale-0 opacity-0"
                    }`}
                    style={{ 
                      transition: 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
                      transitionDelay: '1.8s'
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-blue-600 animate-spin" style={{ animationDuration: "3s" }} />
                      <span className="text-xs md:text-sm font-bold bg-clip-text text-transparent" style={{background: 'linear-gradient(90deg, #4300FF 0%, #0065F8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>
                        AI Destekli
                      </span>
                    </div>
                  </div>
                </div>

                {/* Floating decorative elements */}
                <div 
                  className={`absolute -bottom-6 -left-6 w-24 h-24 bg-gradient-to-r from-blue-400/30 to-purple-500/30 rounded-full blur-xl animate-pulse hidden lg:block ${
                    isVisible ? "scale-100 opacity-100" : "scale-0 opacity-0"
                  }`}
                  style={{ transition: 'all 1s ease-out', transitionDelay: '1.5s' }}
                />
                <div 
                  className={`absolute -top-6 -right-6 w-32 h-32 bg-gradient-to-r from-cyan-400/30 to-blue-500/30 rounded-full blur-xl animate-pulse hidden lg:block ${
                    isVisible ? "scale-100 opacity-100" : "scale-0 opacity-0"
                  }`}
                  style={{ transition: 'all 1s ease-out', transitionDelay: '1.7s' }}
                />
              </div>

              {/* CSS Keyframes için style tag */}
              <style jsx>{`
                @keyframes zoomInFromBack {
                  0% {
                    transform: translateZ(-200px) scale(0.5);
                    opacity: 0;
                  }
                  50% {
                    transform: translateZ(-50px) scale(0.8);
                    opacity: 0.5;
                  }
                  100% {
                    transform: translateZ(0) scale(1);
                    opacity: 1;
                  }
                }

                @keyframes zoomInImage {
                  0% {
                    transform: scale(0.6) translateZ(-100px);
                    opacity: 0;
                    filter: blur(10px);
                  }
                  60% {
                    transform: scale(0.95) translateZ(-20px);
                    opacity: 0.8;
                    filter: blur(2px);
                  }
                  100% {
                    transform: scale(1) translateZ(0);
                    opacity: 1;
                    filter: blur(0);
                  }
                }
              `}</style>
            </div>
          </div>
        </div>

      </section>

      {/* Revolutionary Features Section */}
      <section className="py-12 md:py-16 relative overflow-hidden" style={{background: 'linear-gradient(to bottom, #FFFFFF 0%, #F8FAFF 50%, #E6F7FF 100%)'}}>
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 rounded-full blur-3xl animate-pulse" style={{background: 'radial-gradient(circle, rgba(0, 202, 255, 0.3) 0%, rgba(0, 101, 248, 0.1) 100%)'}} />
          <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl animate-pulse" style={{background: 'radial-gradient(circle, rgba(0, 255, 222, 0.2) 0%, rgba(67, 0, 255, 0.1) 100%)', animationDelay: "2s"}} />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          {/* Section Header */}
          <div className="text-center mb-10 md:mb-12">
            <div className="inline-flex items-center px-4 py-2 rounded-full text-xs md:text-sm font-semibold mb-4 shadow-lg" style={{background: 'linear-gradient(135deg, #00CAFF 0%, #4300FF 100%)', color: '#FFFFFF'}}>
              <Sparkles className="w-3 h-3 md:w-4 md:h-4 mr-2" />
              Yapay Zeka Destekli Çözümler
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 mb-4 leading-tight">
              Kariyerinizi{" "}
              <span className="bg-clip-text text-transparent" style={{background: 'linear-gradient(90deg, #4300FF 0%, #0065F8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>
                Dönüştürün
              </span>
            </h2>
            <p className="text-base md:text-lg max-w-2xl mx-auto leading-relaxed text-gray-700">
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
                <Link href={feature.href}>
                <Card className="relative border-0 shadow-2xl hover:shadow-3xl transition-all duration-700 transform hover:-translate-y-4 hover:rotate-1 bg-white/80 backdrop-blur-sm group-hover:bg-white/90 rounded-3xl overflow-hidden cursor-pointer">
                  
                  <CardHeader className="p-8 relative z-10">
                    <div className="flex items-center justify-between mb-6">
                      <div className={`w-16 h-16 ${feature.bgColor} rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-lg`}>
                        <feature.icon className={`w-8 h-8 ${feature.color}`} />
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-black text-black transition-colors">
                          {index + 1}
                        </div>
                        <div className="text-xs text-gray-500 uppercase tracking-wider">Adım</div>
                      </div>
                    </div>
                    
                    <CardTitle className="text-2xl font-bold text-gray-900 mb-4 transition-colors" style={{color: '#4300FF'}}>
                      {feature.title}
                    </CardTitle>
                    <CardDescription className="text-lg leading-relaxed mb-6 text-black">
                      {feature.description}
                    </CardDescription>
                    
                    <div className="flex items-center font-semibold transition-colors" style={{color: '#0065F8'}}>
                      <span>Detayları Gör</span>
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform" />
                    </div>
                  </CardHeader>
                  
                  {/* Hover Effect Overlay */}
                </Card>
                </Link>
              </div>
            ))}
          </div>

          {/* Interactive Stats Bar */}
          <div className="mt-10 md:mt-12 bg-white/60 backdrop-blur-md rounded-2xl p-6 md:p-8 shadow-xl border border-white/20">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center group">
                  <div className="text-4xl lg:text-5xl font-black bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300" style={{background: 'linear-gradient(90deg, #4300FF 0%, #0065F8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>
                    {stat.number}
                  </div>
                  <div className="font-semibold text-sm uppercase tracking-wider group-hover:text-gray-900 transition-colors text-black">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Benefits Showcase */}
      <section className="py-12 md:py-16 relative overflow-hidden" style={{background: 'linear-gradient(135deg, #4300FF 0%, #0065F8 50%, #4300FF 100%)'}}>
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full" style={{background: 'linear-gradient(135deg, rgba(67, 0, 255, 0.1) 0%, rgba(0, 202, 255, 0.1) 50%, rgba(0, 255, 222, 0.1) 100%)'}} />
          <div className="absolute top-20 right-20 w-64 h-64 rounded-full blur-3xl animate-pulse" style={{background: 'radial-gradient(circle, rgba(0, 202, 255, 0.2) 0%, rgba(0, 101, 248, 0.1) 100%)'}} />
          <div className="absolute bottom-20 left-20 w-80 h-80 rounded-full blur-3xl animate-pulse" style={{background: 'radial-gradient(circle, rgba(0, 255, 222, 0.2) 0%, rgba(67, 0, 255, 0.1) 100%)', animationDelay: "3s"}} />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
            {/* Left Side - Benefits */}
            <div>
              <div className="inline-flex items-center bg-white/10 backdrop-blur-md text-white px-4 py-2 rounded-full text-xs md:text-sm font-semibold mb-4 md:mb-6 border border-white/20">
                <Target className="w-3 h-3 md:w-4 md:h-4 mr-2" />
                Neden Bizi Seçmelisiniz?
              </div>
              
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-4 md:mb-6 leading-tight">
                Kariyerinizde{" "}
                <span className="text-white drop-shadow-lg">
                  Fark Yaratın
                </span>
              </h2>
              
              <p className="text-base md:text-lg mb-8 leading-relaxed text-white/90">
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

      {/* User Testimonials Section */}
      <section className="py-12 md:py-16 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 rounded-full blur-3xl animate-pulse" style={{background: 'radial-gradient(circle, rgba(0, 202, 255, 0.1) 0%, rgba(0, 101, 248, 0.05) 100%)'}} />
          <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl animate-pulse" style={{background: 'radial-gradient(circle, rgba(0, 255, 222, 0.1) 0%, rgba(67, 0, 255, 0.05) 100%)', animationDelay: "2s"}} />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          {/* Section Header */}
          <div className="text-center mb-10 md:mb-12">
            <div className="inline-flex items-center px-4 py-2 md:px-6 md:py-3 rounded-full text-xs md:text-sm font-bold mb-4 md:mb-6 shadow-xl" style={{background: 'linear-gradient(135deg, #00CAFF 0%, #4300FF 100%)', color: '#FFFFFF'}}>
              <Star className="w-3 h-3 md:w-4 md:h-4 mr-2 animate-spin" style={{ animationDuration: "3s" }} />
              Kullanıcı Deneyimleri
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 mb-4 md:mb-6 leading-tight">
              Binlerce Kişi{" "}
              <span className="bg-clip-text text-transparent" style={{background: 'linear-gradient(90deg, #4300FF 0%, #0065F8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>Başarıya Ulaştı</span>
            </h2>
            <p className="text-base md:text-lg max-w-2xl mx-auto text-gray-700 leading-relaxed">
              Gerçek kullanıcılarımızın deneyimlerini keşfedin ve siz de onlardan biri olun.
            </p>
            
            {/* Live Stats */}
            <div className="flex justify-center items-center space-x-6 md:space-x-12 mt-8">
              <div className="text-center">
                <div className="text-xl md:text-2xl font-black text-blue-600">8,247+</div>
                <div className="text-xs md:text-sm text-gray-600">Mutlu Kullanıcı</div>
              </div>
              <div className="text-center">
                <div className="text-xl md:text-2xl font-black text-green-600">92%</div>
                <div className="text-xs md:text-sm text-gray-600">Başarı Oranı</div>
              </div>
              <div className="text-center">
                <div className="text-xl md:text-2xl font-black text-purple-600">2,156+</div>
                <div className="text-xs md:text-sm text-gray-600">Aktif Üye</div>
              </div>
            </div>
          </div>

          {/* Enhanced Animated Testimonials Carousel */}
          <div className="mt-8 md:mt-10 mb-12 overflow-hidden relative px-4 sm:px-6 lg:px-8 py-6 shadow-lg rounded-2xl bg-white/5 backdrop-blur-sm">
            {/* Floating particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className={`absolute bg-gradient-to-r from-blue-400 to-purple-500 rounded-full animate-pulse ${
                    i % 4 === 0 ? 'w-2 h-2' : i % 3 === 0 ? 'w-1 h-1' : 'w-3 h-3'
                  }`}
                  style={{
                    left: Math.random() * 100 + "%",
                    top: Math.random() * 100 + "%",
                    animationDelay: Math.random() * 4 + "s",
                    animationDuration: 3 + Math.random() * 4 + "s",
                    opacity: 0.3
                  }}
                />
              ))}
            </div>
            {/* First Row - Moving Right to Left */}
            <div className="flex animate-scroll-right hover:pause-animation mb-8">
              <div className="flex space-x-8 min-w-max">
                {/* Testimonial 1 */}
                <div className="group relative flex-shrink-0 w-80">
                  <div className="absolute inset-0 rounded-3xl blur-xl opacity-10 group-hover:opacity-30 transition-opacity duration-500" style={{background: 'linear-gradient(135deg, #4300FF 0%, #0065F8 100%)'}} />
                  <Card className="relative border-0 shadow-xl hover:shadow-3xl transition-all duration-700 transform hover:-translate-y-3 hover:scale-105 bg-white rounded-3xl overflow-hidden group-hover:border-2 group-hover:border-blue-200">
                    <div className="p-8">
                      <div className="flex items-center mb-6">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg mr-4 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 shadow-lg">
                          A
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900">Ahmet Yılmaz</h4>
                          <p className="text-sm text-gray-600">Yazılım Geliştirici</p>
                        </div>
                      </div>
                      <div className="flex mb-6">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-yellow-400 fill-current animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
                        ))}
                      </div>
                      <p className="text-gray-700 leading-relaxed">
                        "CV analizi sayesinde eksiklerimi fark ettim. 2 hafta sonra hayalimdeki işe kabul edildim!"
                      </p>
                    </div>
                  </Card>
                </div>

                {/* Testimonial 2 */}
                <div className="group relative flex-shrink-0 w-80">
                  <div className="absolute inset-0 rounded-3xl blur-xl opacity-10 group-hover:opacity-20 transition-opacity duration-500" style={{background: 'linear-gradient(135deg, #00CAFF 0%, #4300FF 100%)'}} />
                  <Card className="relative border-0 shadow-xl hover:shadow-2xl transition-all duration-700 transform hover:-translate-y-2 bg-white rounded-3xl overflow-hidden">
                    <div className="p-8">
                      <div className="flex items-center mb-6">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg mr-4 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 shadow-lg">
                          E
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900">Elif Demir</h4>
                          <p className="text-sm text-gray-600">Pazarlama Uzmanı</p>
                        </div>
                      </div>
                      <div className="flex mb-6">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-yellow-400 fill-current animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
                        ))}
                      </div>
                      <p className="text-gray-700 leading-relaxed">
                        "Mülakat simülasyonu gerçekten çok faydalıydı. Kendime güvenim arttı ve başarılı oldum."
                      </p>
                    </div>
                  </Card>
                </div>

                {/* Testimonial 3 */}
                <div className="group relative flex-shrink-0 w-80">
                  <div className="absolute inset-0 rounded-3xl blur-xl opacity-10 group-hover:opacity-20 transition-opacity duration-500" style={{background: 'linear-gradient(135deg, #00FFDE 0%, #0065F8 100%)'}} />
                  <Card className="relative border-0 shadow-xl hover:shadow-2xl transition-all duration-700 transform hover:-translate-y-2 bg-white rounded-3xl overflow-hidden">
                    <div className="p-8">
                      <div className="flex items-center mb-6">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center text-white font-bold text-lg mr-4 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 shadow-lg">
                          M
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900">Mehmet Kaya</h4>
                          <p className="text-sm text-gray-600">Proje Yöneticisi</p>
                        </div>
                      </div>
                      <div className="flex mb-6">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-yellow-400 fill-current animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
                        ))}
                      </div>
                      <p className="text-gray-700 leading-relaxed">
                        "Platform sayesinde CV'mi profesyonel hale getirdim. 3 farklı şirketten teklif aldım!"
                      </p>
                    </div>
                  </Card>
                </div>

                {/* Testimonial 4 */}
                <div className="group relative flex-shrink-0 w-80">
                  <div className="absolute inset-0 rounded-3xl blur-xl opacity-10 group-hover:opacity-20 transition-opacity duration-500" style={{background: 'linear-gradient(135deg, #FF6B6B 0%, #4ECDC4 100%)'}} />
                  <Card className="relative border-0 shadow-xl hover:shadow-2xl transition-all duration-700 transform hover:-translate-y-2 bg-white rounded-3xl overflow-hidden">
                    <div className="p-8">
                      <div className="flex items-center mb-6">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-orange-500 to-red-600 flex items-center justify-center text-white font-bold text-lg mr-4 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 shadow-lg">
                          S
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900">Selin Özkan</h4>
                          <p className="text-sm text-gray-600">UX Tasarımcı</p>
                        </div>
                      </div>
                      <div className="flex mb-6">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-yellow-400 fill-current animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
                        ))}
                      </div>
                      <p className="text-gray-700 leading-relaxed">
                        "AI destekli analiz gerçekten etkili. CV'mdeki zayıf noktaları net bir şekilde gördüm."
                      </p>
                    </div>
                  </Card>
                </div>

                {/* Testimonial 5 */}
                <div className="group relative flex-shrink-0 w-80">
                  <div className="absolute inset-0 rounded-3xl blur-xl opacity-10 group-hover:opacity-20 transition-opacity duration-500" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}} />
                  <Card className="relative border-0 shadow-xl hover:shadow-2xl transition-all duration-700 transform hover:-translate-y-2 bg-white rounded-3xl overflow-hidden">
                    <div className="p-8">
                      <div className="flex items-center mb-6">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg mr-4 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 shadow-lg">
                          C
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900">Can Arslan</h4>
                          <p className="text-sm text-gray-600">Veri Analisti</p>
                        </div>
                      </div>
                      <div className="flex mb-6">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-yellow-400 fill-current animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
                        ))}
                      </div>
                      <p className="text-gray-700 leading-relaxed">
                        "Mülakat pratiği sayesinde stresimi yendim. Artık kendimden emin bir şekilde görüşmelere giriyorum."
                      </p>
                    </div>
                  </Card>
                </div>

                {/* Testimonial 6 */}
                <div className="group relative flex-shrink-0 w-80">
                  <div className="absolute inset-0 rounded-3xl blur-xl opacity-10 group-hover:opacity-20 transition-opacity duration-500" style={{background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'}} />
                  <Card className="relative border-0 shadow-xl hover:shadow-2xl transition-all duration-700 transform hover:-translate-y-2 bg-white rounded-3xl overflow-hidden">
                    <div className="p-8">
                      <div className="flex items-center mb-6">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-pink-500 to-rose-600 flex items-center justify-center text-white font-bold text-lg mr-4 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 shadow-lg">
                          Z
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900">Zeynep Çelik</h4>
                          <p className="text-sm text-gray-600">İnsan Kaynakları</p>
                        </div>
                      </div>
                      <div className="flex mb-6">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-yellow-400 fill-current animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
                        ))}
                      </div>
                      <p className="text-gray-700 leading-relaxed">
                        "Platform gerçekten kullanışlı. Hem CV analizi hem de mülakat hazırlığı için mükemmel bir çözüm."
                      </p>
                    </div>
                  </Card>
                </div>

                {/* Duplicate for seamless loop */}
                <div className="group relative flex-shrink-0 w-80">
                  <div className="absolute inset-0 rounded-3xl blur-xl opacity-10 group-hover:opacity-30 transition-opacity duration-500" style={{background: 'linear-gradient(135deg, #4300FF 0%, #0065F8 100%)'}} />
                  <Card className="relative border-0 shadow-xl hover:shadow-3xl transition-all duration-700 transform hover:-translate-y-3 hover:scale-105 bg-white rounded-3xl overflow-hidden group-hover:border-2 group-hover:border-blue-200">
                    <div className="p-8">
                      <div className="flex items-center mb-6">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg mr-4 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 shadow-lg">
                          A
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900">Ahmet Yılmaz</h4>
                          <p className="text-sm text-gray-600">Yazılım Geliştirici</p>
                        </div>
                      </div>
                      <div className="flex mb-6">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-yellow-400 fill-current animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
                        ))}
                      </div>
                      <p className="text-gray-700 leading-relaxed">
                        "CV analizi sayesinde eksiklerimi fark ettim. 2 hafta sonra hayalimdeki işe kabul edildim!"
                      </p>
                    </div>
                  </Card>
                </div>

                <div className="group relative flex-shrink-0 w-80">
                  <div className="absolute inset-0 rounded-3xl blur-xl opacity-10 group-hover:opacity-20 transition-opacity duration-500" style={{background: 'linear-gradient(135deg, #00CAFF 0%, #4300FF 100%)'}} />
                  <Card className="relative border-0 shadow-xl hover:shadow-2xl transition-all duration-700 transform hover:-translate-y-2 bg-white rounded-3xl overflow-hidden">
                    <div className="p-8">
                      <div className="flex items-center mb-6">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg mr-4 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 shadow-lg">
                          E
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900">Elif Demir</h4>
                          <p className="text-sm text-gray-600">Pazarlama Uzmanı</p>
                        </div>
                      </div>
                      <div className="flex mb-6">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-yellow-400 fill-current animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
                        ))}
                      </div>
                      <p className="text-gray-700 leading-relaxed">
                        "Mülakat simülasyonu gerçekten çok faydalıydı. Kendime güvenim arttı ve başarılı oldum."
                      </p>
                    </div>
                  </Card>
                </div>

                <div className="group relative flex-shrink-0 w-80">
                  <div className="absolute inset-0 rounded-3xl blur-xl opacity-10 group-hover:opacity-20 transition-opacity duration-500" style={{background: 'linear-gradient(135deg, #00FFDE 0%, #0065F8 100%)'}} />
                  <Card className="relative border-0 shadow-xl hover:shadow-2xl transition-all duration-700 transform hover:-translate-y-2 bg-white rounded-3xl overflow-hidden">
                    <div className="p-8">
                      <div className="flex items-center mb-6">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center text-white font-bold text-lg mr-4 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 shadow-lg">
                          M
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900">Mehmet Kaya</h4>
                          <p className="text-sm text-gray-600">Proje Yöneticisi</p>
                        </div>
                      </div>
                      <div className="flex mb-6">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-yellow-400 fill-current animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
                        ))}
                      </div>
                      <p className="text-gray-700 leading-relaxed">
                        "Platform sayesinde CV'mi profesyonel hale getirdim. 3 farklı şirketten teklif aldım!"
                      </p>
                    </div>
                  </Card>
                </div>
              </div>
            </div>

            {/* Second Row - Moving Left to Right */}
            <div className="flex animate-scroll-left hover:pause-animation">
              <div className="flex space-x-8 min-w-max">
                {/* Testimonial 4 */}
                <div className="group relative flex-shrink-0 w-80">
                  <div className="absolute inset-0 rounded-3xl blur-xl opacity-10 group-hover:opacity-20 transition-opacity duration-500" style={{background: 'linear-gradient(135deg, #FF6B6B 0%, #4ECDC4 100%)'}} />
                  <Card className="relative border-0 shadow-xl hover:shadow-2xl transition-all duration-700 transform hover:-translate-y-2 bg-white rounded-3xl overflow-hidden">
                    <div className="p-8">
                      <div className="flex items-center mb-6">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-orange-500 to-red-600 flex items-center justify-center text-white font-bold text-lg mr-4 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 shadow-lg">
                          S
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900">Selin Özkan</h4>
                          <p className="text-sm text-gray-600">UX Tasarımcı</p>
                        </div>
                      </div>
                      <div className="flex mb-6">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-yellow-400 fill-current animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
                        ))}
                      </div>
                      <p className="text-gray-700 leading-relaxed">
                        "AI destekli analiz gerçekten etkili. CV'mdeki zayıf noktaları net bir şekilde gördüm."
                      </p>
                    </div>
                  </Card>
                </div>

                {/* Testimonial 5 */}
                <div className="group relative flex-shrink-0 w-80">
                  <div className="absolute inset-0 rounded-3xl blur-xl opacity-10 group-hover:opacity-20 transition-opacity duration-500" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}} />
                  <Card className="relative border-0 shadow-xl hover:shadow-2xl transition-all duration-700 transform hover:-translate-y-2 bg-white rounded-3xl overflow-hidden">
                    <div className="p-8">
                      <div className="flex items-center mb-6">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg mr-4 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 shadow-lg">
                          C
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900">Can Arslan</h4>
                          <p className="text-sm text-gray-600">Veri Analisti</p>
                        </div>
                      </div>
                      <div className="flex mb-6">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-yellow-400 fill-current animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
                        ))}
                      </div>
                      <p className="text-gray-700 leading-relaxed">
                        "Mülakat pratiği sayesinde stresimi yendim. Artık kendimden emin bir şekilde görüşmelere giriyorum."
                      </p>
                    </div>
                  </Card>
                </div>

                {/* Testimonial 6 */}
                <div className="group relative flex-shrink-0 w-80">
                  <div className="absolute inset-0 rounded-3xl blur-xl opacity-10 group-hover:opacity-20 transition-opacity duration-500" style={{background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'}} />
                  <Card className="relative border-0 shadow-xl hover:shadow-2xl transition-all duration-700 transform hover:-translate-y-2 bg-white rounded-3xl overflow-hidden">
                    <div className="p-8">
                      <div className="flex items-center mb-6">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-pink-500 to-rose-600 flex items-center justify-center text-white font-bold text-lg mr-4 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 shadow-lg">
                          Z
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900">Zeynep Çelik</h4>
                          <p className="text-sm text-gray-600">İnsan Kaynakları</p>
                        </div>
                      </div>
                      <div className="flex mb-6">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-yellow-400 fill-current animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
                        ))}
                      </div>
                      <p className="text-gray-700 leading-relaxed">
                        "Platform gerçekten kullanışlı. Hem CV analizi hem de mülakat hazırlığı için mükemmel bir çözüm."
                      </p>
                    </div>
                  </Card>
                </div>

                {/* Testimonial 1 */}
                <div className="group relative flex-shrink-0 w-80">
                  <div className="absolute inset-0 rounded-3xl blur-xl opacity-10 group-hover:opacity-30 transition-opacity duration-500" style={{background: 'linear-gradient(135deg, #4300FF 0%, #0065F8 100%)'}} />
                  <Card className="relative border-0 shadow-xl hover:shadow-3xl transition-all duration-700 transform hover:-translate-y-3 hover:scale-105 bg-white rounded-3xl overflow-hidden group-hover:border-2 group-hover:border-blue-200">
                    <div className="p-8">
                      <div className="flex items-center mb-6">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg mr-4 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 shadow-lg">
                          A
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900">Ahmet Yılmaz</h4>
                          <p className="text-sm text-gray-600">Yazılım Geliştirici</p>
                        </div>
                      </div>
                      <div className="flex mb-6">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-yellow-400 fill-current animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
                        ))}
                      </div>
                      <p className="text-gray-700 leading-relaxed">
                        "CV analizi sayesinde eksiklerimi fark ettim. 2 hafta sonra hayalimdeki işe kabul edildim!"
                      </p>
                    </div>
                  </Card>
                </div>

                {/* Testimonial 2 */}
                <div className="group relative flex-shrink-0 w-80">
                  <div className="absolute inset-0 rounded-3xl blur-xl opacity-10 group-hover:opacity-20 transition-opacity duration-500" style={{background: 'linear-gradient(135deg, #00CAFF 0%, #4300FF 100%)'}} />
                  <Card className="relative border-0 shadow-xl hover:shadow-2xl transition-all duration-700 transform hover:-translate-y-2 bg-white rounded-3xl overflow-hidden">
                    <div className="p-8">
                      <div className="flex items-center mb-6">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg mr-4 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 shadow-lg">
                          E
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900">Elif Demir</h4>
                          <p className="text-sm text-gray-600">Pazarlama Uzmanı</p>
                        </div>
                      </div>
                      <div className="flex mb-6">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-yellow-400 fill-current animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
                        ))}
                      </div>
                      <p className="text-gray-700 leading-relaxed">
                        "Mülakat simülasyonu gerçekten çok faydalıydı. Kendime güvenim arttı ve başarılı oldum."
                      </p>
                    </div>
                  </Card>
                </div>

                {/* Testimonial 3 */}
                <div className="group relative flex-shrink-0 w-80">
                  <div className="absolute inset-0 rounded-3xl blur-xl opacity-10 group-hover:opacity-20 transition-opacity duration-500" style={{background: 'linear-gradient(135deg, #00FFDE 0%, #0065F8 100%)'}} />
                  <Card className="relative border-0 shadow-xl hover:shadow-2xl transition-all duration-700 transform hover:-translate-y-2 bg-white rounded-3xl overflow-hidden">
                    <div className="p-8">
                      <div className="flex items-center mb-6">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center text-white font-bold text-lg mr-4 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 shadow-lg">
                          M
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900">Mehmet Kaya</h4>
                          <p className="text-sm text-gray-600">Proje Yöneticisi</p>
                        </div>
                      </div>
                      <div className="flex mb-6">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-yellow-400 fill-current animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
                        ))}
                      </div>
                      <p className="text-gray-700 leading-relaxed">
                        "Platform sayesinde CV'mi profesyonel hale getirdim. 3 farklı şirketten teklif aldım!"
                      </p>
                    </div>
                  </Card>
                </div>

                {/* Duplicate for seamless loop */}
                <div className="group relative flex-shrink-0 w-80">
                  <div className="absolute inset-0 rounded-3xl blur-xl opacity-10 group-hover:opacity-20 transition-opacity duration-500" style={{background: 'linear-gradient(135deg, #FF6B6B 0%, #4ECDC4 100%)'}} />
                  <Card className="relative border-0 shadow-xl hover:shadow-2xl transition-all duration-700 transform hover:-translate-y-2 bg-white rounded-3xl overflow-hidden">
                    <div className="p-8">
                      <div className="flex items-center mb-6">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-orange-500 to-red-600 flex items-center justify-center text-white font-bold text-lg mr-4 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 shadow-lg">
                          S
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900">Selin Özkan</h4>
                          <p className="text-sm text-gray-600">UX Tasarımcı</p>
                        </div>
                      </div>
                      <div className="flex mb-6">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-yellow-400 fill-current animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
                        ))}
                      </div>
                      <p className="text-gray-700 leading-relaxed">
                        "AI destekli analiz gerçekten etkili. CV'mdeki zayıf noktaları net bir şekilde gördüm."
                      </p>
                    </div>
                  </Card>
                </div>

                <div className="group relative flex-shrink-0 w-80">
                  <div className="absolute inset-0 rounded-3xl blur-xl opacity-10 group-hover:opacity-20 transition-opacity duration-500" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}} />
                  <Card className="relative border-0 shadow-xl hover:shadow-2xl transition-all duration-700 transform hover:-translate-y-2 bg-white rounded-3xl overflow-hidden">
                    <div className="p-8">
                      <div className="flex items-center mb-6">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg mr-4 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 shadow-lg">
                          C
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900">Can Arslan</h4>
                          <p className="text-sm text-gray-600">Veri Analisti</p>
                        </div>
                      </div>
                      <div className="flex mb-6">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-yellow-400 fill-current animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
                        ))}
                      </div>
                      <p className="text-gray-700 leading-relaxed">
                        "Mülakat pratiği sayesinde stresimi yendim. Artık kendimden emin bir şekilde görüşmelere giriyorum."
                      </p>
                    </div>
                  </Card>
                </div>

                <div className="group relative flex-shrink-0 w-80">
                  <div className="absolute inset-0 rounded-3xl blur-xl opacity-10 group-hover:opacity-20 transition-opacity duration-500" style={{background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'}} />
                  <Card className="relative border-0 shadow-xl hover:shadow-2xl transition-all duration-700 transform hover:-translate-y-2 bg-white rounded-3xl overflow-hidden">
                    <div className="p-8">
                      <div className="flex items-center mb-6">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-pink-500 to-rose-600 flex items-center justify-center text-white font-bold text-lg mr-4 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 shadow-lg">
                          Z
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900">Zeynep Çelik</h4>
                          <p className="text-sm text-gray-600">İnsan Kaynakları</p>
                        </div>
                      </div>
                      <div className="flex mb-6">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-yellow-400 fill-current animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
                        ))}
                      </div>
                      <p className="text-gray-700 leading-relaxed">
                        "Platform gerçekten kullanışlı. Hem CV analizi hem de mülakat hazırlığı için mükemmel bir çözüm."
                      </p>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </div>


        </div>
      </section>

      {/* Modern Footer */}
      <footer className="text-white py-12 md:py-16 relative overflow-hidden" style={{background: 'linear-gradient(135deg, #4300FF 0%, #0065F8 50%, #4300FF 100%)'}}>
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
                  { name: "CV Oluştur", href: "/cv-olustur", icon: Sparkles },
                  { name: "Topluluk", href: "/topluluk", icon: Users },
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
