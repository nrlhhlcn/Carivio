'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import {
  getPostById,
  getRepliesByPost,
  createReply,
  organizeRepliesIntoTree,
  Post,
  Reply,
} from '@/lib/firestore'
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Reply as ReplyIcon } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import Navbar from '@/components/navbar'
import { useToast } from '@/hooks/use-toast'

// Nested yorum tipi (children içeren)
type ReplyWithChildren = Reply & { children?: ReplyWithChildren[] }

// Recursive Comment Component
const CommentItem = ({ 
  reply, 
  postId, 
  user, 
  onReplyAdded 
}: { 
  reply: ReplyWithChildren
  postId: string
  user: any
  onReplyAdded: () => void
}) => {
  const [showReplyBox, setShowReplyBox] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleReply = async () => {
    if (!user || !replyText.trim()) return
    setIsSubmitting(true)
    try {
      await createReply({
        postId,
        parentReplyId: reply.id!,
        userId: user.uid,
        userDisplayName: user.displayName || 'Anonim',
        userPhotoURL: user.photoURL || '/placeholder-user.jpg',
        content: replyText,
      })
      setReplyText('')
      setShowReplyBox(false)
      onReplyAdded()
    } catch {
      toast({ title: 'Hata', description: 'Yanıt gönderilemedi', variant: 'destructive' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mb-3">
      <div className="flex items-start gap-3">
        <Avatar className="flex-shrink-0">
          <AvatarImage src={reply.userPhotoURL} />
          <AvatarFallback>{reply.userDisplayName.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="bg-gray-100 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <p className="font-medium text-sm">{reply.userDisplayName}</p>
              <p className="text-xs text-gray-500">
                {new Date(reply.createdAt.seconds * 1000).toLocaleString()}
              </p>
            </div>
            <p className="text-sm text-gray-700 whitespace-pre-wrap break-words" style={{ overflowWrap: 'anywhere', wordBreak: 'break-word' }}>
              {reply.content}
            </p>
          </div>
          {user && (
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 text-xs text-gray-600 hover:text-indigo-600"
              onClick={() => setShowReplyBox(!showReplyBox)}
            >
              <ReplyIcon size={14} className="mr-1" />
              Yanıtla
            </Button>
          )}
          {showReplyBox && (
            <div className="mt-3 ml-4 border-l-2 border-gray-200 pl-4">
              <Textarea
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                placeholder="Yanıtınızı yazın..."
                className="min-h-[60px] text-sm"
              />
              <div className="flex gap-2 mt-2">
                <Button
                  onClick={handleReply}
                  disabled={isSubmitting || !replyText.trim()}
                  size="sm"
                  className="bg-indigo-600 hover:bg-indigo-700 text-xs"
                >
                  {isSubmitting ? 'Gönderiliyor...' : 'Gönder'}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowReplyBox(false)
                    setReplyText('')
                  }}
                  className="text-xs"
                >
                  İptal
                </Button>
              </div>
            </div>
          )}
          {/* Nested yorumları göster */}
          {reply.children && reply.children.length > 0 && (
            <div className="mt-3 ml-4 space-y-3 border-l-2 border-gray-200 pl-4">
              {reply.children.map(child => (
                <CommentItem
                  key={child.id}
                  reply={child}
                  postId={postId}
                  user={user}
                  onReplyAdded={onReplyAdded}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function PostDetailPage() {
  const params = useParams<{ postId: string }>()
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const [post, setPost] = useState<Post | null>(null)
  const [replies, setReplies] = useState<Reply[]>([])
  const [loading, setLoading] = useState(true)
  const [newReply, setNewReply] = useState('')

  const load = useCallback(async () => {
    if (!params?.postId) return
    setLoading(true)
    try {
      const p = await getPostById(params.postId)
      if (!p) {
        toast({ title: 'Bulunamadı', description: 'Gönderi bulunamadı', variant: 'destructive' })
        router.back()
        return
      }
      setPost(p)
      const r = await getRepliesByPost(params.postId)
      setReplies(r)
    } finally {
      setLoading(false)
    }
  }, [params?.postId, router, toast])

  useEffect(() => {
    load()
  }, [load])

  const onReply = async () => {
    if (!user || !post || !newReply.trim()) return
    try {
      await createReply({
        postId: post.id!,
        parentReplyId: null,
        userId: user.uid,
        userDisplayName: user.displayName || 'Anonim',
        userPhotoURL: user.photoURL || '/placeholder-user.jpg',
        content: newReply,
      })
      setNewReply('')
      const r = await getRepliesByPost(post.id!)
      setReplies(r)
    } catch {
      toast({ title: 'Hata', description: 'Yanıt gönderilemedi', variant: 'destructive' })
    }
  }

  if (loading) return <div className="container mx-auto py-12 text-center">Yükleniyor...</div>
  if (!post) return null

  return (
    <>
      <Navbar />
      <div className="min-h-screen pt-20">
        <div className="container mx-auto max-w-3xl py-8 px-4">
          <div className="mb-4">
            <Link href="/topluluk">
              <Button variant="ghost" className="gap-2">
                <ArrowLeft size={16} />
                Tüm sorulara dön
              </Button>
            </Link>
          </div>
          <Card className="overflow-hidden">
            <CardHeader className="bg-gray-50/60">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={post.userPhotoURL || '/placeholder-user.jpg'} />
                  <AvatarFallback>{post.userDisplayName?.charAt(0) || 'A'}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{post.userDisplayName}</p>
                  <p className="text-xs text-gray-500">@{post.userTag} · {new Date(post.createdAt.seconds * 1000).toLocaleString()}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-gray-800 whitespace-pre-wrap break-all" style={{ overflowWrap: 'anywhere', wordBreak: 'break-word' }}>
                {post.content}
              </div>
            </CardContent>
            <CardFooter className="p-0">
              <Separator className="w-full" />
            </CardFooter>
          </Card>

          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3">Yanıtlar ({replies.filter(r => !r.parentReplyId).length})</h3>
            <div className="space-y-4">
              {replies.length === 0 && <p className="text-gray-500">Henüz yanıt yok.</p>}
              {replies.length > 0 && (() => {
                const organized = organizeRepliesIntoTree(replies) as ReplyWithChildren[]
                return organized.map(r => (
                  <CommentItem
                    key={r.id}
                    reply={r}
                    postId={post.id!}
                    user={user}
                    onReplyAdded={load}
                  />
                ))
              })()}
            </div>
            {user && (
              <div className="mt-5">
                <Textarea 
                  value={newReply} 
                  onChange={e => setNewReply(e.target.value)} 
                  placeholder="Yanıtınızı yazın..." 
                  className="min-h-[80px]" 
                />
                <Button 
                  onClick={onReply} 
                  disabled={!newReply.trim()}
                  className="mt-2 bg-indigo-600 hover:bg-indigo-700"
                >
                  Yanıtla
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}


