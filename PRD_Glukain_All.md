# PRD Lengkap — Glukain: AI Pemantau Mandiri Pasien Diabetes

| | |
|---|---|
| **Dokumen** | Product Requirements Document (PRD) v2.0, dari kebutuhan hingga implementasi |
| **Metode** | Waterfall |
| **Platform** | Web responsif (mobile, tablet, desktop) |
| **Konteks** | Tugas besar pembelajaran, anggaran terbatas (stack serba gratis) |
| **Dokumen terkait** | SRS v1.0, SDD v1.0, PRD Desain Figma (`PRD_Glukain_Figma.md`) |

---

## 0. Kecocokan dengan PRD Desain Figma Sebelumnya

**Ya, cocok dan saling melengkapi.** Keduanya tidak bertabrakan:

| | PRD Figma (v1) | PRD Lengkap ini (v2) |
|---|---|---|
| Fokus | *Tampilan*: design system, 18 layar (S-01 s.d. S-18), state UI | *Produk + teknis*: aktor, use case, database, API, tahapan, tes |
| Dipakai oleh | Desainer / saat membuat Figma | Developer / saat coding, tes, dan laporan |
| Penghubung | ID layar `S-xx` | Setiap use case dan endpoint di dokumen ini merujuk ke `S-xx` |

Aturan yang dijaga agar tetap konsisten:
- Semua layar `S-xx` di PRD Figma punya endpoint pasangan (lihat **§6.3 Traceability Matrix**).
- Tambahan logika (L1–L22 di PRD Figma, mis. verifikasi email, konfirmasi hasil OCR, jadwal obat) sudah dijadikan use case resmi **UC-18 s.d. UC-25** di sini.
- Pergantian layanan OCR dari Google Cloud Vision ke API AI gratis **tidak mengubah desain UI sama sekali**.

---

## 1. Ringkasan Produk

Glukain membantu pasien diabetes yang **sudah didiagnosis dokter** memantau kondisinya secara mandiri:

1. Pasien mengunggah foto/PDF hasil pemeriksaan dokter.
2. AI membaca nilai medis (HbA1c, gula darah, lipid, tensi, berat badan).
3. **Pasien memeriksa/mengoreksi hasil bacaan** (kontrol kualitas).
4. Sistem menentukan fase kondisi (rule-based): *Terkontrol Baik / Perlu Perhatian / Berisiko Tinggi*.
5. Sistem menyusun rekomendasi diet, aktivitas, dan jadwal obat, serta alert bila berisiko tinggi.
6. Pasien mendapat pengingat minum obat, melihat tren antar-kontrol, bertanya ke chatbot, dan (premium) mengecek keamanan foto makanan.

**Bukan alat diagnosis.** Setiap hasil memuat disclaimer: *"Bukan pengganti saran dokter."*

### 1.1 Tujuan
| Tujuan | Ukuran keberhasilan |
|---|---|
| Mengurangi input manual | Pasien cukup unggah foto, nilai terisi otomatis |
| Respons cepat | OCR + klasifikasi < 10 detik, dashboard/hasil makanan < 7 detik |
| Aman | Auth JWT, data terisolasi per pasien, tidak ada IDOR |
| Layak sebagai tugas besar | Semua 25 use case terimplementasi dan lolos tes |

### 1.2 Di Dalam & Di Luar Ruang Lingkup
**Di dalam:** semua use case di §5.
**Di luar:** diagnosis awal diabetes, integrasi alat medis real-time, SMS/WhatsApp, aplikasi native, aktor Admin, pembayaran sungguhan (hanya Sandbox).

---

## 2. Metode Waterfall dan Tahapan Step by Step

Waterfall berjalan **berurutan**; satu tahap selesai dan disetujui sebelum tahap berikutnya.

```
[1 Analisis Kebutuhan] → [2 Perancangan] → [3 Implementasi] → [4 Pengujian] → [5 Deployment] → [6 Pemeliharaan]
        SRS ✅               SDD + Figma ✅        coding            testing         rilis demo      perbaikan
```

### 2.1 Status Saat Ini
| Tahap | Status | Keluaran |
|---|---|---|
| 1. Analisis kebutuhan | ✅ Selesai | SRS v1.0 |
| 2. Perancangan | ✅ Selesai | SDD v1.0, desain Figma, PRD Figma |
| 2b. Perancangan teknis (dokumen ini) | 🔄 Sekarang | PRD v2.0: database, API, stack |
| 3. Implementasi | ⏳ Berikutnya | Kode program |
| 4. Pengujian | ⏳ | Laporan tes |
| 5. Deployment | ⏳ | Aplikasi berjalan + demo |
| 6. Pemeliharaan | ⏳ | Daftar perbaikan |

> **Catatan Waterfall:** karena SRS/SDD sudah berstatus *approved*, perubahan (mis. penambahan UC-18 s.d. UC-25) harus dicatat sebagai **Change Request** dan dokumen direvisi menjadi **v1.1** (lihat §15). Ini justru nilai plus di laporan: menunjukkan proses pengendalian perubahan.

### 2.2 Rencana Tahapan Rinci (usulan 10 minggu, sesuaikan dengan tenggat)

| Minggu | Tahap | Langkah | Keluaran / Tanda selesai |
|---|---|---|---|
| 1 | 2b Perancangan teknis | 1. Finalisasi PRD ini · 2. Revisi SRS/SDD ke v1.1 (Change Request) · 3. Buat repo GitHub, aturan branch | PRD v2.0 disetujui, repo siap |
| 2 | 3 Implementasi — Fondasi | 1. Setup proyek backend (Express+TS+Prisma) dan frontend (Vite+React+TS+Tailwind) · 2. Buat database + migrasi semua tabel · 3. Setup variabel Figma → Tailwind theme · 4. Komponen dasar (Button, Input, Badge, Card) | `GET /health` jalan, migrasi sukses, komponen UI siap |
| 3 | 3 Implementasi — Auth | 1. Register, verifikasi email, login, refresh, logout, reset password (UC-01 s.d. 03, 18, 19) · 2. Middleware JWT, rate limit · 3. Halaman S-02 s.d. S-05 | Semua endpoint auth lulus tes Postman |
| 4 | 3 Implementasi — Dokumen & OCR | 1. Upload (multer) + validasi (UC-04) · 2. Ekstraksi AI (UC-05) · 3. Layar status & konfirmasi (S-07 s.d. S-09, UC-20) | Foto dokumen → nilai muncul & bisa dikoreksi |
| 5 | 3 Implementasi — Klasifikasi | 1. Fungsi klasifikasi fase (UC-06) · 2. Rekomendasi (UC-07) · 3. Alert risiko tinggi (UC-10) · 4. Unit test klasifikasi | Fase & rekomendasi benar untuk data uji |
| 6 | 3 Implementasi — Dashboard | 1. Dashboard (UC-08) · 2. Rekomendasi (UC-09) · 3. Riwayat & grafik (UC-15) · 4. Notifikasi (UC-23) | S-06, S-11, S-14, S-17 berfungsi |
| 7 | 3 Implementasi — Obat | 1. CRUD jadwal obat (UC-21) · 2. Cron pengingat (UC-13) · 3. Konfirmasi (UC-14) | Pengingat muncul tepat waktu |
| 8 | 3 Implementasi — Premium, Makanan, Chatbot | 1. Midtrans Sandbox + webhook (UC-11, UC-25) · 2. Analisis makanan (UC-12) · 3. Chatbot (UC-16, UC-17) · 4. Profil & hapus akun (UC-24) | Semua UC selesai |
| 9 | 4 Pengujian | 1. Integration test (Postman) · 2. Black-box test per UC · 3. Uji keamanan dasar · 4. Uji responsif HP/tablet · 5. UAT dengan 3–5 teman | Laporan pengujian, daftar bug |
| 10 | 5 Deployment + 6 Pemeliharaan | 1. Perbaiki bug · 2. Deploy/demo · 3. Dokumentasi akhir · 4. Presentasi | Aplikasi siap demo, laporan akhir |

