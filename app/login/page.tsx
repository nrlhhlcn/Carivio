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

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { signIn, signInWithGoogle } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await signIn(email, password)
      toast({
        title: "Başarılı!",
        description: "Giriş yapıldı, yönlendiriliyorsunuz...",
      })
      router.push("/")
    } catch (error: any) {
      toast({
        title: "Hata!",
        description: error.message || "Giriş yapılırken bir hata oluştu.",
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
            <CardTitle className="text-2xl text-center">Giriş Yap</CardTitle>
            <CardDescription className="text-center">Hesabınıza giriş yapın ve CV analizine başlayın</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-posta</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="ornek@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Şifre</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11"
                />
              </div>
              <div className="flex items-center justify-between">
                <Link href="/forgot-password" className="text-sm text-primary hover:text-primary/80 transition-colors">
                  Şifremi Unuttum
                </Link>
              </div>
              <Button
                type="submit"
                className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                disabled={isLoading}
              >
                {isLoading ? "Giriş yapılıyor..." : "Giriş Yap"}
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
                Google ile Giriş Yap
              </Button>
            </div>
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Hesabınız yok mu?{" "}
                <Link href="/register" className="text-primary hover:text-primary/80 font-medium transition-colors">
                  Kayıt Ol
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
