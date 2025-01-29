# BerBer App 💈

BerBer App, bərbərxanalar üçün nəzərdə tutulmuş müasir idarəetmə sistemidir.

## Layihə Haqqında 📋

Bu layihə dörd əsas komponentdən ibarətdir:

1. **Admin Panel** - Bərbərxanaların idarə edilməsi üçün veb interfeys

   - Bərbərxanaların əlavə edilməsi və idarə edilməsi
   - İstifadəçilərin idarə edilməsi
   - Axtarış və filtrasiya
   - Real vaxt statistikası

2. **Biznes Paneli** - Bərbərxana sahibləri üçün xüsusi panel

   - QR kod skaneri
   - Müştəri qeydiyyatı
   - Xidmət statistikası
   - PWA dəstəyi

3. **Mobil Tətbiq** - Müştərilər üçün mobil tətbiq

   - QR kod göstərmə
   - Xidmət tarixçəsi
   - Bildirişlər

4. **Server** - Backend API və verilənlər bazası
   - REST API
   - Real vaxt yeniləmələri (WebSocket)
   - MongoDB verilənlər bazası

## Texnologiyalar 🛠

- **Frontend**: React, Vite, Material-UI
- **Backend**: Node.js, Express, MongoDB
- **Real-vaxt**: Socket.IO
- **Əlavə**: QR kod emalı, PWA

## Quraşdırma Təlimatları 📥

### Admin Panel

```bash
cd AdminPanel
npm install
npm run dev
```

### Biznes Paneli

```bash
cd PanelForBuisness
npm install
npm run dev
```

### Server

```bash
cd server
npm install
npm start
```

### Mobil Tətbiq

```bash
cd mobile
npm install
npm start
```

## Ətraf Mühit Dəyişənləri 🔐

Hər bir komponent üçün `.env` faylı yaradın:

### Admin Panel

```env
VITE_API_URL=http://localhost:3000
```

### Biznes Paneli

```env
VITE_API_URL=http://localhost:3000
```

### Server

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/berber
JWT_SECRET=your_jwt_secret
```

## Əsas Xüsusiyyətlər ⭐

- 🏪 Çoxsaylı bərbərxanaların idarə edilməsi
- 👥 İstifadəçi və müştəri idarəetməsi
- 📊 Detallı statistika və hesabatlar
- 📱 PWA dəstəyi
- 🔄 Real vaxt yeniləmələri
- 🔒 Təhlükəsiz autentifikasiya

## Lisenziya 📄

Bu layihə MIT lisenziyası altında lisenziyalaşdırılıb.

## Əlaqə 📞

Suallarınız və ya təklifləriniz üçün bizimlə əlaqə saxlaya bilərsiniz.