**Kriteria lanjut antar-tahap (gate):**
- Tahap 3 → 4: seluruh UC terimplementasi, tidak ada bug *blocker*.
- Tahap 4 → 5: ≥ 90% test case lulus, bug *critical/high* = 0.

---

## 3. Aktor

| Aktor | Jenis | Peran | Berinteraksi lewat |
|---|---|---|---|
| **Pasien** | Utama (manusia) | Satu-satunya pengguna manusia. Semua fitur | Web (S-01 s.d. S-18) |
| **Sistem AI** | Internal | OCR/ekstraksi, klasifikasi, rekomendasi, alert, analisis makanan, chatbot | Layanan di backend |
| **Penjadwal (Scheduler)** | Internal | Memicu pengingat obat dan menandai pengingat terlewat | `node-cron` |
| **Payment Gateway (Midtrans)** | Eksternal | Memproses pembayaran premium dan mengirim webhook | Snap API + webhook |
| **Layanan Email** | Eksternal | Mengirim email verifikasi & reset password | SMTP (Nodemailer) |
| **Layanan AI Pihak Ketiga** | Eksternal | Penyedia OCR/LLM yang dipanggil Sistem AI | REST API |

> Tidak ada aktor Admin (sesuai SRS poin batasan 5).

---

## 4. Aturan Bisnis

### 4.1 Klasifikasi Fase (UC-06)
Rule-based, **ambang batas disimpan di file konfigurasi** (`config/thresholds.ts`), bukan hardcode di logika. Nilai di bawah adalah **usulan awal, wajib divalidasi dengan sumber medis/dosen**.

| Fase | Kriteria usulan |
|---|---|
| Terkontrol Baik | HbA1c < 7,0 % |
| Perlu Perhatian | HbA1c 7,0 – 8,9 % |
| Berisiko Tinggi | HbA1c ≥ 9,0 % **atau** gula darah puasa ≥ 250 / sewaktu ≥ 300 mg/dL **atau** tensi ≥ 180/120 mmHg |
| Belum Dapat Ditentukan | HbA1c tidak terbaca |

Aturan: fase = **yang terburuk** dari semua indikator yang tersedia. Alasan penentuan (nilai mana yang memicu) disimpan di kolom `reason` agar dapat ditelusuri.

### 4.2 Aturan Lain
| Kode | Aturan |
|---|---|
| BR-01 | Dokumen baru **tidak menimpa** data lama; selalu jadi riwayat baru (FR-08) |
| BR-02 | Klasifikasi baru berjalan **setelah pasien menyimpan hasil konfirmasi** (UC-20), bukan langsung setelah OCR |
| BR-03 | Alert Berisiko Tinggi tetap tampil di dashboard sampai ada pemeriksaan terbaru dengan fase bukan Berisiko Tinggi |
| BR-04 | Tren riwayat butuh ≥ 2 pemeriksaan terkonfirmasi (UC-15) |
| BR-05 | Pengingat obat hanya in-app. Jendela konfirmasi 60 menit, lewat itu status `MISSED` ("Belum Dikonfirmasi") |
| BR-06 | Fitur makanan hanya bila langganan `ACTIVE` dan `active_until` belum lewat. Premium hanya diaktifkan oleh **webhook** valid |
| BR-07 | Verdict makanan: `RISKY` bila estimasi gula > 15 g atau karbohidrat > 45 g per porsi (konfigurasi), `UNRECOGNIZED` bila AI tidak yakin |
| BR-08 | Chatbot hanya menjawab seputar diabetes. Tidak memberi saran dosis/mengubah obat. Selalu mengarahkan ke dokter untuk hal tersebut |
| BR-09 | Batas pemakaian (hemat biaya API): 10 unggah dokumen/hari, 10 analisis makanan/hari, 30 pesan chatbot/hari per pasien |
| BR-10 | Waktu disimpan dalam **UTC**, ditampilkan sesuai zona waktu pasien (default `Asia/Jakarta`) |

---

## 5. Use Case

### 5.1 Daftar Use Case

**UC-01 s.d. UC-17 berasal dari SRS. UC-18 s.d. UC-25 adalah tambahan (Change Request).**

| ID | Nama | Aktor | Layar | Sumber |
|---|---|---|---|---|
| UC-01 | Mendaftar Akun | Pasien, Layanan Email | S-02 | SRS |
| UC-02 | Melakukan Login | Pasien | S-04 | SRS |
| UC-03 | Melakukan Logout | Pasien | S-18 | SRS |
| UC-04 | Mengunggah Dokumen Dokter | Pasien | S-07 | SRS |
| UC-05 | Mengekstrak Data Medis *(sebelumnya "Fase Kondisi")* | Sistem AI | S-08 | SRS |
| UC-06 | Mengklasifikasikan Fase Kondisi | Sistem AI | S-09 | SRS |
| UC-07 | Menghasilkan Rekomendasi Gaya Hidup | Sistem AI | — | SRS |
| UC-08 | Menampilkan Dashboard Kesehatan | Pasien | S-06 | SRS |
| UC-09 | Menampilkan Rekomendasi Gaya Hidup | Pasien | S-11 | SRS |
| UC-10 | Mendeteksi Kondisi Berisiko Tinggi | Sistem AI | S-10 | SRS |
| UC-11 | Mengunggah Foto Makanan (Premium) | Pasien, Payment Gateway | S-15 | SRS |
| UC-12 | Menganalisis Keamanan Foto Makanan | Sistem AI | S-15 | SRS |
| UC-13 | Mengirim Pengingat Minum Obat | Scheduler, Sistem AI | S-12 | SRS |
| UC-14 | Mengonfirmasi Minum Obat | Pasien | S-12 | SRS |
| UC-15 | Menampilkan Riwayat Perkembangan | Pasien | S-14 | SRS |
| UC-16 | Mengajukan Pertanyaan ke Chatbot | Pasien | S-16 | SRS |
| UC-17 | Menjawab Pertanyaan via Chatbot | Sistem AI | S-16 | SRS |
| **UC-18** | Verifikasi Email | Pasien, Layanan Email | S-03 | **Baru** (L1) |
| **UC-19** | Lupa & Reset Password | Pasien, Layanan Email | S-05 | **Baru** (L1) |
| **UC-20** | Mengonfirmasi/Mengoreksi Hasil Ekstraksi | Pasien | S-09 | **Baru** (L4) |
| **UC-21** | Mengelola Jadwal Obat | Pasien | S-13 | **Baru** (L5) |
| **UC-22** | Memperbarui Sesi (Refresh Token) | Pasien (otomatis) | — | **Baru** (L3) |
| **UC-23** | Melihat Notifikasi | Pasien | S-17 | **Baru** |
| **UC-24** | Mengelola Profil & Hapus Akun | Pasien | S-18 | **Baru** (L15) |
| **UC-25** | Menerima Konfirmasi Pembayaran (Webhook) | Payment Gateway | — | **Baru** (L12) |

