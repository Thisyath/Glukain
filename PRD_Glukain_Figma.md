# PRD — Glukain: AI Pemantau Mandiri Pasien Diabetes
**Dokumen:** Product Requirements Document untuk Desain Figma
**Versi:** 1.0 (draft)
**Platform:** Web responsif (mobile-first), tanpa instalasi
**Sumber:** SRS & SDD Glukain (UC-01 s.d. UC-17, FR-01 s.d. FR-18, NFR-01 s.d. NFR-11)

---

## 1. Ringkasan Produk

Glukain adalah aplikasi web pendamping untuk pasien yang **sudah didiagnosis dokter** menderita diabetes. Pasien mengunggah foto/PDF hasil pemeriksaan, sistem membaca nilai medis lewat OCR, menentukan fase kondisi (rule-based), lalu menyusun rekomendasi diet, aktivitas, dan jadwal obat. Ada pengingat obat, riwayat tren antar-kontrol, chatbot kontekstual, dan fitur premium cek keamanan foto makanan.

**Prinsip produk:**
1. Mengurangi input manual (OCR first).
2. Tidak menggantikan dokter. Setiap hasil klasifikasi diberi disclaimer.
3. Ramah pasien awam: bahasa sederhana, tanpa istilah teknis berlebihan (NFR-04).
4. Aman: data medis bersifat privat dan terisolasi per akun (NFR-10, NFR-11).

## 2. Tujuan & Metrik Keberhasilan

| Tujuan | Metrik | Target |
|---|---|---|
| Onboarding cepat | Waktu daftar → dokumen pertama terunggah | < 3 menit |
| OCR efisien | Waktu unggah → hasil ekstraksi + fase tampil | < 10 detik (NFR-07) |
| Dashboard responsif | Waktu muat dashboard / hasil analisis makanan | < 7 detik (NFR-08) |
| Kepatuhan obat | Persentase pengingat berstatus "Terkonfirmasi" | Dipantau per pasien |
| Konversi premium | Pasien yang menyelesaikan pembayaran dari halaman pembayaran | Dipantau (sandbox) |

## 3. Persona & Aktor

| Aktor | Deskripsi | Catatan desain |
|---|---|---|
| **Pasien** | Penderita diabetes, usia dewasa hingga lansia, literasi digital dasar | Font besar, kontras tinggi, tombol besar (min. 48px), satu aksi utama per layar |
| **Sistem AI** | Aktor internal (OCR, klasifikasi, rekomendasi, alert, analisis makanan, pengingat, chatbot) | Tidak punya layar sendiri. Hasilnya tampil sebagai kartu hasil, notifikasi, dan balasan chatbot |

Tidak ada aktor Admin. Tidak ada dashboard admin.

## 4. Ruang Lingkup

**In scope:** registrasi/login/logout, unggah dokumen dokter, ekstraksi & klasifikasi, rekomendasi, alert risiko tinggi, dashboard, riwayat, foto makanan premium (Midtrans Sandbox), pengingat & konfirmasi obat, chatbot, notifikasi in-app.

**Out of scope:** diagnosis/prediksi diabetes, integrasi glucometer/tensimeter real-time, SMS/WhatsApp, aplikasi native, aktor Admin.

---

## 5. Penyesuaian Logika (Tambahan dari Review SRS/SDD)

Bagian ini berisi celah logika yang ditemukan dan solusi yang sudah dimasukkan ke desain. **Item bertanda ⚠ sebaiknya diperbaiki juga di SRS/SDD.**

