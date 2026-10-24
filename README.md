# Glukain — AI Pemantau Mandiri Pasien Diabetes

## Latar Belakang

Pasien diabetes yang sudah didiagnosis dokter umumnya menjalani pemeriksaan berkala (HbA1c, gula darah, profil lipid, tekanan darah). Hasilnya sering hanya diterima sebagai **foto atau PDF lembar laboratorium** berisi deretan angka, tanpa penjelasan apakah kondisi sedang membaik, memburuk, atau perlu perhatian lebih lanjut. Akibatnya pasien sulit menjawab tiga pertanyaan sederhana: *seberapa baik kondisiku sekarang, apa yang berubah sejak pemeriksaan terakhir, dan apa yang harus kulakukan berikutnya.*

**Glukain** adalah aplikasi web pendamping yang dirancang untuk menjembatani kesenjangan itu. Alurnya:

1. Pasien **mengunggah** foto atau PDF hasil pemeriksaan lab.
2. Sistem **membaca nilai medis** dari dokumen tersebut (OCR).
3. Pasien **memeriksa dan mengoreksi** hasil bacaan sebelum disimpan, agar data yang masuk tetap berada di bawah kendalinya.
4. Sistem **menentukan fase kondisi** (TerKontrol / Perlu Perhatian / Berisiko Tinggi / Belum Dapat Ditentukan) memakai aturan berbasis ambang batas.
5. Sistem **menyusun rekomendasi** diet, aktivitas, dan catatan obat sesuai fase tersebut, lalu menampilkannya di dasbor.

Tujuan Glukain adalah membantu pasien memahami tren kondisinya sendiri dan mendorong kepatuhan pada anjuran dokter — bukan menggantikan peran tenaga medis.

### Batasan

- **Glukain bukan pengganti saran dokter** dan bukan alat diagnosis. Sistem tidak menegakkan diagnosis dan tidak meresepkan obat.
- Fase kondisi ditentukan oleh **aturan berbasis ambang batas (rule-based)**, bukan model prediktif. Sistem ini juga tidak memprediksi risiko diabetes.
- Ambang batas yang dipakai adalah usulan awal dan masih perlu divalidasi dengan sumber medis.
- Saat ini pembacaan dokumen (OCR) berjalan dalam **mode mock** dengan hasil contoh yang tetap, sampai API AI tersedia.

---

## Tech Stack

| Lapisan | Teknologi |
|---|---|
| Frontend | React 18, TypeScript, Vite 5, Tailwind CSS 3 |
| Routing & data | React Router 6, TanStack Query, Axios |
| Form & validasi | React Hook Form, Zod |
| Grafik | Recharts |
| Backend | Node.js, Express 4, TypeScript, `tsx` |
| Database | MySQL 8, Prisma ORM 5 |
| Autentikasi | JWT, Argon2id |
| Keamanan | Helmet, CORS, express-rate-limit |
| Email | Nodemailer |
| OCR / AI | Gemini API (rencana) |
| Unggahan berkas | Multer |

---

## Struktur Folder

