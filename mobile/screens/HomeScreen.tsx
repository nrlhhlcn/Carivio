import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { MaterialIcons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'

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
      <LinearGradient colors={['#4300FF', '#0065F8', '#4300FF']} style={styles.hero}>
        <Animated.View style={{ opacity: fadeAnim }}>
          <View style={styles.heroContent}>
            <View style={styles.badge}>
              <MaterialIcons name="auto-awesome" size={16} color="#00FFDE" />
              <Text style={styles.badgeText}>Kariyerinizin geleceği burada başlıyor</Text>
            </View>

            <Text style={styles.heroTitle}>
              CV'nizi{' '}
              <Text style={styles.heroTitleHighlight}>analiz edin</Text>
            </Text>
            <Text style={styles.heroSubtitle}>mülakatlara hazırlanın</Text>

            <Text style={styles.heroDescription}>
              Yapay zeka destekli CV analizi ve mülakat simülasyonu ile kariyerinizde bir adım öne çıkın.
            </Text>

            <TouchableOpacity
              onPress={() => navigation.navigate('CVAnalysis' as never)}
              style={styles.ctaButton}
            >
              <LinearGradient colors={['#fff', '#f0f0f0']} style={styles.ctaButtonGradient}>
                <Text style={styles.ctaButtonText}>Hemen Başla</Text>
                <MaterialIcons name="arrow-forward" size={20} color="#4300FF" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </LinearGradient>

      <View style={styles.statsSection}>
        {stats.map((stat, index) => (
          <View key={index} style={styles.statCard}>
            <MaterialIcons name={stat.icon as any} size={24} color="#4300FF" />
            <Text style={styles.statNumber}>{stat.number}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.featuresSection}>
        <Text style={styles.sectionTitle}>Özellikler</Text>
        <Text style={styles.sectionSubtitle}>Kariyerinizi geliştirmek için ihtiyacınız olan her şey</Text>

        <View style={styles.featuresGrid}>
          {features.map((feature, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => navigation.navigate(feature.screen as never)}
              style={styles.featureCard}
            >
              <LinearGradient colors={feature.color} style={styles.featureIcon}>
                <MaterialIcons name={feature.icon as any} size={32} color="#fff" />
              </LinearGradient>
              <Text style={styles.featureTitle}>{feature.title}</Text>
              <Text style={styles.featureDescription}>{feature.description}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.benefitsSection}>
        <Text style={styles.sectionTitle}>Neden Carivio?</Text>
        <View style={styles.benefitsList}>
          {benefits.map((benefit, index) => (
            <View key={index} style={styles.benefitItem}>
              <MaterialIcons name="check-circle" size={24} color="#10b981" />
              <Text style={styles.benefitText}>{benefit}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Kariyerinizi geliştirmek için bugün başlayın</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('CVAnalysis' as never)}
          style={styles.footerButton}
        >
          <LinearGradient colors={['#4300FF', '#0065F8']} style={styles.footerButtonGradient}>
            <Text style={styles.footerButtonText}>Ücretsiz Başla</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  hero: {
    paddingTop: 60,
    paddingBottom: 60,
    paddingHorizontal: 20,
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
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 24,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 8,
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 12,
  },
  heroTitleHighlight: {
    color: '#00FFDE',
  },
  heroSubtitle: {
    fontSize: 28,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 16,
  },
  heroDescription: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  ctaButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  ctaButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  ctaButtonText: {
    color: '#4300FF',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
  },
  statsSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 20,
    justifyContent: 'space-between',
  },
  statCard: {
    width: (width - 60) / 2,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  featuresSection: {
    padding: 20,
    paddingTop: 40,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  sectionSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  featuresGrid: {
    gap: 16,
  },
  featureCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 16,
  },
  featureIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  benefitsSection: {
    padding: 20,
    paddingTop: 40,
    backgroundColor: '#f9fafb',
  },
  benefitsList: {
    gap: 16,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  benefitText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    marginLeft: 12,
    lineHeight: 20,
  },
  footer: {
    padding: 40,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 24,
    textAlign: 'center',
  },
  footerButton: {
    borderRadius: 12,
    overflow: 'hidden',
    width: '100%',
  },
  footerButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  footerButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
})