| # | Temuan | Solusi di PRD/Desain |
|---|---|---|
| L1 | Registrasi tidak punya verifikasi email dan lupa password | Tambah: verifikasi email (OTP/link), lupa & reset password |
| L2 | Login tidak punya perlindungan brute force | Tambah rate limiting, lockout sementara, pesan error generik |
| L3 | Logout hanya "hapus sesi", token JWT masih valid | Tambah refresh token yang bisa dicabut (revoke), access token berumur pendek |
| L4 | Hasil OCR langsung diklasifikasi tanpa verifikasi pasien. Salah baca angka bisa memicu fase salah atau alert palsu | **Tambah layar "Konfirmasi Hasil Ekstraksi"**: pasien meninjau dan mengoreksi nilai sebelum klasifikasi final. Tampilkan indikator keyakinan OCR |
| L5 | Tidak ada cara mengisi jadwal obat. UC-13 mengasumsikan jadwal sudah ada | Tambah **Pengaturan Jadwal Obat**: terisi otomatis dari OCR resep, bisa ditambah/diubah manual |
| L6 | Dashboard menampilkan "berat badan" tetapi tidak ada sumber datanya | Tambah input berat badan opsional pada form koreksi ekstraksi atau profil |
| L7 | UC-14: tidak ada batas waktu konfirmasi | Tambah jendela konfirmasi (mis. 60 menit). Lewat batas, status otomatis "Belum Dikonfirmasi" |
| L8 | Fase tidak punya label seragam ("Terkontrol" vs "Terkontrol Baik") | Gunakan **Terkontrol Baik / Perlu Perhatian / Berisiko Tinggi / Belum Dapat Ditentukan** |
| L9 | Alert risiko tinggi hanya muncul sekali | Alert muncul sebagai banner persisten di dashboard sampai ada dokumen baru dengan fase lebih baik. Juga tersimpan di Pusat Notifikasi |
| L10 | Status dokumen "Gagal diproses" tidak punya aksi lanjut | Tambah tombol "Unggah ulang" dan tips foto yang baik |
| L11 | Pemrosesan dokumen butuh waktu tetapi UC-04 hanya menampilkan "sedang diproses" | Tambah layar status proses bertahap (Mengunggah → Membaca → Menganalisis → Selesai) |
| L12 | Premium: tidak ada masa aktif dan tidak ada penanganan pembayaran pending | Tambah status langganan (aktif/kedaluwarsa), status "Menunggu Pembayaran", dan verifikasi hasil pembayaran lewat webhook server |
| L13 | Chatbot berisiko memberi saran medis berbahaya | Tambah guardrail: disclaimer permanen, tolak saran dosis/ubah obat, arahkan ke dokter. Pertanyaan di luar topik ditolak (UC-17 alt 1a) |
| L14 | Tidak ada persetujuan privasi untuk data medis | Tambah checkbox persetujuan saat daftar, plus halaman Kebijakan Privasi |
| L15 | Tidak ada profil, hapus akun, atau ekspor data | Tambah layar Profil & Pengaturan (ubah password, hapus akun dan data) |
| L16 | Dokumen yang diunggah bukan hasil pemeriksaan (salah file) | Tambah status "Dokumen tidak dikenali" bila tidak ada satupun nilai medis terbaca |
| L17 | UC-15 butuh ≥ 2 data, UC-08 butuh ≥ 1 data, tetapi tidak ada empty state | Desain empty state untuk semua layar data |
| ⚠ L18 | Activity diagram UC-02: label **Valid/Tidak Valid tertukar** (Valid menuju "Email atau password salah") | Perbaiki diagram |
| ⚠ L19 | UC-10: Success/Failure Postcondition berisi teks UC-09 (copy-paste). UC-09: Scenario sama dengan UC-08 | Perbaiki teks tabel |
| ⚠ L20 | SRS/SDD §2.4 menyebut "Sistem Manajemen Aset Gudang" dan "Pengguna Aset" (sisa dokumen BORROWIN) | Ganti dengan "Glukain" dan "Pasien" |
| ⚠ L21 | UC-05 dinamai "Mengekstrak Fase Kondisi", padahal yang diekstrak adalah nilai medis | Ganti nama menjadi "Mengekstrak Data Medis" |
| ⚠ L22 | Activity diagram UC-11 punya dua lane bernama "Sistem". Aliran pembayaran dan unggah foto saling menyilang | Rapikan lane (Pasien, Sistem, Database, Payment Gateway) |