### 5.2 Diagram Use Case (Mermaid)

```mermaid
flowchart LR
  P([Pasien])
  AI([Sistem AI])
  SC([Scheduler])
  PG([Payment Gateway])
  EM([Layanan Email])

  subgraph Glukain
    UC1(UC-01 Daftar)
    UC2(UC-02 Login)
    UC3(UC-03 Logout)
    UC18(UC-18 Verifikasi Email)
    UC19(UC-19 Reset Password)
    UC22(UC-22 Refresh Sesi)
    UC4(UC-04 Unggah Dokumen)
    UC5(UC-05 Ekstrak Data)
    UC20(UC-20 Konfirmasi Hasil)
    UC6(UC-06 Klasifikasi Fase)
    UC7(UC-07 Buat Rekomendasi)
    UC10(UC-10 Deteksi Berisiko Tinggi)
    UC8(UC-08 Dashboard)
    UC9(UC-09 Lihat Rekomendasi)
    UC15(UC-15 Riwayat)
    UC21(UC-21 Jadwal Obat)
    UC13(UC-13 Kirim Pengingat)
    UC14(UC-14 Konfirmasi Obat)
    UC23(UC-23 Notifikasi)
    UC11(UC-11 Foto Makanan Premium)
    UC12(UC-12 Analisis Makanan)
    UC25(UC-25 Webhook Pembayaran)
    UC16(UC-16 Tanya Chatbot)
    UC17(UC-17 Jawab Chatbot)
    UC24(UC-24 Profil)
  end

  P --- UC1 & UC2 & UC3 & UC18 & UC19 & UC4 & UC20 & UC8 & UC9 & UC15 & UC21 & UC14 & UC23 & UC11 & UC16 & UC24
  UC22 -.-> UC2
  UC5 --- AI
  UC6 --- AI
  UC7 --- AI
  UC10 --- AI
  UC12 --- AI
  UC17 --- AI
  UC13 --- SC
  UC13 --- AI
  UC11 --- PG
  UC25 --- PG
  UC1 --- EM
  UC19 --- EM
  UC4 -.include.-> UC5
  UC5 -.include.-> UC20
  UC20 -.include.-> UC6
  UC6 -.include.-> UC7
  UC6 -.include.-> UC10
  UC11 -.include.-> UC12
  UC16 -.include.-> UC17
```

### 5.3 Deskripsi Use Case Tambahan (UC-18 s.d. UC-25)

**UC-18 Verifikasi Email**
- *Pra-kondisi:* akun sudah dibuat, status belum terverifikasi.
- *Alur utama:* (1) Pasien membuka tautan/memasukkan OTP dari email → (2) Sistem memeriksa token (valid, belum kedaluwarsa, belum dipakai) → (3) Sistem mengisi `email_verified_at` → (4) Menampilkan "Registrasi berhasil, silakan masuk".
- *Alternatif:* token kedaluwarsa → tampilkan "Kirim ulang verifikasi". Token sudah dipakai → pesan netral.
- *Pasca-kondisi:* akun bisa login.

**UC-19 Lupa & Reset Password**
- *Alur:* Pasien masukkan email → sistem selalu menjawab netral ("Jika email terdaftar, tautan dikirim") → pasien membuka tautan (berlaku 30 menit, sekali pakai) → memasukkan password baru → semua refresh token dicabut → arahkan ke login.
- *Alternatif:* token tidak valid/kedaluwarsa → minta tautan baru.

**UC-20 Mengonfirmasi/Mengoreksi Hasil Ekstraksi**
- *Pra-kondisi:* ekstraksi selesai (status dokumen `EXTRACTED`).
- *Alur:* Pasien melihat nilai berdampingan dengan gambar dokumen → mengoreksi bila salah → klik "Simpan & Analisis" → sistem menyimpan, memicu UC-06, UC-07, UC-10 → menampilkan hasil fase.
- *Alternatif:* nilai kosong diperbolehkan (fase "Belum Dapat Ditentukan"). Nilai di luar rentang wajar (mis. HbA1c > 20) ditolak dengan pesan.

**UC-21 Mengelola Jadwal Obat**
- *Alur:* Pasien menambah/ubah/hapus obat (nama, dosis, jam, hari) → sistem menyimpan → pengingat otomatis dibuat sesuai jadwal.
- *Catatan:* jadwal juga dapat diusulkan dari hasil OCR resep, tetapi **wajib dikonfirmasi pasien**.

**UC-22 Memperbarui Sesi** — Saat access token kedaluwarsa, frontend memanggil `/auth/refresh` dengan cookie refresh token. Sukses → access token baru (refresh token dirotasi). Gagal → modal "Sesi berakhir, silakan masuk lagi".

**UC-23 Melihat Notifikasi** — Pasien membuka daftar (alert, pengingat, hasil makanan, status dokumen), menandai dibaca. Badge jumlah belum dibaca di header.

**UC-24 Mengelola Profil & Hapus Akun** — Ubah nama, zona waktu, password; keluar dari semua perangkat; hapus akun (konfirmasi dengan memasukkan password) → semua data dan file pasien dihapus.

**UC-25 Menerima Konfirmasi Pembayaran** — Midtrans mengirim notifikasi → sistem memverifikasi `signature_key` → mencari order → bila `settlement`/`capture` sukses, status langganan `ACTIVE` dan `active_until = sekarang + 30 hari`; bila `expire/cancel/deny` → `FAILED/EXPIRED`. Endpoint bersifat **idempoten** (notifikasi ganda tidak menggandakan masa aktif).

---

## 6. Kebutuhan

### 6.1 Fungsional
FR-01 s.d. FR-18 mengikuti SRS tanpa perubahan. Tambahan:

| ID | Kebutuhan tambahan |
|---|---|
| FR-19 | Sistem memverifikasi email melalui token sekali pakai sebelum akun dapat login |
| FR-20 | Sistem menyediakan reset password lewat tautan sekali pakai |
| FR-21 | Sistem menampilkan hasil ekstraksi untuk dikonfirmasi/dikoreksi pasien sebelum klasifikasi |
| FR-22 | Sistem menyediakan pengelolaan jadwal obat oleh pasien |
| FR-23 | Sistem menyediakan refresh token yang dapat dicabut |
| FR-24 | Sistem menyediakan pusat notifikasi in-app |
| FR-25 | Sistem menyediakan penghapusan akun beserta seluruh data |
| FR-26 | Sistem hanya mengaktifkan premium berdasarkan webhook pembayaran yang valid |

### 6.2 Non-Fungsional
NFR-01 s.d. NFR-11 mengikuti SRS. Tambahan:

| ID | Parameter | Kebutuhan |
|---|---|---|
| NFR-12 | Security | Rate limit login 5 kali gagal / 15 menit; seluruh trafik HTTPS pada deployment online |
| NFR-13 | Security | Tidak ada endpoint yang mengembalikan data milik pasien lain (uji IDOR wajib) |
| NFR-14 | Privacy | Pada demo, **gunakan dokumen contoh/dummy**, bukan data pasien sungguhan (free tier AI dapat memakai data untuk peningkatan produk) |
| NFR-15 | Maintainability | Ambang batas klasifikasi dan aturan makanan berada di file konfigurasi |
| NFR-16 | Usability | Responsif 360–1280 px; target sentuh ≥ 48 px |

