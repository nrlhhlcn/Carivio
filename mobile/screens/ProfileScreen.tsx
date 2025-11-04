import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  TextInput,
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
        getUserCVAnalysisResults(user.uid),
        getUserInterviewResults(user.uid),
      ])

      setUserStats(stats)
      setCvResults(cvData)
      setInterviewResults(interviewData)
      if (stats) {
        setTag(stats.tag || 'Frontend')
        // Boolean değeri garantile - string "true"/"false" değerlerini de handle et
        const isPublic = stats.isProfilePublic
        let publicValue: boolean
        if (typeof isPublic === 'string') {
          publicValue = isPublic === 'true' || isPublic === 'True' || isPublic === '1'
        } else if (typeof isPublic === 'boolean') {
          publicValue = isPublic
        } else {
          publicValue = true // default
        }
        setIsProfilePublic(publicValue)
      }
    } catch (error) {
      console.error('User data load error:', error)
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
      // Boolean değeri garantile - kesinlikle boolean olmalı
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
        <ActivityIndicator size="large" color="#4300FF" />
      </View>
    )
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
    >
      <View style={styles.header}>
        <View style={styles.profileHeader}>
          {user?.photoURL ? (
            <Image source={{ uri: user.photoURL }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {getInitials(user?.displayName || 'Kullanıcı')}
              </Text>
            </View>
          )}
          <Text style={styles.userName}>{user?.displayName || 'Kullanıcı'}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
          <TouchableOpacity
            onPress={() => setIsEditing(!isEditing)}
            style={styles.editButton}
          >
            <MaterialIcons name="edit" size={20} color="#4300FF" />
            <Text style={styles.editButtonText}>
              {isEditing ? 'İptal' : 'Düzenle'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {isEditing && (
        <View style={styles.editCard}>
          <Text style={styles.editLabel}>Sektör/Alan</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
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
            <Text style={styles.editLabel}>Profil Görünürlüğü</Text>
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

          <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
            <LinearGradient colors={['#4300FF', '#0065F8']} style={styles.saveButtonGradient}>
              <Text style={styles.saveButtonText}>Kaydet</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.tabs}>
        <TouchableOpacity
          onPress={() => setActiveTab('overview')}
          style={[styles.tab, activeTab === 'overview' && styles.tabActive]}
        >
          <Text style={[styles.tabText, activeTab === 'overview' && styles.tabTextActive]}>
            Genel Bakış
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab('stats')}
          style={[styles.tab, activeTab === 'stats' && styles.tabActive]}
        >
          <Text style={[styles.tabText, activeTab === 'stats' && styles.tabTextActive]}>
            İstatistikler
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab('activity')}
          style={[styles.tab, activeTab === 'activity' && styles.tabActive]}
        >
          <Text style={[styles.tabText, activeTab === 'activity' && styles.tabTextActive]}>
            Aktivite
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'overview' && (
        <View style={styles.content}>
          <View style={styles.statsCard}>
            <LinearGradient colors={['#dbeafe', '#e9d5ff']} style={styles.statsGradient}>
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{userStats?.totalScore || 0}</Text>
                  <Text style={styles.statLabel}>Toplam Puan</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{userStats?.cvScore || 0}</Text>
                  <Text style={styles.statLabel}>CV Skoru</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{userStats?.interviewScore || 0}</Text>
                  <Text style={styles.statLabel}>Mülakat Skoru</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{userStats?.level || 'Başlangıç'}</Text>
                  <Text style={styles.statLabel}>Seviye</Text>
                </View>
              </View>
            </LinearGradient>
          </View>

          <View style={styles.badgeCard}>
            <Text style={styles.cardTitle}>Rozet</Text>
            <View style={styles.badge}>
              <MaterialIcons name="workspace-premium" size={24} color="#fbbf24" />
              <Text style={styles.badgeText}>{userStats?.badge || 'Yeni Katılımcı'}</Text>
            </View>
          </View>
        </View>
      )}

      {activeTab === 'stats' && (
        <View style={styles.content}>
          <View style={styles.statsDetailCard}>
            <Text style={styles.cardTitle}>Detaylı İstatistikler</Text>
            <View style={styles.statsList}>
              <View style={styles.statsRow}>
                <Text style={styles.statsRowLabel}>Tamamlanan Analizler</Text>
                <Text style={styles.statsRowValue}>{userStats?.completedAnalyses || 0}</Text>
              </View>
              <View style={styles.statsRow}>
                <Text style={styles.statsRowLabel}>Tamamlanan Mülakatlar</Text>
                <Text style={styles.statsRowValue}>{userStats?.completedInterviews || 0}</Text>
              </View>
              <View style={styles.statsRow}>
                <Text style={styles.statsRowLabel}>Aktif Günler</Text>
                <Text style={styles.statsRowValue}>{userStats?.totalActiveDays || 0}</Text>
              </View>
              <View style={styles.statsRow}>
                <Text style={styles.statsRowLabel}>Seri</Text>
                <Text style={styles.statsRowValue}>{userStats?.streak || 0} gün</Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {activeTab === 'activity' && (
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>CV Analizleri</Text>
          {cvResults.length === 0 ? (
            <Text style={styles.emptyText}>Henüz CV analizi yapılmamış</Text>
          ) : (
            cvResults.map((result) => (
              <View key={result.id} style={styles.activityItem}>
                <MaterialIcons name="description" size={24} color="#3b82f6" />
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>{result.fileName}</Text>
                  <Text style={styles.activityDesc}>
                    Skor: {result.overallScore}/100 - {formatDate(result.analysisDate)}
                  </Text>
                </View>
              </View>
            ))
          )}

          <Text style={styles.sectionTitle}>Mülakatlar</Text>
          {interviewResults.length === 0 ? (
            <Text style={styles.emptyText}>Henüz mülakat yapılmamış</Text>
          ) : (
            interviewResults.map((result) => (
              <View key={result.id} style={styles.activityItem}>
                <MaterialIcons name="videocam" size={24} color="#10b981" />
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>Mülakat Simülasyonu</Text>
                  <Text style={styles.activityDesc}>
                    Skor: {result.overallScore}/100 - {formatDate(result.interviewDate || new Date())}
                  </Text>
                </View>
              </View>
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
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    paddingTop: 40,
  },
  profileHeader: {
    alignItems: 'center',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#4300FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4300FF',
  },
  editButtonText: {
    color: '#4300FF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  editCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  editLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  tagOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    marginRight: 8,
  },
  tagOptionSelected: {
    backgroundColor: '#4300FF',
  },
  tagOptionText: {
    fontSize: 14,
    color: '#6b7280',
  },
  tagOptionTextSelected: {
    color: '#fff',
  },
  publicSwitch: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
  },
  switch: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#d1d5db',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  switchActive: {
    backgroundColor: '#4300FF',
  },
  switchThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#fff',
  },
  switchThumbActive: {
    transform: [{ translateX: 20 }],
  },
  saveButton: {
    marginTop: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  saveButtonGradient: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#4300FF',
  },
  tabText: {
    fontSize: 14,
    color: '#6b7280',
  },
  tabTextActive: {
    color: '#4300FF',
    fontWeight: '600',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  statsCard: {
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
  },
  statsGradient: {
    padding: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 16,
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  badgeCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 16,
    color: '#1f2937',
    marginLeft: 12,
  },
  statsDetailCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statsList: {
    marginTop: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  statsRowLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  statsRowValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
    marginTop: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 20,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  activityContent: {
    flex: 1,
    marginLeft: 12,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  activityDesc: {
    fontSize: 12,
    color: '#6b7280',
  },
})
