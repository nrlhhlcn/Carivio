import React, { useState, useEffect } from 'react'
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
  RefreshControl,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { MaterialIcons } from '@expo/vector-icons'
import { useAuth } from '../contexts/AuthContext'
import {
  getUserStats,
  getUserCVAnalysisResults,
  getUserInterviewResults,
  saveUserStats,
  UserStats,
  CVAnalysis,
  InterviewResult,
} from '../services/firestore'
import { Timestamp } from 'firebase/firestore'
import { theme } from '../theme'
import { Text } from '../components/ui/Text'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'

const TAG_OPTIONS = [
  { value: 'Frontend', label: 'Frontend' },
  { value: 'Backend', label: 'Backend' },
  { value: 'Fullstack', label: 'Fullstack' },
  { value: 'Mobile', label: 'Mobile' },
  { value: 'DevOps', label: 'DevOps' },
  { value: 'Data Science', label: 'Data Science' },
]

export default function ProfileScreen() {
  const [activeTab, setActiveTab] = useState<'overview' | 'stats' | 'activity'>('overview')
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [cvResults, setCvResults] = useState<CVAnalysis[]>([])
  const [interviewResults, setInterviewResults] = useState<InterviewResult[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [tag, setTag] = useState('Frontend')
  const [isProfilePublic, setIsProfilePublic] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    loadUserData()
  }, [user])

  const loadUserData = async () => {
    if (!user) return

    setLoading(true)
    try {
      const [stats, cvData, interviewData] = await Promise.all([
        getUserStats(user.uid),
        getUserCVAnalysisResults(user.uid).catch((err) => {
          console.error('CV Analysis Results error:', err)
          // Index hatası için boş array döndür
          if (err?.code === 'failed-precondition' || err?.message?.includes('index')) {
            console.warn('Firestore index eksik. Firebase Console\'da index oluşturun.')
            return []
          }
          throw err
        }),
        getUserInterviewResults(user.uid).catch((err) => {
          console.error('Interview Results error:', err)
          // Index hatası için boş array döndür
          if (err?.code === 'failed-precondition' || err?.message?.includes('index')) {
            console.warn('Firestore index eksik. Firebase Console\'da index oluşturun.')
            return []
          }
          throw err
        }),
      ])

      setUserStats(stats)
      setCvResults(cvData)
      setInterviewResults(interviewData)
      if (stats) {
        setTag(stats.tag || 'Frontend')
        const isPublic = stats.isProfilePublic
        let publicValue: boolean
        if (typeof isPublic === 'string') {
          publicValue = isPublic === 'true' || isPublic === 'True' || isPublic === '1'
        } else if (typeof isPublic === 'boolean') {
          publicValue = isPublic
        } else {
          publicValue = true
        }
        setIsProfilePublic(publicValue)
      }
    } catch (error: any) {
      console.error('User data load error:', error)
      // Index hatası için kullanıcıya bilgi ver
      if (error?.code === 'failed-precondition' || error?.message?.includes('index')) {
        Alert.alert(
          'Firestore Index Gerekli',
          'Bu sorgu için Firestore\'da index oluşturmanız gerekiyor.\n\n' +
          'Hata mesajındaki linke tıklayarak index\'i otomatik oluşturabilirsiniz.\n\n' +
          'Veya Firebase Console > Firestore > Indexes bölümünden manuel oluşturabilirsiniz.',
          [{ text: 'Tamam' }]
        )
      }
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadUserData()
    setRefreshing(false)
  }

  const handleSave = async () => {
    if (!user) return

    try {
      const publicValue: boolean = !!isProfilePublic
      
      await saveUserStats({
        userId: user.uid,
        tag,
        isProfilePublic: publicValue,
        displayName: user.displayName || 'Kullanıcı',
        photoURL: user.photoURL || undefined,
        ...(userStats || {}),
      })
      setIsEditing(false)
      Alert.alert('Başarılı', 'Profil güncellendi')
      await loadUserData()
    } catch (error) {
      console.error('Save error:', error)
      Alert.alert('Hata', 'Profil güncellenemedi')
    }
  }

  const getInitials = (name: string) => {
    if (!name) return 'K'
    const parts = name.trim().split(/\s+/).filter(Boolean)
    const first = parts[0]?.[0] || ''
    const second = parts[1]?.[0] || ''
    return `${first}${second}`.toUpperCase() || first || 'K'
  }

  const formatDate = (date: Date | Timestamp) => {
    if (!date) return ''
    const d = date instanceof Date ? date : date.toDate()
    return d.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short',
    })
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    )
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
    >
      <LinearGradient colors={theme.colors.gradientPrimary} style={styles.header}>
        <View style={styles.profileHeader}>
          {user?.photoURL ? (
            <Image source={{ uri: user.photoURL }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text variant="heading1" style={styles.avatarText}>
                {getInitials(user?.displayName || 'Kullanıcı')}
              </Text>
            </View>
          )}
          <Text variant="heading2" style={styles.userName}>{user?.displayName || 'Kullanıcı'}</Text>
          <Text variant="body" style={styles.userEmail}>{user?.email}</Text>
          <Button
            title={isEditing ? 'İptal' : 'Düzenle'}
            onPress={() => setIsEditing(!isEditing)}
            variant="outline"
            iconLeft={<MaterialIcons name="edit" size={20} color={theme.colors.primary} />}
            style={styles.editButton}
          />
        </View>
      </LinearGradient>

      {isEditing && (
        <Card style={styles.editCard}>
          <Text variant="heading3" style={styles.editLabel}>Sektör/Alan</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagsScroll}>
            {TAG_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                onPress={() => setTag(option.value)}
                style={[
                  styles.tagOption,
                  tag === option.value && styles.tagOptionSelected,
                ]}
              >
                <Text
                  variant="body"
                  style={[
                    styles.tagOptionText,
                    tag === option.value && styles.tagOptionTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.publicSwitch}>
            <Text variant="heading3" style={styles.editLabel}>Profil Görünürlüğü</Text>
            <TouchableOpacity
              onPress={() => setIsProfilePublic(!isProfilePublic)}
              style={[
                styles.switch,
                isProfilePublic && styles.switchActive,
              ]}
            >
              <View style={[styles.switchThumb, isProfilePublic && styles.switchThumbActive]} />
            </TouchableOpacity>
          </View>

          <Button
            title="Kaydet"
            onPress={handleSave}
            variant="primary"
            style={styles.saveButton}
          />
        </Card>
      )}

      <View style={styles.tabs}>
        <TouchableOpacity
          onPress={() => setActiveTab('overview')}
          style={[styles.tab, activeTab === 'overview' && styles.tabActive]}
        >
          <Text variant="body" style={[styles.tabText, activeTab === 'overview' && styles.tabTextActive]}>
            Genel Bakış
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab('stats')}
          style={[styles.tab, activeTab === 'stats' && styles.tabActive]}
        >
          <Text variant="body" style={[styles.tabText, activeTab === 'stats' && styles.tabTextActive]}>
            İstatistikler
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab('activity')}
          style={[styles.tab, activeTab === 'activity' && styles.tabActive]}
        >
          <Text variant="body" style={[styles.tabText, activeTab === 'activity' && styles.tabTextActive]}>
            Aktivite
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'overview' && (
        <View style={styles.content}>
          <Card style={styles.statsCard}>
            <LinearGradient colors={theme.colors.gradientSurface} style={styles.statsGradient}>
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Text variant="heading2" style={styles.statValue}>{userStats?.totalScore || 0}</Text>
                  <Text variant="label" style={styles.statLabel}>Toplam Puan</Text>
                </View>
                <View style={styles.statItem}>
                  <Text variant="heading2" style={styles.statValue}>{userStats?.cvScore || 0}</Text>
                  <Text variant="label" style={styles.statLabel}>CV Skoru</Text>
                </View>
                <View style={styles.statItem}>
                  <Text variant="heading2" style={styles.statValue}>{userStats?.interviewScore || 0}</Text>
                  <Text variant="label" style={styles.statLabel}>Mülakat Skoru</Text>
                </View>
                <View style={styles.statItem}>
                  <Text variant="heading2" style={styles.statValue}>{userStats?.level || 'Başlangıç'}</Text>
                  <Text variant="label" style={styles.statLabel}>Seviye</Text>
                </View>
              </View>
            </LinearGradient>
          </Card>

          <Card style={styles.badgeCard}>
            <Text variant="heading3" style={styles.cardTitle}>Rozet</Text>
            <View style={styles.badge}>
              <MaterialIcons name="workspace-premium" size={24} color="#fbbf24" />
              <Text variant="body" style={styles.badgeText}>{userStats?.badge || 'Yeni Katılımcı'}</Text>
            </View>
          </Card>
        </View>
      )}

      {activeTab === 'stats' && (
        <View style={styles.content}>
          <Card style={styles.statsDetailCard}>
            <Text variant="heading3" style={styles.cardTitle}>Detaylı İstatistikler</Text>
            <View style={styles.statsList}>
              <View style={styles.statsRow}>
                <Text variant="body" style={styles.statsRowLabel}>Tamamlanan Analizler</Text>
                <Text variant="body" style={styles.statsRowValue}>{userStats?.completedAnalyses || 0}</Text>
              </View>
              <View style={styles.statsRow}>
                <Text variant="body" style={styles.statsRowLabel}>Tamamlanan Mülakatlar</Text>
                <Text variant="body" style={styles.statsRowValue}>{userStats?.completedInterviews || 0}</Text>
              </View>
              <View style={styles.statsRow}>
                <Text variant="body" style={styles.statsRowLabel}>Aktif Günler</Text>
                <Text variant="body" style={styles.statsRowValue}>{userStats?.totalActiveDays || 0}</Text>
              </View>
              <View style={styles.statsRow}>
                <Text variant="body" style={styles.statsRowLabel}>Seri</Text>
                <Text variant="body" style={styles.statsRowValue}>{userStats?.streak || 0} gün</Text>
              </View>
            </View>
          </Card>
        </View>
      )}

      {activeTab === 'activity' && (
        <View style={styles.content}>
          <Text variant="heading3" style={styles.sectionTitle}>CV Analizleri</Text>
          {cvResults.length === 0 ? (
            <Text variant="body" style={styles.emptyText}>Henüz CV analizi yapılmamış</Text>
          ) : (
            cvResults.map((result) => (
              <Card key={result.id} style={styles.activityItem}>
                <MaterialIcons name="description" size={24} color={theme.colors.info} />
                <View style={styles.activityContent}>
                  <Text variant="heading3" style={styles.activityTitle}>{result.fileName}</Text>
                  <Text variant="muted" style={styles.activityDesc}>
                    Skor: {result.overallScore}/100 - {formatDate(result.analysisDate)}
                  </Text>
                </View>
              </Card>
            ))
          )}

          <Text variant="heading3" style={styles.sectionTitle}>Mülakatlar</Text>
          {interviewResults.length === 0 ? (
            <Text variant="body" style={styles.emptyText}>Henüz mülakat yapılmamış</Text>
          ) : (
            interviewResults.map((result) => (
              <Card key={result.id} style={styles.activityItem}>
                <MaterialIcons name="videocam" size={24} color={theme.colors.success} />
                <View style={styles.activityContent}>
                  <Text variant="heading3" style={styles.activityTitle}>Mülakat Simülasyonu</Text>
                  <Text variant="muted" style={styles.activityDesc}>
                    Skor: {result.overallScore}/100 - {formatDate(result.interviewDate || new Date())}
                  </Text>
                </View>
              </Card>
            ))
          )}
        </View>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: theme.spacing.xl,
    paddingTop: 60,
    paddingBottom: theme.spacing['3xl'],
  },
  profileHeader: {
    alignItems: 'center',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: theme.spacing.lg,
    borderWidth: 4,
    borderColor: theme.colors.white,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    borderWidth: 4,
    borderColor: theme.colors.white,
  },
  avatarText: {
    color: theme.colors.primary,
  },
  userName: {
    color: theme.colors.white,
    marginBottom: theme.spacing.xs,
  },
  userEmail: {
    color: 'rgba(255,255,255,0.9)',
    marginBottom: theme.spacing.lg,
  },
  editButton: {
    marginTop: theme.spacing.sm,
  },
  editCard: {
    margin: theme.spacing.xl,
    marginTop: -theme.spacing['2xl'],
  },
  editLabel: {
    color: theme.colors.gray800,
    marginBottom: theme.spacing.md,
  },
  tagsScroll: {
    marginBottom: theme.spacing.lg,
  },
  tagOption: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radii.pill,
    backgroundColor: theme.colors.gray100,
    marginRight: theme.spacing.sm,
  },
  tagOptionSelected: {
    backgroundColor: theme.colors.primary,
  },
  tagOptionText: {
    color: theme.colors.gray500,
  },
  tagOptionTextSelected: {
    color: theme.colors.white,
  },
  publicSwitch: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
  },
  switch: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: theme.colors.gray300,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  switchActive: {
    backgroundColor: theme.colors.primary,
  },
  switchThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: theme.colors.white,
  },
  switchThumbActive: {
    transform: [{ translateX: 20 }],
  },
  saveButton: {
    marginTop: theme.spacing.md,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray200,
  },
  tab: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.primary,
  },
  tabText: {
    color: theme.colors.gray500,
  },
  tabTextActive: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  content: {
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.xl,
  },
  statsCard: {
    marginBottom: theme.spacing.xl,
    overflow: 'hidden',
    padding: 0,
  },
  statsGradient: {
    padding: theme.spacing.xl,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  statValue: {
    color: theme.colors.gray800,
    marginBottom: theme.spacing.xs,
  },
  statLabel: {
    color: theme.colors.gray500,
  },
  badgeCard: {
    marginBottom: theme.spacing.xl,
  },
  cardTitle: {
    color: theme.colors.gray800,
    marginBottom: theme.spacing.md,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgeText: {
    color: theme.colors.gray800,
    marginLeft: theme.spacing.md,
  },
  statsDetailCard: {
    marginBottom: theme.spacing.xl,
  },
  statsList: {
    marginTop: theme.spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray100,
  },
  statsRowLabel: {
    color: theme.colors.gray500,
  },
  statsRowValue: {
    color: theme.colors.gray800,
    fontWeight: '600',
  },
  sectionTitle: {
    color: theme.colors.gray800,
    marginBottom: theme.spacing.lg,
    marginTop: theme.spacing.md,
  },
  emptyText: {
    color: theme.colors.gray400,
    textAlign: 'center',
    marginTop: theme.spacing.xl,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    padding: theme.spacing.lg,
  },
  activityContent: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  activityTitle: {
    color: theme.colors.gray800,
    marginBottom: theme.spacing.xs,
  },
  activityDesc: {
    color: theme.colors.gray500,
  },
})
