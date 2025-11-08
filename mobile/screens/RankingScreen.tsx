import React, { useState, useEffect } from 'react'
import {
  View,
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
import { theme } from '../theme'
import { Text } from '../components/ui/Text'
import { Card } from '../components/ui/Card'

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
            <Text variant="body" style={styles.rankNumberText}>#{rank}</Text>
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
      <LinearGradient colors={theme.colors.gradientPrimary} style={styles.header}>
        <Text variant="heading1" style={styles.title}>Sıralama Tablosu</Text>
        <Text variant="body" style={styles.subtitle}>Diğer kullanıcılarla yarışın ve rozetler kazanın</Text>
      </LinearGradient>

      <View style={styles.tabs}>
        <TouchableOpacity
          onPress={() => setSelectedTab('total')}
          style={[styles.tab, selectedTab === 'total' && styles.tabSelected]}
        >
          <LinearGradient
            colors={selectedTab === 'total' ? theme.colors.gradientPrimary : [theme.colors.gray100, theme.colors.gray200]}
            style={styles.tabGradient}
          >
            <Text variant="body" style={[styles.tabText, selectedTab === 'total' && styles.tabTextSelected]}>
              Toplam Puan
            </Text>
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setSelectedTab('cv')}
          style={[styles.tab, selectedTab === 'cv' && styles.tabSelected]}
        >
          <LinearGradient
            colors={selectedTab === 'cv' ? theme.colors.gradientPrimary : [theme.colors.gray100, theme.colors.gray200]}
            style={styles.tabGradient}
          >
            <Text variant="body" style={[styles.tabText, selectedTab === 'cv' && styles.tabTextSelected]}>
              CV Skoru
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {userStats && (
        <Card style={styles.userCard}>
          <LinearGradient colors={theme.colors.gradientSurface} style={styles.userCardGradient}>
            <Text variant="heading3" style={styles.userCardTitle}>Sizin Sıralamanız</Text>
            <View style={styles.userCardStats}>
              <View style={styles.userCardStat}>
                <Text variant="heading2" style={styles.userCardStatValue}>
                  {getUserRank() || '-'}
                </Text>
                <Text variant="label" style={styles.userCardStatLabel}>Sıralama</Text>
              </View>
              <View style={styles.userCardStat}>
                <Text variant="heading2" style={styles.userCardStatValue}>
                  {selectedTab === 'total' ? userStats.totalScore : userStats.cvScore}
                </Text>
                <Text variant="label" style={styles.userCardStatLabel}>
                  {selectedTab === 'total' ? 'Toplam Puan' : 'CV Skoru'}
                </Text>
              </View>
              <View style={styles.userCardStat}>
                <Text variant="heading2" style={styles.userCardStatValue}>{userStats.level}</Text>
                <Text variant="label" style={styles.userCardStatLabel}>Seviye</Text>
              </View>
            </View>
          </LinearGradient>
        </Card>
      )}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
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
              <Card
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
                      <Text variant="heading3" style={styles.avatarText}>
                        {getInitials(item.displayName || 'Kullanıcı')}
                      </Text>
                    </View>
                  )}
                </View>
                <View style={styles.infoSection}>
                  <Text variant="heading3" style={styles.userName}>{item.displayName || 'Kullanıcı'}</Text>
                  <Text variant="muted" style={styles.userBadge}>{item.badge || 'Yeni Katılımcı'}</Text>
                </View>
                <View style={styles.scoreSection}>
                  <Text variant="heading2" style={styles.scoreValue}>
                    {selectedTab === 'total' ? item.totalScore : item.cvScore}
                  </Text>
                  <Text variant="label" style={styles.scoreLabel}>Puan</Text>
                </View>
              </Card>
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
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: theme.spacing.xl,
    paddingTop: 60,
    paddingBottom: theme.spacing['3xl'],
    alignItems: 'center',
  },
  title: {
    color: theme.colors.white,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  tab: {
    flex: 1,
    borderRadius: theme.radii.md,
    overflow: 'hidden',
  },
  tabSelected: {
    ...theme.shadows.soft,
  },
  tabGradient: {
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
  },
  tabText: {
    color: theme.colors.gray500,
    fontWeight: '600',
  },
  tabTextSelected: {
    color: theme.colors.white,
  },
  userCard: {
    marginHorizontal: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
    overflow: 'hidden',
    padding: 0,
  },
  userCardGradient: {
    padding: theme.spacing.xl,
  },
  userCardTitle: {
    color: theme.colors.gray800,
    marginBottom: theme.spacing.lg,
  },
  userCardStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  userCardStat: {
    alignItems: 'center',
  },
  userCardStatValue: {
    color: theme.colors.gray800,
    marginBottom: theme.spacing.xs,
  },
  userCardStatLabel: {
    color: theme.colors.gray500,
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
    marginHorizontal: theme.spacing.xl,
    marginBottom: theme.spacing.md,
    padding: theme.spacing.lg,
  },
  leaderboardItemHighlighted: {
    backgroundColor: '#eff6ff',
    borderWidth: 2,
    borderColor: theme.colors.primary,
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
    backgroundColor: theme.colors.gray100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankNumberText: {
    color: theme.colors.gray500,
    fontWeight: 'bold',
  },
  avatarSection: {
    marginLeft: theme.spacing.md,
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
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: theme.colors.white,
  },
  infoSection: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  userName: {
    color: theme.colors.gray800,
    marginBottom: theme.spacing.xs,
  },
  userBadge: {
    color: theme.colors.gray500,
  },
  scoreSection: {
    alignItems: 'flex-end',
  },
  scoreValue: {
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  scoreLabel: {
    color: theme.colors.gray500,
  },
})
