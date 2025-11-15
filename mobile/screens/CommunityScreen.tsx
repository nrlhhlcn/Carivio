import React, { useState, useEffect } from 'react'
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
  Image,
  RefreshControl,
  TextInput,
  Dimensions,
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
import { theme } from '../theme'
import { Text } from '../components/ui/Text'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'

const { width } = Dimensions.get('window')

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
      <LinearGradient colors={theme.colors.gradientPrimary} style={styles.header}>
        <Text variant="heading1" style={styles.title}>Topluluk</Text>
        <Text variant="body" style={styles.subtitle}>Sektörünüzle ilgili tartışmalara katılın</Text>
      </LinearGradient>

      <View style={styles.stickySection}>
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
              <Text variant="body" style={[styles.tagText, selectedTag === tag && styles.tagTextSelected]}>
                {tag}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {user && (
          <Card style={styles.createPostCard}>
            <View style={styles.createPostHeader}>
              {user.photoURL ? (
                <Image source={{ uri: user.photoURL }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text variant="heading3" style={styles.avatarText}>{user.displayName?.charAt(0) || 'U'}</Text>
                </View>
              )}
              <TextInput
                style={styles.postInput}
                placeholder="Alanınızla ilgili bir tartışma başlatın..."
                placeholderTextColor={theme.colors.gray400}
                value={newPostContent}
                onChangeText={setNewPostContent}
                multiline
                maxLength={500}
              />
            </View>
            <Button
              title="Gönder"
              onPress={handleCreatePost}
              disabled={!newPostContent.trim()}
              variant="primary"
              iconRight={<MaterialIcons name="send" size={20} color={theme.colors.white} />}
              style={styles.sendButton}
            />
          </Card>
        )}
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <ScrollView
          style={styles.postsContainer}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        >
          {posts.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="forum" size={64} color={theme.colors.gray400} />
              <Text variant="heading3" style={styles.emptyText}>Henüz gönderi yok</Text>
              <Text variant="body" style={styles.emptySubtext}>İlk gönderiyi siz oluşturun!</Text>
            </View>
          ) : (
            posts.map((post) => (
              <TouchableOpacity
                key={post.id}
                onPress={() => openPostModal(post)}
              >
                <Card style={styles.postCard}>
                  <View style={styles.postHeader}>
                    {post.userPhotoURL ? (
                      <Image source={{ uri: post.userPhotoURL }} style={styles.postAvatar} />
                    ) : (
                      <View style={styles.postAvatarPlaceholder}>
                        <Text variant="heading3" style={styles.postAvatarText}>
                          {post.userDisplayName.charAt(0)}
                        </Text>
                      </View>
                    )}
                    <View style={styles.postHeaderText}>
                      <Text variant="heading3" style={styles.postAuthor}>{post.userDisplayName}</Text>
                      <Text variant="muted" style={styles.postTag}>{post.userTag}</Text>
                    </View>
                    <Text variant="muted" style={styles.postDate}>{formatDate(post.createdAt)}</Text>
                  </View>
                  <Text variant="body" style={styles.postContent}>{post.content}</Text>
                  <View style={styles.postFooter}>
                    <TouchableOpacity
                      onPress={() => handleLike(post.id!)}
                      style={styles.postAction}
                    >
                      <MaterialIcons
                        name={userLikes.includes(post.id!) ? 'favorite' : 'favorite-border'}
                        size={20}
                        color={userLikes.includes(post.id!) ? theme.colors.danger : theme.colors.gray500}
                      />
                      <Text variant="body" style={styles.postActionText}>{post.likeCount}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.postAction}>
                      <MaterialIcons name="comment" size={20} color={theme.colors.gray500} />
                      <Text variant="body" style={styles.postActionText}>{post.replyCount}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleBookmark(post.id!)}
                      style={styles.postAction}
                    >
                      <MaterialIcons
                        name={userBookmarks.includes(post.id!) ? 'bookmark' : 'bookmark-border'}
                        size={20}
                        color={userBookmarks.includes(post.id!) ? theme.colors.info : theme.colors.gray500}
                      />
                    </TouchableOpacity>
                  </View>
                </Card>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      )}

      <Modal visible={selectedPost !== null} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text variant="heading2" style={styles.modalTitle}>Yanıtlar</Text>
              <TouchableOpacity onPress={() => setSelectedPost(null)}>
                <MaterialIcons name="close" size={24} color={theme.colors.gray500} />
              </TouchableOpacity>
            </View>

            {selectedPost && (
              <>
                <Card style={styles.modalPost}>
                  <View style={styles.postHeader}>
                    {selectedPost.userPhotoURL ? (
                      <Image
                        source={{ uri: selectedPost.userPhotoURL }}
                        style={styles.postAvatar}
                      />
                    ) : (
                      <View style={styles.postAvatarPlaceholder}>
                        <Text variant="heading3" style={styles.postAvatarText}>
                          {selectedPost.userDisplayName.charAt(0)}
                        </Text>
                      </View>
                    )}
                    <View style={styles.postHeaderText}>
                      <Text variant="heading3" style={styles.postAuthor}>{selectedPost.userDisplayName}</Text>
                      <Text variant="muted" style={styles.postTag}>{selectedPost.userTag}</Text>
                    </View>
                  </View>
                  <Text variant="body" style={styles.postContent}>{selectedPost.content}</Text>
                </Card>

                <ScrollView style={styles.repliesContainer}>
                  {replies.length === 0 ? (
                    <Text variant="body" style={styles.noRepliesText}>Henüz yanıt yok</Text>
                  ) : (
                    replies.map((reply) => (
                      <Card key={reply.id} style={styles.replyItem}>
                        <View style={styles.replyHeader}>
                          {reply.userPhotoURL ? (
                            <Image
                              source={{ uri: reply.userPhotoURL }}
                              style={styles.replyAvatar}
                            />
                          ) : (
                            <View style={styles.replyAvatarPlaceholder}>
                              <Text variant="body" style={styles.replyAvatarText}>
                                {reply.userDisplayName.charAt(0)}
                              </Text>
                            </View>
                          )}
                          <View style={styles.replyHeaderText}>
                            <Text variant="heading3" style={styles.replyAuthor}>{reply.userDisplayName}</Text>
                            <Text variant="muted" style={styles.replyDate}>{formatDate(reply.createdAt)}</Text>
                          </View>
                        </View>
                        <Text variant="body" style={styles.replyContent}>{reply.content}</Text>
                      </Card>
                    ))
                  )}
                </ScrollView>

                {user && (
                  <View style={styles.replyInputContainer}>
                    <TextInput
                      style={styles.replyInput}
                      placeholder="Yanıtınızı yazın..."
                      placeholderTextColor={theme.colors.gray400}
                      value={newReply}
                      onChangeText={setNewReply}
                      multiline
                    />
                    <TouchableOpacity
                      onPress={handleReply}
                      disabled={!newReply.trim()}
                      style={[styles.replyButton, !newReply.trim() && styles.replyButtonDisabled]}
                    >
                      <MaterialIcons name="send" size={20} color={theme.colors.white} />
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
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: theme.spacing.xl,
    paddingTop: 60,
    paddingBottom: theme.spacing.xl,
  },
  title: {
    color: theme.colors.white,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.9)',
  },
  stickySection: {
    backgroundColor: theme.colors.background,
    zIndex: 10,
    paddingBottom: theme.spacing.md,
  },
  tagsContainer: {
    maxHeight: 60,
  },
  tagsContent: {
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
  },
  tag: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radii.pill,
    backgroundColor: theme.colors.gray100,
    marginRight: theme.spacing.sm,
  },
  tagSelected: {
    backgroundColor: theme.colors.primary,
  },
  tagText: {
    color: theme.colors.gray500,
    fontWeight: '500',
  },
  tagTextSelected: {
    color: theme.colors.white,
  },
  createPostCard: {
    marginHorizontal: theme.spacing.xl,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  createPostHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: theme.spacing.md,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  avatarText: {
    color: theme.colors.white,
  },
  postInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.gray200,
    borderRadius: theme.radii.md,
    padding: theme.spacing.md,
    fontSize: width < 375 ? 13 : 14,
    color: theme.colors.gray900,
    backgroundColor: theme.colors.gray50,
    minHeight: 80,
    maxHeight: 120,
  },
  sendButton: {
    marginTop: theme.spacing.sm,
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
    padding: theme.spacing['4xl'],
  },
  emptyText: {
    color: theme.colors.gray500,
    marginTop: theme.spacing.lg,
  },
  emptySubtext: {
    color: theme.colors.gray400,
    marginTop: theme.spacing.sm,
  },
  postCard: {
    marginHorizontal: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.lg,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  postAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: theme.spacing.md,
  },
  postAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  postAvatarText: {
    color: theme.colors.white,
  },
  postHeaderText: {
    flex: 1,
  },
  postAuthor: {
    color: theme.colors.gray800,
  },
  postTag: {
    color: theme.colors.gray500,
    marginTop: 2,
  },
  postDate: {
    color: theme.colors.gray400,
  },
  postContent: {
    color: theme.colors.gray700,
    lineHeight: 20,
    marginBottom: theme.spacing.md,
  },
  postFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing['2xl'],
  },
  postAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  postActionText: {
    color: theme.colors.gray500,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    padding: theme.spacing.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  modalTitle: {
    color: theme.colors.gray800,
  },
  modalPost: {
    paddingBottom: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray200,
    marginBottom: theme.spacing.lg,
  },
  repliesContainer: {
    maxHeight: 400,
    marginBottom: theme.spacing.lg,
  },
  noRepliesText: {
    textAlign: 'center',
    color: theme.colors.gray400,
    marginTop: theme.spacing.xl,
  },
  replyItem: {
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.lg,
  },
  replyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  replyAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: theme.spacing.sm,
  },
  replyAvatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.sm,
  },
  replyAvatarText: {
    color: theme.colors.white,
  },
  replyHeaderText: {
    flex: 1,
  },
  replyAuthor: {
    color: theme.colors.gray800,
  },
  replyDate: {
    color: theme.colors.gray400,
    marginTop: 2,
  },
  replyContent: {
    color: theme.colors.gray700,
    lineHeight: 20,
    marginLeft: 40,
  },
  replyInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray200,
    paddingTop: theme.spacing.lg,
  },
  replyInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.gray200,
    borderRadius: theme.radii.md,
    padding: theme.spacing.md,
    fontSize: 14,
    color: theme.colors.gray900,
    backgroundColor: theme.colors.gray50,
    minHeight: 40,
    maxHeight: 100,
  },
  replyButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: theme.spacing.sm,
  },
  replyButtonDisabled: {
    opacity: 0.5,
  },
})
