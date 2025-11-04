import React, { useState, useEffect, useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Animated,
  Dimensions,
} from 'react-native'
import { CameraView, useCameraPermissions } from 'expo-camera'
import { LinearGradient } from 'expo-linear-gradient'
import { MaterialIcons, Ionicons } from '@expo/vector-icons'
import * as DocumentPicker from 'expo-document-picker'
import { useAuth } from '../contexts/AuthContext'
import { analyzeCV } from '../services/cvService'
import { saveInterviewResult, saveUserStats, getUserStats } from '../services/firestore'
import { API_ENDPOINTS } from '../config/api'

const { width, height } = Dimensions.get('window')

const mockQuestions = [
  'Kendinizi kısaca tanıtır mısınız?',
  'Bu pozisyona neden başvurdunuz?',
  'En büyük güçlü yönünüz nedir?',
  'Bir zorlukla karşılaştığınızda nasıl yaklaşırsınız?',
  '5 yıl sonra kendinizi nerede görüyorsunuz?',
]

const mockInterviewResult = {
  overallScore: 78,
  cvCompatibility: 85,
  stressManagement: 72,
  communicationSkills: 80,
  technicalKnowledge: 75,
  bodyLanguage: {
    eyeContact: 85,
    posture: 70,
    facialExpressions: 78,
  },
  feedback: [
    'Mükemmel göz teması kuruyorsunuz, bu güven verici',
    'Postürünüzü düzeltmeye odaklanın, daha dik oturun',
    'Teknik sorularda daha detaylı örnekler verebilirsiniz',
    'Stres yönetimi konusunda gelişim gösterebilirsiniz',
  ],
  recommendations: [
    'Teknik becerilerinizi örneklerle destekleyin',
    'Vücut dilinize dikkat edin, daha rahat durun',
    'Sorulara daha yapılandırılmış cevaplar verin',
    'Stresli durumlarda sakin kalma tekniklerini uygulayın',
  ],
  questions: mockQuestions,
}

type InterviewStep = 'setup' | 'interview' | 'results'