### 6.3 Traceability Matrix

| FR | UC | Layar | Endpoint utama | Tabel utama |
|---|---|---|---|---|
| FR-01, 02, 19 | UC-01, UC-18 | S-02, S-03 | `POST /auth/register`, `POST /auth/verify-email` | `users`, `email_tokens` |
| FR-03, 23 | UC-02, UC-22 | S-04 | `POST /auth/login`, `POST /auth/refresh` | `users`, `refresh_tokens` |
| FR-04 | UC-03 | S-18 | `POST /auth/logout` | `refresh_tokens` |
| FR-20 | UC-19 | S-05 | `POST /auth/forgot-password`, `/reset-password` | `email_tokens` |
| FR-05, 08 | UC-04 | S-07 | `POST /documents` | `medical_documents` |
| FR-06 | UC-05 | S-08 | `GET /documents/:id` | `extraction_results` |
| FR-21 | UC-20 | S-09 | `PUT /documents/:id/extraction` | `extraction_results` |
| FR-07 | UC-06 | S-09 | (dipicu UC-20) | `phase_records` |
| FR-09 | UC-07, UC-09 | S-11 | `GET /recommendations/latest` | `recommendations`, `recommendation_rules` |
| FR-10 | UC-10 | S-10, S-06 | `GET /alerts/active`, `POST /alerts/:id/acknowledge` | `alerts` |
| FR-11 | UC-08 | S-06 | `GET /dashboard` | semua data pasien |
| FR-12 | UC-15 | S-14 | `GET /history` | `phase_records`, `extraction_results` |
| FR-13, 14, 26 | UC-11, UC-25 | S-15 | `POST /subscription/checkout`, `POST /payments/midtrans/webhook` | `subscriptions` |
| FR-15 | UC-12 | S-15 | `POST /food-analyses` | `food_analyses` |
| FR-16, 22 | UC-13, UC-21 | S-12, S-13 | `/medications` | `medications`, `medication_schedules`, `medication_logs` |
| FR-17 | UC-14 | S-12 | `POST /medication-logs/:id/confirm` | `medication_logs` |
| FR-18 | UC-16, UC-17 | S-16 | `POST /chat/messages` | `chat_messages` |
| FR-24 | UC-23 | S-17 | `GET /notifications` | `notifications` |
| FR-25 | UC-24 | S-18 | `DELETE /users/me` | semua |

---

## 7. Tech Stack dan Arsitektur

### 7.1 Stack (semua gratis untuk keperluan tugas besar)

| Lapisan | Teknologi | Biaya |
|---|---|---|
| Frontend | React + TypeScript + Vite | Gratis |
| Styling | Tailwind CSS (token dari Figma Variables) | Gratis |
| Routing/data | React Router, TanStack Query | Gratis |
| Form & validasi UI | React Hook Form + Zod | Gratis |
| Grafik | Recharts | Gratis |
| Backend | Node.js + Express + TypeScript | Gratis |
| Validasi API | Zod | Gratis |
| ORM & DB | Prisma + MySQL 8 (lokal: XAMPP/Docker) | Gratis |
| Auth | `jsonwebtoken`, `argon2`, `cookie-parser` | Gratis |
| Keamanan | `helmet`, `cors`, `express-rate-limit` | Gratis |
| Upload | `multer` | Gratis |
| Penjadwal | `node-cron` | Gratis |
| Email | Nodemailer + SMTP Gmail (App Password); saat dev cukup cetak tautan ke konsol | Gratis |
| OCR + AI (rekomendasi, chatbot, analisis makanan) | **API AI dengan kemampuan membaca gambar, pakai free tier** (mis. Gemini API). Alternatif OCR gratis: OCR.space | Gratis (ada batas) |
| Pembayaran | Midtrans Sandbox + `midtrans-client` | Gratis (sandbox) |
| Tes | Postman, Vitest (unit test), Playwright/manual (opsional) | Gratis |
| Versi | Git + GitHub | Gratis |

> Pemilihan Express dibanding FastAPI didasarkan pada keahlian Anda (JavaScript/TypeScript) dan satu bahasa di frontend-backend. Bila nanti memilih penyedia AI lain, cukup mengganti satu file `ai.client.ts`.

### 7.2 Arsitektur

```
┌────────────────────────────┐
│ Browser (HP/Tablet/Desktop)│
│ React + TS + Tailwind      │
└─────────────┬──────────────┘
              │ HTTPS · JSON · Bearer JWT (+ cookie refresh)
┌─────────────▼──────────────────────────────────────────┐
│ Express API  (/api/v1)                                  │
│  routes → middlewares → controllers → services          │
│  middlewares: helmet, cors, rateLimit, authJwt, zod     │
│  services: auth, document, extraction, classification,  │
│            recommendation, alert, medication, history,  │
│            notification, subscription, food, chatbot    │
│  jobs: reminder (cron tiap menit), expire-subscription  │
└───┬──────────┬───────────┬────────────┬────────────────┘
    │          │           │            │
 MySQL     Storage      API AI       Midtrans
(Prisma)  (uploads/     (OCR+LLM)    Sandbox ⇄ webhook
          privat)
```

**Pemrosesan dokumen (tanpa antrean pesan, sesuai SRS poin 4):**
`POST /documents` → simpan file + status `PROCESSING` → balas **202** → proses ekstraksi berjalan di latar (async function di proses yang sama) → frontend *polling* `GET /documents/:id` tiap 2 detik sampai status `EXTRACTED`/`FAILED`/`UNRECOGNIZED`.

**Alur ekstraksi (UC-05):** kirim gambar ke API AI dengan perintah mengembalikan JSON berisi nilai + keyakinan per field → validasi dengan Zod → simpan di `extraction_results` (`is_confirmed = false`) → status `EXTRACTED`. Tidak ada satu pun nilai ditemukan → `UNRECOGNIZED`. Error/timeout → `FAILED` (file tetap tersimpan, NFR-09).

---

## 8. Keamanan

| Area | Ketentuan |
|---|---|
| Password | Hash **Argon2id**; min. 8 karakter, wajib huruf & angka; tolak password umum |
| Access token | JWT berumur **15 menit**, berisi `sub`, `iat`, `exp`, `jti`. Tidak memuat data medis. Disimpan di memori frontend (bukan `localStorage`) |
| Refresh token | Acak 256-bit, **hash-nya** disimpan di DB, berumur 7 hari, cookie `HttpOnly; Secure; SameSite=Strict`, **dirotasi** setiap dipakai. Pemakaian ulang token lama → cabut seluruh keluarga token |
| Login | Pesan error generik; 5 gagal/15 menit → kunci 15 menit |
| Email/Reset | Token acak, di-hash di DB, sekali pakai (verifikasi 15 menit, reset 30 menit). Respons endpoint selalu netral (anti user-enumeration) |
| Otorisasi | Semua query memfilter `user_id` dari JWT. ID sumber daya berupa UUID. Uji IDOR wajib |
| File | Validasi MIME **dan** magic bytes, batas 10 MB, nama file diacak, disimpan di luar folder publik, diakses via endpoint terautentikasi |
| Transport | HTTPS pada deployment; `helmet` (HSTS, CSP dasar); CORS hanya origin frontend |
| Webhook | Verifikasi `signature_key` = SHA-512(`order_id` + `status_code` + `gross_amount` + `ServerKey`); idempoten |
| AI | API key hanya di backend `.env`. Input pengguna ke chatbot dibatasi panjang (maks. 500 karakter). Prompt sistem berisi guardrail BR-08 |
| Log | Tabel `audit_logs`: login, logout, reset password, unggah, alert, hapus akun. **Jangan** mencatat password/token/isi dokumen |
| Rahasia | `.env` masuk `.gitignore`; sediakan `.env.example` |