```
Glukain/
├── backend/
│   ├── prisma/
│   │   ├── migrations/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   ├── src/
│   │   ├── config/
│   │   │   ├── env.ts
│   │   │   └── thresholds.ts
│   │   ├── lib/
│   │   │   └── prisma.ts
│   │   ├── middlewares/
│   │   │   ├── authJwt.ts
│   │   │   ├── rateLimit.ts
│   │   │   └── validate.ts
│   │   ├── routes/
│   │   │   ├── auth.routes.ts
│   │   │   ├── dashboard.routes.ts
│   │   │   └── documents.routes.ts
│   │   ├── services/
│   │   │   ├── auth.service.ts
│   │   │   ├── classification.service.ts
│   │   │   ├── dashboard.service.ts
│   │   │   └── extraction.service.ts
│   │   ├── utils/
│   │   │   ├── jwt.ts
│   │   │   └── time.ts
│   │   ├── app.ts
│   │   └── server.ts
│   ├── uploads/
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── auth.ts
│   │   │   ├── client.ts
│   │   │   ├── dashboard.ts
│   │   │   └── documents.ts
│   │   ├── components/
│   │   │   ├── assets/
│   │   │   │   └── BrandMark.tsx
│   │   │   ├── auth/
│   │   │   │   ├── AuthLayout.tsx
│   │   │   │   ├── BrandStory.tsx
│   │   │   │   ├── FormHeading.tsx
│   │   │   │   ├── Notice.tsx
│   │   │   │   └── TextField.tsx
│   │   │   ├── BottomNav.tsx
│   │   │   ├── Button.tsx
│   │   │   ├── InfoAlert.tsx
│   │   │   ├── Layout.tsx
│   │   │   ├── MedicalDisclaimer.tsx
│   │   │   ├── NavigationSidebar.tsx
│   │   │   ├── PageHeading.tsx
│   │   │   ├── WebHeader.tsx
│   │   │   └── icons.tsx
│   │   ├── lib/
│   │   │   └── format.ts
│   │   ├── pages/
│   │   │   ├── ComingSoonPage.tsx
│   │   │   ├── ConfirmExtractionPage.tsx
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── ForgotPasswordPage.tsx
│   │   │   ├── LandingPage.tsx
│   │   │   ├── LoginPage.tsx
│   │   │   ├── ProcessingPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   ├── ResetPasswordPage.tsx
│   │   │   ├── UploadDocumentPage.tsx
│   │   │   └── VerifyEmailPage.tsx
│   │   ├── styles/
│   │   │   └── index.css
│   │   ├── App.tsx
│   │   ├── design-tokens.tokens.json
│   │   ├── main.tsx
│   │   └── navigation.ts
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.ts
│   └── package.json
├── .gitignore
└── README.md
```

---

## Endpoint API

### Konvensi umum

| Aspek | Ketentuan |
|---|---|
| Base URL (lokal) | `http://localhost:3001` |
| Prefiks API | `/api/v1` |
| Format bodi | JSON (`application/json`), kecuali unggah berkas (`multipart/form-data`) |
| Autentikasi | Header `Authorization: Bearer <accessToken>` |
| Format sukses | `{ "data": … }` |
| Format gagal | `{ "error": { "code": "…", "message": "…" } }` |
| Bahasa pesan | Indonesia (siap ditampilkan ke pengguna) |
| Kode status | `200` sukses, `201` dibuat, `202` diproses, `204` tanpa isi, `4xx` gagal, `500` kesalahan server |

Pengguna hanya bisa mengakses datanya sendiri. Percobaan membuka data milik akun lain dijawab **`404`**, bukan `403`.

### Pemeriksaan kesehatan

| Method | Path | Auth | Keterangan |
|---|---|---|---|
| `GET` | `/health` | — | Status server dan database |

### Autentikasi — `/api/v1/auth`

| Method | Path | Auth | Keterangan |
|---|---|---|---|
| `POST` | `/register` | — | Daftar akun baru |
| `POST` | `/verify-email` | — | Verifikasi email dengan token |
| `POST` | `/resend-verification` | — | Kirim ulang tautan verifikasi |
| `POST` | `/login` | — | Masuk, mengembalikan access token + cookie refresh |
| `POST` | `/refresh` | Cookie | Perpanjang access token |
| `POST` | `/logout` | Cookie | Keluar dan mencabut refresh token |
| `POST` | `/forgot-password` | — | Minta tautan reset password |
| `POST` | `/reset-password` | — | Simpan password baru memakai token reset |

### Dokumen — `/api/v1/documents` (butuh login)

| Method | Path | Keterangan |
|---|---|---|
| `POST` | `/` | Unggah berkas hasil lab (`multipart/form-data`, field `file`, opsional `checkupDate`) |
| `GET` | `/?page=1&limit=10` | Daftar dokumen milik pengguna |
| `GET` | `/:id` | Detail dokumen + hasil ekstraksi |
| `GET` | `/:id/file` | Berkas asli untuk pratinjau |
| `PUT` | `/:id/extraction` | Konfirmasi/koreksi nilai → klasifikasi fase + rekomendasi |
| `POST` | `/:id/retry` | Ulangi ekstraksi |

### Dasbor dan laporan — `/api/v1` (butuh login)

