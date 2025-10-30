'use client'

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
    getUserStats,
    getPostsByTag,
    getAllPosts,
    createPost,
    likePost,
    unlikePost,
    bookmarkPost,
    unbookmarkPost,
    getUserLikes,
    getUserBookmarks,
    createReply,
    getRepliesByPost,
    Post,
    Reply
} from '@/lib/firestore';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { MessageCircle, Heart, Bookmark, Send, Maximize2, Search } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/navbar';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';

// Gönderi Oluşturma Formu
const CreatePostForm = ({ userTag, onPostCreated }: { userTag: string, onPostCreated: () => void }) => {
    const { user } = useAuth();
    const [content, setContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    if (!user) return null;

    const handleSubmit = async () => {
        if (!content.trim()) {
            toast({ title: 'Hata', description: 'Gönderi boş olamaz.', variant: 'destructive' });
            return;
        }
        setIsLoading(true);
        try {
            await createPost({
                userId: user.uid,
                userDisplayName: user.displayName || 'Anonim',
                userPhotoURL: user.photoURL || '/placeholder-user.jpg',
                userTag,
                content,
            });
            setContent('');
            onPostCreated();
            toast({ title: 'Başarılı!', description: 'Gönderiniz paylaşıldı.' });
        } catch (error) {
            toast({ title: 'Hata', description: 'Gönderi oluşturulurken bir sorun oluştu.', variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative group mb-8">
            <div className="absolute inset-0 -z-10 rounded-2xl blur-2xl opacity-30 transition-opacity duration-500 group-hover:opacity-60" style={{background: 'radial-gradient(120px 120px at 20% 20%, rgba(67,0,255,.25), transparent 60%), radial-gradient(140px 140px at 80% 30%, rgba(0,101,248,.25), transparent 60%)'}} />
            <div className="rounded-2xl p-[1px] bg-[linear-gradient(135deg,rgba(67,0,255,0.25),rgba(0,101,248,0.25))]">
            <Card className="shadow-md hover:shadow-xl transition-all duration-300 border-0 hover:-translate-y-0.5 focus-within:ring-1 focus-within:ring-blue-300/60 rounded-2xl">
                <CardHeader className="flex flex-row items-start space-x-4 p-4">
                <Avatar>
                    <AvatarImage src={user.photoURL || '/placeholder-user.jpg'} />
                    <AvatarFallback>{user.displayName?.charAt(0) || 'T'}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <Textarea
                        placeholder="Alanınızla ilgili bir tartışma başlatın..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        wrap="soft"
                        rows={4}
                        className="w-full bg-gray-50/60 border-gray-200 rounded-lg p-3 text-sm focus:ring-blue-500 focus:border-blue-500 min-h-[80px] max-h-64 transition-colors resize-y overflow-y-auto overflow-x-hidden break-all whitespace-pre-wrap"
                        style={{ overflowWrap: 'anywhere', wordBreak: 'break-word' }}
                    />
                </div>
                </CardHeader>
                <CardContent className="flex justify-end p-4 pt-0">
                <Button onClick={handleSubmit} disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg transition-all active:scale-[0.98]">
                    <Send size={16} className="mr-2"/>
                    {isLoading ? 'Gönderiliyor...' : 'Gönder'}
                </Button>
                </CardContent>
            </Card>
            </div>
        </div>
    );
};

// Yanıtlar Bölümü (Dialog içinde)
const ReplySection = ({ post, user }: { post: Post, user: any }) => {
    const [replies, setReplies] = useState<Reply[]>([]);
    const [newReply, setNewReply] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        const fetchReplies = async () => {
            setIsLoading(true);
            try {
                const replyData = await getRepliesByPost(post.id!);
                setReplies(replyData);
            } catch (error) {
                toast({ title: 'Hata', description: 'Yanıtlar yüklenemedi.', variant: 'destructive' });
            }
            setIsLoading(false);
        };
        fetchReplies();
    }, [post.id, toast]);

    const handleReplySubmit = async () => {
        if (!newReply.trim() || !user) return;
        setIsLoading(true);
        try {
            await createReply({
                postId: post.id!,
                userId: user.uid,
                userDisplayName: user.displayName || 'Anonim',
                userPhotoURL: user.photoURL || '/placeholder-user.jpg',
                content: newReply
            });
            setNewReply('');
            const updatedReplies = await getRepliesByPost(post.id!); // Refresh
            setReplies(updatedReplies);
            // Optionally, we can pass a function to update the reply count on the main page
        } catch (error) {
            toast({ title: 'Hata', description: 'Yanıt gönderilemedi.', variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <DialogContent className="sm|max-w-[625px]" aria-describedby="replies-desc">
            <DialogHeader>
                <DialogTitle>Yanıtlar</DialogTitle>
                <DialogDescription id="replies-desc">Gönderiye yapılan yanıtları görüntüleyin ve yeni yanıt ekleyin.</DialogDescription>
            </DialogHeader>
            <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
                {isLoading && <p>Yükleniyor...</p>}
                {!isLoading && replies.length === 0 && <p className="text-center text-gray-500">Henüz yanıt yok.</p>}
                {replies.map(reply => (
                    <div key={reply.id} className="flex items-start space-x-3">
                        <Avatar>
                            <AvatarImage src={reply.userPhotoURL} />
                            <AvatarFallback>{reply.userDisplayName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 bg-gray-100 rounded-lg p-3">
                            <p className="font-semibold text-sm">{reply.userDisplayName}</p>
                            <p className="text-sm text-gray-700">{reply.content}</p>
                        </div>
                    </div>
                ))}
            </div>
            <div className="p-4 border-t">
                <div className="flex items-start space-x-3">
                    <Avatar>
                        <AvatarImage src={user?.photoURL || '/placeholder-user.jpg'} />
                        <AvatarFallback>{user?.displayName?.charAt(0) || 'Y'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <Textarea placeholder="Yanıtınızı yazın..." value={newReply} onChange={e => setNewReply(e.target.value)} />
                        <Button onClick={handleReplySubmit} disabled={isLoading} className="mt-2 bg-indigo-600 hover:bg-indigo-700">
                            Yanıtla
                        </Button>
                    </div>
                </div>
            </div>
        </DialogContent>
    );
};

// Detay modalı içeriği (gönderi + yanıtlar)
const PostDetailModalContent = ({ post, user }: { post: Post, user: any }) => {
    const [replies, setReplies] = useState<Reply[]>([]);
    const [newReply, setNewReply] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        const fetchReplies = async () => {
            setIsLoading(true);
            try {
                const replyData = await getRepliesByPost(post.id!);
                setReplies(replyData);
            } catch (error) {
                toast({ title: 'Hata', description: 'Yanıtlar yüklenemedi.', variant: 'destructive' });
            }
            setIsLoading(false);
        };
        fetchReplies();
    }, [post.id, toast]);

    const handleReplySubmit = async () => {
        if (!newReply.trim() || !user) return;
        setIsLoading(true);
        try {
            await createReply({
                postId: post.id!,
                userId: user.uid,
                userDisplayName: user.displayName || 'Anonim',
                userPhotoURL: user.photoURL || '/placeholder-user.jpg',
                content: newReply
            });
            setNewReply('');
            const updatedReplies = await getRepliesByPost(post.id!);
            setReplies(updatedReplies);
        } catch (error) {
            toast({ title: 'Hata', description: 'Yanıt gönderilemedi.', variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="text-gray-700 whitespace-pre-wrap break-all" style={{ overflowWrap: 'anywhere', wordBreak: 'break-word' }}>
                {post.content}
            </div>
            <Separator />
            <div className="max-h-[50vh] overflow-y-auto space-y-3">
                {isLoading && <p>Yükleniyor...</p>}
                {!isLoading && replies.length === 0 && <p className="text-gray-500">Henüz yanıt yok.</p>}
                {replies.map(reply => (
                    <div key={reply.id} className="flex items-start space-x-3">
                        <Avatar>
                            <AvatarImage src={reply.userPhotoURL} />
                            <AvatarFallback>{reply.userDisplayName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 bg-gray-100 rounded-lg p-3">
                            <p className="font-semibold text-sm">{reply.userDisplayName}</p>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap break-words" style={{ overflowWrap: 'anywhere', wordBreak: 'break-word' }}>{reply.content}</p>
                        </div>
                    </div>
                ))}
            </div>
            <div className="p-2 border-t rounded-lg bg-white">
                <div className="flex items-start space-x-3">
                    <Avatar>
                        <AvatarImage src={user?.photoURL || '/placeholder-user.jpg'} />
                        <AvatarFallback>{user?.displayName?.charAt(0) || 'Y'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <Textarea placeholder="Yanıtınızı yazın..." value={newReply} onChange={e => setNewReply(e.target.value)} className="min-h-[64px]" />
                        <Button onClick={handleReplySubmit} disabled={isLoading} className="mt-2 bg-indigo-600 hover:bg-indigo-700">
                            Yanıtla
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Gönderi Kartı
const PostCard = ({ post, isLiked, isBookmarked, onLikeToggle, onBookmarkToggle, onReplyCreated, user }: { post: Post, isLiked: boolean, isBookmarked: boolean, onLikeToggle: (postId: string) => void, onBookmarkToggle: (postId: string) => void, onReplyCreated: (postId: string) => void, user: any }) => {
    return (
        <>
            {/* Card + top-right detail link to dedicated page */}
                <div className="group relative mb-6 h-full">
                    <div className="absolute inset-0 -z-10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{background: 'linear-gradient(120deg, rgba(67,0,255,0.10), rgba(0,101,248,0.10))'}} />
                    <div className="rounded-2xl p-[1px] bg-[linear-gradient(135deg,rgba(67,0,255,0.22),rgba(0,101,248,0.22))] transition-transform h-full">
                        <Card className="h-full flex flex-col shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border-0 hover:-translate-y-1 hover:ring-1 hover:ring-blue-200/70 rounded-2xl">
                            <CardHeader className="p-4 bg-gray-50/60 relative">
                                <div className="flex items-center space-x-4">
                                            <Avatar>
                                                <AvatarImage src={post.userPhotoURL || '/placeholder-user.jpg'} />
                                                <AvatarFallback>{post.userDisplayName?.charAt(0) || 'A'}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-semibold text-gray-800">{post.userDisplayName}</p>
                                                <p className="text-xs text-gray-500">@{post.userTag} · {new Date(post.createdAt.seconds * 1000).toLocaleDateString()}</p>
                                            </div>
                                </div>
                                <Link href={`/topluluk/${post.id}`} className="absolute top-2 right-2">
                                    <Button size="icon" variant="ghost" className="rounded-full hover:bg-blue-50/70 hover:text-blue-600" aria-label="Detayları aç">
                                        <Maximize2 size={18} />
                                    </Button>
                                </Link>
                            </CardHeader>
                            <CardContent className="p-4 flex-1">
                                <p className="mb-4 text-gray-700 whitespace-pre-wrap break-all" style={{ overflowWrap: 'anywhere', wordBreak: 'break-word', display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: '88px' }}>
                                    {post.content}
                                </p>
                            </CardContent>
                            <CardFooter className="mt-auto p-4 border-t bg-white/40 backdrop-blur">
                                <div className="flex justify-between items-center w-full text-gray-600">
                                    <Button variant="ghost" className="flex items-center space-x-2 hover:text-blue-600 hover:bg-blue-50/70 rounded-lg transition-all active:scale-[0.98]" onClick={(e) => e.stopPropagation()}>
                                        <MessageCircle size={18} />
                                        <span className="text-sm font-medium">{post.replyCount || 0} Yanıt</span>
                                    </Button>
                                    <Button variant="ghost" className={`flex items-center space-x-2 hover:text-red-600 hover:bg-red-50/70 rounded-lg transition-all active:scale-[0.98] ${isLiked ? 'text-red-600' : ''}`} onClick={(e) => { e.stopPropagation(); onLikeToggle(post.id!); }}>
                                        <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} />
                                        <span className="text-sm font-medium">{post.likeCount || 0} Beğen</span>
                                    </Button>
                                    <Button variant="ghost" className={`flex items-center space-x-2 hover:text-yellow-600 hover:bg-yellow-50/70 rounded-lg transition-all active:scale-[0.98] ${isBookmarked ? 'text-yellow-600' : ''}`} onClick={(e) => { e.stopPropagation(); onBookmarkToggle(post.id!); }}>
                                        <Bookmark size={18} fill={isBookmarked ? 'currentColor' : 'none'} />
                                        <span className="text-sm font-medium">Kaydet</span>
                                    </Button>
                                </div>
                            </CardFooter>
                        </Card>
                    </div>
                </div>
        </>
    );
};

// Ana Sayfa Bileşeni
const ToplulukPage = () => {
    const { user } = useAuth();
    const [mounted, setMounted] = useState(false);
    const [userTag, setUserTag] = useState<string | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
    const [bookmarkedPosts, setBookmarkedPosts] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'popular' | 'recent' | 'saved'>('all');
    const [query, setQuery] = useState('');
    const [showAll, setShowAll] = useState(false);
    const { toast } = useToast();

    const fetchFeedData = useCallback(async (tag: string, uid: string) => {
        try {
            const [postData, likedData, bookmarkedData] = await Promise.all([
                showAll ? getAllPosts() : getPostsByTag(tag),
                getUserLikes(uid),
                getUserBookmarks(uid)
            ]);
            setPosts(postData);
            setLikedPosts(new Set(likedData));
            setBookmarkedPosts(new Set(bookmarkedData));
        } catch (error) {
            console.error("Error fetching feed data: ", error);
            toast({ title: 'Hata', description: 'Akış verileri yüklenirken bir sorun oluştu.', variant: 'destructive' });
        }
    }, [toast, showAll]);

    const onReplyCreated = (postId: string) => {
        const updatedPosts = posts.map(p => p.id === postId ? { ...p, replyCount: p.replyCount + 1 } : p);
        setPosts(updatedPosts);
    };

    useEffect(() => {
        setMounted(true);
        const init = async () => {
            if (user) {
                setLoading(true);
                const stats = await getUserStats(user.uid);
                if (stats && stats.tag) {
                    setUserTag(stats.tag);
                    await fetchFeedData(stats.tag, user.uid);
                }
                setLoading(false);
            }
        };
        init();
    }, [user, fetchFeedData]);

    const handlePostCreated = useCallback(() => {
        if (user && userTag) {
            fetchFeedData(userTag, user.uid);
        }
    }, [user, userTag, fetchFeedData]);

    const handleLikeToggle = async (postId: string) => {
        if (!user) return;
        const isLiked = likedPosts.has(postId);
        const updatedPosts = posts.map(p => p.id === postId ? { ...p, likeCount: p.likeCount + (isLiked ? -1 : 1) } : p);
        setPosts(updatedPosts);
        const updatedLikedPosts = new Set(likedPosts);
        if(isLiked) updatedLikedPosts.delete(postId); else updatedLikedPosts.add(postId);
        setLikedPosts(updatedLikedPosts);

        try {
            if (isLiked) await unlikePost(postId, user.uid); else await likePost(postId, user.uid);
        } catch (error) {
            setPosts(posts);
            setLikedPosts(likedPosts);
            toast({ title: 'Hata', description: 'Beğenme işlemi sırasında bir sorun oluştu.', variant: 'destructive' });
        }
    };

    const handleBookmarkToggle = async (postId: string) => {
        if (!user) return;
        const isBookmarked = bookmarkedPosts.has(postId);
        const updatedBookmarkedPosts = new Set(bookmarkedPosts);
        if(isBookmarked) updatedBookmarkedPosts.delete(postId); else updatedBookmarkedPosts.add(postId);
        setBookmarkedPosts(updatedBookmarkedPosts);

        try {
            if (isBookmarked) await unbookmarkPost(postId, user.uid); else await bookmarkPost(postId, user.uid);
            toast({ title: 'Başarılı', description: isBookmarked ? 'Gönderi kaydedilenlerden kaldırıldı.' : 'Gönderi kaydedildi.' });
        } catch (error) {
            setBookmarkedPosts(bookmarkedPosts);
            toast({ title: 'Hata', description: 'Kaydetme işlemi sırasında bir sorun oluştu.', variant: 'destructive' });
        }
    };

    const filteredPosts = posts
        .filter(p => {
            if (filter === 'saved') return bookmarkedPosts.has(p.id!);
            return true;
        })
        .filter(p => {
            if (!query.trim()) return true;
            const q = query.toLowerCase();
            return (
                (p.content || '').toLowerCase().includes(q) ||
                (p.userDisplayName || '').toLowerCase().includes(q)
            );
        })
        .sort((a, b) => {
            if (filter === 'popular') return (b.likeCount || 0) - (a.likeCount || 0);
            if (filter === 'recent') return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
            return 0;
        });

    const LoadingSkeleton = (
        <>
            <Navbar />
            <div className="min-h-screen pt-20" style={{background: 'linear-gradient(180deg, #F8FAFF 0%, #FFFFFF 100%)'}}>
                <div className="container mx-auto max-w-6xl py-10 px-4 sm:px-6 lg:px-8">
                    <div className="mb-8">
                        <div className="h-9 w-48 rounded-lg bg-gray-200 dark:bg-gray-800" />
                        <div className="mt-2 h-5 w-80 rounded bg-gray-200 dark:bg-gray-800" />
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-4">
                            {[...Array(4)].map((_, i) => (
                                <Card key={i} className="overflow-hidden">
                                    <CardHeader className="bg-gray-50/60">
                                        <div className="flex items-center gap-3">
                                            <Skeleton className="h-10 w-10 rounded-full" />
                                            <div className="space-y-2">
                                                <Skeleton className="h-4 w-40" />
                                                <Skeleton className="h-3 w-24" />
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-4 w-5/6" />
                                        <Skeleton className="h-4 w-3/5" />
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                        <div className="space-y-4">
                            <Card className="p-4">
                                <Skeleton className="h-4 w-32 mb-3" />
                                <Skeleton className="h-10 w-full" />
                            </Card>
                            <Card className="p-4">
                                <Skeleton className="h-4 w-40 mb-3" />
                                <div className="space-y-2">
                                    {[...Array(5)].map((_, j) => (
                                        <Skeleton key={j} className="h-3 w-2/3" />
                                    ))}
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );

    if (loading) {
        return LoadingSkeleton;
    }

    if (!user) {
        return (
             <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8 text-center">
                <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100 sm:text-5xl md:text-6xl">Topluluk Akışı</h1>
                <p className="mt-3 max-w-md mx-auto text-base text-gray-500 dark:text-gray-400 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">Gönderileri görmek ve kendi düşüncelerinizi paylaşmak için lütfen platforma giriş yapın.</p>
             </div>
        )
    }
    
    if (!userTag) {
        return (
             <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8 text-center">
                <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100 sm:text-5xl md:text-6xl">Topluluğa Katılın</h1>
                <p className="mt-3 max-w-md mx-auto text-base text-gray-500 dark:text-gray-400 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">Topluluk akışına erişmek ve diğer profesyonellerle etkileşimde bulunmak için lütfen profilinizden bir alan (tag) seçin.</p>
             </div>
        )
    }

    return (
        <>
            <Navbar />
            <div className="min-h-screen pt-20 relative" style={{background: 'linear-gradient(180deg, #F8FAFF 0%, #FFFFFF 100%)'}}>
                <div className="pointer-events-none absolute inset-x-0 top-16 mx-auto h-64 max-w-6xl opacity-60 blur-3xl" style={{background: 'radial-gradient(320px 180px at 15% 30%, rgba(67,0,255,.12), transparent 60%), radial-gradient(360px 200px at 85% 20%, rgba(0,101,248,.12), transparent 60%)'}} />
                <div className="container mx-auto max-w-6xl py-10 px-4 sm:px-6 lg:px-8 relative">
                    <header className={`mb-8 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} animate-fade-in-up`}>
                        <div className="flex flex-col gap-2">
                            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight drop-shadow-sm">
                                <span className="bg-clip-text text-transparent" style={{background: 'linear-gradient(90deg, #4300FF 0%, #0065F8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>
                                    {userTag}
                                </span>{' '}
                                Topluluğu
                            </h1>
                            <p className="text-base md:text-lg text-gray-600">Alanınızdaki profesyonellerle bağlantı kurun, paylaşın ve öğrenin.</p>
                        </div>
                        <div className="mt-6 flex flex-col md:flex-row gap-3">
                            <div className="relative md:flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <Input
                                    placeholder="Gönderilerde ara..."
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    className="pl-9 h-10"
                                    aria-label="Gönderilerde ara"
                                />
                            </div>
                            <Tabs value={filter} onValueChange={(v) => setFilter(v as any)} className="md:w-auto">
                                <TabsList className="grid grid-cols-4">
                                    <TabsTrigger value="all">Tümü</TabsTrigger>
                                    <TabsTrigger value="popular">Popüler</TabsTrigger>
                                    <TabsTrigger value="recent">En Yeni</TabsTrigger>
                                    <TabsTrigger value="saved">Kaydedilenler</TabsTrigger>
                                </TabsList>
                            </Tabs>
                            <Button
                                variant={showAll ? 'default' : 'outline'}
                                className="h-10"
                                onClick={() => {
                                    if (!user || !userTag) return;
                                    setShowAll((prev) => !prev);
                                    // fetch immediately with new mode
                                    fetchFeedData(userTag, user.uid);
                                }}
                                aria-pressed={showAll}
                                aria-label="Tüm alanlardaki gönderileri göster"
                            >
                                {showAll ? 'Sadece Alanım' : 'Tüm Alanlar'}
                            </Button>
                        </div>
                    </header>

                    <main className={`transition-opacity duration-700 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2">
                                <CreatePostForm userTag={userTag} onPostCreated={handlePostCreated} />
                                <Separator className="my-6"/>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {filteredPosts.length > 0 ? (
                                        filteredPosts.map((post, idx) => (
                                            <div key={post.id} style={{transitionDelay: `${Math.min(idx, 6) * 60}ms`}} className={`h-full transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'} animate-fade-in-up`}>
                                                <PostCard
                                                    post={post}
                                                    isLiked={likedPosts.has(post.id!)}
                                                    isBookmarked={bookmarkedPosts.has(post.id!)}
                                                    onLikeToggle={handleLikeToggle}
                                                    onBookmarkToggle={handleBookmarkToggle}
                                                    onReplyCreated={onReplyCreated}
                                                    user={user}
                                                />
                                            </div>
                                        ))
                                    ) : (
                                        <div className="col-span-full">
                                            <Card className="bg-white/70 backdrop-blur border border-gray-200">
                                                <CardContent className="py-12 text-center">
                                                    <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600">✨</div>
                                                    <h3 className="text-lg font-semibold text-gray-800">Sonuç bulunamadı</h3>
                                                    <p className="text-gray-500 mt-1">Filtreleri değiştirin veya farklı bir arama deneyin.</p>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <aside className="lg:sticky lg:top-24 lg:h-[calc(100vh-7rem)] space-y-6">
                                <Card className="overflow-hidden">
                                    <CardHeader className="bg-gray-50/60">
                                        <p className="font-semibold">Profiliniz</p>
                                    </CardHeader>
                                    <CardContent className="pt-4">
                                        <div className="flex items-center gap-3">
                                            <Avatar>
                                                <AvatarImage src={user?.photoURL || '/placeholder-user.jpg'} />
                                                <AvatarFallback>{user?.displayName?.charAt(0) || 'U'}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium">{user?.displayName || 'Anonim'}</p>
                                                <p className="text-xs text-gray-500">@{userTag}</p>
                                            </div>
                                        </div>
                                        <div className="mt-4 flex items-center gap-2">
                                            <Badge variant="secondary">{posts.length} gönderi</Badge>
                                            <Badge variant="outline">{bookmarkedPosts.size} kaydedilen</Badge>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <p className="font-semibold">İpuçları</p>
                                    </CardHeader>
                                    <CardContent className="text-sm text-gray-600 space-y-2">
                                        <p>• Daha fazla etkileşim için net başlıklar ve kısa içerikler yazın.</p>
                                        <p>• Uzmanlık alanınıza uygun etiketler kullanın.</p>
                                        <p>• Faydalı yanıtları beğenmeyi ve kaydetmeyi unutmayın.</p>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <p className="font-semibold">Topluluk kuralları</p>
                                    </CardHeader>
                                    <CardContent className="text-sm text-gray-600">
                                        <ul className="list-disc pl-5 space-y-1">
                                            <li>Saygılı ve yapıcı olun.</li>
                                            <li>Spam ve reklam paylaşmayın.</li>
                                            <li>Gizlilik ve telif haklarına uyun.</li>
                                        </ul>
                                    </CardContent>
                                </Card>
                            </aside>
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
};

export default ToplulukPage;
