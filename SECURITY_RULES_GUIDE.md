# 🔒 Firebase Güvenlik Kuralları Rehberi

Bu proje için kapsamlı Firestore ve Storage güvenlik kuralları hazırlanmıştır.

## 📋 İçindekiler

- [Firestore Rules](#firestore-rules) - Veritabanı güvenlik kuralları
- [Storage Rules](#storage-rules) - Dosya depolama güvenlik kuralları
- [Deployment](#deployment) - Kuralları Firebase'e yükleme
- [Güvenlik Özellikleri](#güvenlik-özellikleri)

---

## 🗄️ Firestore Rules

### Kapsanan Collection'lar

#### 1. **Kullanıcı Yönetimi**
```
✅ userProfiles    - Kullanıcı profil bilgileri
✅ userStats       - İstatistikler ve leaderboard (public read)
✅ users           - Basit kullanıcı kayıtları
```

#### 2. **CV Analiz Sistemi**
```
🔒 cvAnalyses        - CV analiz verileri (private)
🔒 cvAnalysisResults - Detaylı analiz sonuçları (private)
```
- **Güvenlik:** Sadece kendi CV'lerinizi görebilirsiniz
- **Validasyon:** Skorlar 0-100 arası olmalı
- **Zorunlu Alanlar:** userId, fileName, analysisDate

#### 3. **Mülakat Sistemi**
```
🔒 interviewResults - Mülakat performans verileri (private)
🔒 interviewVideos  - Video metadata (private)
```
- **Güvenlik:** Sadece kendi mülakat sonuçlarınızı görebilirsiniz
- **Validasyon:** Tüm skorlar 0-100 arası
- **Özel:** Video duration bilgisi zorunlu

#### 4. **Topluluk Sistemi**
```
👥 posts        - Topluluk gönderileri (public read, auth write)
💬 replies      - Gönderilere yanıtlar
❤️  likes       - Beğeniler
🔖 bookmarks    - Kaydedilen gönderiler (private)
```
- **Güvenlik:** 
  - Herkes okuyabilir
  - Sadece giriş yapmışlar paylaşabilir
  - Sadece kendi içeriğini silebilir
- **Validasyon:** 
  - İçerik boş olamaz
  - Maksimum 5000 karakter
  - Tag zorunlu

#### 5. **Bildirimler**
```
🔔 notifications - Kullanıcı bildirimleri (private)
```
- **Güvenlik:** Sadece kendi bildirimlerinizi görebilirsiniz
- **Güncelleme:** Sadece 'read' durumu değiştirilebilir

#### 6. **Admin & Sistem**
```
⚙️  systemSettings - Sistem ayarları (read only)
📱 appVersion      - Versiyon kontrolü (public read)
📊 reports         - Kötüye kullanım raporları
🔧 adminLogs       - Admin logları (disabled)
```

---

## 📦 Storage Rules

### Kapsanan Klasörler

#### 1. **CV Dosyaları**
```
📄 /cv-files/{userId}/{fileName}
```
- **Format:** Sadece PDF
- **Boyut:** Maksimum 10MB
- **Güvenlik:** Sadece sahibi okuyup yazabilir

#### 2. **Mülakat Videoları**
```
🎥 /interview-videos/{userId}/{videoId}
```
- **Format:** mp4, webm, quicktime, avi
- **Boyut:** Maksimum 100MB
- **Güvenlik:** Sadece sahibi okuyup yazabilir
- **Chunk Upload:** Büyük dosyalar için parçalı upload desteği

#### 3. **Profil Resimleri**
```
👤 /profile-pictures/{userId}/{fileName}
```
- **Format:** jpg, jpeg, png, gif, webp
- **Boyut:** Maksimum 5MB
- **Güvenlik:** Herkes okuyabilir, sadece sahibi değiştirebilir

#### 4. **Topluluk Görselleri**
```
🖼️  /post-images/{userId}/{postId}/{fileName}
```
- **Format:** jpg, jpeg, png, gif, webp
- **Boyut:** Maksimum 5MB
- **Güvenlik:** Herkes okuyabilir, sadece sahibi yükleyebilir

#### 5. **Geçici Dosyalar**
```
⏳ /temp/{userId}/{fileName}
```
- **Boyut:** Maksimum 20MB
- **Güvenlik:** Sadece sahibi erişebilir
- **Kullanım:** Upload önizleme, geçici işlemler

#### 6. **Public Assets**
```
🌐 /public/{fileName}
```
- **Güvenlik:** Herkes okuyabilir
- **Yönetim:** Sadece Firebase Console'dan

---

## 🚀 Deployment

### Yöntem 1: Firebase Console (Manuel - Önerilen)

#### Firestore Rules

1. **Firebase Console'a gidin:**
   ```
   https://console.firebase.google.com/project/carivio-88178/firestore/rules
   ```

2. **firestore.rules dosyasının içeriğini kopyalayın**

3. **Rules editörüne yapıştırın**

4. **"Publish" butonuna tıklayın** ✅

5. **Başarı mesajını bekleyin** (2-5 saniye)

#### Storage Rules

1. **Firebase Console'a gidin:**
   ```
   https://console.firebase.google.com/project/carivio-88178/storage/rules
   ```

2. **storage.rules dosyasının içeriğini kopyalayın**

3. **Rules editörüne yapıştırın**

4. **"Publish" butonuna tıklayın** ✅

---

### Yöntem 2: Firebase CLI (Otomatik - Hızlı)

```bash
# Proje dizinine gidin
cd /Users/nurullah/Desktop/Carivio

# Firebase CLI'yi yükleyin (eğer yoksa)
npm install -g firebase-tools

# Firebase'e giriş yapın
firebase login

# Projeyi seçin
firebase use carivio-88178

# SADECE Firestore rules deploy et
firebase deploy --only firestore:rules

# SADECE Storage rules deploy et
firebase deploy --only storage:rules

# HER İKİSİNİ BIRDEN deploy et
firebase deploy --only firestore:rules,storage:rules
```

#### firebase.json Oluşturma

Eğer `firebase.json` dosyanız yoksa oluşturun:

```bash
firebase init
```

Veya manuel oluşturun:

```json
{
  "firestore": {
    "rules": "firestore.rules"
  },
  "storage": {
    "rules": "storage.rules"
  }
}
```

---

## 🛡️ Güvenlik Özellikleri

### ✅ Yapılanlar

```typescript
✅ Kullanıcı Kimlik Doğrulama
   - Tüm işlemler için giriş zorunlu
   - userId doğrulaması

✅ Veri Sahipliği Kontrolü
   - Sadece kendi verilerine erişim
   - CV, mülakat sonuçları private

✅ Veri Validasyonu
   - Zorunlu alanlar kontrolü
   - Skor limitleri (0-100)
   - Dosya boyutu limitleri
   - Dosya tipi kontrolü

✅ İçerik Güvenliği
   - Maksimum karakter limiti (5000)
   - Boş içerik engelleme
   - SQL injection koruması

✅ Topluluk Moderasyonu
   - Rapor sistemi altyapısı
   - İçerik silme yetkileri
   - Spam önleme (rate limiting hazır)

✅ Leaderboard
   - Public read (herkes görebilir)
   - Negatif skor önleme
   - Skor manipülasyon koruması
```

### ⚠️ Önemli Notlar

```bash
⚠️  Admin Panel
   - adminLogs disabled (henüz yok)
   - Admin yetkileri eklenecek

⚠️  Rate Limiting
   - Helper fonksiyon hazır
   - Henüz aktif değil
   - İleride eklenebilir

⚠️  Email Verification
   - Helper fonksiyon hazır
   - İsteğe bağlı aktif edilebilir
```

---

## 🧪 Test Etme

### Deployment Sonrası Kontrol Listesi

```bash
✅ Profil düzenleme çalışıyor mu?
✅ CV upload edebiliyor musunuz?
✅ CV analiz sonuçları kaydediliyor mu?
✅ Başka birinin CV'sini göremediğinizi test edin
✅ Mülakat kaydı oluşturabiliyor musunuz?
✅ Topluluk'ta gönderi paylaşabiliyor musunuz?
✅ Beğeni/Kaydetme çalışıyor mu?
✅ Leaderboard görüntüleniyor mu?
✅ Başka birinin mülakat sonuçlarını göremediğinizi test edin
```

### Hata Ayıklama

Firebase Console'dan gerçek zamanlı hataları görebilirsiniz:

```
https://console.firebase.google.com/project/carivio-88178/firestore/usage
```

---

## 📊 Collection Şeması Örnekleri

### userStats
```javascript
{
  userId: "abc123",
  totalScore: 850,
  currentRank: 12,
  cvScore: 85,
  interviewScore: 90,
  tag: "ENGINEERING",
  displayName: "Ahmet Yılmaz",
  photoURL: "...",
  badge: "Gold Member",
  level: "Advanced",
  completedAnalyses: 5,
  completedInterviews: 3,
  // ... diğer alanlar
}
```

### posts
```javascript
{
  userId: "abc123",
  userDisplayName: "Ahmet Yılmaz",
  userPhotoURL: "...",
  userTag: "ENGINEERING",
  content: "Mühendislik hakkında düşünceler...",
  createdAt: Timestamp,
  likeCount: 42,
  replyCount: 8
}
```

### cvAnalysisResults
```javascript
{
  userId: "abc123",
  fileName: "cv_ahmet.pdf",
  overallScore: 85,
  sections: {
    personalInfo: { score: 90, status: "good", feedback: "..." },
    experience: { score: 85, status: "good", feedback: "..." },
    // ...
  },
  recommendations: ["...", "..."],
  analysisDate: Timestamp
}
```

---

## 🔄 Güncelleme

Rules'ları güncellemek için:

1. `firestore.rules` veya `storage.rules` dosyasını düzenleyin
2. Deployment komutunu çalıştırın veya Console'dan yayınlayın
3. Test edin

**Not:** Rules değişiklikleri anında aktif olur, uygulama yeniden başlatmaya gerek yoktur.

---

## 📞 Destek

Sorun yaşarsanız:

1. Firebase Console → Rules sekmesinde sözdizimi hatalarını kontrol edin
2. Chrome DevTools → Console'da detaylı hata mesajlarına bakın
3. Test kullanıcısıyla tüm özellikleri test edin

---

## 📝 Versiyon

- **Rules Version:** 2
- **Son Güncelleme:** 2025-10-30
- **Firebase Project:** carivio-88178

---

## 🎯 Production Checklist

Production'a geçmeden önce:

```bash
✅ Tüm rules deploy edildi
✅ Test kullanıcısıyla tüm özellikler test edildi
✅ Güvenlik açıkları kontrol edildi
✅ Dosya boyutu limitleri uygun
✅ Public/Private erişimler doğru ayarlandı
✅ Leaderboard çalışıyor
✅ Topluluk özellikleri çalışıyor
✅ CV upload ve analiz çalışıyor
✅ Mülakat sistemi çalışıyor
```

---

**🎉 Başarılar! Projeniz artık production-ready güvenlik kurallarına sahip.**

