# Google OAuth Yapılandırma Kılavuzu

Google ile giriş özelliğini etkinleştirmek için aşağıdaki adımları takip edin.

## 1. Google Cloud Console'da OAuth 2.0 Client ID Oluşturma

1. [Google Cloud Console](https://console.cloud.google.com/)'a gidin
2. Projenizi seçin (veya yeni bir proje oluşturun)
3. **APIs & Services** > **Credentials** sayfasına gidin
4. **+ CREATE CREDENTIALS** > **OAuth client ID** seçin
5. Eğer ilk kez OAuth consent screen ayarlıyorsanız, önce **Configure Consent Screen** yapın:
   - User Type: **External** seçin
   - App name: **Carivio** (veya istediğiniz isim)
   - User support email: Email adresinizi seçin
   - Developer contact: Email adresinizi girin
   - **Save and Continue**'a tıklayın
   - Scopes: Varsayılan olarak bırakın, **Save and Continue**
   - Test users: Test kullanıcıları ekleyin (opsiyonel), **Save and Continue**
   - **Back to Dashboard**'a tıklayın

6. **Create OAuth client ID**'ye tıklayın:
   - Application type: **Web application** seçin
   - Name: **Carivio Web Client**
   - Authorized redirect URIs: 
     - `https://auth.expo.io/@your-expo-username/mobile` (Expo Go için)
     - `exp://127.0.0.1:8081` (Development için)
   - **Create**'e tıklayın
   - **Client ID**'yi kopyalayın (Web Client ID)

7. Tekrar **+ CREATE CREDENTIALS** > **OAuth client ID** seçin:
   - Application type: **iOS** seçin
   - Name: **Carivio iOS Client**
   - Bundle ID: `com.yourcompany.mobile` (app.json'daki bundle identifier ile aynı olmalı)
   - **Create**'e tıklayın
   - **Client ID**'yi kopyalayın (iOS Client ID)

8. Tekrar **+ CREATE CREDENTIALS** > **OAuth client ID** seçin:
   - Application type: **Android** seçin
   - Name: **Carivio Android Client**
   - Package name: `com.yourcompany.mobile` (app.json'daki package ile aynı olmalı)
   - SHA-1 certificate fingerprint: Expo Go için gerekli değil, development build için gerekli
   - **Create**'e tıklayın
   - **Client ID**'yi kopyalayın (Android Client ID)

## 2. Firebase Console'da Google Sign-In Method'unu Etkinleştirme

1. [Firebase Console](https://console.firebase.google.com/)'a gidin
2. Projenizi seçin
3. **Authentication** > **Sign-in method** sayfasına gidin
4. **Google** provider'ını seçin
5. **Enable**'a tıklayın
6. **Web client ID**'yi yapıştırın (Google Cloud Console'dan aldığınız Web Client ID)
7. **Web client secret**'ı yapıştırın (Google Cloud Console'dan aldığınız Web Client Secret)
8. **Save**'e tıklayın

## 3. Environment Variables (.env) Dosyası Oluşturma

`mobile/.env` dosyası oluşturun ve aşağıdaki değişkenleri ekleyin:

```env
# Firebase Config (zaten var olmalı)
EXPO_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-firebase-auth-domain
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-firebase-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-firebase-storage-bucket
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-firebase-messaging-sender-id
EXPO_PUBLIC_FIREBASE_APP_ID=your-firebase-app-id
EXPO_PUBLIC_API_URL=your-api-url

# Google OAuth Client IDs
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your-web-client-id.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=your-ios-client-id.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=your-android-client-id.apps.googleusercontent.com
```

## 4. app.json Güncellemesi (Opsiyonel - Development Build için)

Development build kullanıyorsanız, `app.json` dosyasına aşağıdaki yapılandırmayı ekleyin:

```json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.yourcompany.mobile",
      "config": {
        "googleSignIn": {
          "reservedClientId": "your-ios-client-id.apps.googleusercontent.com"
        }
      }
    },
    "android": {
      "package": "com.yourcompany.mobile",
      "config": {
        "googleSignIn": {
          "apiKey": "your-android-api-key",
          "certificateHash": "your-sha-1-certificate-hash"
        }
      }
    }
  }
}
```

**Not:** Expo Go kullanıyorsanız bu adım gerekli değildir. Expo Go, kendi client ID'lerini kullanır.

## 5. Uygulamayı Yeniden Başlatma

1. Metro bundler'ı durdurun (Ctrl+C)
2. Cache'i temizleyin:
   ```bash
   npx expo start -c
   ```
3. Uygulamayı yeniden yükleyin

## Sorun Giderme

### "Google login henüz yapılandırılmadı" hatası
- `.env` dosyasında `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` değişkeninin doğru olduğundan emin olun
- Metro bundler'ı cache temizleyerek yeniden başlatın

### "redirect_uri_mismatch" hatası
- Google Cloud Console'da Authorized redirect URIs'ye Expo redirect URI'sini eklediğinizden emin olun
- Expo Go için: `https://auth.expo.io/@your-expo-username/mobile`
- Development için: `exp://127.0.0.1:8081`

### Firebase Authentication hatası
- Firebase Console'da Google Sign-In method'unun etkin olduğundan emin olun
- Web Client ID'nin Firebase Console'da doğru yapılandırıldığından emin olun

## Expo Go vs Development Build

- **Expo Go**: Expo'nun kendi client ID'lerini kullanır, sadece Web Client ID gerekir
- **Development Build**: Tüm platformlar için client ID'ler gereklidir

Şu an için Expo Go kullanıyorsanız, sadece **Web Client ID** yeterlidir. iOS ve Android Client ID'leri development build için gereklidir.