---

## 6. Keamanan Autentikasi (Registrasi, Login, Logout)

### 6.1 Registrasi (FR-01, FR-02, NFR-10)
- Field: nama lengkap, email, password, konfirmasi password, checkbox persetujuan privasi (wajib).
- Validasi email: format valid, unik (case-insensitive). Normalisasi huruf kecil sebelum disimpan.
- Validasi password: minimal 8 karakter, wajib huruf dan angka. Disarankan ≥ 12 karakter. Tolak password umum (daftar password bocor).
- Password di-hash dengan **bcrypt (cost ≥ 12) atau Argon2id** di server. Tidak pernah disimpan atau dicatat dalam bentuk asli.
- **Hindari user enumeration:** setelah daftar, tampilkan pesan netral ("Cek email Anda untuk verifikasi"). Pesan "Email sudah digunakan" hanya jika kebijakan produk memilih UX di atas keamanan. Catat sebagai keputusan desain.
- Verifikasi email lewat tautan/OTP berumur 15 menit, sekali pakai. Akun belum terverifikasi tidak bisa login.
- Proteksi bot: rate limit per IP dan email, opsional CAPTCHA (hCaptcha/Turnstile) setelah beberapa percobaan.

### 6.2 Login & Sesi JWT (FR-03, NFR-10)
- Server memberikan **access token JWT berumur pendek (10–15 menit)** dan **refresh token (7 hari)**.
- Refresh token disimpan di cookie `HttpOnly; Secure; SameSite=Strict`. Access token disimpan di memori aplikasi (jangan di `localStorage`).
- JWT ditandatangani (HS256 dengan secret kuat, atau RS256), berisi `sub` (id pasien), `iat`, `exp`, `jti`. **Tidak boleh memuat data medis.**
- Refresh token dirotasi setiap dipakai (rotation) dan disimpan hash-nya di DB agar bisa dicabut. Jika token lama dipakai ulang, semua sesi pengguna dicabut.
- Pesan gagal login **generik**: "Email atau password salah" (tidak membedakan email tidak ada atau password salah).
- Rate limit: maksimal 5 percobaan gagal per 15 menit per akun + IP. Lalu kunci sementara 15 menit dengan pesan jelas dan opsi "Lupa password".
- Semua traffic **HTTPS wajib**. Gunakan header keamanan (HSTS, CSP, X-Content-Type-Options).
- Token kedaluwarsa saat sedang memakai aplikasi: refresh otomatis di belakang layar. Jika refresh gagal, tampilkan modal "Sesi berakhir, silakan masuk lagi" dan simpan draf aksi bila memungkinkan.
- Lupa password: tautan reset sekali pakai berumur 30 menit. Setelah reset, semua refresh token dicabut.

### 6.3 Logout (FR-04)
- Klik "Keluar" memanggil endpoint logout yang **mencabut refresh token di server**, menghapus cookie, dan mengosongkan state klien.
- Jika sesi sudah kedaluwarsa, langsung arahkan ke halaman login (UC-03 alt 2a).
- Opsi "Keluar dari semua perangkat" di Pengaturan.

### 6.4 Otorisasi Data (NFR-11)
- Setiap endpoint memeriksa `pasienId` dari token. Pasien hanya bisa mengakses datanya sendiri (cegah IDOR). Id dokumen/foto memakai UUID.
- File dokumen dan foto disimpan di storage privat, diakses lewat URL bertanda tangan berumur pendek.
- Audit log: login, logout, unggah, alert risiko tinggi, perubahan password.

---

## 7. Design System

### 7.1 Palet Warna

**Palet utama (dari revisi palet Glukain):**

