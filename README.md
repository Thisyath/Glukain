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
