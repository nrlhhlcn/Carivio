'use client'

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
    getUserStats,
    getPostsByTag,
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MessageCircle, Heart, Bookmark, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
        <Card className="mb-8 shadow-md hover:shadow-lg transition-shadow duration-300">
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
                        className="w-full bg-gray-50/50 border-gray-200 rounded-lg p-3 text-sm focus:ring-blue-500 focus:border-blue-500 min-h-[80px]"
                    />
                </div>
            </CardHeader>
            <CardContent className="flex justify-end p-4 pt-0">
                <Button onClick={handleSubmit} disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-700">
                    <Send size={16} className="mr-2"/>
                    {isLoading ? 'Gönderiliyor...' : 'Gönder'}
                </Button>
            </CardContent>
        </Card>
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
        <DialogContent className="sm:max-w-[625px]">
            <DialogHeader>
                <DialogTitle>Yanıtlar</DialogTitle>
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

// Gönderi Kartı
const PostCard = ({ post, isLiked, isBookmarked, onLikeToggle, onBookmarkToggle, onReplyCreated, user }: { post: Post, isLiked: boolean, isBookmarked: boolean, onLikeToggle: (postId: string) => void, onBookmarkToggle: (postId: string) => void, onReplyCreated: (postId: string) => void, user: any }) => {
    return (
        <Dialog>
            <Card className="mb-6 shadow-sm hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                <CardHeader className="p-4 bg-gray-50/50">
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
                </CardHeader>
                <CardContent className="p-4">
                    <p className="mb-4 text-gray-700 whitespace-pre-wrap">
                        {post.content}
                    </p>
                </CardContent>
                 <CardFooter className="p-4 border-t">
                    <div className="flex justify-between items-center w-full text-gray-600">
                        <DialogTrigger asChild>
                            <Button variant="ghost" className="flex items-center space-x-2 hover:text-blue-500 hover:bg-blue-50 rounded-lg">
                                <MessageCircle size={18} />
                                <span className="text-sm font-medium">{post.replyCount || 0} Yanıt</span>
                            </Button>
                        </DialogTrigger>
                        <Button variant="ghost" className={`flex items-center space-x-2 hover:text-red-500 hover:bg-red-50 rounded-lg ${isLiked ? 'text-red-500' : ''}`} onClick={() => onLikeToggle(post.id!)}>
                            <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} />
                            <span className="text-sm font-medium">{post.likeCount || 0} Beğen</span>
                        </Button>
                        <Button variant="ghost" className={`flex items-center space-x-2 hover:text-yellow-500 hover:bg-yellow-50 rounded-lg ${isBookmarked ? 'text-yellow-500' : ''}`} onClick={() => onBookmarkToggle(post.id!)}>
                            <Bookmark size={18} fill={isBookmarked ? 'currentColor' : 'none'} />
                            <span className="text-sm font-medium">Kaydet</span>
                        </Button>
                    </div>
                </CardFooter>
            </Card>
            <ReplySection post={post} user={user} />
        </Dialog>
    );
};

// Ana Sayfa Bileşeni
const ToplulukPage = () => {
    const { user } = useAuth();
    const [userTag, setUserTag] = useState<string | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
    const [bookmarkedPosts, setBookmarkedPosts] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    const fetchFeedData = useCallback(async (tag: string, uid: string) => {
        try {
            const [postData, likedData, bookmarkedData] = await Promise.all([
                getPostsByTag(tag),
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
    }, [toast]);

    const onReplyCreated = (postId: string) => {
        const updatedPosts = posts.map(p => p.id === postId ? { ...p, replyCount: p.replyCount + 1 } : p);
        setPosts(updatedPosts);
    };

    useEffect(() => {
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

    if (loading) {
        return <div className="container mx-auto py-12 text-center">Topluluk akışı yükleniyor...</div>;
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
        <div className="bg-gray-50 min-h-screen">
            <div className="container mx-auto max-w-3xl py-12 px-4 sm:px-6 lg:px-8">
                <header className="mb-10 text-center">
                    <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
                        <span className="text-indigo-600">{userTag}</span> Topluluğu
                    </h1>
                    <p className="mt-2 text-xl text-gray-500 dark:text-gray-400">Alanınızdaki diğer profesyonellerle bağlantı kurun ve etkileşimde bulunun.</p>
                </header>

                <main>
                    <CreatePostForm userTag={userTag} onPostCreated={handlePostCreated} />
                    <Separator className="my-8"/>
                    <div className="flow-y-6">
                        {posts.length > 0 ? (
                            posts.map(post => (
                                <PostCard 
                                    key={post.id} 
                                    post={post} 
                                    isLiked={likedPosts.has(post.id!)}
                                    isBookmarked={bookmarkedPosts.has(post.id!)}
                                    onLikeToggle={handleLikeToggle}
                                    onBookmarkToggle={handleBookmarkToggle}
                                    onReplyCreated={onReplyCreated} // Pass the function here
                                    user={user}
                                />
                            ))
                        ) : (
                            <div className="text-center py-16 px-4 bg-white rounded-lg shadow-md">
                                <h3 className="text-lg font-medium text-gray-800">Henüz gönderi yok.</h3>
                                <p className="text-gray-500 mt-1">Bu topluluktaki ilk gönderiyi paylaşan siz olun!</p>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default ToplulukPage;