| Token | Hex | Penggunaan |
|---|---|---|
| `primary-600` | `#4338CA` | Warna utama, tombol primer, navigasi aktif |
| `accent-500` | `#5B5FEF` | Aksen utama, tautan, elemen interaktif, hover tombol |
| `violet-600` | `#702DE1` | Gradasi, ilustrasi, aksen dekoratif |
| `sky-300` | `#91BDF4` | Latar kartu sekunder, ilustrasi pendukung |
| `white` | `#FFFFFF` | Latar utama, teks pada tombol gelap |
| `surface-50` | `#F3F5FC` | Latar halaman, panel, area formulir |

**Warna status (aksen hijau & kuning sesuai permintaan, difungsikan sebagai warna fase kondisi):**

Palet revisi tidak berisi hijau dan kuning. Agar aksen tersebut tetap ada dan bermakna, keduanya dipakai sebagai warna **status medis**, bukan warna merek.

| Token | Hex | Fase / Penggunaan |
|---|---|---|
| `success-600` / `success-100` | `#16A34A` / `#DCFCE7` | **Terkontrol Baik**, obat terkonfirmasi, makanan aman, pembayaran berhasil |
| `warning-500` / `warning-100` | `#F5B301` / `#FEF3C7` | **Perlu Perhatian**, peringatan, obat belum dikonfirmasi |
| `danger-600` / `danger-100` | `#DC2626` / `#FEE2E2` | **Berisiko Tinggi**, alert darurat, error, makanan berisiko |
| `neutral-900` | `#1E1B4B` | Teks utama (indigo gelap, selaras dengan merek) |
| `neutral-500` | `#64748B` | Teks sekunder |

**Aturan:**
- Warna fase **tidak boleh jadi satu-satunya penanda**. Selalu sertakan ikon dan label teks (aksesibilitas buta warna).
- Teks di atas `warning-500` memakai `neutral-900`, bukan putih.
- Kontras teks minimal WCAG AA (4.5:1).
- Gradasi hero/ilustrasi: `#4338CA → #702DE1` (135°).

### 7.2 Tipografi
- Font: **Plus Jakarta Sans** (alternatif: Inter). Fallback sans-serif.
- Skala: H1 28/36 bold, H2 22/30 semibold, H3 18/26 semibold, Body 16/24 regular (minimum), Caption 13/18.
- Angka medis (HbA1c, gula darah) memakai ukuran besar 32–40 bold agar mudah dibaca.

### 7.3 Spacing, Radius, Elevasi
- Grid 8px. Radius: kartu 16, tombol 12, input 12, chip 999.
- Elevasi: kartu `0 2px 8px rgba(67,56,202,0.08)`. Modal `0 12px 32px rgba(30,27,75,0.18)`.
- Breakpoint: Mobile 375 (utama), Tablet 768, Desktop 1280.

### 7.4 Komponen Inti (buat sebagai Figma Component + Variants)
- **Button:** Primary (`#4338CA`), Secondary (outline), Ghost, Danger. State: default, hover, pressed, disabled, loading.
- **Input:** text, email, password (toggle tampil, indikator kekuatan), file dropzone. State: default, focus, error, success, disabled.
- **Badge Fase:** 4 varian (Terkontrol Baik, Perlu Perhatian, Berisiko Tinggi, Belum Dapat Ditentukan), semuanya ikon + teks.
- **Kartu:** Metrik (angka besar + tren), Rekomendasi (diet/aktivitas/obat), Dokumen (thumbnail + status), Notifikasi.
- **Alert Banner:** info, sukses, peringatan, darurat (merah, persisten, ada tombol "Hubungi tenaga medis").
- **Chart:** garis tren HbA1c (dengan zona ambang berwarna), bar gula darah. Tooltip, label sumbu jelas.
- **Chat bubble:** pasien (indigo) dan AI (putih + border), indikator mengetik, disclaimer sticky.
- **Navigation:** bottom tab bar (mobile), sidebar (desktop).
- **Toast, Modal, Stepper (proses OCR), Skeleton loader, Empty state illustration.**

