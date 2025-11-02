'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { 
  getUserStats, 
  getUserById, 
  getPostsByUser, 
  getRepliesByUser,
  Post,
  Reply 
} from '@/lib/firestore'
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import Navbar from '@/components/navbar'
import { useToast } from '@/hooks/use-toast'
import { 
  ArrowLeft, 
  User, 
  FileText, 
  MessageSquare, 
  Trophy, 
  TrendingUp,
  Calendar,
  Sparkles,
  Award,
  Star
} from 'lucide-react'

export default function PublicProfilePage() {
  const params = useParams<{ userId: string }>()
  const router = useRouter()
  const { user: currentUser } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [userData, setUserData] = useState<any>(null)
  const [userStats, setUserStats] = useState<any>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [replies, setReplies] = useState<Reply[]>([])
  const [activeTab, setActiveTab] = useState<'posts' | 'replies'>('posts')

  const loadUserData = useCallback(async () => {
    if (!params?.userId) return
    setLoading(true)
    try {
      const [userDoc, stats, userPosts] = await Promise.all([
        getUserById(params.userId).catch(() => null),
        getUserStats(params.userId).catch(() => null),
        getPostsByUser(params.userId).catch(() => [])
      ])

      // Kullanıcının tüm yorumlarını getir
      const allReplies = await getRepliesByUser(params.userId).catch(() => [])

      // Eğer userDoc yoksa, en azından gönderilerden veya yorumlardan bilgi çek
      if (!userDoc && (userPosts.length > 0 || allReplies.length > 0)) {
        const firstPost = userPosts[0]
        const firstReply = allReplies[0]
        const fallbackData = {
          userId: params.userId,
          displayName: firstPost?.userDisplayName || firstReply?.userDisplayName || 'Kullanıcı',
          photoURL: firstPost?.userPhotoURL || firstReply?.userPhotoURL || '/placeholder-user.jpg',
          tag: firstPost?.userTag || undefined
        }
        setUserData(fallbackData)
      } else {
        setUserData(userDoc)
      }
      
      setUserStats(stats)
      setPosts(userPosts.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0)))
      setReplies(allReplies.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0)))
    } catch (error) {
      console.error('Error loading user data:', error)
      toast({ title: 'Hata', description: 'Kullanıcı bilgileri yüklenemedi', variant: 'destructive' })
      // router.back() yerine sadece hata göster
    } finally {
      setLoading(false)
    }
  }, [params?.userId, router, toast])

  useEffect(() => {
    loadUserData()
  }, [loadUserData])

  const isOwnProfile = currentUser?.uid === params?.userId
  const isProfilePublic = userStats?.isProfilePublic !== undefined ? userStats.isProfilePublic : true
  const displayName = userData?.displayName || posts[0]?.userDisplayName || replies[0]?.userDisplayName || 'Kullanıcı'
  const photoURL = userData?.photoURL || posts[0]?.userPhotoURL || replies[0]?.userPhotoURL || '/placeholder-user.jpg'
  const tag = userStats?.tag || userData?.tag || posts[0]?.userTag
  
  // Gizlilik kontrolü: Eğer profil gizliyse ve kendi profili değilse
  if (!isProfilePublic && !isOwnProfile && !loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen pt-20 bg-gradient-to-b from-gray-50 to-white">
          <div className="container mx-auto max-w-6xl py-8 px-4">
            <div className="mb-6">
              <Button variant="ghost" onClick={() => router.back()} className="gap-2">
                <ArrowLeft size={16} />
                Geri Dön
              </Button>
            </div>
            
            <Card className="shadow-lg border-none rounded-xl overflow-hidden">
              <CardContent className="p-12 text-center">
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-6">
                    <Lock className="w-12 h-12 text-gray-400" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-3">Bu Hesap Gizli</h2>
                  <p className="text-gray-600 text-lg max-w-md mx-auto mb-6">
                    Bu kullanıcı profilini gizli olarak ayarlamış. Profil bilgileri görüntülenemiyor.
                  </p>
                  <Button onClick={() => router.back()} variant="outline" className="gap-2">
                    <ArrowLeft size={16} />
                    Geri Dön
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </>
    )
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen pt-20">
          <div className="container mx-auto max-w-6xl py-8 px-4">
            <div className="mb-6">
              <Skeleton className="h-10 w-32" />
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center space-y-4">
                      <Skeleton className="w-32 h-32 rounded-full" />
                      <Skeleton className="h-6 w-32" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="md:col-span-2">
                <Skeleton className="h-96 w-full" />
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }

  // Eğer hiç veri yoksa (ne userDoc ne de gönderi/yorum), hata göster
  const hasNoData = posts.length === 0 && replies.length === 0 && !userData
  
  if (hasNoData && !loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen pt-20">
          <div className="container mx-auto max-w-6xl py-8 px-4 text-center">
            <h1 className="text-2xl font-bold mb-4">Kullanıcı Bulunamadı</h1>
            <Link href="/topluluk">
              <Button>Topluluğa Dön</Button>
            </Link>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen pt-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto max-w-6xl py-8 px-4">
          {/* Back Button */}
          <div className="mb-6">
            <Button variant="ghost" onClick={() => router.back()} className="gap-2">
              <ArrowLeft size={16} />
              Geri Dön
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Left Sidebar - Profile Info */}
            <div className="md:col-span-1">
              <Card className="sticky top-24">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center space-y-4">
                    <Avatar className="w-32 h-32 border-4 border-indigo-200 shadow-lg">
                      <AvatarImage src={photoURL} />
                      <AvatarFallback className="text-3xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                        {displayName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="text-center">
                      <h1 className="text-2xl font-bold text-gray-900 mb-2">{displayName}</h1>
                      {tag && (
                        <Badge variant="secondary" className="text-sm">
                          {tag}
                        </Badge>
                      )}
                      {userData?.email && (
                        <p className="text-sm text-gray-500 mt-2">{userData.email}</p>
                      )}
                    </div>

                    {isOwnProfile && (
                      <Link href="/profil" className="w-full">
                        <Button className="w-full" variant="outline">
                          Profili Düzenle
                        </Button>
                      </Link>
                    )}

                    <Separator />

                    {/* Stats */}
                    <div className="w-full space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-indigo-600" />
                          <span className="text-sm text-gray-700">Gönderiler</span>
                        </div>
                        <span className="font-bold text-gray-900">{posts.length}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-indigo-600" />
                          <span className="text-sm text-gray-700">Yorumlar</span>
                        </div>
                        <span className="font-bold text-gray-900">{replies.length}</span>
                      </div>
                      {userStats?.totalScore !== undefined && (
                        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
                          <div className="flex items-center gap-2">
                            <Trophy className="w-4 h-4 text-indigo-600" />
                            <span className="text-sm font-semibold text-indigo-900">Toplam Puan</span>
                          </div>
                          <span className="font-bold text-indigo-900">{userStats.totalScore}</span>
                        </div>
                      )}
                      {userStats?.currentRank && (
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-indigo-600" />
                            <span className="text-sm text-gray-700">Sıralama</span>
                          </div>
                          <span className="font-bold text-gray-900">#{userStats.currentRank}</span>
                        </div>
                      )}
                      {userStats?.level && (
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-indigo-600" />
                            <span className="text-sm text-gray-700">Seviye</span>
                          </div>
                          <span className="font-bold text-gray-900">{userStats.level}</span>
                        </div>
                      )}
                      {userStats?.badge && (
                        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                          <div className="flex items-center gap-2">
                            <Award className="w-4 h-4 text-yellow-600" />
                            <span className="text-sm font-semibold text-yellow-900">Rozet</span>
                          </div>
                          <Badge className="bg-yellow-600 text-white">
                            {userStats.badge}
                          </Badge>
                        </div>
                      )}
                    </div>

                    {userData?.createdAt && (
                      <div className="w-full pt-4 border-t">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Calendar className="w-3 h-3" />
                          <span>
                            Katılım: {new Date(userData.createdAt.seconds * 1000).toLocaleDateString('tr-TR')}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Side - Content */}
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="posts" className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Gönderiler ({posts.length})
                      </TabsTrigger>
                      <TabsTrigger value="replies" className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        Yorumlar ({replies.length})
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="posts" className="mt-4">
                      <div className="space-y-4">
                        {posts.length === 0 ? (
                          <div className="text-center py-12 text-gray-500">
                            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                            <p>Henüz gönderi yok.</p>
                          </div>
                        ) : (
                          posts.map((post) => (
                            <Link key={post.id} href={`/topluluk/${post.id}`}>
                              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                                <CardHeader className="pb-3">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <Badge variant="outline">{post.userTag}</Badge>
                                    </div>
                                    <p className="text-xs text-gray-500">
                                      {new Date(post.createdAt.seconds * 1000).toLocaleDateString('tr-TR')}
                                    </p>
                                  </div>
                                </CardHeader>
                                <CardContent>
                                  <p className="text-gray-700 line-clamp-3" style={{ overflowWrap: 'anywhere', wordBreak: 'break-word' }}>
                                    {post.content}
                                  </p>
                                  <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
                                    <span className="flex items-center gap-1">
                                      <MessageSquare className="w-4 h-4" />
                                      {post.replyCount || 0} yorum
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Star className="w-4 h-4" />
                                      {post.likeCount || 0} beğeni
                                    </span>
                                  </div>
                                </CardContent>
                              </Card>
                            </Link>
                          ))
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="replies" className="mt-4">
                      <div className="space-y-4">
                        {replies.length === 0 ? (
                          <div className="text-center py-12 text-gray-500">
                            <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                            <p>Henüz yorum yok.</p>
                          </div>
                        ) : (
                          replies.map((reply) => (
                            <Link key={reply.id} href={`/topluluk/${reply.postId}`}>
                              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                  <p className="text-sm text-gray-700 line-clamp-3" style={{ overflowWrap: 'anywhere', wordBreak: 'break-word' }}>
                                    {reply.content}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-2">
                                    {new Date(reply.createdAt.seconds * 1000).toLocaleString('tr-TR')}
                                  </p>
                                </CardContent>
                              </Card>
                            </Link>
                          ))
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardHeader>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
