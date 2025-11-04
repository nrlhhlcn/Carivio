import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
  Image,
  RefreshControl,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { MaterialIcons, Ionicons } from '@expo/vector-icons'
import { useAuth } from '../contexts/AuthContext'
import {
  createPost,
  getAllPosts,
  getPostsByTag,
  likePost,
  unlikePost,
  bookmarkPost,
  unbookmarkPost,
  createReply,
  getRepliesByPost,
  getUserLikes,
  getUserBookmarks,
  Post,
  Reply,
  getUserStats,
} from '../services/firestore'
import { Timestamp } from 'firebase/firestore'

const tags = ['Tümü', 'Frontend', 'Backend', 'Fullstack', 'Mobile', 'DevOps', 'Data Science']

export default function CommunityScreen() {
  const [posts, setPosts] = useState<Post[]>([])
  const [selectedTag, setSelectedTag] = useState('Tümü')
  const [newPostContent, setNewPostContent] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [replies, setReplies] = useState<Reply[]>([])
  const [newReply, setNewReply] = useState('')
  const [userLikes, setUserLikes] = useState<string[]>([])
  const [userBookmarks, setUserBookmarks] = useState<string[]>([])
  const [userTag, setUserTag] = useState('')
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      loadUserData()
      loadLikesAndBookmarks()
    }
  }, [user])

  useEffect(() => {
    loadPosts()
  }, [selectedTag])

  const loadUserData = async () => {
    if (!user) return
    try {
      const stats = await getUserStats(user.uid)
      setUserTag(stats?.tag || 'Frontend')
      // Boolean değerleri garantile (eğer kullanılıyorsa)
      if (stats && stats.isProfilePublic !== undefined && typeof stats.isProfilePublic === 'string') {
        // Silently fix the boolean value if needed
      }
    } catch (error) {
      console.error('User data load error:', error)
    }
  }

  const loadLikesAndBookmarks = async () => {
    if (!user) return
    try {
      const [likes, bookmarks] = await Promise.all([
        getUserLikes(user.uid),
        getUserBookmarks(user.uid),
      ])
      setUserLikes(likes)
      setUserBookmarks(bookmarks)
    } catch (error) {
      console.error('Likes/bookmarks load error:', error)
    }
  }

  const loadPosts = async () => {
    setIsLoading(true)
    try {
      const data = selectedTag === 'Tümü' ? await getAllPosts() : await getPostsByTag(selectedTag)
      setPosts(data)
    } catch (error) {
      console.error('Posts load error:', error)
      Alert.alert('Hata', 'Gönderiler yüklenemedi')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await Promise.all([loadPosts(), loadLikesAndBookmarks()])
    setRefreshing(false)
  }

  const handleCreatePost = async () => {
    if (!user || !newPostContent.trim()) {
      Alert.alert('Hata', 'Gönderi boş olamaz')
      return
    }

    try {
      await createPost({
        userId: user.uid,
        userDisplayName: user.displayName || 'Anonim',
        userPhotoURL: user.photoURL || '',
        userTag: userTag || 'Frontend',
        content: newPostContent,
      })
      setNewPostContent('')
      await loadPosts()
      Alert.alert('Başarılı', 'Gönderiniz paylaşıldı')
    } catch (error) {
      console.error('Create post error:', error)
      Alert.alert('Hata', 'Gönderi oluşturulamadı')
    }
  }

  const handleLike = async (postId: string) => {
    if (!user) return

    const isLiked = userLikes.includes(postId)
    try {
      if (isLiked) {
        await unlikePost(postId, user.uid)
        setUserLikes(userLikes.filter((id) => id !== postId))
      } else {
        await likePost(postId, user.uid)
        setUserLikes([...userLikes, postId])
      }
      await loadPosts()
    } catch (error) {
      console.error('Like error:', error)
    }
  }

  const handleBookmark = async (postId: string) => {
    if (!user) return

    const isBookmarked = userBookmarks.includes(postId)
    try {
      if (isBookmarked) {
        await unbookmarkPost(postId, user.uid)
        setUserBookmarks(userBookmarks.filter((id) => id !== postId))
      } else {
        await bookmarkPost(postId, user.uid)
        setUserBookmarks([...userBookmarks, postId])
      }
    } catch (error) {
      console.error('Bookmark error:', error)
    }
  }

  const openPostModal = async (post: Post) => {
    setSelectedPost(post)
    try {
      const postReplies = await getRepliesByPost(post.id!)
      setReplies(postReplies)
    } catch (error) {
      console.error('Replies load error:', error)
    }
  }

  const handleReply = async () => {
    if (!user || !selectedPost || !newReply.trim()) return

    try {
      await createReply({
        postId: selectedPost.id!,
        parentReplyId: null,
        userId: user.uid,
        userDisplayName: user.displayName || 'Anonim',
        userPhotoURL: user.photoURL || '',
        content: newReply,
      })
      setNewReply('')
      const updatedReplies = await getRepliesByPost(selectedPost.id!)
      setReplies(updatedReplies)
      await loadPosts()
    } catch (error) {
      console.error('Reply error:', error)
      Alert.alert('Hata', 'Yanıt gönderilemedi')
    }
  }

  const formatDate = (date: Timestamp | Date) => {
    if (!date) return ''
    const d = date instanceof Date ? date : date.toDate()
    return d.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Topluluk</Text>
        <Text style={styles.subtitle}>Sektörünüzle ilgili tartışmalara katılın</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tagsContainer}
        contentContainerStyle={styles.tagsContent}
      >
        {tags.map((tag) => (
          <TouchableOpacity
            key={tag}
            onPress={() => setSelectedTag(tag)}
            style={[styles.tag, selectedTag === tag && styles.tagSelected]}
          >
            <Text style={[styles.tagText, selectedTag === tag && styles.tagTextSelected]}>
              {tag}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {user && (
        <View style={styles.createPostCard}>
          <View style={styles.createPostHeader}>
            {user.photoURL ? (
              <Image source={{ uri: user.photoURL }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>{user.displayName?.charAt(0) || 'U'}</Text>
              </View>
            )}
            <TextInput
              style={styles.postInput}
              placeholder="Alanınızla ilgili bir tartışma başlatın..."
              value={newPostContent}
              onChangeText={setNewPostContent}
              multiline
              maxLength={500}
            />
          </View>
          <TouchableOpacity
            onPress={handleCreatePost}
            disabled={!newPostContent.trim()}
            style={[styles.sendButton, !newPostContent.trim() && styles.sendButtonDisabled]}
          >
            <MaterialIcons name="send" size={20} color="#fff" />
            <Text style={styles.sendButtonText}>Gönder</Text>
          </TouchableOpacity>
        </View>
      )}

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4300FF" />
        </View>
      ) : (
        <ScrollView
          style={styles.postsContainer}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        >
          {posts.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="forum" size={64} color="#9ca3af" />
              <Text style={styles.emptyText}>Henüz gönderi yok</Text>
              <Text style={styles.emptySubtext}>İlk gönderiyi siz oluşturun!</Text>
            </View>
          ) : (
            posts.map((post) => (
              <TouchableOpacity
                key={post.id}
                onPress={() => openPostModal(post)}
                style={styles.postCard}
              >
                <View style={styles.postHeader}>
                  {post.userPhotoURL ? (
                    <Image source={{ uri: post.userPhotoURL }} style={styles.postAvatar} />
                  ) : (
                    <View style={styles.postAvatarPlaceholder}>
                      <Text style={styles.postAvatarText}>
                        {post.userDisplayName.charAt(0)}
                      </Text>
                    </View>
                  )}
                  <View style={styles.postHeaderText}>
                    <Text style={styles.postAuthor}>{post.userDisplayName}</Text>
                    <Text style={styles.postTag}>{post.userTag}</Text>
                  </View>
                  <Text style={styles.postDate}>{formatDate(post.createdAt)}</Text>
                </View>
                <Text style={styles.postContent}>{post.content}</Text>
                <View style={styles.postFooter}>
                  <TouchableOpacity
                    onPress={() => handleLike(post.id!)}
                    style={styles.postAction}
                  >
                    <MaterialIcons
                      name={userLikes.includes(post.id!) ? 'favorite' : 'favorite-border'}
                      size={20}
                      color={userLikes.includes(post.id!) ? '#ef4444' : '#6b7280'}
                    />
                    <Text style={styles.postActionText}>{post.likeCount}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.postAction}>
                    <MaterialIcons name="comment" size={20} color="#6b7280" />
                    <Text style={styles.postActionText}>{post.replyCount}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleBookmark(post.id!)}
                    style={styles.postAction}
                  >
                    <MaterialIcons
                      name={userBookmarks.includes(post.id!) ? 'bookmark' : 'bookmark-border'}
                      size={20}
                      color={userBookmarks.includes(post.id!) ? '#3b82f6' : '#6b7280'}
                    />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      )}

      <Modal visible={selectedPost !== null} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Yanıtlar</Text>
              <TouchableOpacity onPress={() => setSelectedPost(null)}>
                <MaterialIcons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            {selectedPost && (
              <>
                <View style={styles.modalPost}>
                  <View style={styles.postHeader}>
                    {selectedPost.userPhotoURL ? (
                      <Image
                        source={{ uri: selectedPost.userPhotoURL }}
                        style={styles.postAvatar}
                      />
                    ) : (
                      <View style={styles.postAvatarPlaceholder}>
                        <Text style={styles.postAvatarText}>
                          {selectedPost.userDisplayName.charAt(0)}
                        </Text>
                      </View>
                    )}
                    <View style={styles.postHeaderText}>
                      <Text style={styles.postAuthor}>{selectedPost.userDisplayName}</Text>
                      <Text style={styles.postTag}>{selectedPost.userTag}</Text>
                    </View>
                  </View>
                  <Text style={styles.postContent}>{selectedPost.content}</Text>
                </View>

                <ScrollView style={styles.repliesContainer}>
                  {replies.length === 0 ? (
                    <Text style={styles.noRepliesText}>Henüz yanıt yok</Text>
                  ) : (
                    replies.map((reply) => (
                      <View key={reply.id} style={styles.replyItem}>
                        <View style={styles.replyHeader}>
                          {reply.userPhotoURL ? (
                            <Image
                              source={{ uri: reply.userPhotoURL }}
                              style={styles.replyAvatar}
                            />
                          ) : (
                            <View style={styles.replyAvatarPlaceholder}>
                              <Text style={styles.replyAvatarText}>
                                {reply.userDisplayName.charAt(0)}
                              </Text>
                            </View>
                          )}
                          <View style={styles.replyHeaderText}>
                            <Text style={styles.replyAuthor}>{reply.userDisplayName}</Text>
                            <Text style={styles.replyDate}>{formatDate(reply.createdAt)}</Text>
                          </View>
                        </View>
                        <Text style={styles.replyContent}>{reply.content}</Text>
                      </View>
                    ))
                  )}
                </ScrollView>

                {user && (
                  <View style={styles.replyInputContainer}>
                    <TextInput
                      style={styles.replyInput}
                      placeholder="Yanıtınızı yazın..."
                      value={newReply}
                      onChangeText={setNewReply}
                      multiline
                    />
                    <TouchableOpacity
                      onPress={handleReply}
                      disabled={!newReply.trim()}
                      style={[styles.replyButton, !newReply.trim() && styles.replyButtonDisabled]}
                    >
                      <MaterialIcons name="send" size={20} color="#fff" />
                    </TouchableOpacity>
                  </View>
                )}
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  tagsContainer: {
    maxHeight: 60,
  },
  tagsContent: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  tag: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    marginRight: 8,
  },
  tagSelected: {
    backgroundColor: '#4300FF',
  },
  tagText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  tagTextSelected: {
    color: '#fff',
  },
  createPostCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  createPostHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4300FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  postInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#1f2937',
    minHeight: 80,
    maxHeight: 120,
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4300FF',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  postsContainer: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 8,
  },
  postCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  postAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  postAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4300FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  postAvatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  postHeaderText: {
    flex: 1,
  },
  postAuthor: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  postTag: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  postDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  postContent: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 12,
  },
  postFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  postAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  postActionText: {
    fontSize: 14,
    color: '#6b7280',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  modalPost: {
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    marginBottom: 16,
  },
  repliesContainer: {
    maxHeight: 400,
    marginBottom: 16,
  },
  noRepliesText: {
    textAlign: 'center',
    color: '#9ca3af',
    marginTop: 20,
  },
  replyItem: {
    marginBottom: 16,
  },
  replyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  replyAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  replyAvatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4300FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  replyAvatarText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  replyHeaderText: {
    flex: 1,
  },
  replyAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  replyDate: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  replyContent: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginLeft: 40,
  },
  replyInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 16,
  },
  replyInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#1f2937',
    minHeight: 40,
    maxHeight: 100,
  },
  replyButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4300FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  replyButtonDisabled: {
    opacity: 0.5,
  },
})