---

## 8. Arsitektur Informasi

```
Publik
├── Landing / Onboarding
├── Daftar ─ Verifikasi Email
├── Masuk ─ Lupa Password ─ Reset Password
└── Kebijakan Privasi

Aplikasi (setelah login) — Bottom tab: Beranda · Unggah · Riwayat · Chatbot · Profil
├── Beranda (Dashboard Kesehatan)         UC-08
│   ├── Lihat Rekomendasi                 UC-09
│   ├── Pengingat Obat hari ini           UC-13/14
│   └── Pusat Notifikasi
├── Unggah Dokumen Dokter                 UC-04
│   ├── Status Proses                     UC-05/06/07
│   └── Konfirmasi Hasil Ekstraksi        (tambahan L4)
├── Riwayat Perkembangan                  UC-15
├── Cek Makanan (Premium)                 UC-11/12
│   └── Halaman Pembayaran
├── Chatbot                               UC-16/17
└── Profil & Pengaturan                   Logout UC-03, Jadwal Obat, Langganan, Hapus Akun
```

---

## 9. Spesifikasi Layar

Setiap layar wajib didesain untuk state: **default, loading, empty, error, success**.

### S-01 Landing / Onboarding
- Hero gradasi `#4338CA → #702DE1`, judul "Pantau diabetes lebih mudah, mandiri, dan aman", tombol **Daftar** dan **Masuk**.
- 3 slide manfaat: Foto hasil lab → AI membaca; Rekomendasi sesuai kondisi; Pengingat obat.
- Disclaimer kecil: "Glukain tidak menggantikan dokter."

### S-02 Daftar Akun — UC-01, FR-01/02
- Form: nama, email, password (+ indikator kekuatan, aturan tampil real-time), konfirmasi password, checkbox persetujuan privasi, tombol **Daftar**.
- Error inline: format email salah, password < 8 karakter, password tidak sama, email sudah digunakan (lihat catatan §6.1).
- Sukses: layar "Cek email Anda" lalu S-03.

### S-03 Verifikasi Email (tambahan L1)
- Input OTP 6 digit atau tautan, hitung mundur kirim ulang, state sukses lalu arahkan ke Masuk dengan pesan "Registrasi berhasil, silakan masuk".

### S-04 Masuk — UC-02, FR-03
- Email, password (toggle tampil), tombol **Masuk**, tautan "Lupa password?", tautan Daftar.
- State error: "Email atau password salah" (generik). State terkunci: "Terlalu banyak percobaan, coba lagi dalam 15 menit".
- Sukses → Dashboard.

### S-05 Lupa & Reset Password (tambahan L1)
- Form email lalu pesan netral "Jika email terdaftar, kami kirim tautan". Form password baru dengan aturan yang sama dengan registrasi.

### S-06 Dashboard Kesehatan — UC-08, FR-11
- Header: sapaan nama + ikon notifikasi (badge jumlah belum dibaca).
- **Kartu Fase** besar: badge fase, tanggal pemeriksaan terakhir, tombol **Lihat Rekomendasi**.
- **Alert Banner merah** persisten bila fase Berisiko Tinggi: "Segera hubungi tenaga medis."
- Kartu metrik: HbA1c, gula darah, tensi, (opsional) berat badan, masing-masing dengan nilai terbaru + indikator zona.
- Grafik gula darah/tensi/berat badan.
- Kartu "Obat hari ini" (jadwal + tombol cepat **Sudah Minum**).
- **Empty state** (belum ada data): ilustrasi + "Belum ada data, silakan unggah dokumen dokter" + CTA **Unggah**.