---

## 9. Desain Database (MySQL 8)

### 9.1 ERD

```mermaid
erDiagram
  users ||--o{ email_tokens : has
  users ||--o{ refresh_tokens : has
  users ||--o{ medical_documents : uploads
  medical_documents ||--o| extraction_results : yields
  extraction_results ||--o| phase_records : classified_as
  phase_records ||--o{ recommendations : generates
  phase_records ||--o{ alerts : triggers
  recommendation_rules ||--o{ recommendations : template_for
  users ||--o{ medications : takes
  medications ||--o{ medication_schedules : scheduled
  medication_schedules ||--o{ medication_logs : logs
  users ||--o{ notifications : receives
  users ||--o{ subscriptions : buys
  users ||--o{ food_analyses : checks
  users ||--o{ chat_messages : chats
  users ||--o{ audit_logs : generates

  users {
    char36 id PK
    varchar name
    varchar email UK
    varchar password_hash
    varchar timezone
    datetime email_verified_at
    int failed_login_count
    datetime locked_until
    datetime created_at
  }
  medical_documents {
    char36 id PK
    char36 user_id FK
    varchar file_path
    varchar status
    date checkup_date
    datetime uploaded_at
  }
  extraction_results {
    char36 id PK
    char36 document_id FK
    decimal hba1c
    int fasting_glucose
    int systolic
    int diastolic
    boolean is_confirmed
  }
  phase_records {
    char36 id PK
    char36 user_id FK
    char36 extraction_id FK
    varchar phase
    json reason
  }
```

### 9.2 Kamus Data

Konvensi: PK `CHAR(36)` UUID · `created_at`/`updated_at` `DATETIME(3)` UTC · nama tabel `snake_case` · semua FK `ON DELETE CASCADE` ke `users` (mendukung hapus akun).

**`users`**
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | CHAR(36) PK | UUID |
| name | VARCHAR(100) | |
| email | VARCHAR(190) UNIQUE | huruf kecil |
| password_hash | VARCHAR(255) | Argon2id |
| timezone | VARCHAR(50) | default `Asia/Jakarta` |
| consent_at | DATETIME | persetujuan privasi |
| email_verified_at | DATETIME NULL | NULL = belum verifikasi |
| failed_login_count | INT default 0 | |
| locked_until | DATETIME NULL | |
| created_at, updated_at | DATETIME | |

**`email_tokens`**: `id`, `user_id` FK, `type` ENUM(`VERIFY`,`RESET`), `token_hash` CHAR(64) UNIQUE, `expires_at`, `used_at` NULL, `created_at`.

**`refresh_tokens`**: `id`, `user_id` FK, `family_id` CHAR(36), `token_hash` CHAR(64) UNIQUE, `expires_at`, `revoked_at` NULL, `user_agent` VARCHAR(255), `ip` VARCHAR(45), `created_at`. Index: (`user_id`), (`family_id`).

**`medical_documents`**
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | CHAR(36) PK | |
| user_id | CHAR(36) FK | |
| file_path | VARCHAR(255) | path privat |
| original_name | VARCHAR(255) | |
| mime_type | VARCHAR(50) | |
| size_bytes | INT | |
| status | ENUM | `PROCESSING`,`EXTRACTED`,`CONFIRMED`,`FAILED`,`UNRECOGNIZED` |
| error_message | VARCHAR(255) NULL | |
| checkup_date | DATE NULL | tanggal pemeriksaan (dari dokumen/diisi pasien) |
| uploaded_at | DATETIME | |

Index: (`user_id`, `uploaded_at` DESC).

**`extraction_results`** (1:1 dengan dokumen)
| Kolom | Tipe |
|---|---|
| id | CHAR(36) PK |
| document_id | CHAR(36) FK UNIQUE |
| user_id | CHAR(36) FK |
| hba1c | DECIMAL(4,1) NULL |
| fasting_glucose | INT NULL (mg/dL) |
| random_glucose | INT NULL |
| total_cholesterol, ldl, hdl, triglyceride | INT NULL |
| systolic, diastolic | INT NULL |
| weight_kg | DECIMAL(5,1) NULL |
| confidence | JSON NULL (keyakinan per field) |
| is_confirmed | BOOLEAN default false |
| confirmed_at | DATETIME NULL |
| created_at | DATETIME |

**`phase_records`**: `id`, `user_id` FK, `extraction_id` FK UNIQUE, `phase` ENUM(`CONTROLLED`,`NEEDS_ATTENTION`,`HIGH_RISK`,`UNDETERMINED`), `reason` JSON, `determined_at`. Index (`user_id`, `determined_at` DESC).

**`recommendation_rules`** (tabel aturan, UC-07): `id`, `phase` ENUM UNIQUE, `diet_text` TEXT, `activity_text` TEXT, `medication_note` TEXT, `updated_at`. Diisi lewat *seed*. Fase tidak dikenali → pakai aturan `UNDETERMINED` (default).

**`recommendations`**: `id`, `user_id` FK, `phase_record_id` FK, `diet_text`, `activity_text`, `medication_note` (salinan teks saat dibuat), `created_at`.

**`alerts`**: `id`, `user_id` FK, `phase_record_id` FK, `type` ENUM(`HIGH_RISK`), `message`, `created_at`, `acknowledged_at` NULL, `resolved_at` NULL.

**`medications`**: `id`, `user_id` FK, `name` VARCHAR(100), `dose` VARCHAR(50), `source` ENUM(`MANUAL`,`OCR`), `is_active` BOOLEAN, `created_at`.

**`medication_schedules`**: `id`, `medication_id` FK, `time_of_day` TIME, `days_of_week` TINYINT UNSIGNED (bitmask Sen–Min, 127 = tiap hari).

**`medication_logs`**: `id`, `user_id` FK, `schedule_id` FK, `scheduled_for` DATETIME (UTC), `reminder_sent_at`, `status` ENUM(`PENDING`,`CONFIRMED`,`MISSED`), `confirmed_at` NULL. **UNIQUE** (`schedule_id`, `scheduled_for`) mencegah pengingat ganda.

**`notifications`**: `id`, `user_id` FK, `type` ENUM(`HIGH_RISK_ALERT`,`MEDICATION_REMINDER`,`FOOD_RESULT`,`DOCUMENT_STATUS`,`SUBSCRIPTION`), `title`, `body`, `ref_type`, `ref_id`, `is_read` BOOLEAN default false, `created_at`. Index (`user_id`, `is_read`, `created_at` DESC).

**`subscriptions`**: `id`, `user_id` FK, `order_id` VARCHAR(64) UNIQUE, `amount` INT, `status` ENUM(`PENDING`,`ACTIVE`,`FAILED`,`EXPIRED`), `midtrans_transaction_id` NULL, `paid_at` NULL, `active_until` NULL, `created_at`.

