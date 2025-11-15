# Firestore Index Yapılandırma Kılavuzu

Profil sayfasında "server data load error" veya "the query requires an index" hatası alıyorsanız, Firestore'da composite index oluşturmanız gerekiyor.

## Hızlı Çözüm

Firebase Console'da hata mesajında görünen linke tıklayarak index'i otomatik oluşturabilirsiniz.

## Manuel Index Oluşturma

### 1. Firebase Console'a Gidin

1. [Firebase Console](https://console.firebase.google.com/)'a gidin
2. Projenizi seçin
3. **Firestore Database** > **Indexes** sekmesine gidin

### 2. Gerekli Index'ler

Aşağıdaki index'leri oluşturun:

#### Index 1: CV Analysis Results
- **Collection ID**: `cvAnalysisResults`
- **Fields to index**:
  - `userId` (Ascending)
  - `analysisDate` (Descending)
- **Query scope**: Collection

#### Index 2: Interview Results
- **Collection ID**: `interviewResults`
- **Fields to index**:
  - `userId` (Ascending)
  - `interviewDate` (Descending)
- **Query scope**: Collection

### 3. Index Oluşturma Adımları

1. **Indexes** sayfasında **Create Index** butonuna tıklayın
2. **Collection ID**'yi girin (örn: `cvAnalysisResults`)
3. **Fields** bölümünde:
   - İlk field: `userId`, Type: **Ascending**
   - İkinci field: `analysisDate` (veya `interviewDate`), Type: **Descending**
4. **Create** butonuna tıklayın
5. Index'in oluşturulması birkaç dakika sürebilir

### 4. Index Durumunu Kontrol Edin

- Index'ler **Building** durumunda olabilir (birkaç dakika sürebilir)
- **Enabled** durumuna geçtiğinde kullanıma hazırdır

## Alternatif: Hata Mesajındaki Linki Kullanma

Firebase hatası aldığınızda, hata mesajında genellikle şöyle bir link görünür:
```
https://console.firebase.google.com/project/YOUR_PROJECT/firestore/indexes?create_composite=...
```

Bu linke tıklayarak index'i otomatik oluşturabilirsiniz.

## Notlar

- Index'ler oluşturulurken sorgular çalışmayabilir
- Index oluşturma işlemi genellikle 1-5 dakika sürer
- Index'ler oluşturulduktan sonra profil sayfası normal çalışacaktır

## Sorun Giderme

### Index oluşturuldu ama hala hata alıyorum
- Index'in **Enabled** durumunda olduğundan emin olun
- Uygulamayı yeniden başlatın
- Firebase Console'da index durumunu kontrol edin

### Hangi index'lerin gerekli olduğunu nasıl öğrenirim?
- Firebase Console'da hata mesajındaki linke tıklayın
- Veya Firestore > Indexes > **Missing Indexes** sekmesine bakın