### S-07 Unggah Dokumen Dokter — UC-04, FR-05/08
- Dropzone besar + tombol **Foto langsung** (kamera) dan **Pilih file**. Format JPG/PNG/PDF, batas ukuran tertulis (mis. 10 MB).
- Tips foto: terang, tidak buram, seluruh halaman terlihat.
- Pratinjau thumbnail + tombol **Unggah**.
- Error: "Format tidak didukung, gunakan JPG/PNG/PDF." atau "File terlalu besar".

### S-08 Status Proses (tambahan L11) — UC-05/06/07
- Stepper: Mengunggah → Membaca dokumen → Menganalisis kondisi → Menyusun rekomendasi.
- Target < 10 detik. Jika lebih lama, tampilkan "Masih diproses, Anda bisa tutup halaman ini, kami beri tahu saat selesai".
- State gagal: "Gagal diproses" + tips + tombol **Unggah ulang** (NFR-09, L10). State "Dokumen tidak dikenali" (L16).

### S-09 Konfirmasi Hasil Ekstraksi (tambahan L4)
- Daftar nilai (HbA1c, gula darah puasa/sewaktu, kolesterol total/LDL/HDL/trigliserida, tensi, berat badan opsional) berdampingan dengan thumbnail dokumen.
- Setiap nilai bisa diedit. Nilai dengan keyakinan OCR rendah ditandai kuning "Mohon periksa".
- Nilai tidak lengkap boleh dikosongkan → fase "Belum Dapat Ditentukan" (UC-06 alt 1a).
- Tombol **Simpan & Analisis**. Setelah itu tampil kartu hasil fase + disclaimer.
- Jika fase Berisiko Tinggi → **Modal Alert Darurat** (S-10).

### S-10 Alert Berisiko Tinggi — UC-10, FR-10
- Modal merah/putih penuh perhatian: ikon peringatan, "Kondisi Anda berisiko tinggi", "Segera hubungi tenaga medis", tombol **Saya mengerti**. Tombol sekunder **Lihat detail**.
- Dicatat ke Pusat Notifikasi dan banner persisten di Dashboard (L9).
- Hindari bahasa yang memicu panik. Tetap tegas dan jelas.

### S-11 Rekomendasi Gaya Hidup — UC-07/09, FR-09
- Tiga tab/kartu: **Diet** (menu anjuran, makanan dibatasi), **Aktivitas** (target harian), **Obat** (jadwal sesuai resep).
- Header menampilkan fase yang dipakai dan tanggalnya.
- Empty state: "Unggah dokumen dokter terlebih dahulu."
- Footer: "Rekomendasi bersifat umum. Konsultasikan dengan dokter Anda."

### S-12 Pengingat & Konfirmasi Obat — UC-13/14, FR-16/17
- **Notifikasi in-app** (toast + Pusat Notifikasi): "Waktunya minum [obat], dosis [dosis]" + tombol **Sudah Minum**.
- Status: Terkonfirmasi (hijau, ikon centang + waktu), Belum Dikonfirmasi (kuning, ikon jam) setelah jendela waktu lewat (L7).
- Catatan produk: pengingat hanya in-app (tanpa SMS/WA). Tampilkan info ini di pengaturan agar pasien membuka aplikasi.

### S-13 Pengaturan Jadwal Obat (tambahan L5)
- Daftar obat: nama, dosis, jam (multi), pengulangan. Tombol tambah/ubah/hapus.
- Banner "Jadwal diisi otomatis dari resep. Periksa kembali."
- Empty state: "Belum ada jadwal obat" → tambah manual atau unggah resep.

### S-14 Riwayat Perkembangan — UC-15, FR-12
- Grafik garis HbA1c dengan zona ambang berwarna (hijau/kuning/merah di latar), grafik tren fase, daftar tanggal kontrol (tap untuk melihat detail dokumen & nilai).
- Empty state (< 2 kontrol): "Riwayat belum cukup untuk menampilkan tren." + tetap tampilkan daftar kontrol yang ada.
- Filter rentang waktu: 3 bln / 6 bln / 1 th / Semua.