**`food_analyses`**: `id`, `user_id` FK, `photo_path`, `food_name` NULL, `est_sugar_g` DECIMAL(5,1) NULL, `est_carb_g` DECIMAL(5,1) NULL, `verdict` ENUM(`SAFE`,`RISKY`,`UNRECOGNIZED`), `reason` VARCHAR(500), `created_at`.

**`chat_messages`**: `id`, `user_id` FK, `role` ENUM(`USER`,`ASSISTANT`), `content` TEXT, `created_at`. Index (`user_id`, `created_at`).

**`audit_logs`**: `id` BIGINT AI, `user_id` NULL, `action` VARCHAR(50), `ip` VARCHAR(45), `meta` JSON, `created_at`. (tanpa FK cascade agar jejak tidak ikut terhapus; anonimkan saat hapus akun.)

### 9.3 Data Awal (Seed)
- 4 baris `recommendation_rules` (satu per fase) berisi teks diet/aktivitas/obat.
- 1 akun demo untuk presentasi (data dummy).

---

## 10. Kontrak API

### 10.1 Konvensi
- **Base URL:** `/api/v1` · Format: JSON (`multipart/form-data` untuk unggah file) · Waktu: ISO-8601 UTC.
- **Auth:** header `Authorization: Bearer <accessToken>`. Endpoint publik ditandai 🔓.
- **Respons sukses:** `{ "data": ... }` · **Respons gagal:**
```json
{ "error": { "code": "VALIDATION_ERROR", "message": "Password minimal 8 karakter", "details": [{ "field": "password", "issue": "min_length" }] } }
```
- **Kode status:** 200 OK, 201 Created, 202 Accepted, 204 No Content, 400 validasi, 401 belum login/token salah, 403 dilarang/premium diperlukan, 404 tidak ditemukan, 409 konflik, 413 file terlalu besar, 415 format tidak didukung, 422 tidak dapat diproses, 429 terlalu banyak permintaan, 500 kesalahan server.

**Kode error aplikasi:** `VALIDATION_ERROR`, `UNAUTHORIZED`, `TOKEN_EXPIRED`, `INVALID_CREDENTIALS`, `ACCOUNT_LOCKED`, `EMAIL_NOT_VERIFIED`, `EMAIL_EXISTS`, `UNSUPPORTED_FILE_TYPE`, `FILE_TOO_LARGE`, `NOT_FOUND`, `PREMIUM_REQUIRED`, `RATE_LIMITED`, `DAILY_QUOTA_EXCEEDED`, `EXTRACTION_FAILED`, `OFF_TOPIC`, `INTERNAL_ERROR`.

### 10.2 Auth 🔓

| Method | Path | Body | Sukses | Error |
|---|---|---|---|---|
| POST | `/auth/register` | `{name,email,password,confirmPassword,consent:true}` | 201 `{message}` | 400, 409 `EMAIL_EXISTS`* |
| POST | `/auth/verify-email` | `{token}` | 200 `{message}` | 400 token tidak valid/kedaluwarsa |
| POST | `/auth/resend-verification` | `{email}` | 200 netral | 429 |
| POST | `/auth/login` | `{email,password}` | 200 + cookie refresh | 401 `INVALID_CREDENTIALS`, 403 `EMAIL_NOT_VERIFIED`, 423/429 `ACCOUNT_LOCKED` |
| POST | `/auth/refresh` | — (cookie) | 200 `{accessToken}` | 401 |
| POST | `/auth/logout` | — (cookie) | 204 | — |
| POST | `/auth/logout-all` 🔒 | — | 204 | 401 |
| POST | `/auth/forgot-password` | `{email}` | 200 netral | 429 |
| POST | `/auth/reset-password` | `{token,newPassword}` | 200 | 400 |

\* Keputusan desain: kembalikan 409 (sesuai SRS) atau 200 netral (lebih aman). Pilih satu dan catat di laporan.

**Contoh Login**
```http
POST /api/v1/auth/login
{ "email": "budi@mail.com", "password": "Rahasia123" }
```
```http
200 OK
Set-Cookie: refresh_token=...; HttpOnly; Secure; SameSite=Strict; Path=/api/v1/auth; Max-Age=604800
```
```json
{ "data": { "accessToken": "eyJhbGciOi...", "expiresIn": 900,
            "user": { "id": "7c1e...", "name": "Budi", "email": "budi@mail.com", "isPremium": false } } }
```

### 10.3 Pengguna 🔒
| Method | Path | Keterangan |
|---|---|---|
| GET | `/users/me` | Profil `{id,name,email,timezone,isPremium,premiumUntil}` |
| PATCH | `/users/me` | `{name?,timezone?}` |
| POST | `/users/me/change-password` | `{currentPassword,newPassword}` → 204, semua refresh token dicabut |
| DELETE | `/users/me` | `{password}` → 204, hapus semua data dan file |

### 10.4 Dokumen & Ekstraksi 🔒

| Method | Path | Keterangan |
|---|---|---|
| POST | `/documents` | `multipart`: `file` (JPG/PNG/PDF ≤ 10 MB). **202** `{id,status:"PROCESSING"}`. Error: 415, 413, 429 `DAILY_QUOTA_EXCEEDED` |
| GET | `/documents` | Daftar `?page=1&limit=10` `[{id,status,checkupDate,uploadedAt}]` |
| GET | `/documents/:id` | Status + hasil ekstraksi bila ada (dipolling) |
| GET | `/documents/:id/file` | Mengunduh/menampilkan berkas (hanya pemilik) |
| POST | `/documents/:id/retry` | Ulangi ekstraksi bila `FAILED` → 202 |
| PUT | `/documents/:id/extraction` | Konfirmasi/koreksi (UC-20). Memicu klasifikasi, rekomendasi, alert |

**`GET /documents/:id` (selesai)**
```json
{ "data": {
  "id": "d3f1...", "status": "EXTRACTED", "uploadedAt": "2026-10-18T03:20:11Z",
  "extraction": {
    "checkupDate": "2026-10-15",
    "values": { "hba1c": 8.2, "fastingGlucose": 156, "randomGlucose": null,
                "totalCholesterol": 210, "ldl": 130, "hdl": 42, "triglyceride": 180,
                "systolic": 135, "diastolic": 85, "weightKg": 72.5 },
    "confidence": { "hba1c": 0.97, "fastingGlucose": 0.88, "systolic": 0.55 },
    "isConfirmed": false }
} }
```

**`PUT /documents/:id/extraction`**
```json
// Request
{ "checkupDate": "2026-10-15",
  "values": { "hba1c": 8.2, "fastingGlucose": 156, "systolic": 135, "diastolic": 85, "weightKg": 72.5 } }
```
Validasi rentang wajar: HbA1c 3–20, glukosa 20–800, sistolik 60–260, diastolik 30–160, berat 20–300 → lainnya `400 VALIDATION_ERROR`.
```json
// 200 Response
{ "data": {
  "phase": { "code": "NEEDS_ATTENTION", "label": "Perlu Perhatian", "reason": ["HbA1c 8.2% berada pada 7.0–8.9%"] },
  "recommendation": { "diet": "...", "activity": "...", "medicationNote": "..." },
  "alert": null,
  "disclaimer": "Hasil ini bukan pengganti saran dokter."
} }
```
Bila `HIGH_RISK`: `"alert": { "id": "...", "message": "Segera hubungi tenaga medis." }`.

### 10.5 Dashboard, Rekomendasi, Alert, Riwayat 🔒

