import React, { useState } from 'react'
import { View, StyleSheet, Alert } from 'react-native'
import { useAuth } from '../contexts/AuthContext'
import { useNavigation } from '@react-navigation/native'
import { LinearGradient } from 'expo-linear-gradient'
import { theme } from '../theme'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Text } from '../components/ui/Text'

export default function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { signIn, signInWithGoogle } = useAuth()
  const navigation = useNavigation()

  const handleLogin = async () => {
    try {
      await signIn(email, password)
    } catch (error: any) {
      Alert.alert('Hata', error.message)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle()
    } catch (error: any) {
      Alert.alert('Hata', error.message)
    }
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={[theme.colors.white, theme.colors.gray50]} style={styles.header}>
        <Text variant="heading1" style={styles.brand}>
          Carivio
        </Text>
        <Text variant="muted">Hesabınıza giriş yapın</Text>
      </LinearGradient>

      <View style={styles.card}>
        <Input
          label="Email"
          placeholder="ornek@mail.com"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <Input
          label="Şifre"
          placeholder="••••••••"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <Button title="Giriş Yap" onPress={handleLogin} />
        <View style={{ height: theme.spacing.md }} />
        <Button
          title="Google ile Giriş"
          variant="outline"
          onPress={handleGoogleLogin}
        />

        <View style={styles.footerRow}>
          <Text variant="body">Hesabın yok mu?</Text>
          <Text
            variant="body"
            style={styles.link}
            onPress={() => navigation.navigate('Register' as never)}
          >
            Kayıt Ol
          </Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingTop: theme.spacing['4xl'],
    paddingBottom: theme.spacing['2xl'],
    alignItems: 'center',
  },
  brand: {
    color: theme.colors.primary,
    marginBottom: theme.spacing.sm,
  },
  card: {
    marginHorizontal: theme.spacing['2xl'],
    padding: theme.spacing['2xl'],
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    ...theme.shadows.card,
  },
  footerRow: {
    marginTop: theme.spacing.lg,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing.sm as any,
  },
  link: {
    color: theme.colors.primary,
    marginLeft: theme.spacing.sm,
    fontWeight: '600',
  },
})