### S-15 Cek Makanan (Premium) — UC-11/12, FR-13/14/15
- **Gate premium:** bila belum premium → kartu penawaran fitur + harga + tombol **Berlangganan**.
- **Halaman Pembayaran:** ringkasan paket, pilihan metode (Midtrans Sandbox), tombol **Bayar**. State: Menunggu Pembayaran, Berhasil (hijau), Gagal ("Pembayaran gagal, coba lagi", merah).
- **Unggah foto makanan:** kamera/galeri, validasi ("Foto tidak dapat diproses, coba lagi" bila buram/gelap).
- **Hasil analisis:** badge **Aman** (hijau) + estimasi gula/karbohidrat, atau **Berisiko** (merah) + alasan, atau **"Cek manual disarankan"** (kuning) bila tidak dikenali (UC-12 alt 1c).
- Status langganan (aktif sampai tanggal) terlihat di Profil.
- Disclaimer: estimasi berasal dari foto dan tidak sepenuhnya akurat.

### S-16 Chatbot — UC-16/17, FR-18
- Bubble chat, input + tombol **Kirim** (disabled bila kosong, error "Pertanyaan tidak boleh kosong").
- Chip saran pertanyaan (mis. "Makanan apa yang sebaiknya dihindari?").
- Indikator mengetik. Balasan menyebut konteks fase pasien.
- Pertanyaan di luar topik: "Maaf, saya hanya dapat membantu seputar kondisi diabetes Anda."
- Banner sticky: "Jawaban bukan pengganti saran dokter." Pertanyaan soal dosis/ubah obat → arahkan ke dokter (L13).
- Riwayat percakapan tersimpan.

### S-17 Pusat Notifikasi
- Daftar: alert risiko tinggi, pengingat obat, hasil analisis makanan, status dokumen. Tandai dibaca, filter per jenis.

### S-18 Profil & Pengaturan — UC-03, L15
- Data akun, ubah password, status langganan, jadwal obat, kebijakan privasi, **Keluar**, **Keluar dari semua perangkat**, **Hapus akun & data** (konfirmasi ganda).
- Konfirmasi logout: tidak wajib, cukup tombol **Keluar** lalu arahkan ke S-04.

---

## 10. Alur Pengguna Utama (untuk Figma Prototype)

1. **Onboarding:** S-01 → S-02 → S-03 → S-04 → S-06 (empty) → S-07.
2. **Unggah pertama:** S-07 → S-08 → S-09 → (jika berisiko tinggi: S-10) → S-06 terisi → S-11.
3. **Rutinitas obat:** notifikasi → S-12 → Sudah Minum → status tampil di S-06.
4. **Kontrol berikutnya:** S-07 → S-08 → S-09 → S-14 menampilkan tren baru.
5. **Premium:** S-15 (gate) → pembayaran → unggah foto → hasil Aman/Berisiko.
6. **Tanya chatbot:** S-16 → pertanyaan → jawaban kontekstual.
7. **Gagal:** dokumen gagal → S-08 error → unggah ulang. Pembayaran gagal → S-15 error → coba lagi.

---

## 11. Aturan Klasifikasi Fase (referensi untuk teks UI)

Klasifikasi bersifat rule-based dan ambang batas harus **disahkan sumber medis/dosen** sebelum diimplementasikan. Nilai di bawah hanya usulan awal agar desain punya contoh data:

| Fase | Contoh kriteria (usulan, perlu validasi) | Warna |
|---|---|---|
| Terkontrol Baik | HbA1c < 7,0% | Hijau |
| Perlu Perhatian | HbA1c 7,0% – 8,9% | Kuning |
| Berisiko Tinggi | HbA1c ≥ 9,0% atau gula darah ekstrem | Merah |
| Belum Dapat Ditentukan | Data tidak lengkap | Abu-abu |

