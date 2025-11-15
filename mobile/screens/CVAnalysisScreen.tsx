import React, { useState, useEffect, useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native'
import * as DocumentPicker from 'expo-document-picker'
import { LinearGradient } from 'expo-linear-gradient'
import { useAuth } from '../contexts/AuthContext'
import { analyzeCV, CVScoreResult } from '../services/cvService'
import { saveCVAnalysisResult, saveUserStats, getUserStats } from '../services/firestore'
import { MaterialIcons, Ionicons, Feather } from '@expo/vector-icons'

const { width } = Dimensions.get('window')

type SectionKey = 'personalInfo' | 'experience' | 'education' | 'skills' | 'projects'
type Section = { score: number; status: 'excellent' | 'good' | 'needs-improvement'; feedback: string }
type RecItem = { type: string; message: string; priority?: string; impact?: string }
type AnalysisResult = {
  overallScore: number
  sections: Record<SectionKey, Section>
  recommendations: RecItem[]
  templates: { name: string; price: string; popular?: boolean }[]
  raw?: any
}

export default function CVAnalysisScreen() {
  const [uploadedFile, setUploadedFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null)
  const [analysisComplete, setAnalysisComplete] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)
  const { user } = useAuth()
  const fadeAnim = useRef(new Animated.Value(0)).current
  const globalSavingState = useRef<Set<string>>(new Set())
  const lastSaveTime = useRef<number>(0)

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start()
  }, [])

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      })

      if (!result.canceled && result.assets[0]) {
        setUploadedFile(result.assets[0])
        setAnalysisComplete(false)
        setShowResults(false)
        setAnalysisResult(null)
        globalSavingState.current.clear()
      }
    } catch (error: any) {
      Alert.alert('Hata', 'Dosya seçilemedi')
    }
  }

  const saveAnalysisToFirebase = async (resultOverride?: AnalysisResult) => {
    if (!user || !uploadedFile) return

    const resultToSave = resultOverride ?? analysisResult
    if (!resultToSave) return

    const now = Date.now()
    if (now - lastSaveTime.current < 5000) return

    const fileKey = `${user.uid}_${uploadedFile.name}_${uploadedFile.size}`
    if (globalSavingState.current.has(fileKey)) return

    lastSaveTime.current = now
    globalSavingState.current.add(fileKey)
    setIsSaving(true)

    try {
      await saveCVAnalysisResult({
        userId: user.uid,
        fileName: uploadedFile.name,
        overallScore: resultToSave.overallScore,
        sections: resultToSave.sections,
        recommendations: resultToSave.recommendations.map((r) => r.message),
      })

      const currentStats = await getUserStats(user.uid)
      const newStats = {
        userId: user.uid,
        displayName: user.displayName || 'Kullanıcı',
        photoURL: user.photoURL || undefined,
        currentRank: currentStats?.currentRank || 12,
        totalScore: (currentStats?.totalScore || 0) + resultToSave.overallScore,
        cvScore: Math.max(currentStats?.cvScore || 0, resultToSave.overallScore),
        interviewScore: currentStats?.interviewScore || 0,
        badge: currentStats?.badge || 'Yeni Katılımcı',
        level: currentStats?.level || 'Başlangıç',
        completedAnalyses: (currentStats?.completedAnalyses || 0) + 1,
        completedInterviews: currentStats?.completedInterviews || 0,
        totalActiveDays: currentStats?.totalActiveDays || 1,
        streak: currentStats?.streak || 1,
        lastActivityDate: new Date(),
      }

      await saveUserStats(newStats)
    } catch (error) {
      console.error('Firebase kaydetme hatası:', error)
    } finally {
      setIsSaving(false)
      globalSavingState.current.delete(fileKey)
    }
  }

  const handleAnalyze = async () => {
    if (!uploadedFile) return

    setIsLoading(true)
    setApiError(null)
    setLoadingProgress(0)

    let done = false
    const timer = setInterval(() => {
      setLoadingProgress((p) => (p >= 95 || done ? p : p + 2))
    }, 60)

    try {
      const analysisResult = await analyzeCV(uploadedFile.uri)
      const result = analysisResult.result

      const overall = Math.max(0, Math.min(100, Number(result.score) || 0))
      const breakdown = result.breakdown || {}

      const mapScoreToStatus = (s: number): Section['status'] =>
        s >= 80 ? 'excellent' : s >= 60 ? 'good' : 'needs-improvement'

      const sections: AnalysisResult['sections'] = {
        personalInfo: {
          score: Math.round((breakdown.completeness || 0) * 10),
          status: mapScoreToStatus(Math.round((breakdown.completeness || 0) * 10)),
          feedback: 'İletişim/link bilgilerini zenginleştirin (LinkedIn/GitHub vb.)',
        },
        experience: {
          score: Math.min(100, Math.round(((breakdown.sections || 0) / 30) * 100)),
          status: mapScoreToStatus(Math.min(100, Math.round(((breakdown.sections || 0) / 30) * 100))),
          feedback: 'İş deneyimlerinizde sayısal ve sonuç odaklı maddeler kullanın',
        },
        education: {
          score: Math.min(100, Math.round(((breakdown.formatting || 0) / 20) * 100)),
          status: mapScoreToStatus(Math.min(100, Math.round(((breakdown.formatting || 0) / 20) * 100))),
          feedback: 'Eğitim ve tarih formatlarını tek tipte sunun',
        },
        skills: {
          score: Math.min(100, Math.round(((breakdown.keywords || 0) / 30) * 100)),
          status: mapScoreToStatus(Math.min(100, Math.round(((breakdown.keywords || 0) / 30) * 100))),
          feedback: 'Sektöre özgü anahtar kelime ve becerileri artırın',
        },
        projects: {
          score: Math.min(100, Math.round(((breakdown.actions || 0) / 20) * 100)),
          status: mapScoreToStatus(Math.min(100, Math.round(((breakdown.actions || 0) / 20) * 100))),
          feedback: 'Aksiyon fiilleriyle somut başarılar ve çıktılar ekleyin',
        },
      }

      const recsRaw = (result.recommendations || []) as RecItem[] | string[]
      const recs: RecItem[] =
        Array.isArray(recsRaw) && typeof recsRaw[0] === 'object'
          ? (recsRaw as RecItem[])
          : (recsRaw as string[]).map((msg) => ({ type: 'improvement', message: msg }))

      const computed: AnalysisResult = {
        overallScore: overall,
        sections,
        recommendations: recs.length
          ? recs
          : [
              { type: 'contact', message: 'LinkedIn profilinizi ekleyin ve becerileri güncelleyin' },
              { type: 'content', message: 'İş deneyimlerinde sayısal başarıları vurgulayın' },
            ],
        templates: [
          { name: 'Basit & Temiz', price: 'Ücretsiz', popular: true },
          { name: 'Modern Tasarım', price: '₺25' },
          { name: 'Kreatif', price: '₺35' },
          { name: 'Klasik', price: '₺15' },
        ],
        raw: result,
      }

      setAnalysisResult(computed)
      done = true
      setLoadingProgress(100)
      clearInterval(timer)
      setIsLoading(false)
      setAnalysisComplete(true)
      setShowResults(true)

      await saveAnalysisToFirebase(computed)
    } catch (e: any) {
      done = true
      clearInterval(timer)
      setIsLoading(false)
      setLoadingProgress(0)
      setApiError(e.message || 'Analiz sırasında bir hata oluştu')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent':
        return '#10b981'
      case 'good':
        return '#3b82f6'
      case 'needs-improvement':
        return '#f59e0b'
      default:
        return '#6b7280'
    }
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={['#1e293b', '#1e40af', '#1e293b']}
          style={styles.loadingGradient}
        >
          <View style={styles.loadingContent}>
            <View style={styles.progressCircle}>
              <Text style={styles.progressText}>{Math.round(loadingProgress)}%</Text>
            </View>
            <Text style={styles.loadingTitle}>CV İNCELENİYOR...</Text>
            <Text style={styles.loadingSubtitle}>Yapay zeka CV'nizi analiz ediyor</Text>
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { width: `${loadingProgress}%` }]} />
            </View>
          </View>
        </LinearGradient>
      </View>
    )
  }

  if (!showResults) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <Animated.View style={{ opacity: fadeAnim }}>
          <View style={styles.header}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>✨ Yapay Zeka Destekli Analiz</Text>
            </View>
            <Text style={styles.title}>CV Analizi</Text>
            <Text style={styles.subtitle}>CV'nizi yükleyin, analiz edin ve nasıl geliştirebileceğinizi öğrenin</Text>
            {apiError && <Text style={styles.errorText}>{apiError}</Text>}
          </View>

          <View style={styles.uploadCard}>
            <View style={styles.uploadArea}>
              <TouchableOpacity onPress={pickDocument} style={styles.uploadButton}>
                <MaterialIcons name="description" size={48} color="#fff" />
                <Text style={styles.uploadText}>Dosya Seç</Text>
                <Text style={styles.uploadSubtext}>PDF formatında</Text>
              </TouchableOpacity>
            </View>

            {uploadedFile && (
              <View style={styles.fileInfo}>
                <View style={styles.fileInfoLeft}>
                  <View style={styles.fileIcon}>
                    <MaterialIcons name="description" size={24} color="#fff" />
                  </View>
                  <View>
                    <Text style={styles.fileName}>{uploadedFile.name}</Text>
                    <Text style={styles.fileSize}>
                      {((uploadedFile.size || 0) / 1024 / 1024).toFixed(1)} MB
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={handleAnalyze}
                  style={styles.analyzeButton}
                >
                  <Ionicons name="flash" size={20} color="#fff" />
                  <Text style={styles.analyzeButtonText}>Analiz Et</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View style={styles.featuresGrid}>
            {[
              { icon: 'person', title: 'Kişisel Bilgiler', desc: 'İletişim bilgileri ve profesyonel özet kontrol edilir.', color: ['#3b82f6', '#2563eb'] },
              { icon: 'work', title: 'İş Deneyimi', desc: 'Çalışma geçmişi ve başarılarınız değerlendirilir.', color: ['#10b981', '#059669'] },
              { icon: 'school', title: 'Eğitim & Beceriler', desc: 'Eğitim geçmişi ve teknik beceriler incelenir.', color: ['#f59e0b', '#d97706'] },
            ].map((item, index) => (
              <View key={index} style={styles.featureCard}>
                <LinearGradient colors={item.color} style={styles.featureIcon}>
                  <MaterialIcons name={item.icon as any} size={28} color="#fff" />
                </LinearGradient>
                <Text style={styles.featureTitle}>{item.title}</Text>
                <Text style={styles.featureDesc}>{item.desc}</Text>
              </View>
            ))}
          </View>
        </Animated.View>
      </ScrollView>
    )
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.resultsContainer}>
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsTitle}>Analiz Sonuçları</Text>
      </View>

      <View style={styles.scoreCard}>
        <LinearGradient colors={['#dbeafe', '#e9d5ff']} style={styles.scoreGradient}>
          <View style={styles.scoreHeader}>
            <View style={styles.scoreIcon}>
              <Text style={styles.scoreIconText}>⭐</Text>
            </View>
            <Text style={styles.scoreLabel}>Genel Puan</Text>
          </View>
          <Text style={styles.scoreValue}>{analysisResult?.overallScore ?? 0}/100</Text>
          <View style={styles.scoreBarContainer}>
            <View
              style={[
                styles.scoreBar,
                {
                  width: `${analysisResult?.overallScore ?? 0}%`,
                  backgroundColor: (analysisResult?.overallScore ?? 0) >= 80 ? '#10b981' : (analysisResult?.overallScore ?? 0) >= 60 ? '#3b82f6' : '#f59e0b',
                },
              ]}
            />
          </View>
          <Text style={styles.scoreMessage}>
            {analysisResult && analysisResult.overallScore >= 80
              ? 'Harika! Küçük dokunuşlarla mükemmel hale gelebilir.'
              : analysisResult.overallScore >= 60
                ? 'İyi bir başlangıç. Önerileri uygulayarak hızlıca güçlendirebilirsiniz.'
                : 'İyileştirme alanları fazla. Aşağıdaki önerileri önceliklendirin.'}
          </Text>
        </LinearGradient>
      </View>

      {analysisResult?.raw?.breakdown && (
        <View style={styles.breakdownCard}>
          <Text style={styles.sectionTitle}>Skor Kırılımı</Text>
          <View style={styles.breakdownGrid}>
            {[
              { label: 'Bölümler', key: 'sections' },
              { label: 'Biçimlendirme', key: 'formatting' },
              { label: 'Anahtar Kelimeler', key: 'keywords' },
              { label: 'Eylem Fiilleri', key: 'actions' },
              { label: 'Tamamlayıcılık', key: 'completeness' },
            ].map((item) => (
              <View key={item.key} style={styles.breakdownItem}>
                <Text style={styles.breakdownLabel}>{item.label}</Text>
                <Text style={styles.breakdownValue}>
                  {analysisResult.raw.breakdown[item.key] ?? 0}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <View style={styles.recommendationsCard}>
          <View style={styles.recommendationsHeader}>
          <MaterialIcons name="trending-up" size={24} color="#3b82f6" />
          <Text style={styles.sectionTitle}>Nasıl Geliştirebilirsiniz?</Text>
        </View>
        <ScrollView style={styles.recommendationsList}>
          {analysisResult?.recommendations
            .filter((r) => (r.type || '').toLowerCase() !== 'positive')
            .map((r, index) => (
              <View key={`neg-${index}`} style={styles.recommendationItem}>
                <View style={styles.recommendationBadge}>
                  <Text style={styles.recommendationBadgeText}>!</Text>
                </View>
                <Text style={styles.recommendationText}>{r.message}</Text>
              </View>
            ))}
          {analysisResult?.recommendations
            .filter((r) => (r.type || '').toLowerCase() === 'positive')
            .map((r, index) => (
              <View key={`pos-${index}`} style={[styles.recommendationItem, styles.recommendationItemPositive]}>
                <View style={[styles.recommendationBadge, styles.recommendationBadgePositive]}>
                  <Text style={[styles.recommendationBadgeText, styles.recommendationBadgeTextPositive]}>✓</Text>
                </View>
                <Text style={styles.recommendationText}>{r.message}</Text>
              </View>
            ))}
        </ScrollView>
      </View>

      <View style={styles.templatesCard}>
        <Text style={styles.sectionTitle}>CV Şablonları</Text>
        <Text style={styles.sectionSubtitle}>Profesyonel şablonlarla CV'nizi yenileyin</Text>
        <View style={styles.templatesGrid}>
          {analysisResult?.templates.map((template, index) => (
            <TouchableOpacity key={index} style={styles.templateCard}>
              {template.popular && (
                <View style={styles.popularBadge}>
                  <Text style={styles.popularBadgeText}>Popüler</Text>
                </View>
              )}
              <Text style={styles.templateName}>{template.name}</Text>
              <Text style={styles.templatePrice}>{template.price}</Text>
              <TouchableOpacity
                style={[
                  styles.templateButton,
                  template.price === 'Ücretsiz' && styles.templateButtonFree,
                ]}
              >
                <Text
                  style={[
                    styles.templateButtonText,
                    template.price === 'Ücretsiz' && styles.templateButtonTextFree,
                  ]}
                >
                  {template.price === 'Ücretsiz' ? 'İndir' : 'Satın Al'}
                </Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
  },
  loadingGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    alignItems: 'center',
  },
  progressCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  progressText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  loadingTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  loadingSubtitle: {
    fontSize: 16,
    color: '#cbd5e1',
    marginBottom: 32,
  },
  progressBarContainer: {
    width: width * 0.7,
    height: 8,
    backgroundColor: '#334155',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 4,
  },
  header: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  badge: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
  },
  badgeText: {
    color: '#1e40af',
    fontSize: 14,
    fontWeight: '600',
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
  errorText: {
    color: '#ef4444',
    marginTop: 8,
    fontSize: 14,
  },
  uploadCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  uploadArea: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
  },
  uploadButton: {
    alignItems: 'center',
  },
  uploadText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 16,
  },
  uploadSubtext: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  fileInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    padding: 16,
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
  },
  fileInfoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  fileIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  fileName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  fileSize: {
    fontSize: 14,
    color: '#6b7280',
  },
  analyzeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3b82f6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  analyzeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureCard: {
    width: (width - 60) / 3,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  featureIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  featureDesc: {
    fontSize: 12,
    color: '#6b7280',
    lineHeight: 18,
  },
  resultsContainer: {
    padding: 20,
  },
  resultsHeader: {
    marginBottom: 24,
  },
  resultsTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  scoreCard: {
    borderRadius: 16,
    marginBottom: 24,
    overflow: 'hidden',
  },
  scoreGradient: {
    padding: 24,
  },
  scoreHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  scoreIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#fbbf24',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  scoreIconText: {
    fontSize: 24,
  },
  scoreLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  scoreBarContainer: {
    width: '100%',
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginBottom: 16,
    overflow: 'hidden',
  },
  scoreBar: {
    height: '100%',
    borderRadius: 4,
  },
  scoreMessage: {
    fontSize: 16,
    color: '#4b5563',
    lineHeight: 24,
  },
  breakdownCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  breakdownGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  breakdownItem: {
    width: (width - 80) / 2,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  breakdownLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  breakdownValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  recommendationsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  recommendationsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  recommendationsList: {
    maxHeight: 400,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
  },
  recommendationItemPositive: {
    backgroundColor: '#f0fdf4',
    borderLeftColor: '#10b981',
  },
  recommendationBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fee2e2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  recommendationBadgePositive: {
    backgroundColor: '#d1fae5',
  },
  recommendationBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#dc2626',
  },
  recommendationBadgeTextPositive: {
    color: '#059669',
  },
  recommendationText: {
    flex: 1,
    fontSize: 14,
    color: '#1f2937',
    lineHeight: 20,
  },
  templatesCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  templatesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  templateCard: {
    width: (width - 80) / 2,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    position: 'relative',
  },
  popularBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#10b981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  templateName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  templatePrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3b82f6',
    marginBottom: 12,
  },
  templateButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  templateButtonFree: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  templateButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  templateButtonTextFree: {
    color: '#fff',
  },
})