| Method | Path | Keterangan |
|---|---|---|
| `GET` | `/dashboard` | Ringkasan fase terbaru, grafik, alert, obat hari ini |
| `GET` | `/recommendations/latest` | Rekomendasi terbaru |
| `GET` | `/alerts/active` | Alert aktif (atau `null`) |
| `GET` | `/history?range=3m\|6m\|1y\|all` | Riwayat pemeriksaan dan tren |

### Kode error

| Kode | HTTP | Arti |
|---|---|---|
| `VALIDATION_ERROR` | 400 | Data tidak lolos validasi (disertai `details` per field) |
| `INVALID_TOKEN` | 400 | Token verifikasi/reset tidak valid atau sudah dipakai |
| `TOKEN_EXPIRED` | 400 / 401 | Token email kedaluwarsa (400) atau access token kedaluwarsa (401) |
| `INVALID_CREDENTIALS` | 401 | Email atau password salah |
| `UNAUTHORIZED` | 401 | Header token tidak ada / tidak valid |
| `EMAIL_NOT_VERIFIED` | 403 | Email belum diverifikasi |
| `NOT_FOUND` | 404 | Data tidak ada, atau bukan milik pengguna |
| `FILE_MISSING` | 404 | Berkas tercatat di database tetapi hilang dari server |
| `EMAIL_EXISTS` | 409 | Email sudah terdaftar |
| `LIMIT_FILE_SIZE` | 413 | Berkas melebihi 10 MB |
| `UNSUPPORTED_MEDIA_TYPE` | 415 | Format berkas bukan JPG/PNG/PDF |
| `ACCOUNT_LOCKED` | 423 | Akun terkunci sementara (5 kali salah password) |
| `DAILY_QUOTA_EXCEEDED` | 429 | Kuota unggah harian (10/hari) habis |
| `RATE_LIMITED` | 429 | Terlalu banyak permintaan dari satu IP |
| `INTERNAL_ERROR` | 500 | Kesalahan tak terduga di server |

---

## Cara Menjalankan

Ada dua cara menjalankan Glukain: **tanpa Docker** (Node.js + MySQL lokal) atau **dengan Docker** (cukup Docker Desktop). Pilih salah satu — hasil akhirnya sama.

Karena proyek masih dalam pengembangan, dua hal sengaja berperilaku "sementara":

- **Email belum dikirim.** Tautan verifikasi dan reset password dicetak di **terminal tempat backend dijalankan**, bukan dikirim lewat email.
- **Pembacaan dokumen (OCR) masih mock.** Apa pun berkas yang diunggah, hasilnya selalu nilai contoh yang sama. Ini disengaja agar proyek bisa dijalankan **tanpa API key dan tanpa biaya**.