| Method | Path | Respons ringkas |
|---|---|---|
| GET | `/dashboard` | `{ latest: {phase, checkupDate, values}, charts: {glucose:[{date,value}], bloodPressure:[...], weight:[...]}, activeAlert, todayMedications:[...], hasData }` (`hasData:false` → empty state) |
| GET | `/recommendations/latest` | `{phase, diet, activity, medicationNote, createdAt}` · 404 bila belum ada |
| GET | `/alerts/active` | Alert yang belum selesai (untuk banner) |
| POST | `/alerts/:id/acknowledge` | 204 (menutup modal; banner tetap sesuai BR-03) |
| GET | `/history?range=3m\|6m\|1y\|all` | `{ enough: boolean, hba1cTrend:[{date,value}], phaseTrend:[{date,phase}], checkups:[{documentId,date,phase}] }` (`enough:false` bila < 2 data) |
| GET | `/history/:documentId` | Detail satu kontrol |

### 10.6 Obat & Pengingat 🔒

| Method | Path | Body / Respons |
|---|---|---|
| GET | `/medications` | Daftar obat + jadwal |
| POST | `/medications` | `{name,dose,schedules:[{timeOfDay:"07:00",daysOfWeek:[1,2,3,4,5,6,7]}]}` → 201 |
| PATCH | `/medications/:id` | Ubah nama/dosis/jadwal/`isActive` |
| DELETE | `/medications/:id` | 204 |
| GET | `/medications/today` | `[{logId,medicationName,dose,scheduledFor,status}]` |
| POST | `/medication-logs/:id/confirm` | 200 `{status:"CONFIRMED",confirmedAt}`. Error: 409 bila sudah `MISSED` melewati jendela 60 menit |

**Cron `reminder` (tiap menit):** (1) cari jadwal aktif yang jatuh pada menit ini (zona waktu pasien) → (2) `INSERT` `medication_logs` (`PENDING`, UNIQUE mencegah duplikat) → (3) buat notifikasi `MEDICATION_REMINDER` "Waktunya minum [obat], dosis [dosis]" → (4) log `PENDING` yang lewat 60 menit → `MISSED`. Jadwal tidak ditemukan → tidak ada notifikasi (UC-13 alt 1a).

### 10.7 Notifikasi 🔒
| Method | Path | Keterangan |
|---|---|---|
| GET | `/notifications?type=&unread=true&page=` | Daftar |
| GET | `/notifications/unread-count` | `{count}` (dipolling frontend tiap 30 detik) |
| PATCH | `/notifications/:id/read` | 204 |
| POST | `/notifications/read-all` | 204 |

### 10.8 Premium & Makanan 🔒

| Method | Path | Keterangan |
|---|---|---|
| GET | `/subscription` | `{status:"ACTIVE\|NONE\|PENDING\|EXPIRED", activeUntil, price, plan}` |
| POST | `/subscription/checkout` | Membuat order + Snap token → 201 `{orderId, snapToken, redirectUrl}` |
| POST 🔓 | `/payments/midtrans/webhook` | Dari Midtrans. Verifikasi signature, idempoten → 200 |
| POST | `/food-analyses` | `multipart`: `photo`. **403 `PREMIUM_REQUIRED`** bila belum aktif. 422 foto tidak bisa diproses. 200 hasil di bawah |
| GET | `/food-analyses?page=` | Riwayat analisis |

```json
// POST /food-analyses → 200
{ "data": { "id": "f81c...", "foodName": "Nasi goreng", "estSugarG": 6.5, "estCarbG": 58.0,
            "verdict": "RISKY", "label": "Menu ini berisiko",
            "reason": "Karbohidrat tinggi (±58 g per porsi).",
            "disclaimer": "Estimasi dari foto, tidak sepenuhnya akurat." } }
```
`verdict: "UNRECOGNIZED"` → `label: "Cek manual disarankan"`.

### 10.9 Chatbot 🔒

| Method | Path | Keterangan |
|---|---|---|
| GET | `/chat/messages?before=&limit=30` | Riwayat percakapan |
| POST | `/chat/messages` | `{message}` (1–500 karakter). Kosong → 400 `VALIDATION_ERROR` "Pertanyaan tidak boleh kosong" |

```json
// Response 200
{ "data": { "userMessage": { "id": "...", "content": "..." },
            "reply": { "id": "...", "content": "Dengan kondisi Anda saat ini ...", "offTopic": false } } }
```
Di luar topik: `reply.content = "Maaf, saya hanya dapat membantu seputar kondisi diabetes Anda."`, `offTopic: true`.
Konteks yang dikirim ke AI: fase terbaru + nilai terakhir + 10 pesan terakhir + prompt sistem guardrail (BR-08).

### 10.10 Lainnya
| Method | Path | Keterangan |
|---|---|---|
| GET 🔓 | `/health` | `{status:"ok", db:"up"}` |

---

## 11. Struktur Proyek

```
glukain/
├── backend/
│   ├── prisma/ (schema.prisma, migrations/, seed.ts)
│   ├── src/
│   │   ├── config/        (env.ts, thresholds.ts, food-rules.ts)
│   │   ├── routes/        (auth, users, documents, dashboard, history, medications, notifications, subscription, food, chat)
│   │   ├── controllers/
│   │   ├── services/      (auth, extraction, classification, recommendation, alert, medication, notification, subscription, food, chatbot, email)
│   │   ├── clients/       (ai.client.ts, midtrans.client.ts)
│   │   ├── middlewares/   (authJwt, rateLimit, upload, validate, errorHandler)
│   │   ├── jobs/          (reminder.job.ts, subscription-expiry.job.ts)
│   │   ├── utils/         (jwt.ts, hash.ts, time.ts)
│   │   └── app.ts, server.ts
│   ├── uploads/           (privat, di-.gitignore)
│   └── tests/             (classification.test.ts, auth.test.ts)
├── frontend/
│   └── src/ (pages/, components/, features/, api/, hooks/, lib/, styles/)
├── docs/ (SRS, SDD, PRD_Glukain_Figma.md, PRD_Glukain_Lengkap_Waterfall.md, postman_collection.json)
└── README.md
```

**Variabel lingkungan (`.env.example`):**
```
DATABASE_URL=mysql://user:pass@localhost:3306/glukain
JWT_ACCESS_SECRET=
JWT_ACCESS_TTL=900
REFRESH_TTL_DAYS=7
FRONTEND_ORIGIN=http://localhost:5173
AI_API_KEY=
SMTP_HOST= / SMTP_USER= / SMTP_PASS=
MIDTRANS_SERVER_KEY= / MIDTRANS_CLIENT_KEY= / MIDTRANS_IS_PRODUCTION=false
UPLOAD_DIR=./uploads
```

---

## 12. Rencana Pengujian (Tahap 4 Waterfall)

| Jenis | Alat | Cakupan |
|---|---|---|
| Unit test | Vitest | Fungsi klasifikasi (semua batas ambang), validasi rentang, signature webhook |
| Pengujian API | Postman (collection + environment) | Semua endpoint §10, termasuk alur gagal |
| Black-box per use case | Tabel uji manual | UC-01 s.d. UC-25 (alur utama + alternatif) |
| Keamanan | Manual + Postman | IDOR (akses data pasien lain), token kedaluwarsa, brute force, upload file berbahaya (`.exe` diganti `.jpg`) |
| Responsif & kompatibilitas | Browser devtools + HP asli | 360, 768, 1280 px; Chrome, Firefox, Safari |
| Performa dasar | Stopwatch/Network tab | OCR+klasifikasi < 10 dtk, dashboard < 7 dtk |
| UAT | 3–5 responden | Skenario tugas dari §2, kuesioner kemudahan |

