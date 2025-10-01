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
import { Chrome } from "lucide-react"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const { signUp, signInWithGoogle } = useAuth()
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">CV Analiz Platformu</h1>
          <p className="text-muted-foreground">Kariyerinizi bir sonraki seviyeye taşıyın</p>
        </div>

        <Card className="shadow-xl border-0 bg-card/80 backdrop-blur-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Kayıt Ol</CardTitle>
            <CardDescription className="text-center">Yeni hesap oluşturun ve CV analizine başlayın</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Ad</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    type="text"
                    placeholder="Adınız"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Soyad</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    placeholder="Soyadınız"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    className="h-11"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-posta</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="ornek@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Şifre</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Şifre Tekrar</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="h-11"
                />
              </div>
              <Button
                type="submit"
                className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                disabled={isLoading}
              >
                {isLoading ? "Kayıt oluşturuluyor..." : "Kayıt Ol"}
              </Button>
            </form>
            
            <div className="mt-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">veya</span>
                </div>
              </div>
              
              <Button
                type="button"
                variant="outline"
                className="w-full h-11 mt-4"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
              >
                <Chrome className="w-4 h-4 mr-2" />
                Google ile Kayıt Ol
              </Button>
            </div>
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Zaten hesabınız var mı?{" "}
                <Link href="/login" className="text-primary hover:text-primary/80 font-medium transition-colors">
                  Giriş Yap
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
