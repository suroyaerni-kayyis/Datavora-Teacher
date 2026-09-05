# Datavora Teacher App

Aplikasi Web (Progressive Web App) untuk manajemen kelas, absensi, nilai, jadwal pelajaran, dan catatan murid.

---

## Panduan Penggunaan Awal (Onboarding)

Jika ini adalah pertama kalinya Anda menjalankan atau menggunakan aplikasi ini setelah instalasi baru, ikuti urutan pengisian data berikut agar aplikasi berjalan optimal:

1. **Pengaturan Informasi Kelas (Wajib Pertama)**
   Buka menu **Pengaturan (Settings)** atau **Beranda**. Masukkan informasi dasar kelas seperti "Nama Kelas", "Wali Kelas", dan "Tahun Ajaran". Ini akan menjadi identitas utama laporan Anda.

2. **Pengisian Data Murid (Master Data)**
   Masuk ke menu **Murid**. Tambahkan seluruh siswa satu per satu beserta NIS/NISN. Data murid ini adalah pondasi utama, karena fitur Absensi, Nilai, dan Catatan akan bergantung pada daftar murid ini.

3. **Pengaturan Jadwal Pelajaran & Piket**
   Buka menu **Jadwal**. Masukkan jadwal mata pelajaran dan jadwal piket kebersihan/harian.

4. **Penggunaan Fitur Harian**
   Setelah 3 langkah di atas selesai, Anda sudah bisa menggunakan fitur operasional sehari-hari:
   - **Absensi:** Mengabsen murid setiap hari.
   - **Nilai:** Memasukkan nilai ujian atau tugas.
   - **Keuangan/Kas:** Mencatat pemasukan dan pengeluaran kas kelas.
   - **Catatan:** Mencatat jurnal harian atau insiden murid.

---

## Panduan Deployment (GitHub, Supabase, Vercel)

Berikut adalah panduan langkah demi langkah untuk mengunggah dan mempublikasikan aplikasi Anda.

### Tahap 1: Push ke GitHub
Buka terminal/CMD di dalam folder proyek Anda, lalu jalankan perintah berikut:
```bash
# Inisialisasi repository (jika belum)
git init

# Tambahkan semua file
git add .

# Buat commit pertama
git commit -m "Initial commit - Datavora Teacher App"

# Hubungkan dengan repository GitHub Anda yang masih kosong
git remote add origin https://github.com/USERNAME/NAMA_REPO_ANDA.git

# Push ke GitHub
git branch -M main
git push -u origin main
```

### Tahap 2: Pengaturan Database di Supabase
1. Buka [Supabase](https://supabase.com) dan buat proyek baru (Create New Project).
2. Catat dan simpan **Database Password** yang Anda buat.
3. Setelah proyek selesai dibuat, masuk ke menu **Settings > Database** (Atau Project Settings > Database).
4. Catat informasi berikut untuk digunakan di Vercel nanti:
   - Host
   - Database Name (biasanya `postgres`)
   - User (biasanya `postgres`)
   - Password (yang Anda buat di langkah 2)
5. Masuk ke menu **Settings > API**, catat:
   - Project URL (`VITE_SUPABASE_URL`)
   - Project API keys (anon / public) (`VITE_SUPABASE_ANON_KEY`)
*(Struktur tabel akan otomatis terbuat ketika Drizzle ORM atau Backend berjalan).*

### Tahap 3: Deployment ke Vercel
1. Buka [Vercel](https://vercel.com) dan login menggunakan akun GitHub Anda.
2. Klik **Add New... > Project**.
3. Temukan repository `Datavora Teacher` yang baru Anda *push*, lalu klik **Import**.
4. Di bagian **Framework Preset**, pastikan memilih **Vite**.
5. Buka bagian **Environment Variables**, dan masukkan semua konfigurasi yang ada di file `.env.example` ke sini. Isi dengan data dari Supabase:
   - `VITE_SUPABASE_URL` = URL dari Tahap 2
   - `VITE_SUPABASE_ANON_KEY` = Anon Key dari Tahap 2
   - `SQL_HOST` = Host dari Tahap 2
   - `SQL_USER` = User database (misal: postgres)
   - `SQL_PASSWORD` = Password database Anda
   - `SQL_DB_NAME` = Nama database (misal: postgres)
6. Terakhir, klik tombol **Deploy**.

Tunggu 1-2 menit, dan aplikasi Anda sudah bisa diakses secara online serta dapat diinstal di HP sebagai PWA!