**Contoh test case (format yang bisa disalin ke laporan):**

| ID | UC | Skenario | Data uji | Hasil diharapkan | Status |
|---|---|---|---|---|---|
| TC-01 | UC-01 | Daftar email sudah terdaftar | email yang sama | Pesan error sesuai keputusan §10.2 | |
| TC-02 | UC-01 | Password 6 karakter | `abc123` | 400, "Password minimal 8 karakter" | |
| TC-03 | UC-02 | Login sebelum verifikasi email | akun belum verifikasi | 403 `EMAIL_NOT_VERIFIED` | |
| TC-04 | UC-02 | 6 kali password salah | — | Percobaan ke-6: 429/423 terkunci | |
| TC-05 | UC-22 | Refresh token lama dipakai ulang | token ter-rotasi | 401, seluruh sesi dicabut | |
| TC-06 | UC-04 | Unggah `.docx` | file docx | 415 "Format tidak didukung, gunakan JPG/PNG/PDF." | |
| TC-07 | UC-05 | Foto buram/bukan hasil lab | foto kucing | Status `UNRECOGNIZED` | |
| TC-08 | UC-06 | HbA1c = 6,9 | | Terkontrol Baik | |
| TC-09 | UC-06 | HbA1c = 7,0 | | Perlu Perhatian (batas bawah) | |
| TC-10 | UC-06 | HbA1c = 9,0 | | Berisiko Tinggi (batas bawah) | |
| TC-11 | UC-10 | Berisiko Tinggi | | Alert + notifikasi + banner dashboard | |
| TC-12 | UC-15 | Hanya 1 pemeriksaan | | `enough:false`, pesan "Riwayat belum cukup..." | |
| TC-13 | UC-13/14 | Abaikan pengingat 60 menit | | Status `MISSED` | |
| TC-14 | UC-11 | Foto makanan tanpa premium | | 403 `PREMIUM_REQUIRED` | |
| TC-15 | UC-25 | Webhook signature salah | | Ditolak, premium tidak aktif | |
| TC-16 | UC-25 | Webhook sukses dikirim 2x | | Masa aktif tidak berlipat | |
| TC-17 | UC-16 | Kirim pesan kosong | | 400 "Pertanyaan tidak boleh kosong" | |
| TC-18 | UC-17 | "Siapa presiden Indonesia?" | | `offTopic:true` | |
| TC-19 | NFR-13 | Pasien A membuka `/documents/{id milik B}` | | 404/403 | |
| TC-20 | UC-24 | Hapus akun | | Semua data dan file hilang | |

---

## 13. Deployment dan Pemeliharaan

**Deployment (Tahap 5):**
1. **Minimum (Rp0):** jalankan lokal (`localhost`) untuk demo di depan dosen. Siapkan skrip `npm run dev` dan data demo.
2. **Opsional online:** frontend di hosting statis gratis, backend + MySQL di platform dengan paket gratis. Syarat dan batasnya sering berubah, jadi cek dulu. Wajib HTTPS, `MIDTRANS_IS_PRODUCTION=false`, dan rahasia disimpan di environment platform.
3. Cadangan database: ekspor `mysqldump` harian saat demo (memenuhi semangat NFR-03).

**Pemeliharaan (Tahap 6):** catat bug temuan UAT di tabel (ID, deskripsi, tingkat, status), prioritaskan critical/high, simpan versi (tag Git `v1.0`), dan dokumentasikan keterbatasan serta saran pengembangan lanjut.

---

## 14. Risiko

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Akurasi OCR rendah pada tulisan tangan/format beragam | Nilai salah | Layar konfirmasi wajib (UC-20), tampilkan keyakinan rendah |
| Kuota API AI gratis habis | Fitur AI berhenti | Batas harian (BR-09), cache hasil, siapkan data contoh untuk demo |
| Ambang batas medis belum divalidasi | Klasifikasi tidak akurat | Konfigurasi terpisah, validasi dengan sumber medis, tampilkan disclaimer |
| Pengingat hanya in-app | Pasien tidak melihat jika aplikasi tertutup | Dicatat sebagai keterbatasan; opsi pengembangan lanjut Web Push |
| API key bocor | Kuota/biaya disalahgunakan | `.env` di `.gitignore`, jangan commit, rotasi bila bocor |
| Jadwal Waterfall ketat | Terlambat | Prioritaskan UC inti (auth → dokumen → klasifikasi → dashboard), premium dan chatbot paling akhir |
| Kerumitan perubahan di tengah Waterfall | Dokumen tidak sinkron | Change Request (§15) dan revisi SRS/SDD v1.1 |

**Prioritas bila waktu mepet (MoSCoW):**
- **Must:** UC-01–10, 18, 20, 22, 08, 09, 15
- **Should:** UC-13, 14, 21, 23, 24, 19
- **Could:** UC-16, 17 (chatbot)
- **Won't (tahap ini):** UC-11, 12, 25 (premium) bila benar-benar terdesak, cukup ditampilkan sebagai mock di Midtrans Sandbox

---

## 15. Change Request terhadap SRS/SDD v1.0 (menuju v1.1)

| CR | Perubahan | Alasan |
|---|---|---|
| CR-01 | Tambah UC-18 s.d. UC-25 dan FR-19 s.d. FR-26 | Celah logika (verifikasi email, konfirmasi OCR, jadwal obat, webhook, dsb.) |
| CR-02 | Ganti nama UC-05 menjadi "Mengekstrak Data Medis" | Nama lama keliru |
| CR-03 | Ganti "Google Cloud Vision" menjadi "API OCR/AI pihak ketiga" (SDD §1.2, §2.5) | Hemat biaya, tetap memenuhi batasan poin 2 |
| CR-04 | Perbaiki activity diagram UC-02 (label Valid/Tidak Valid tertukar) | Kesalahan diagram |
| CR-05 | Perbaiki teks UC-09 (Scenario) dan UC-10 (Success/Failure Postcondition) | Salah salin |
| CR-06 | Ganti "Sistem Manajemen Aset Gudang" dan "Pengguna Aset" menjadi "Glukain" dan "Pasien" (SRS/SDD §2.4) | Sisa dokumen lama |
| CR-07 | Rapikan lane ganda "Sistem" pada activity diagram UC-11 | Keterbacaan |
| CR-08 | Tambah sequence diagram untuk UC-18–25 | Kelengkapan SDD |
| CR-09 | Lengkapi SDD dengan ERD dan kontrak API (§9–§10 dokumen ini) | SDD v1.0 belum memuat rancangan database |

---

## 16. Definition of Done (per Use Case)

- [ ] Endpoint sesuai kontrak §10 dan lolos tes Postman (alur utama + alternatif).
- [ ] Validasi input dengan Zod dan pesan error sesuai SRS.
- [ ] Otorisasi diuji (tidak bisa mengakses data pasien lain).
- [ ] Layar Figma `S-xx` terimplementasi, semua state (loading/empty/error/success), responsif.
- [ ] Unit test untuk logika bisnis (jika ada).
- [ ] Kode di-commit lewat pull request dan lolos review sendiri/rekan.
- [ ] Dicatat di laporan pengujian.
