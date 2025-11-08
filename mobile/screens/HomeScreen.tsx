import React, { useState, useEffect } from 'react'
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { MaterialIcons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { theme } from '../theme'
import { Text } from '../components/ui/Text'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'

const { width } = Dimensions.get('window')

const features = [
  {
    icon: 'description',
    title: 'CV Analizi',
    description: 'CV\'nizi detaylı analiz ederek hangi alanlarda güçlü olduğunuzu ve nereleri geliştirmeniz gerektiğini öğrenin.',
    color: ['#3b82f6', '#2563eb'],
    screen: 'CVAnalysis',
  },
  {
    icon: 'videocam',
    title: 'Mülakat Pratiği',
    description: 'Gerçek mülakat ortamını simüle eden sistemle pratik yapın.',
    color: ['#10b981', '#059669'],
    screen: 'Interview',
  },
  {
    icon: 'emoji-events',
    title: 'Sıralama',
    description: 'Diğer kullanıcılarla kıyaslayın ve ilerlemenizi takip edin.',
    color: ['#f59e0b', '#d97706'],
    screen: 'Ranking',
  },
  {
    icon: 'people',
    title: 'Topluluk',
    description: 'Soru sorun, tecrübelerinizi paylaşın ve diğer adaylarla etkileşime geçin.',
    color: ['#8b5cf6', '#7c3aed'],
    screen: 'Community',
  },
]

const stats = [
  { number: '8,247', label: 'Analiz Yapıldı', icon: 'description' },
  { number: '4,891', label: 'Mülakat Tamamlandı', icon: 'videocam' },
  { number: '92%', label: 'Memnun Kullanıcı', icon: 'star' },
  { number: '2,156', label: 'Aktif Üye', icon: 'people' },
]

const benefits = [
  'CV\'nizde eksik olan kısımları bulun',
  'Mülakat sorularına hazırlanın',
  'Hangi pozisyonlara uygun olduğunuzu keşfedin',
  'Diğer adaylarla kendinizi kıyaslayın',
  'İlerlemenizi takip edin',
  'Ücretsiz başlayın, sonra karar verin',
]

export default function HomeScreen() {
  const navigation = useNavigation()
  const [fadeAnim] = useState(new Animated.Value(0))

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start()
  }, [])

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient colors={theme.colors.gradientPrimary} style={styles.hero}>
        <Animated.View style={{ opacity: fadeAnim }}>
          <View style={styles.heroContent}>
            <View style={styles.badge}>
              <MaterialIcons name="auto-awesome" size={16} color="#00FFDE" />
              <Text style={styles.badgeText}>Kariyerinizin geleceği burada başlıyor</Text>
            </View>

            <Text variant="heading1" style={styles.heroTitle}>
              CV'nizi{' '}
              <Text variant="heading1" style={styles.heroTitleHighlight}>analiz edin</Text>
            </Text>
            <Text variant="heading2" style={styles.heroSubtitle}>mülakatlara hazırlanın</Text>

            <Text style={styles.heroDescription}>
              Yapay zeka destekli CV analizi ve mülakat simülasyonu ile kariyerinizde bir adım öne çıkın.
            </Text>

            <Button
              title="Hemen Başla"
              onPress={() => navigation.navigate('CVAnalysis' as never)}
              variant="primary"
              iconRight={<MaterialIcons name="arrow-forward" size={20} color={theme.colors.white} />}
              style={styles.ctaButton}
            />
          </View>
        </Animated.View>
      </LinearGradient>

      <View style={styles.statsSection}>
        {stats.map((stat, index) => (
          <Card key={index} style={styles.statCard}>
            <MaterialIcons name={stat.icon as any} size={24} color={theme.colors.primary} />
            <Text variant="heading2" style={styles.statNumber}>{stat.number}</Text>
            <Text variant="label" style={styles.statLabel}>{stat.label}</Text>
          </Card>
        ))}
      </View>

      <View style={styles.featuresSection}>
        <Text variant="heading1" style={styles.sectionTitle}>Özellikler</Text>
        <Text variant="body" style={styles.sectionSubtitle}>Kariyerinizi geliştirmek için ihtiyacınız olan her şey</Text>

        <View style={styles.featuresGrid}>
          {features.map((feature, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => navigation.navigate(feature.screen as never)}
            >
              <Card style={styles.featureCard}>
                <LinearGradient colors={feature.color} style={styles.featureIcon}>
                  <MaterialIcons name={feature.icon as any} size={32} color="#fff" />
                </LinearGradient>
                <Text variant="heading3" style={styles.featureTitle}>{feature.title}</Text>
                <Text variant="body" style={styles.featureDescription}>{feature.description}</Text>
              </Card>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.benefitsSection}>
        <Text variant="heading1" style={styles.sectionTitle}>Neden Carivio?</Text>
        <View style={styles.benefitsList}>
          {benefits.map((benefit, index) => (
            <Card key={index} style={styles.benefitItem}>
              <MaterialIcons name="check-circle" size={24} color={theme.colors.success} />
              <Text variant="body" style={styles.benefitText}>{benefit}</Text>
            </Card>
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <Text variant="heading3" style={styles.footerText}>Kariyerinizi geliştirmek için bugün başlayın</Text>
        <Button
          title="Ücretsiz Başla"
          onPress={() => navigation.navigate('CVAnalysis' as never)}
          variant="primary"
          style={styles.footerButton}
        />
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  hero: {
    paddingTop: 60,
    paddingBottom: 60,
    paddingHorizontal: theme.spacing.xl,
    alignItems: 'center',
  },
  heroContent: {
    alignItems: 'center',
    maxWidth: width - 40,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radii.pill,
    marginBottom: theme.spacing['2xl'],
  },
  badgeText: {
    color: theme.colors.white,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: theme.spacing.sm,
  },
  heroTitle: {
    color: theme.colors.white,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  heroTitleHighlight: {
    color: '#00FFDE',
  },
  heroSubtitle: {
    color: theme.colors.white,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  heroDescription: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: theme.spacing['3xl'],
    lineHeight: 24,
  },
  ctaButton: {
    width: '100%',
  },
  statsSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: theme.spacing.xl,
    justifyContent: 'space-between',
  },
  statCard: {
    width: (width - 60) / 2,
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  statNumber: {
    color: theme.colors.gray800,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  statLabel: {
    color: theme.colors.gray500,
    textAlign: 'center',
  },
  featuresSection: {
    padding: theme.spacing.xl,
    paddingTop: theme.spacing['4xl'],
  },
  sectionTitle: {
    color: theme.colors.gray800,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  sectionSubtitle: {
    color: theme.colors.gray500,
    textAlign: 'center',
    marginBottom: theme.spacing['3xl'],
  },
  featuresGrid: {
    gap: theme.spacing.lg,
  },
  featureCard: {
    padding: theme.spacing['2xl'],
    marginBottom: theme.spacing.lg,
  },
  featureIcon: {
    width: 64,
    height: 64,
    borderRadius: theme.radii.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  featureTitle: {
    color: theme.colors.gray800,
    marginBottom: theme.spacing.sm,
  },
  featureDescription: {
    color: theme.colors.gray500,
    lineHeight: 20,
  },
  benefitsSection: {
    padding: theme.spacing.xl,
    paddingTop: theme.spacing['4xl'],
    backgroundColor: theme.colors.gray50,
  },
  benefitsList: {
    gap: theme.spacing.lg,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: theme.spacing.lg,
  },
  benefitText: {
    flex: 1,
    color: theme.colors.gray700,
    marginLeft: theme.spacing.md,
    lineHeight: 20,
  },
  footer: {
    padding: theme.spacing['4xl'],
    alignItems: 'center',
  },
  footerText: {
    color: theme.colors.gray800,
    marginBottom: theme.spacing['2xl'],
    textAlign: 'center',
  },
  footerButton: {
    width: '100%',
  },
})