export default function InterviewScreen() {
  const [currentStep, setCurrentStep] = useState<InterviewStep>('setup')
  const [uploadedCV, setUploadedCV] = useState<DocumentPicker.DocumentPickerAsset | null>(null)
  const [jobDescription, setJobDescription] = useState('')
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const [interviewStarted, setInterviewStarted] = useState(false)
  const [aiSpeaking, setAiSpeaking] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [isSavingInterview, setIsSavingInterview] = useState(false)
  const [jdFit, setJdFit] = useState<any | null>(null)
  const [facing, setFacing] = useState<'front' | 'back'>('front')
  const [permission, requestPermission] = useCameraPermissions()
  const { user } = useAuth()
  const cameraRef = useRef<any>(null)
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

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isRecording])

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      })

      if (!result.canceled && result.assets[0]) {
        setUploadedCV(result.assets[0])
      }
    } catch (error: any) {
      Alert.alert('Hata', 'Dosya seçilemedi')
    }
  }

  const startInterview = async () => {
    if (!uploadedCV || !jobDescription.trim()) {
      Alert.alert('Hata', 'Lütfen CV ve iş tanımını girin')
      return
    }

    if (!permission?.granted) {
      const result = await requestPermission()
      if (!result.granted) {
        Alert.alert('Hata', 'Kamera izni gerekli')
        return
      }
    }

    setCurrentStep('interview')
    setInterviewStarted(true)
    setIsLoading(true)
    setLoadingProgress(0)

    // Progress animasyonu
    const progressInterval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          setIsLoading(false)
          setAiSpeaking(true)
          setTimeout(() => {
            setAiSpeaking(false)
            setTimeout(() => {
              setIsRecording(true)
            }, 500)
          }, 3000)
          return 100
        }
        return prev + 2
      })
    }, 100)

    // JD fit hesapla
    try {
      const analysisResult = await analyzeCV(uploadedCV.uri, 'INFORMATION-TECHNOLOGY', jobDescription)
      if (analysisResult.result?.jd_fit) {
        setJdFit(analysisResult.result.jd_fit)
      }
    } catch (e) {
      console.error('JD fit hesaplanamadı', e)
    }
  }

  const nextQuestion = () => {
    if (currentQuestion < mockQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setIsRecording(false)
      setRecordingTime(0)
      setAiSpeaking(true)
      setTimeout(() => {
        setAiSpeaking(false)
        setTimeout(() => {
          setIsRecording(true)
        }, 500)
      }, 3000)
    } else {
      setCurrentStep('results')
      setIsRecording(false)
      saveInterviewToFirebase()
    }
  }

  const saveInterviewToFirebase = async () => {
    if (!user) return

    const now = Date.now()
    if (now - lastSaveTime.current < 5000) return

    const interviewKey = `interview_${user.uid}_${now}`
    if (globalSavingState.current.has(interviewKey) || isSavingInterview) return

    lastSaveTime.current = now
    globalSavingState.current.add(interviewKey)
    setIsSavingInterview(true)

    try {
      await saveInterviewResult({
        userId: user.uid,
        overallScore: mockInterviewResult.overallScore,
        cvCompatibility: mockInterviewResult.cvCompatibility,
        stressManagement: mockInterviewResult.stressManagement,
        communicationSkills: mockInterviewResult.communicationSkills,
        technicalKnowledge: mockInterviewResult.technicalKnowledge,
        bodyLanguage: mockInterviewResult.bodyLanguage,
        feedback: mockInterviewResult.feedback,
        recommendations: mockInterviewResult.recommendations,
        questions: mockInterviewResult.questions,
        duration: recordingTime,
      })

      const currentStats = await getUserStats(user.uid)
      const newStats = {
        userId: user.uid,
        currentRank: currentStats?.currentRank || 12,
        totalScore: (currentStats?.totalScore || 0) + mockInterviewResult.overallScore,
        cvScore: currentStats?.cvScore || 0,
        interviewScore: mockInterviewResult.overallScore,
        badge: currentStats?.badge || 'Yeni Katılımcı',
        level: currentStats?.level || 'Başlangıç',
        completedAnalyses: currentStats?.completedAnalyses || 0,
        completedInterviews: (currentStats?.completedInterviews || 0) + 1,
        totalActiveDays: currentStats?.totalActiveDays || 1,
        streak: currentStats?.streak || 1,
        lastActivityDate: new Date(),
      }

      await saveUserStats(newStats)
    } catch (error) {
      console.error('Firebase kaydetme hatası:', error)
    } finally {
      setIsSavingInterview(false)
      globalSavingState.current.delete(interviewKey)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10b981'
    if (score >= 60) return '#3b82f6'
    return '#f59e0b'
  }

  if (currentStep === 'setup') {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <Animated.View style={{ opacity: fadeAnim }}>
          <View style={styles.header}>
            <Text style={styles.title}>Mülakat Simülasyonu</Text>
            <Text style={styles.subtitle}>Gerçek mülakat ortamını simüle eden sistemle pratik yapın</Text>
          </View>

          <View style={styles.setupCard}>
            <Text style={styles.sectionTitle}>CV'nizi Yükleyin</Text>
            <TouchableOpacity onPress={pickDocument} style={styles.uploadButton}>
              <MaterialIcons name="description" size={32} color="#3b82f6" />
              <Text style={styles.uploadText}>
                {uploadedCV ? uploadedCV.name : 'CV Dosyası Seç'}
              </Text>
            </TouchableOpacity>

            <Text style={styles.sectionTitle}>İş Tanımı</Text>
            <TextInput
              style={styles.textInput}
              multiline
              numberOfLines={6}
              placeholder="İş tanımını buraya yapıştırın..."
              value={jobDescription}
              onChangeText={setJobDescription}
              textAlignVertical="top"
            />

            <TouchableOpacity
              onPress={startInterview}
              disabled={!uploadedCV || !jobDescription.trim()}
              style={[
                styles.startButton,
                (!uploadedCV || !jobDescription.trim()) && styles.startButtonDisabled,
              ]}
            >
              <LinearGradient
                colors={['#4300FF', '#0065F8']}
                style={styles.startButtonGradient}
              >
                <Text style={styles.startButtonText}>Mülakatı Başlat</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    )
  }

  if (currentStep === 'interview') {
    return (
      <View style={styles.interviewContainer}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <LinearGradient colors={['#1e293b', '#1e40af']} style={styles.loadingGradient}>
              <View style={styles.progressCircle}>
                <Text style={styles.progressText}>{Math.round(loadingProgress)}%</Text>
              </View>
              <Text style={styles.loadingTitle}>Mülakat Hazırlanıyor...</Text>
            </LinearGradient>
          </View>
        ) : (
          <>
            {permission?.granted ? (
              <CameraView
                ref={cameraRef}
                style={styles.camera}
                facing={facing}
              >
                <View style={styles.interviewOverlay}>
                  <View style={styles.questionCard}>
                    <Text style={styles.questionNumber}>Soru {currentQuestion + 1}/{mockQuestions.length}</Text>
                    <Text style={styles.questionText}>{mockQuestions[currentQuestion]}</Text>
                  </View>

                  <View style={styles.controls}>
                    <View style={styles.timer}>
                      <Text style={styles.timerText}>{formatTime(recordingTime)}</Text>
                    </View>

                    {isRecording && (
                      <View style={styles.recordingIndicator}>
                        <View style={styles.recordingDot} />
                        <Text style={styles.recordingText}>Kayıt Yapılıyor</Text>
                      </View>
                    )}

                    {aiSpeaking && (
                      <View style={styles.aiSpeakingIndicator}>
                        <ActivityIndicator size="small" color="#fff" />
                        <Text style={styles.aiSpeakingText}>AI Konuşuyor...</Text>
                      </View>
                    )}

                    <View style={styles.controlButtons}>
                      <TouchableOpacity
                        onPress={() => setFacing(facing === 'front' ? 'back' : 'front')}
                        style={styles.controlButton}
                      >
                        <Ionicons name="camera-reverse" size={24} color="#fff" />
                      </TouchableOpacity>

                      {!isRecording && !aiSpeaking && (
                        <TouchableOpacity
                          onPress={nextQuestion}
                          style={styles.nextButton}
                        >
                          <Text style={styles.nextButtonText}>Sonraki Soru</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </View>
              </CameraView>
            ) : (
              <View style={styles.permissionContainer}>
                <MaterialIcons name="videocam-off" size={64} color="#6b7280" />
                <Text style={styles.permissionText}>Kamera İzni Gerekli</Text>
                <TouchableOpacity
                  onPress={requestPermission}
                  style={styles.permissionButton}
                >
                  <Text style={styles.permissionButtonText}>İzin Ver</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
      </View>
    )
  }

  if (currentStep === 'results') {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.resultsContainer}>
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsTitle}>Mülakat Sonuçları</Text>
        </View>

        <View style={styles.scoreCard}>
          <LinearGradient colors={['#dbeafe', '#e9d5ff']} style={styles.scoreGradient}>
            <Text style={styles.scoreLabel}>Genel Puan</Text>
            <Text style={styles.scoreValue}>{mockInterviewResult.overallScore}/100</Text>
          </LinearGradient>
        </View>

        <View style={styles.breakdownCard}>
          <Text style={styles.sectionTitle}>Detaylı Skorlar</Text>
          <View style={styles.breakdownGrid}>
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownLabel}>CV Uyumu</Text>
              <Text style={[styles.breakdownValue, { color: getScoreColor(mockInterviewResult.cvCompatibility) }]}>
                {mockInterviewResult.cvCompatibility}
              </Text>
            </View>
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownLabel}>İletişim</Text>
              <Text style={[styles.breakdownValue, { color: getScoreColor(mockInterviewResult.communicationSkills) }]}>
                {mockInterviewResult.communicationSkills}
              </Text>
            </View>
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownLabel}>Teknik Bilgi</Text>
              <Text style={[styles.breakdownValue, { color: getScoreColor(mockInterviewResult.technicalKnowledge) }]}>
                {mockInterviewResult.technicalKnowledge}
              </Text>
            </View>
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownLabel}>Stres Yönetimi</Text>
              <Text style={[styles.breakdownValue, { color: getScoreColor(mockInterviewResult.stressManagement) }]}>
                {mockInterviewResult.stressManagement}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.feedbackCard}>
          <Text style={styles.sectionTitle}>Geri Bildirimler</Text>
          {mockInterviewResult.feedback.map((item, index) => (
            <View key={index} style={styles.feedbackItem}>
              <MaterialIcons name="feedback" size={20} color="#3b82f6" />
              <Text style={styles.feedbackText}>{item}</Text>
            </View>
          ))}
        </View>

        <View style={styles.recommendationsCard}>
          <Text style={styles.sectionTitle}>Öneriler</Text>
          {mockInterviewResult.recommendations.map((item, index) => (
            <View key={index} style={styles.recommendationItem}>
              <MaterialIcons name="lightbulb" size={20} color="#f59e0b" />
              <Text style={styles.recommendationText}>{item}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          onPress={() => {
            setCurrentStep('setup')
            setCurrentQuestion(0)
            setRecordingTime(0)
            setUploadedCV(null)
            setJobDescription('')
          }}
          style={styles.restartButton}
        >
          <LinearGradient colors={['#4300FF', '#0065F8']} style={styles.restartButtonGradient}>
            <Text style={styles.restartButtonText}>Yeni Mülakat Başlat</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    )
  }

  return null
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
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
  setupCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
    marginTop: 20,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  uploadText: {
    fontSize: 16,
    color: '#6b7280',
    marginLeft: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1f2937',
    backgroundColor: '#f9fafb',
    marginBottom: 20,
    minHeight: 120,
  },
  startButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
  },
  startButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  startButtonDisabled: {
    opacity: 0.5,
  },
  interviewContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
  },
  loadingGradient: {
    flex: 1,
    justifyContent: 'center',
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
  },
  camera: {
    flex: 1,
  },
  interviewOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'space-between',
    padding: 20,
  },
  questionCard: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 16,
    padding: 20,
    marginTop: 40,
  },
  questionNumber: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  controls: {
    alignItems: 'center',
  },
  timer: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginBottom: 16,
  },
  timerText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ef4444',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 16,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
    marginRight: 8,
  },
  recordingText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  aiSpeakingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(59,130,246,0.9)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 16,
  },
  aiSpeakingText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  controlButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  permissionText: {
    fontSize: 18,
    color: '#6b7280',
    marginTop: 16,
    marginBottom: 24,
  },
  permissionButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#1f2937',
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
  breakdownGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  breakdownItem: {
    width: (width - 80) / 2,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  breakdownLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
  },
  breakdownValue: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  feedbackCard: {
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
  feedbackItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  feedbackText: {
    flex: 1,
    fontSize: 14,
    color: '#1f2937',
    marginLeft: 12,
    lineHeight: 20,
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
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  recommendationText: {
    flex: 1,
    fontSize: 14,
    color: '#1f2937',
    marginLeft: 12,
    lineHeight: 20,
  },
  restartButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
  },
  restartButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  restartButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
})
