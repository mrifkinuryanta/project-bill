# Analisis Robustness & TODO List: ProjectBill V1.6

Dokumen ini berisi daftar perbaikan kritis dan peningkatan (enhancements) untuk membuat ProjectBill lebih tangguh (robust), aman, dan siap untuk skenario production dengan skala yang lebih besar.

## 🔴 Prioritas 0: Kritis (Keamanan & Stabilitas Core)

- [x] **1. Rate Limiting pada API & Webhook**
  - **Masalah:** Rentan terhadap brute-force login, webhook replay attack (spam), dan abuse pada cron job.
  - **Solusi:** Implementasi rate limiter (misal: `upstash/ratelimit` atau custom in-memory/Redis middleware) pada endpoint `/api/auth`, `/api/webhooks`, dan `/api/cron`.

- [x] **2. Idempotency pada Cron Job (Recurring Invoices)**
  - **Masalah:** Cron bisa menghasilkan invoice ganda jika endpoint (`/api/cron/recurring-invoices`) terpicu lebih dari sekali dalam satu hari (misal jika scheduler eksternal melakukan retry).
  - **Solusi:** Tambahkan pengecekan sebelum generate: pastikan belum ada invoice dengan `type: "recurring"` untuk project dan periode bulan/minggu yang sama, atau jalankan increment `nextRunAt` dan pembuatan invoice dalam satu `prisma.$transaction`.

- [x] **3. Webhook Replay Prevention & Deduplication**
  - **Masalah:** Meskipun ada verifikasi HMAC, jika Mayar mengirim ulang *event* yang sama (retry payload yang valid), sistem bisa memprosesnya dua kali.
  - **Solusi:** Lakukan pengecekan `invoice.paidAt !== null` atau pastikan status masih `unpaid` sebelum memproses. Opsional: buat tabel/kolom untuk mencatat `processedWebhookIds`.

## 🟡 Prioritas 1: Penting (Keamanan Data & Monitoring)

- [x] **4. Error Monitoring & Alerting**
  - **Masalah:** Jika cron gagal, email tidak terkirim, atau webhook error, admin tidak mendapat notifikasi otomatis.
  - **Solusi:** Integrasi dengan layanan error tracking (contoh: Sentry free tier) atau minimal siapkan mekanisme alert logging via email/webhook Discord/Slack internal tim.

- [x] **5. Input Sanitization pada Markdown/TOS (SOW Editor)**
  - **Masalah:** Render Markdown (`react-markdown`) tanpa sanitasi pada dokumen SOW bisa membuka celah XSS (Cross-Site Scripting) jika ada *malicious input* yang disisipkan.
  - **Solusi:** Tambahkan plugin `rehype-sanitize` pada semua komponen yang mengimplementasikan `react-markdown`.

- [x] **6. Database Backup Strategy**
  - **Masalah:** Saat ini bergantung pada lokal Docker Compose PostgreSQL. Rawan data *loss* jika container atau *host* bermasalah.
  - **Solusi:** Buat script cron untuk auto `pg_dump` ke *cloud storage* (seperti S3) atau pindahkan DB ke *managed service* (Supabase/Neon) untuk production.

## 🟢 Prioritas 2: Peningkatan Kualitas & UX (Best Practices)

- [x] **7. Email Status Tracking (Graceful Degradation)**
  - **Masalah:** Jika API email (Resend) sedang *down*, sistem tetap membuat invoice tapi admin tidak tahu kalau emailnya gagal terkirim.
  - **Solusi:** Tambahkan field `emailStatus` (`sent`, `failed`, `pending`) pada model Invoice. Munculkan indikator visual (badge) di dashboard agar admin bisa melakukan *retry* pengiriman secara manual.

- [x] **8. Audit Trail untuk Operasi Finansial**
  - **Masalah:** `AuditLog` saat ini hanya mencatat perubahan API Key. Mutasi finansial (pembuatan invoice, DP terkunci, dsb) belum tercatat.
  - **Solusi:** Perluas cakupan tabel `AuditLog` untuk melacak `userId`, `action`, `entityType`, `entityId`, nilai lama (`oldValue`), dan nilai baru (`newValue`) pada entitas Project & Invoice.

- [x] **9. Optimasi Query Dashboard (Aggregation)**
  - **Masalah:** Menarik semua data invoice untuk menghitung total *revenue* bisa menyebabkan lambat jika data sudah ribuan baris.
  - **Solusi:** Ganti operasi perhitungan array di sisi JS dengan fungsi agregasi level database (`Prisma.sum`, `GROUP BY`).

- [x] **10. Multi-User Access (Role-Based)**
  - **Masalah:** Aplikasi hanya mendukung arsitektur *single admin*.
  - **Solusi:** Siapkan pondasi *Role-Based Access Control* (Misal: User dengan *role* `admin` vs `staff/viewer`) jika aplikasi ini mau dipakai oleh tim agency.
