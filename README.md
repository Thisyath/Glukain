# Glukain - AI Pemantau Mandiri Pasien Diabetes

Aplikasi web pendamping untuk pasien diabetes yang sudah didiagnosis dokter. Pasien mengunggah foto/PDF hasil pemeriksaan, sistem membaca nilai medis lewat OCR, menentukan fase kondisi (rule-based), lalu menyusun rekomendasi diet, aktivitas, dan jadwal obat.

**Disclaimer:** Glukain bukan pengganti saran dokter.

---

## Tech Stack

| Lapisan | Teknologi |
|---|---|
| Frontend | React + TypeScript + Vite + Tailwind CSS |
| Backend | Node.js + Express + TypeScript |
| Database | MySQL 8 + Prisma ORM |
| Auth | JWT + Argon2id + Refresh Token Rotation |
| AI | API AI free tier (Gemini) - siap diganti |

---

## Progress 30% (8 Use Case Esensial)

| # | Use Case | Status | Layar |
|---|---|---|---|
| 1 | UC-01: Register | Selesai | S-02 |
| 2 | UC-18: Verify Email | Selesai | S-03 |
| 3 | UC-02: Login | Selesai | S-04 |
| 4 | UC-19: Forgot Password | Selesai | S-05 |
| 5 | UC-04: Upload Document | Selesai | S-07 |
| 6 | UC-05: Extract Medical Data | Selesai | S-08 |
| 7 | UC-20: Confirm Extraction | Selesai | S-09 |
| 8 | UC-06: Classify Phase | Selesai | S-09 |
| 9 | UC-08: Dashboard | Selesai | S-06 |

---

## Struktur Proyek

```
glukain/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   ├── src/
│   │   ├── config/        (env.ts, thresholds.ts)
│   │   ├── routes/        (auth, documents, dashboard)
│   │   ├── services/      (auth, extraction, classification, dashboard)
│   │   ├── middlewares/   (authJwt, rateLimit, validate)
│   │   ├── utils/         (jwt, time)
│   │   ├── app.ts
│   │   └── server.ts
│   ├── uploads/
│   └── tests/
├── frontend/
│   └── src/
│       ├── pages/         (9 halaman)
│       ├── components/    (Layout, Header, BottomNav)
│       ├── api/           (client, auth, documents, dashboard)
│       └── styles/
└── docs/
    ├── PRD_Glukain_All.md
    └── PRD_Glukain_Figma.md
```

---

## Cara Menjalankan

### 1. Setup Database
Pastikan MySQL 8 sudah berjalan, lalu buat database:
```sql
CREATE DATABASE glukain;
```

### 2. Backend
```bash
cd backend
cp .env.example .env
# Edit .env dengan kredensial MySQL dan API key AI
npm install
npx prisma migrate dev
npx prisma db seed
npm run dev
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```

### 4. Akses
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001/api/v1

---

## API Endpoints

### Auth
| Method | Path | Deskripsi |
|---|---|---|
| POST | /api/v1/auth/register | UC-01: Daftar akun |
| POST | /api/v1/auth/verify-email | UC-18: Verifikasi email |
| POST | /api/v1/auth/login | UC-02: Login |
| POST | /api/v1/auth/logout | UC-03: Logout |
| POST | /api/v1/auth/refresh | UC-22: Refresh token |
| POST | /api/v1/auth/forgot-password | UC-19: Lupa password |
| POST | /api/v1/auth/reset-password | UC-19: Reset password |

### Documents & Extraction
| Method | Path | Deskripsi |
|---|---|---|
| POST | /api/v1/documents | UC-04: Upload dokumen |
| GET | /api/v1/documents | Daftar dokumen |
| GET | /api/v1/documents/:id | Detail + hasil ekstraksi |
| PUT | /api/v1/documents/:id/extraction | UC-20: Konfirmasi hasil |
| POST | /api/v1/documents/:id/retry | Ulangi ekstraksi |

### Dashboard
| Method | Path | Deskripsi |
|---|---|---|
| GET | /api/v1/dashboard | UC-08: Dashboard |
| GET | /api/v1/recommendations/latest | UC-09: Rekomendasi |
| GET | /api/v1/alerts/active | UC-10: Alert aktif |
| GET | /api/v1/history | UC-15: Riwayat |

---

## Klasifikasi Fase (Rule-based)

| Fase | Kriteria |
|---|---|
| Terkontrol Baik | HbA1c < 7,0% |
| Perlu Perhatian | HbA1c 7,0 - 8,9% |
| Berisiko Tinggi | HbA1c >= 9,0% atau gula darah ekstrem |
| Belum Dapat Ditentukan | Data tidak lengkap |

---

## Keamanan

- Password: Argon2id
- Access token: JWT 15 menit
- Refresh token: 7 hari, rotasi + HttpOnly cookie
- Rate limit login: 5 gagal / 15 menit
- IDOR protection: semua query filter by user_id
- File: validasi MIME + magic bytes, maks 10 MB
