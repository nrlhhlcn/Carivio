'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { getUserStats, getUserById, getPostsByUser, getRepliesByUser } from '@/lib/firestore'
import { 
  User, 
  FileText, 
  MessageSquare, 
  Trophy, 
  TrendingUp,
  ExternalLink,
  Calendar,
  Sparkles,
  EyeOff,
  Lock
} from 'lucide-react'

interface UserPreviewModalProps {
  userId: string
  userDisplayName: string
  userPhotoURL: string
  isOpen: boolean
  onClose: () => void
}

export default function UserPreviewModal({
  userId,
  userDisplayName,
  userPhotoURL,
  isOpen,
  onClose
}: UserPreviewModalProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [userData, setUserData] = useState<any>(null)
  const [postCount, setPostCount] = useState(0)
  const [replyCount, setReplyCount] = useState(0)

  useEffect(() => {
    if (isOpen && userId) {
      loadUserData()
    }
  }, [isOpen, userId])

  const loadUserData = async () => {
    setLoading(true)
    try {
      const [userDoc, stats, posts, replies] = await Promise.all([
        getUserById(userId).catch(() => null),
        getUserStats(userId).catch(() => null),
        getPostsByUser(userId).catch(() => []),
        getRepliesByUser(userId).catch(() => [])
      ])

      // Eğer userDoc yoksa, fallback olarak mevcut bilgileri kullan
      const displayName = userDoc?.displayName || userDisplayName
      const photoURL = userDoc?.photoURL || userPhotoURL
      const tag = stats?.tag || userDoc?.tag
      const isProfilePublic = stats?.isProfilePublic !== undefined ? stats.isProfilePublic : true

      setUserData({
        ...userDoc,
        stats: {
          ...stats,
          isProfilePublic,
        },
        displayName,
        photoURL,
        tag,
        isProfilePublic,
      })
      setPostCount(posts.length)
      setReplyCount(replies.length)
    } catch (error) {
      console.error('Error loading user data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleViewFullProfile = () => {
    onClose()
    router.push(`/kullanici/${userId}`)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Kullanıcı Profili
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Skeleton className="w-20 h-20 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : userData?.isProfilePublic === false ? (
          <div className="space-y-6">
            {/* Gizli Hesap Mesajı */}
            <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
              <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <Lock className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Bu Hesap Gizli</h3>
              <p className="text-gray-600 text-sm max-w-sm">
                Bu kullanıcı profilini gizli olarak ayarlamış. Profil bilgileri görüntülenemiyor.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* User Header */}
            <div className="flex items-start gap-4">
              <Avatar className="w-20 h-20 border-2 border-indigo-200">
                <AvatarImage src={userData?.photoURL || userPhotoURL} />
                <AvatarFallback className="text-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                  {(userData?.displayName || userDisplayName).charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-xl text-gray-900 truncate">
                  {userData?.displayName || userDisplayName}
                </h3>
                {(userData?.stats?.tag || userData?.tag) && (
                  <Badge variant="secondary" className="mt-1">
                    {userData?.stats?.tag || userData?.tag}
                  </Badge>
                )}
                {userData?.email && (
                  <p className="text-sm text-gray-500 mt-1 truncate">{userData.email}</p>
                )}
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-3">
              <Card className="border-2 hover:border-indigo-300 transition-colors">
                <CardContent className="p-4 text-center">
                  <FileText className="w-5 h-5 mx-auto mb-2 text-indigo-600" />
                  <div className="text-2xl font-bold text-gray-900">{postCount}</div>
                  <div className="text-xs text-gray-600 mt-1">Gönderi</div>
                </CardContent>
              </Card>
              <Card className="border-2 hover:border-indigo-300 transition-colors">
                <CardContent className="p-4 text-center">
                  <MessageSquare className="w-5 h-5 mx-auto mb-2 text-indigo-600" />
                  <div className="text-2xl font-bold text-gray-900">{replyCount}</div>
                  <div className="text-xs text-gray-600 mt-1">Yorum</div>
                </CardContent>
              </Card>
              <Card className="border-2 hover:border-indigo-300 transition-colors">
                <CardContent className="p-4 text-center">
                  <Trophy className="w-5 h-5 mx-auto mb-2 text-indigo-600" />
                  <div className="text-2xl font-bold text-gray-900">
                    {userData?.stats?.totalScore || 0}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">Puan</div>
                </CardContent>
              </Card>
            </div>

            {/* Additional Info */}
            {userData?.stats && (
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-700">Sıralama</span>
                  </div>
                  <span className="font-bold text-gray-900">
                    #{userData.stats.currentRank || 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-700">Seviye</span>
                  </div>
                  <span className="font-bold text-gray-900">
                    {userData.stats.level || 'Başlangıç'}
                  </span>
                </div>
                {userData.stats.badge && (
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-indigo-600" />
                      <span className="text-sm font-semibold text-indigo-900">Rozet</span>
                    </div>
                    <Badge className="bg-indigo-600 text-white">
                      {userData.stats.badge}
                    </Badge>
                  </div>
                )}
              </div>
            )}

            {/* View Full Profile Button */}
            <Button
              onClick={handleViewFullProfile}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg"
              size="lg"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Tam Profili Gör
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
