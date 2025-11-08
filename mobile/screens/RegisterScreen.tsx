import React, { useState } from 'react'
import { View, StyleSheet, Alert } from 'react-native'
import { useAuth } from '../contexts/AuthContext'
import { useNavigation } from '@react-navigation/native'
import { LinearGradient } from 'expo-linear-gradient'
import { theme } from '../theme'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Text } from '../components/ui/Text'

export default function RegisterScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [tag, setTag] = useState('')
  const { signUp } = useAuth()
  const navigation = useNavigation()

  const handleRegister = async () => {
    if (!email || !password || !firstName || !lastName || !tag) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun')
      return
    }

    try {
      await signUp(email, password, firstName, lastName, tag)
    } catch (error: any) {
      Alert.alert('Hata', error.message)
    }
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={[theme.colors.white, theme.colors.gray50]} style={styles.header}>
        <Text variant="heading1" style={styles.brand}>Hesap Oluştur</Text>
        <Text variant="muted">Saniyeler içinde başlayın</Text>
      </LinearGradient>

      <View style={styles.card}>
        <View style={styles.row}>
          <View style={styles.col}>
            <Input label="Ad" placeholder="Ad" value={firstName} onChangeText={setFirstName} />
          </View>
          <View style={styles.col}>
            <Input label="Soyad" placeholder="Soyad" value={lastName} onChangeText={setLastName} />
          </View>
        </View>

        <Input
          label="Kullanıcı Adı (tag)"
          placeholder="@kullaniciadi"
          value={tag}
          onChangeText={setTag}
          autoCapitalize="none"
        />
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

        <Button title="Kayıt Ol" onPress={handleRegister} />

        <View style={styles.footerRow}>
          <Text variant="body">Zaten hesabın var mı?</Text>
          <Text
            variant="body"
            style={styles.link}
            onPress={() => navigation.navigate('Login' as never)}
          >
            Giriş Yap
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
  row: {
    flexDirection: 'row',
    gap: theme.spacing.lg as any,
  },
  col: {
    flex: 1,
  },
  footerRow: {
    marginTop: theme.spacing.lg,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  link: {
    color: theme.colors.primary,
    marginLeft: theme.spacing.sm,
    fontWeight: '600',
  },
})

