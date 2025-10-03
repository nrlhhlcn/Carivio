"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import Image from "next/image"
import { Flag, Home } from "lucide-react"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const { signUp, signInWithGoogle, signInWithGithub } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Hata!",
        description: "Şifreler eşleşmiyor!",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    try {
      await signUp(formData.email, formData.password, formData.firstName, formData.lastName)
      toast({
        title: "Başarılı!",
        description: "Hesabınız oluşturuldu, giriş yapabilirsiniz.",
      })
      router.push("/login")
    } catch (error: any) {
      toast({
        title: "Hata!",
        description: error.message || "Kayıt olurken bir hata oluştu.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    try {
      await signInWithGoogle()
      toast({
        title: "Başarılı!",
        description: "Google ile giriş yapıldı, yönlendiriliyorsunuz...",
      })
      router.push("/")
    } catch (error: any) {
      toast({
        title: "Hata!",
        description: error.message || "Google ile giriş yapılırken bir hata oluştu.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex overflow-hidden">
      {/* Back to Homepage Button - Top Left */}
      <div className="absolute top-6 left-6 z-50 animate-fade-in-up" style={{animationDelay: '0.1s'}}>
        <Link href="/">
          <Button
            type="button"
            variant="outline"
            className="h-10 px-4 border-2 rounded-lg font-medium transition-all duration-200 hover:scale-105 hover:shadow-lg"
            style={{borderColor: '#0065F8', color: '#0065F8'}}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#0065F8';
              e.currentTarget.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#0065F8';
            }}
          >
            <Home className="w-4 h-4 mr-2" />
            Ana Sayfaya Dön
          </Button>
        </Link>
      </div>

      {/* Left side - Register Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white transition-all duration-700 ease-in-out animate-slide-in-left">
        <div className="w-full max-w-md space-y-8">
          {/* Logo and Header */}
          <div className="text-center animate-fade-in-up" style={{animationDelay: '0.2s'}}>
            <div className="flex items-center justify-center gap-2 mb-6">
              <Flag className="w-8 h-8" style={{color: '#4300FF'}} />
              <span className="text-2xl font-bold text-gray-800">Carivio</span>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Kayıt Ol</h1>
            <p className="text-gray-500">Yeni hesabınızı oluşturun ve CV analizine başlayın</p>
          </div>

          {/* Register Form */}
          <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in-up" style={{animationDelay: '0.4s'}}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Input
                  id="firstName"
                  name="firstName"
                  type="text"
                  placeholder="Adınız"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="h-12 rounded-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <Input
                  id="lastName"
                  name="lastName"
                  type="text"
                  placeholder="Soyadınız"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="h-12 rounded-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="ornek@email.com"
                value={formData.email}
                onChange={handleChange}
                required
                className="h-12 rounded-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                className="h-12 rounded-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="h-12 rounded-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12 rounded-lg text-white font-medium"
              style={{background: 'linear-gradient(135deg, #4300FF 0%, #0065F8 100%)'}}
              onMouseEnter={(e) => (e.target as HTMLButtonElement).style.background = 'linear-gradient(135deg, #0065F8 0%, #4300FF 100%)'}
              onMouseLeave={(e) => (e.target as HTMLButtonElement).style.background = 'linear-gradient(135deg, #4300FF 0%, #0065F8 100%)'}
              disabled={isLoading}
            >
              {isLoading ? "Kayıt oluşturuluyor..." : "Kayıt Ol"}
            </Button>
          </form>

          {/* Social Register/Login Options */}
          <div className="mt-6 animate-fade-in-up" style={{animationDelay: '0.6s'}}>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">veya şununla devam et</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              {/* Google Sign In */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full inline-flex justify-center items-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 hover:scale-105"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </button>

              {/* GitHub Sign In */}
              <button
                type="button"
                onClick={async () => {
                  setIsLoading(true)
                  try {
                    await signInWithGithub()
                    toast({ title: "Başarılı!", description: "GitHub ile giriş yapıldı, yönlendiriliyorsunuz..." })
                    router.push("/")
                  } catch (error: any) {
                    toast({ title: "Hata!", description: error?.message || "GitHub ile giriş yapılırken bir hata oluştu.", variant: "destructive" })
                  } finally {
                    setIsLoading(false)
                  }
                }}
                disabled={isLoading}
                className="w-full inline-flex justify-center items-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200 hover:scale-105"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                GitHub
              </button>
            </div>
          </div>

          <div className="text-center text-sm text-gray-600 animate-fade-in-up" style={{animationDelay: '0.8s'}}>
            Zaten hesabınız var mı?{" "}
            <Link href="/login" className="font-medium" style={{color: '#0065F8'}} onMouseEnter={(e) => (e.target as HTMLAnchorElement).style.color = '#4300FF'} onMouseLeave={(e) => (e.target as HTMLAnchorElement).style.color = '#0065F8'}>
              Giriş Yap
            </Link>
          </div>

        </div>
      </div>

      {/* Right side - Illustration */}
      <div className="flex-1 relative flex items-center justify-center p-8 transition-all duration-700 ease-in-out animate-slide-in-right" style={{background: 'linear-gradient(135deg, #4300FF 0%, #0065F8 50%, #4300FF 100%)'}}>
        {/* Background clouds */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-20 w-32 h-16 bg-white/20 rounded-full blur-sm"></div>
          <div className="absolute top-40 right-32 w-24 h-12 bg-white/15 rounded-full blur-sm"></div>
          <div className="absolute bottom-32 left-16 w-28 h-14 bg-white/25 rounded-full blur-sm"></div>
          <div className="absolute bottom-20 right-20 w-20 h-10 bg-white/20 rounded-full blur-sm"></div>
          <div className="absolute top-60 left-1/2 w-36 h-18 bg-white/10 rounded-full blur-sm"></div>
        </div>

        {/* CV Analysis Illustration (same as login) */}
        <div className="relative z-10 flex items-center justify-center h-full">
          <div className="relative w-full h-full flex items-center justify-center">
            <div className="relative w-full max-w-md h-auto group">
              <div className="relative transform transition-all duration-700 group-hover:scale-105 group-hover:-translate-y-2">
                <Image
                  src="/kayitol.png"
                  alt="CV Analysis Process"
                  width={500}
                  height={375}
                  className="w-full h-auto object-contain drop-shadow-2xl animate-pulse"
                  style={{animationDuration: '4s'}}
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