Ambang batas disimpan sebagai konfigurasi, bukan hardcode di UI.

---

## 12. Kebutuhan Non-Fungsional yang Memengaruhi Desain

| NFR | Implikasi desain |
|---|---|
| NFR-04 | Bahasa awam, ikon + label, satu aksi utama per layar |
| NFR-05 | Setiap aksi punya umpan balik jelas (toast/inline error/success) |
| NFR-06 | Responsif Chrome/Firefox/Safari, mobile & desktop |
| NFR-07/08 | Skeleton loader & stepper progres agar waktu tunggu terasa singkat |
| NFR-09 | Status "Gagal diproses" tidak menghilangkan dokumen yang sudah diunggah |
| NFR-10/11 | Alur auth sesuai §6, tidak ada data medis tampil di URL |
| Aksesibilitas | Target sentuh ≥ 48px, kontras AA, dukung zoom 200%, fokus keyboard terlihat, label `aria` pada ikon |

---

## 13. Struktur File Figma

```
📄 Glukain — Design
├── 00 Cover & Changelog
├── 01 Foundations   (Colors, Typography, Spacing, Grid, Icons, Elevation)
├── 02 Components    (Button, Input, Badge Fase, Card, Alert, Chart, Chat, Nav, Modal, Toast)
├── 03 Auth          (S-02 s.d. S-05, termasuk semua state error)
├── 04 Dashboard & Rekomendasi (S-06, S-11, S-17)
├── 05 Dokumen & AI  (S-07 s.d. S-10)
├── 06 Obat          (S-12, S-13)
├── 07 Riwayat       (S-14)
├── 08 Premium Makanan (S-15)
├── 09 Chatbot       (S-16)
├── 10 Profil        (S-18)
├── 11 Prototype Flows (alur §10)
└── 12 Handoff Notes
```

Gunakan **Variables** Figma untuk token warna & spacing, **Auto Layout** pada semua komponen, dan **Variants** untuk state. Buat frame Mobile 375×812 dan Desktop 1280×800 untuk layar utama.

---

## 14. Kriteria Penerimaan Desain (Checklist)

- [ ] Seluruh 17 use case SRS punya layar atau state yang sesuai.
- [ ] Semua jalur alternatif UC (format tidak valid, pembayaran gagal, OCR gagal, input kosong, data kurang, makanan tidak dikenali, di luar topik) punya desain.
- [ ] Layar tambahan L1–L17 ada: verifikasi email, reset password, konfirmasi ekstraksi, jadwal obat, notifikasi, profil.
- [ ] Palet hanya memakai token pada §7.1. Warna fase selalu disertai ikon + teks.
- [ ] Kontras teks lulus WCAG AA.
- [ ] Prototype dapat dijalankan untuk 7 alur pada §10.
- [ ] Disclaimer medis muncul di hasil klasifikasi, rekomendasi, analisis makanan, dan chatbot.

## 15. Risiko & Pertanyaan Terbuka

| Risiko / Pertanyaan | Catatan |
|---|---|
| Akurasi OCR pada tulisan tangan dan format lab yang beragam | Layar koreksi (S-09) wajib. Uji dengan beberapa contoh dokumen nyata |
| Ambang batas fase belum divalidasi | Konsultasi sumber medis/dosen. Jadikan konfigurasi |
| Pengingat hanya in-app | Pasien yang tidak membuka aplikasi tidak menerima pengingat. Pertimbangkan Web Push (opsional) |
| Pesan "Email sudah digunakan" vs user enumeration | Putuskan: UX jelas (sesuai SRS) atau pesan netral (lebih aman) |
| Harga & masa aktif premium | Tentukan paket (mis. bulanan) untuk teks pada S-15 |
| Data medis bersifat sensitif | Tinjau kepatuhan UU Pelindungan Data Pribadi (UU PDP) sebagai referensi akademik |
