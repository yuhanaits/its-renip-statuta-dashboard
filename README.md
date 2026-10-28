# Dashboard Review Statuta & RENIP ITS

Dashboard monitoring mingguan **M1–M13** untuk Review Statuta dan RENIP ITS, berbasis keputusan Kick-off 19 Oktober 2026.

## Fitur
- Login tunggal memakai Supabase Auth.
- Dashboard M1–M13 dengan PIC, output, deadline, RAG, % progres, blocker, keputusan yang dibutuhkan, dan tindak lanjut.
- Filter fase, RAG, dan pencarian.
- Edit status langsung dari web; data tersimpan di Supabase PostgreSQL.
- Ringkasan KPI dan 5 gate pengendalian.
- Siap deploy ke GitHub Pages melalui GitHub Actions.

## Nama repository yang disarankan
`its-renip-statuta-dashboard`

## 1. Buat project Supabase
1. Buat project baru di Supabase.
2. Buka **SQL Editor** dan jalankan `supabase.sql`.
3. Sebelum menjalankan, ganti `ADMIN_EMAIL_HERE` dengan email admin yang akan dipakai untuk login.
4. Buka **Authentication > Users** lalu buat **1 user** dengan email yang sama dan password kuat.
5. Ambil **Project URL** dan **anon public key** dari Project Settings / API.

> Keamanan akses data dijaga dengan Row Level Security (RLS). Hanya JWT dengan email admin yang boleh membaca/memperbarui tabel monitoring.

## 2. Konfigurasi GitHub
1. Repository ini menggunakan branch `main`.
2. Buka **Settings > Secrets and variables > Actions** dan tambahkan:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
3. Buka **Settings > Pages** dan pilih **Source: GitHub Actions**.
4. Push ke `main` untuk memicu deployment.

## 3. Login
Buka URL GitHub Pages hasil deployment. Gunakan satu email/password yang dibuat pada Supabase Authentication.

## Status awal
Data awal dibuat konservatif berdasarkan posisi setelah kick-off:
- M1: kuning, 80% — kick-off telah dilakukan, tetapi dashboard meminta konfirmasi penutupan seluruh action item awal.
- M2: kuning, 40% — fokus konsolidasi rencana kerja 8 PIC dan persiapan Konsultasi MWA I.
- M3–M13: hijau, 0% — belum dimulai dan dianggap on-track sampai ada indikator risiko.

Semua angka/status dapat langsung diubah melalui tombol **Edit**.

## Catatan
GitHub Pages bersifat publik di level halaman jika Pages diaktifkan tanpa lapisan akses tambahan, tetapi **data monitoring tetap tidak bisa dibaca tanpa login** karena Supabase RLS. Untuk akses halaman yang juga sepenuhnya tertutup sebelum login, gunakan hosting dengan access proxy (mis. Cloudflare Access) atau platform server-side; arsitektur dashboard dan database tetap dapat dipakai.