"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Menu, X, FileText, MessageSquare, Trophy, User, Sparkles, LogOut } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { user, logout } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleLogout = async () => {
    try {
      await logout()
      toast({
        title: "Başarılı!",
        description: "Çıkış yapıldı.",
      })
      router.push("/")
    } catch (error) {
      toast({
        title: "Hata!",
        description: "Çıkış yapılırken bir hata oluştu.",
        variant: "destructive",
      })
    }
  }

  const navItems = [
    { href: "/", label: "Ana Sayfa" },
    { href: "/cv-analiz", label: "CV Analizi", icon: FileText },
    { href: "/mulakat", label: "Mülakat", icon: MessageSquare },
    { href: "/siralama", label: "Sıralama", icon: Trophy },
    ...(user ? [{ href: "/profil", label: "Profil", icon: User }] : []),
  ]

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md border-b border-gray-200/50 shadow-lg"
          : "bg-white/90 backdrop-blur-md border-b border-gray-200/30"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg" style={{background: 'linear-gradient(135deg, #4300FF 0%, #0065F8 100%)'}}>
              <FileText className="w-4 h-4 text-white" />
            </div>
              <span className="text-xl font-bold bg-clip-text text-transparent transition-all duration-300" style={{background: 'linear-gradient(90deg, #4300FF 0%, #0065F8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>
                Carivio
              </span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item, index) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center space-x-2 transition-all duration-300 font-medium text-sm group relative hover:scale-105"
                style={{color: '#0065F8', animationDelay: `${index * 0.1}s`}}
              >
                {item.icon && <item.icon className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />}
                <span className="relative">
                  {item.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-300" style={{background: 'linear-gradient(90deg, #4300FF 0%, #00CAFF 100%)'}}></span>
                </span>
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <>
                <span className="text-sm text-gray-600">
                  Merhaba, {user.displayName || user.email}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="transition-all duration-300 hover:scale-105 hover:bg-opacity-10"
                  style={{color: '#0065F8', backgroundColor: 'transparent'}}
                >
                  <LogOut className="w-4 h-4 mr-1" />
                  Çıkış
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="transition-all duration-300 hover:scale-105 hover:bg-opacity-10"
                    style={{color: '#0065F8', backgroundColor: 'transparent'}}
                  >
                    Giriş
                  </Button>
                </Link>
                <Link href="/register">
                  <Button
                    size="sm"
                    className="text-white shadow-lg transition-all duration-300 hover:scale-105 group"
                    style={{background: 'linear-gradient(135deg, #4300FF 0%, #0065F8 100%)', boxShadow: '0 10px 25px -5px rgba(67, 0, 255, 0.3)'}}
                  >
                    <Sparkles className="w-4 h-4 mr-1 group-hover:rotate-12 transition-transform" />
                    Kayıt Ol
                  </Button>
                </Link>
              </>
            )}
          </div>

          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
              className="transition-all duration-300"
              style={{backgroundColor: 'transparent'}}
            >
              <div className="relative w-5 h-5">
                <Menu
                  className={`w-5 h-5 absolute transition-all duration-300 ${isOpen ? "rotate-90 opacity-0" : "rotate-0 opacity-100"}`}
                />
                <X
                  className={`w-5 h-5 absolute transition-all duration-300 ${isOpen ? "rotate-0 opacity-100" : "-rotate-90 opacity-0"}`}
                />
              </div>
            </Button>
          </div>
        </div>

        <div
          className={`md:hidden overflow-hidden transition-all duration-500 ${
            isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="border-t border-gray-200/50 backdrop-blur-sm">
            <div className="py-3 space-y-1">
              {navItems.map((item, index) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg mx-2 transition-all duration-300 transform hover:scale-105 group"
                  style={{color: '#0065F8', backgroundColor: 'transparent', animationDelay: `${index * 0.1}s`}}
                  onClick={() => setIsOpen(false)}
                >
                  {item.icon && <item.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />}
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
              <div className="pt-3 space-y-3 border-t border-gray-200/50 mt-3 mx-2">
                {user ? (
                  <>
                    <div className="px-4 py-2 text-sm text-gray-600">
                      Merhaba, {user.displayName || user.email}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        handleLogout()
                        setIsOpen(false)
                      }}
                      className="w-full justify-start transition-all duration-300"
                      style={{color: '#0065F8', backgroundColor: 'transparent'}}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Çıkış Yap
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/login" onClick={() => setIsOpen(false)}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start transition-all duration-300"
                        style={{color: '#0065F8', backgroundColor: 'transparent'}}
                      >
                        Giriş Yap
                      </Button>
                    </Link>
                    <Link href="/register" onClick={() => setIsOpen(false)}>
                      <Button
                        size="sm"
                        className="w-full text-white shadow-lg transition-all duration-300"
                        style={{background: 'linear-gradient(135deg, #4300FF 0%, #0065F8 100%)', boxShadow: '0 10px 25px -5px rgba(67, 0, 255, 0.3)'}}
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Kayıt Ol
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
