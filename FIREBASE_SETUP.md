# Firebase Kurulum Talimatları

## 1. Firebase Projesi Oluşturma

1. [Firebase Console](https://console.firebase.google.com/) adresine gidin
2. "Create a project" butonuna tıklayın
3. Proje adını girin (örn: "carivio-app")
4. Google Analytics'i etkinleştirin (opsiyonel)
5. Projeyi oluşturun

## 2. Authentication Kurulumu

1. Firebase Console'da sol menüden "Authentication" seçin
2. "Get started" butonuna tıklayın
3. "Sign-in method" sekmesine gidin
4. "Email/Password" seçeneğini etkinleştirin
5. "Save" butonuna tıklayın

## 3. Firestore Database Kurulumu

1. Sol menüden "Firestore Database" seçin
2. "Create database" butonuna tıklayın
3. "Start in test mode" seçin (geliştirme için)
4. Bir lokasyon seçin (örn: europe-west1)
5. "Done" butonuna tıklayın

## 4. Storage Kurulumu

1. Sol menüden "Storage" seçin
2. "Get started" butonuna tıklayın
3. "Start in test mode" seçin
4. Aynı lokasyonu seçin
5. "Done" butonuna tıklayın

## 5. Web App Konfigürasyonu

1. Firebase Console'da proje ayarlarına gidin (⚙️ > Project settings)
2. "General" sekmesinde "Your apps" bölümüne gidin
3. Web ikonuna (</>) tıklayın
4. App nickname girin (örn: "carivio-web")
5. "Register app" butonuna tıklayın
6. Konfigürasyon kodunu kopyalayın

## 6. Environment Variables

Proje kök dizininde `.env.local` dosyası oluşturun ve aşağıdaki değerleri ekleyin:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

Bu değerleri Firebase Console'dan aldığınız konfigürasyon kodundan alabilirsiniz.

## 7. Firestore Güvenlik Kuralları

Firestore Database > Rules sekmesinde aşağıdaki kuralları ekleyin:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // CV Analizleri - sadece kendi verilerine erişim
    match /cvAnalyses/{document} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
    
    // Kullanıcı Profilleri - sadece kendi profiline erişim
    match /userProfiles/{document} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

## 8. Storage Güvenlik Kuralları

Storage > Rules sekmesinde aşağıdaki kuralları ekleyin:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // CV dosyaları - sadece kendi dosyalarına erişim
    match /cv-files/{userId}/{fileName} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 9. Test Etme

1. Projeyi çalıştırın: `npm run dev`
2. `/register` sayfasından yeni bir hesap oluşturun
3. `/login` sayfasından giriş yapın
4. Firebase Console'da Authentication ve Firestore'da verilerin oluştuğunu kontrol edin

## 10. Production Hazırlığı

Production'a geçmeden önce:

1. Firestore kurallarını production için güncelleyin
2. Storage kurallarını production için güncelleyin
3. Firebase Console'da "Authentication" > "Settings" > "Authorized domains" listesine domain'inizi ekleyin
4. Environment variables'ları production sunucunuza ekleyin

## Sorun Giderme

- **"Firebase: Error (auth/configuration-not-found)"**: Environment variables'ların doğru tanımlandığından emin olun
- **"Permission denied"**: Firestore ve Storage kurallarını kontrol edin
- **"Network error"**: Firebase projesinin aktif olduğundan emin olun

