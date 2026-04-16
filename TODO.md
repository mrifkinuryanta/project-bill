# ✅ ProjectBill — Development Todo

> Daftar tugas pengembangan berdasarkan [Future Development Roadmap](file:///home/mrndev/Projects/Web/ProjectBill/future_development_roadmap.md).

---

## 🎯 Current Sprint — Priority Order

1. 🤖 AI — Playwright E2E test + Dokploy deployment config
2. 🔐 Casdoor — Phase 5 (middleware) + Phase 6 (testing)
3. 💳 Partial Payments & Milestone Billing
4. 🌐 Client Portal (Multitenant Dashboard)
5. 🔗 Stripe Integration

---

## ✅ Completed

### 🔐 Subscription & Licensing System (Tiered Gating)

- [x] Desain strategi subscription 3-tier (Starter / Pro / Business)
- [x] Tambah `DEPLOYMENT_MODE` env var (`self-hosted` vs `managed`)
- [x] Buat model `Subscription` di Prisma schema
- [x] Buat `src/lib/subscription.ts` — plan limits, gate checks, usage tracking
- [x] Auto-create `Subscription` record untuk user baru
- [x] Gate check di `POST /api/clients` (count limit)
- [x] Gate check di `POST /api/projects` (count limit)
- [x] Gate check di `POST /api/invoices` & `/api/invoices/generate` (monthly counter)
- [x] Gate check di email sender `email.ts` (monthly counter)
- [x] Gate check di `POST /api/recurring-invoices` (count limit)
- [x] Gate check di `POST /api/sow-templates` (count limit)
- [x] Buat endpoint cron `/api/cron/reset-usage` + `CRON_SECRET` auth
- [x] Buat halaman `/settings/subscription` (progress bar usage)
- [x] Buat komponen `UpgradeDialog` (muncul saat limit tercapai)
- [x] Tambah watermark "Powered by ProjectBill" di invoice publik (free plan, managed cloud)
- [x] Buat API `GET /api/subscription` (fetch info langganan)
- [x] Buat API `PUT /api/subscription` (admin update plan manual)
- [x] Unit test `subscription.ts` (8 test cases, semua pass)
- [x] Fix dan update `mayar.test.ts` mock ke database settings
- [x] Semua 20 unit test project pass ✅

---

## 🤖 AI Financial Co-Pilot — Sprint 17

> An AI-powered assistant that proactively analyzes business data, answers natural language queries, and provides actionable financial insights. The first of its kind in the Indonesian invoicing market.

### Phase 1 — Infrastructure & Core (✅ Complete)
- [x] Database schema — `AgentConversation`, `AgentMessage`, `AgentMemory`, `AgentConfig` models
- [x] DTO types & interfaces (`src/lib/ai/types.ts`) — ChatMessage, BusinessContext, ProactiveInsight, etc.
- [x] Context builder (`src/lib/ai/context-builder.ts`) — Gathers real-time business data (stats, invoices, deadlines, top clients)
- [x] LLM provider abstraction (`src/lib/ai/provider.ts`) — Pluggable OpenRouter support, OpenAI/Anthropic/Local stubs
- [x] AI tool definitions (`src/lib/ai/tools.ts`) — `query_invoices`, `query_projects`, `analyze_cashflow`, `get_client_details`
- [x] System prompts (`src/lib/ai/prompts.ts`) — Bilingual (en/id) with structured business context + tool instructions
- [x] Agent orchestrator (`src/lib/ai/agent.ts`) — Chat (blocking) + streaming SSE + proactive insights engine
- [x] API route `/api/agent/chat` — SSE streaming endpoint with proper callback interface
- [x] API route `/api/agent/history` — Fetch conversation list & message history
- [x] API route `/api/agent/config` — GET/PUT agent settings (provider, model, temperature, locale, proactive mode)
- [x] Environment variable validation — `AI_PROVIDER`, `AI_API_KEY`, `AI_MODEL`, `AI_BASE_URL` in `env.ts`

### Phase 2 — UI Components (✅ Complete)
- [x] `ai-chat-panel.tsx` — Main chat panel with conversation tabs, streaming SSE parsing, quick-actions
- [x] `ai-chat-input.tsx` — Textarea with Enter-to-send, disabled state during streaming
- [x] `ai-message-bubble.tsx` — Markdown rendering (bold, italic, code, lists, headers), typing indicator
- [x] `ai-insight-card.tsx` — Priority-colored cards for proactive insights (overdue, cashflow, reminders)
- [x] `ai-floating-chat.tsx` — Fixed FAB (bottom-right), slide-over panel, responsive (mobile full-width / desktop 420px)
- [x] `ai-toggle-button.tsx` — Sidebar toggle button with Bot icon
- [x] Settings page `/settings/agent` — Provider select, model input, temperature slider, locale toggle, proactive mode
- [x] Sidebar integration — "AI Assistant" menu item under Settings
- [x] Layout integration — `<AIFloatingChat />` mounted in dashboard layout
- [x] All strings translated to English

### Phase 3 — Tool Execution & Testing (✅ Almost Complete)
- [x] Tool execution loop — AI calls tools, receives results, includes in response
- [x] Jest unit tests — `ai-tools.test.ts`, `context-builder.test.ts`
- [ ] Playwright E2E test — Open AI chat → send message → receive streaming response
- [x] Error handling — API key missing, rate limiting, LLM timeout fallback

### Phase 4 — Production & Polish (✅ Almost Complete)
- [ ] Dokploy deployment — Docker compose + env config for AI_API_KEY
- [x] Proactive insights on dashboard (show insight cards automatically)
- [x] Conversation persistence UI — "Continue previous conversation" on load
- [x] Markdown support in chat (react-markdown + rehype-sanitize)
- [x] Rate limiting on `/api/agent/chat` endpoint (20 req/hr per user)

---

## 🏆 Tier 1 — High Impact, High Feasibility

### 1. 🔐 Casdoor OIDC Integration (Managed Auth) — Sprint 16

> Integrasi Casdoor sebagai OIDC auth provider untuk `DEPLOYMENT_MODE=managed`, sementara tetap menggunakan Credentials auth (email/bcrypt) untuk `self-hosted`.
> Estimasi: **~13-18 jam (2-3 hari kerja)** | Kompleksitas: **Medium**

#### Phase 1 — Setup & Konfigurasi
- [x] Setup Casdoor instance (Docker / cloud hosted)
- [x] Konfigurasi Casdoor: buat Application, Organization, dan Roles
- [x] Tambah env vars baru di `env.ts`: `CASDOOR_ENDPOINT`, `CASDOOR_CLIENT_ID`, `CASDOOR_CLIENT_SECRET`
- [x] Update `.env.example` dengan variabel Casdoor baru

#### Phase 2 — Auth Provider Conditional
- [x] Modifikasi `src/auth.ts` — tambah Casdoor sebagai OIDC provider
- [x] Implementasi conditional provider: Credentials (self-hosted) vs Casdoor OIDC (managed)
- [x] Update `src/auth.config.ts` — pastikan JWT callbacks handle kedua mode (Casdoor user vs local user)
- [x] Pindahkan `isSelfHosted()` / `isManagedCloud()` ke utility terpisah (dari `subscription.ts`)

#### Phase 3 — Login Page & UX
- [x] Modifikasi `src/components/login-form.tsx` — conditional render:
  - Self-hosted: form email/password (existing)
  - Managed: tombol "Login with Casdoor" (OIDC redirect)
- [x] Update `src/app/(auth)/login/page.tsx` — handle login mode detection
- [x] Update `src/app/(auth)/login/actions.ts` — support Casdoor sign-in action
- [x] Modifikasi setup page (`/setup`) — skip atau adjust untuk managed mode

#### Phase 4 — User Provisioning & Sync
- [x] Implementasi auto-create `User` record di DB saat pertama login via Casdoor (di NextAuth callback)
- [x] Mapping role Casdoor → role ProjectBill (`admin`, `staff`, dll)
- [x] Handle user profile sync (name, email) dari Casdoor ke local DB
- [x] Pastikan `Subscription` auto-create juga berjalan untuk user Casdoor baru

#### Phase 5 — Route Protection & Middleware
- [ ] Buat/update middleware untuk consistent auth check di kedua mode
- [ ] Pastikan API routes (Server Actions) tetap aman di kedua mode
- [ ] Proteksi Casdoor callback route (`/api/auth/callback/casdoor`)

#### Phase 6 — Testing & Validasi
- [ ] Unit test: conditional provider logic
- [ ] E2E test: login flow self-hosted (Credentials)
- [ ] E2E test: login flow managed (Casdoor OIDC)
- [ ] E2E test: user provisioning (auto-create user + subscription)
- [ ] Validasi: logout flow di kedua mode
- [ ] Update dokumentasi (`ARCHITECTURE.md`, `README.md`)

---

### 2. 🌐 Client Portal (Multitenant Dashboard) — Sprint 17-18

- [ ] Desain model `ClientAuth` (magic link ke email), terpisah dari model `User`
- [ ] Buat schema Prisma untuk `ClientAuth`
- [ ] Migrasi database
- [ ] Setup route group `(client-portal)/` di App Router
- [ ] Buat middleware auth khusus client portal (terpisah dari admin auth)
- [ ] Buat halaman login client portal
- [ ] Implementasi magic link / password auth flow
- [ ] Buat dashboard klien — daftar invoice
- [ ] Buat dashboard klien — status proyek
- [ ] Buat dashboard klien — download SOW
- [ ] Proteksi route client portal dengan middleware
- [ ] Testing end-to-end client portal

### 3. 💳 Partial Payments & Milestone Billing — Sprint 17-18

- [ ] Desain model `PaymentMilestone` (linked to `Project`)
- [ ] Buat schema Prisma: `name`, `percentage`, `amount`, `status`, `dueDate`, `invoiceId`
- [ ] Migrasi database
- [ ] Buat UI timeline / progress bar di project detail
- [ ] Implementasi logika auto-generate invoice saat milestone di-approve
- [ ] Buat form untuk mendefinisikan milestone (misal: 30% Design → 40% Dev → 30% Launch)
- [ ] Integrasi milestone status dengan payment flow
- [ ] Testing partial payment flow

### 4. ⏱️ Time Tracking & Hourly Billing — Sprint 18-19

- [ ] Desain model `TimeEntry` (`projectId`, `description`, `startTime`, `endTime`, `duration`, `billable`)
- [ ] Buat schema Prisma untuk `TimeEntry`
- [ ] Migrasi database
- [ ] Buat komponen UI stopwatch (start/stop/pause)
- [ ] Buat time log table per proyek
- [ ] Implementasi action "Convert to Invoice" (compile time entries → line items)
- [ ] Buat dashboard widget: total jam minggu ini
- [ ] Testing time tracking & invoice conversion

---

## 🥈 Tier 2 — High Impact, Medium Complexity

### 5. 📎 File Attachments & Deliverables (S3/R2) — Sprint 19

- [ ] Pilih storage provider (Cloudflare R2 / MinIO / AWS S3)
- [ ] Setup integrasi S3-compatible storage
- [ ] Desain model `Attachment` (`projectId`, `fileName`, `fileUrl`, `fileSize`, `isLocked`)
- [ ] Buat schema Prisma untuk `Attachment`
- [ ] Migrasi database
- [ ] Implementasi pre-signed URL generation untuk secure download
- [ ] Buat UI upload file di section "Deliverables" project board
- [ ] Implementasi lock/unlock logic berdasarkan invoice status
- [ ] Testing upload, download, dan akses kontrol

### 6. 📊 Advanced Reporting & Export — Sprint 19-20

- [ ] Buat halaman `/reports` dengan filter (tanggal, klien, status)
- [ ] Implementasi chart: Revenue trend (line chart)
- [ ] Implementasi chart: Client breakdown (pie chart)
- [ ] Implementasi chart: Aging invoice report (bar chart)
- [ ] Buat summary cards: Revenue MTD, YTD, Average Invoice Value
- [ ] Implementasi export CSV menggunakan library (`xlsx` / `exceljs`)
- [ ] Implementasi export XLSX
- [ ] Testing laporan dan export

### 7. 💬 WhatsApp Integration (Notifikasi) — Sprint 20

- [ ] Pilih WA provider (WhatsApp Business API / Fonnte / Wablas)
- [ ] Setup integrasi API WA provider
- [ ] Buat template message: invoice baru
- [ ] Buat template message: reminder pembayaran
- [ ] Buat template message: payment success
- [ ] Buat toggle di Settings: Email only / WhatsApp only / Both
- [ ] Implementasi rate limiting khusus untuk WA messages
- [ ] Testing pengiriman notifikasi WA

### 8. 👥 RBAC Expansion (Staff Roles & Permissions) — Sprint 20-21

- [ ] Extend `User.role` enum: `owner`, `admin`, `staff`, `viewer`
- [ ] Update schema Prisma
- [ ] Migrasi database
- [ ] Desain permission matrix per resource (clients, projects, invoices, settings)
- [ ] Implementasi permission checks di middleware per route
- [ ] Buat UI permission management di `/settings/team`
- [ ] Testing akses per role

---

## 🥉 Tier 3 — Medium Impact, Worth Building

### 9. 🌍 Multi-Currency & Stripe Integration — Sprint 21

**Multi-Currency: ✅ Complete** — 8 currencies (IDR, USD, EUR, GBP, SGD, MYR, JPY, AUD), centralized `src/lib/currency.ts`, dynamic UI, per-currency dashboard aggregation.

**Stripe: ⏳ Next**
- [ ] Integrasi Stripe Checkout (payment intent + webhook)
- [ ] Implementasi conditional payment gateway: Mayar (IDR) vs Stripe (USD/other)
- [ ] Tambahkan exchange rate display (optional, manual)
- [ ] Testing payment flow IDR & USD

### 10. 📧 Email Template Builder (Visual Editor) — Sprint 22

- [ ] Desain UI editor template email (drag-and-drop / field-based) di `/settings/email-templates`
- [ ] Store template config di Settings (JSON field)
- [ ] Implementasi apply config saat render React Email components
- [ ] Buat preview mode sebelum save
- [ ] Testing customized email output

### 11. 📱 Progressive Web App (PWA) — Sprint 22

- [ ] Setup PWA (`next-pwa` / manual Service Worker)
- [ ] Buat `manifest.json` dengan icon dan splash screen
- [ ] Implementasi Push Notification via Web Push API
- [ ] Buat offline fallback page
- [ ] Testing installability dan offline mode

### 12. 📋 Activity Log / Timeline — Sprint 23

- [ ] Desain model `ActivityLog` (atau extend `AuditLog`)
- [ ] Buat schema Prisma
- [ ] Migrasi database
- [ ] Buat komponen `<Timeline />` di project detail page
- [ ] Implementasi auto-capture events dari Server Actions
- [ ] Testing timeline per proyek

### 13. 🔄 Expense Tracking & Profit Calculator — Sprint 23-24

- [ ] Desain model `Expense` (`projectId`, `description`, `amount`, `category`, `date`, `receipt`)
- [ ] Buat schema Prisma
- [ ] Migrasi database
- [ ] Buat UI form input expense + daftar expense di project detail
- [ ] Buat dashboard cards: Gross Revenue vs Net Profit
- [ ] Implementasi chart: Profit margin per project
- [ ] Testing expense tracking & profit calculation

---

## 💡 Tier 4 — Nice to Have / Long-term Vision

### 14. 🤖 AI-Powered Features — Sprint 24

- [ ] Smart Pricing Suggestion: suggest harga per scope item berdasarkan histori invoice
- [ ] Invoice Copy Generator: AI-generated email copy berdasarkan konteks invoice
- [ ] Project Scope Estimator: AI-powered man-hours estimation

### 15. 📊 Client Satisfaction Survey

- [ ] Auto-kirim survey (NPS-style) setelah proyek selesai
- [ ] Track satisfaction score di dashboard

### 16. 🔗 Third-Party Integrations

- [ ] Export ke format akuntansi (Jurnal.id / Xero / QuickBooks)
- [ ] Sync 2-arah dengan Trello / Notion
- [ ] Google Calendar sync untuk deadline proyek

### 17. 🌐 Multi-Language Dashboard

- [ ] Full i18n untuk dashboard admin (ID / EN)
- [ ] Toggle bahasa di sidebar

### 18. 📈 Client Insights Dashboard

- [ ] Revenue per client (lifetime value)
- [ ] Payment behavior analysis (average days to pay)
- [ ] Client retention metrics
