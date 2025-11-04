import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  RefreshControl,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { MaterialIcons } from '@expo/vector-icons'
import { useAuth } from '../contexts/AuthContext'
import { getLeaderboard, getCvLeaderboard, getUserStats, UserStats } from '../services/firestore'

type LeaderboardType = 'total' | 'cv'

export default function RankingScreen() {
  const [selectedTab, setSelectedTab] = useState<LeaderboardType>('total')
  const [leaderboard, setLeaderboard] = useState<UserStats[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    loadLeaderboard()
  }, [selectedTab])

  useEffect(() => {
    if (user) {
      loadUserStats()
    }
  }, [user])

  const loadLeaderboard = async () => {
    setLoading(true)
    try {
      const data = selectedTab === 'total' ? await getLeaderboard(50) : await getCvLeaderboard(50)
      setLeaderboard(data)
    } catch (error) {
      console.error('Leaderboard load error:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadUserStats = async () => {
    if (!user) return
    try {
      const stats = await getUserStats(user.uid)
      if (stats) {
        // Boolean değerleri garantile
        const cleanStats = { ...stats }
        if (cleanStats.isProfilePublic !== undefined && typeof cleanStats.isProfilePublic === 'string') {
          cleanStats.isProfilePublic = cleanStats.isProfilePublic === 'true' || cleanStats.isProfilePublic === 'True'
        }
        setUserStats(cleanStats)
      } else {
        setUserStats(null)
      }
    } catch (error) {
      console.error('User stats load error:', error)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await Promise.all([loadLeaderboard(), loadUserStats()])
    setRefreshing(false)
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <MaterialIcons name="emoji-events" size={32} color="#fbbf24" />
      case 2:
        return <MaterialIcons name="workspace-premium" size={28} color="#9ca3af" />
      case 3:
        return <MaterialIcons name="military-tech" size={28} color="#d97706" />
      default:
        return (
          <View style={styles.rankNumber}>
            <Text style={styles.rankNumberText}>#{rank}</Text>
          </View>
        )
    }
  }

  const getUserRank = () => {
    if (!user || !userStats) return null
    const rank = leaderboard.findIndex((u) => u.userId === user.uid)
    return rank >= 0 ? rank + 1 : null
  }

  const getInitials = (name: string) => {
    if (!name) return 'K'
    const parts = name.trim().split(/\s+/).filter(Boolean)
    const first = parts[0]?.[0] || ''
    const second = parts[1]?.[0] || ''
    return `${first}${second}`.toUpperCase() || first || 'K'
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Sıralama Tablosu</Text>
        <Text style={styles.subtitle}>Diğer kullanıcılarla yarışın ve rozetler kazanın</Text>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          onPress={() => setSelectedTab('total')}
          style={[styles.tab, selectedTab === 'total' && styles.tabSelected]}
        >
          <LinearGradient
            colors={selectedTab === 'total' ? ['#4300FF', '#0065F8'] : ['#f3f4f6', '#f3f4f6']}
            style={styles.tabGradient}
          >
            <Text style={[styles.tabText, selectedTab === 'total' && styles.tabTextSelected]}>
              Toplam Puan
            </Text>
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setSelectedTab('cv')}
          style={[styles.tab, selectedTab === 'cv' && styles.tabSelected]}
        >
          <LinearGradient
            colors={selectedTab === 'cv' ? ['#4300FF', '#0065F8'] : ['#f3f4f6', '#f3f4f6']}
            style={styles.tabGradient}
          >
            <Text style={[styles.tabText, selectedTab === 'cv' && styles.tabTextSelected]}>
              CV Skoru
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {userStats && (
        <View style={styles.userCard}>
          <LinearGradient colors={['#dbeafe', '#e9d5ff']} style={styles.userCardGradient}>
            <Text style={styles.userCardTitle}>Sizin Sıralamanız</Text>
            <View style={styles.userCardStats}>
              <View style={styles.userCardStat}>
                <Text style={styles.userCardStatValue}>
                  {getUserRank() || '-'}
                </Text>
                <Text style={styles.userCardStatLabel}>Sıralama</Text>
              </View>
              <View style={styles.userCardStat}>
                <Text style={styles.userCardStatValue}>
                  {selectedTab === 'total' ? userStats.totalScore : userStats.cvScore}
                </Text>
                <Text style={styles.userCardStatLabel}>
                  {selectedTab === 'total' ? 'Toplam Puan' : 'CV Skoru'}
                </Text>
              </View>
              <View style={styles.userCardStat}>
                <Text style={styles.userCardStatValue}>{userStats.level}</Text>
                <Text style={styles.userCardStatLabel}>Seviye</Text>
              </View>
            </View>
          </LinearGradient>
        </View>
      )}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4300FF" />
        </View>
      ) : (
        <ScrollView
          style={styles.leaderboardContainer}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        >
          {leaderboard.map((item, index) => {
            const rank = index + 1
            const isCurrentUser = user && item.userId === user.uid
            return (
              <View
                key={item.id || item.userId}
                style={[styles.leaderboardItem, isCurrentUser && styles.leaderboardItemHighlighted]}
              >
                <View style={styles.rankSection}>
                  {getRankIcon(rank)}
                </View>
                <View style={styles.avatarSection}>
                  {item.photoURL ? (
                    <Image source={{ uri: item.photoURL }} style={styles.avatar} />
                  ) : (
                    <View style={styles.avatarPlaceholder}>
                      <Text style={styles.avatarText}>
                        {getInitials(item.displayName || 'Kullanıcı')}
                      </Text>
                    </View>
                  )}
                </View>
                <View style={styles.infoSection}>
                  <Text style={styles.userName}>{item.displayName || 'Kullanıcı'}</Text>
                  <Text style={styles.userBadge}>{item.badge || 'Yeni Katılımcı'}</Text>
                </View>
                <View style={styles.scoreSection}>
                  <Text style={styles.scoreValue}>
                    {selectedTab === 'total' ? item.totalScore : item.cvScore}
                  </Text>
                  <Text style={styles.scoreLabel}>Puan</Text>
                </View>
              </View>
            )
          })}
        </ScrollView>
      )}
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
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  tab: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  tabGradient: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabSelected: {
    shadowColor: '#4300FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  tabTextSelected: {
    color: '#fff',
  },
  userCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  userCardGradient: {
    padding: 20,
  },
  userCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  userCardStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  userCardStat: {
    alignItems: 'center',
  },
  userCardStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  userCardStatLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  leaderboardContainer: {
    flex: 1,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  leaderboardItemHighlighted: {
    backgroundColor: '#eff6ff',
    borderWidth: 2,
    borderColor: '#4300FF',
  },
  rankSection: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankNumberText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6b7280',
  },
  avatarSection: {
    marginLeft: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#4300FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoSection: {
    flex: 1,
    marginLeft: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  userBadge: {
    fontSize: 12,
    color: '#6b7280',
  },
  scoreSection: {
    alignItems: 'flex-end',
  },
  scoreValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4300FF',
    marginBottom: 4,
  },
  scoreLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
})