Keduanya dijelaskan lebih lanjut di [Catatan mode pengembangan](#catatan-mode-pengembangan).

## Opsi 1 — Tanpa Docker

### Prasyarat

| Kebutuhan | Versi |
|---|---|
| Node.js | ≥ 20 |
| MySQL | 8 (berjalan di `localhost:3306`) |
| npm | ikut Node.js |
| Git | untuk mengunduh repositori |

Tidak ada `package.json` di root — backend dan frontend adalah dua paket terpisah dan dijalankan di **dua terminal**.

### 1. Unduh repositori

```bash
git clone https://github.com/Thisyath/Glukain.git
cd Glukain
```

### 2. Siapkan database

Pastikan MySQL sudah berjalan, lalu buat database baru bernama `glukain`:

```sql
CREATE DATABASE glukain;
```

### 3. Jalankan backend

```bash
cd backend
npm install

# Salin contoh konfigurasi lalu isi. Di Windows: copy .env.example .env
cp .env.example .env
```

Isi `backend/.env` — **minimal dua baris ini**:

```env
DATABASE_URL="mysql://root:password@localhost:3306/glukain"
JWT_ACCESS_SECRET="ganti-dengan-string-acak-minimal-32-karakter"
```

> Ganti `root` dan `password` sesuai kredensial MySQL Anda. Kunci lain boleh dibiarkan kosong karena kode sudah punya nilai bawaan untuk pengembangan. **Pengecualiannya `DATABASE_URL`** — tanpa ini server tidak bisa hidup.

Lalu buat tabel dan data awal:

```bash
npm run prisma:generate   # membuat klien Prisma
npm run prisma:migrate    # membuat/memperbarui tabel di database
npm run prisma:seed       # mengisi 4 aturan rekomendasi (wajib, sekali saja)
npm run dev               # server jalan di http://localhost:3001
```

Cek cepat: buka `http://localhost:3001/health`, harusnya muncul `{"status":"ok","db":"up",...}`.

**Perhatikan terminal backend** saat menguji verifikasi email nanti — tautan verifikasi muncul di sana.

### 4. Jalankan frontend

Di terminal kedua:

```bash
cd frontend
npm install
npm run dev               # http://localhost:5173
```

Frontend otomatis meneruskan permintaan `/api` ke `http://localhost:3001` (lihat `vite.config.ts`), jadi tidak ada alamat backend yang perlu diubah di kode.

### 5. Cara memakai (alur demo)

1. Buka `http://localhost:5173` — tampil landing page.
2. Klik **Daftar**, isi formulir, lalu setujui persetujuan.
3. Buka **terminal backend**, salin tautan `[DEV] Verification link: …` ke browser → muncul "Email berhasil diverifikasi".
4. **Masuk** dengan email dan password tadi.
5. **Beranda** menampilkan keadaan kosong ("belum ada laporan kesehatan") — ini benar untuk akun baru.
6. Buka **Unggah**, pilih berkas JPG/PNG/PDF (maks. 10 MB), isi tanggal pemeriksaan bila perlu.
7. Halaman proses berjalan ± 3 detik, lalu berpindah ke halaman konfirmasi.
8. Di halaman konfirmasi: periksa nilai hasil bacaan — **sistolik ditandai keyakinan rendah (0,55)** — dan ubah satu nilai untuk memperlihatkan bahwa pasien bisa mengoreksi.
9. Klik **Konfirmasi** → muncul fase beserta rekomendasi diet, aktivitas, dan catatan obat.
10. Kembali ke **Beranda** → fase terbaru, grafik, dan ringkasan nilai sudah terisi.
11. Opsional: peragakan **Lupa password** — tautan `[DEV] Reset link: …` muncul di terminal.

## Opsi 2 — Dengan Docker

Cara ini paling mudah untuk teman yang ingin mencoba tanpa memasang Node.js atau MySQL.

### Prasyarat

| Kebutuhan | Versi |
|---|---|
| Docker Desktop | versi terbaru (Docker Compose sudah termasuk) |
| Git | untuk mengunduh repositori |

Pastikan **Docker Desktop sedang berjalan** sebelum menjalankan perintah.

### 1. Unduh repositori

```bash
git clone https://github.com/Thisyath/Glukain.git
cd Glukain
```

### 2. Buat `.env` di root

Buat file `.env` di folder root (sejajar dengan `docker-compose.yml`):

```env
MYSQL_ROOT_PASSWORD=ganti-dengan-password-kuat
JWT_ACCESS_SECRET=ganti-dengan-string-acak-minimal-32-karakter
```

> File ini sudah di-gitignore, jadi tidak ikut ter-commit. Kalau dilewati, Compose memakai nilai default yang lemah.

### 3. Jalankan

Dari folder root:

```bash
docker compose up --build -d
```

Build pertama kali bisa memakan **5–15 menit**. Pantau log backend:

```bash
docker compose logs -f backend
```

Tunggu sampai muncul:

```text
Server running on http://localhost:3001
```

Tekan `Ctrl+C` untuk berhenti melihat log — container tetap berjalan.

### 4. Isi aturan rekomendasi (sekali saja)

Migrasi tabel berjalan otomatis, tetapi **seeder tidak dijalankan otomatis** oleh container. Jalankan sekali:

```bash
docker compose exec backend npx prisma db seed
```

Tanpa langkah ini, fase tetap terdeteksi tetapi **rekomendasi akan kosong**.

### 5. Buka aplikasi

| Yang dibuka | Alamat |
|---|---|
| Aplikasi Glukain | `http://localhost:8080` |
| Cek backend | `http://localhost:3001/health` |

### 6. Cara memakai (alur demo)

1. Buka `http://localhost:8080` — tampil landing page.
2. Klik **Daftar**, isi formulir, lalu setujui persetujuan.
3. Lihat log backend untuk tautan verifikasi:
   ```bash
   docker compose logs -f backend
   ```
   Cari baris `[DEV] Verification link: http://localhost:8080/verify-email?token=…`, lalu buka tautannya.
4. **Masuk** dengan email dan password tadi.
5. Buka **Unggah**, unggah JPG/PNG/PDF (maks. 10 MB).
6. Tunggu ±3 detik → periksa/koreksi nilai → **Konfirmasi**.
7. Kembali ke **Beranda** → fase, grafik, dan ringkasan sudah terisi.

### Perintah harian

| Tujuan | Perintah |
|---|---|
| Nyalakan (latar belakang) | `docker compose up --build -d` |
| Lihat log backend | `docker compose logs -f backend` |
| Hentikan (data tetap) | `docker compose down` |
| Hentikan + hapus database | `docker compose down -v` |
| Masuk ke container backend | `docker compose exec backend sh` |
| Migrasi manual | `docker compose exec backend npx prisma migrate deploy` |
| Seed manual | `docker compose exec backend npx prisma db seed` |

### Catatan Docker

- File yang dipakai: `docker-compose.yml` (root), `backend/Dockerfile`, `backend/.dockerignore`, `frontend/Dockerfile`, `frontend/.dockerignore`, dan `frontend/nginx.conf`.
- Database disimpan di volume `db_data`; unggahan disimpan di `backend/uploads` (bind mount).
- `docker compose down -v` menghapus **database**, tetapi tidak menghapus `backend/uploads`.
- Frontend disajikan nginx dan meneruskan `/api` ke service `backend`, sehingga aplikasi dan API berada di origin yang sama dan cookie refresh tetap bekerja.
- Perubahan kode memerlukan build ulang: `docker compose up --build -d`.

## Catatan mode pengembangan

| Hal | Perilaku saat ini | Cara menggantinya |
|---|---|---|
| Verifikasi & reset email | Tautan dicetak di terminal backend (tanpa Docker) atau di log container `docker compose logs backend` (Docker) | Isi `SMTP_USER`/`SMTP_PASS`, lalu pakai `nodemailer` di `auth.service.ts` |
| Pembacaan dokumen (OCR) | Nilai contoh tetap (HbA1c 8,2% / gula puasa 156 mg/dL) | Isi `AI_API_KEY`, ganti `simulateExtraction()` di `extraction.service.ts` |
| Fitur Riwayat, Obat, Cek Makanan, Chatbot, Profil | Menu tampil, isi masih halaman "Segera hadir" | — |

Batasan yang perlu diingat saat mencoba berulang:

| Batas | Angka | Sifat |
|---|---|---|
| Kuota unggah | 10 dokumen/hari/akun | Tersimpan di database — restart server tidak mengembalikannya |
| Batas endpoint autentikasi | 20 percobaan/15 menit/IP | Di memori — hilang saat server di-restart |
| Kunci akun | 5 salah password → terkunci 15 menit | Tersimpan di database |

Untuk demo berulang, gunakan **akun berbeda** tiap sesi latihan, atau bersihkan data dokumen hari itu di database.

## Menguji tanpa tampilan

Semua endpoint bisa diuji langsung, misalnya dengan `curl` atau Postman:

```bash
# Status server
curl http://localhost:3001/health

# Daftar akun
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Budi\",\"email\":\"budi@example.com\",\"password\":\"rahasia123\",\"confirmPassword\":\"rahasia123\",\"consent\":true}"
```

Di Postman, `POST /auth/login` otomatis menyimpan cookie `refresh_token`, sehingga endpoint berbasis cookie (`/auth/refresh`, `/auth/logout`) bisa langsung dicoba.

---

## Video UTS

[![Video UTS](https://img.youtube.com/vi/oGasA37yE70/maxresdefault.jpg)](https://youtu.be/oGasA37yE70?si=z8bVJB3GrlIv9iQ8)
