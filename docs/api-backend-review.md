# Analisis Kesesuaian API Backend dengan Frontend

## Ringkasan

Analisis ini membandingkan [api-backend.md](./api-backend.md) dengan kontrak/service/UI frontend yang dicatat di [api-per-menu.md](./api-per-menu.md). Ini merupakan review dokumentasi, bukan verifikasi implementasi server: repository yang tersedia berisi aplikasi frontend dan mock MSW, bukan source code `backoffice-service`.

**Kesimpulan:** daftar endpoint backend secara umum mencakup alur utama menu, tetapi kontrak tertulis masih memiliki gap yang perlu diuji sebelum integrasi penuh. Dokumentasi backend dan frontend berbeda pada pagination, enum Rules/Campaign, serta error. Namun, sampel runtime untuk health dan login yang diperiksa menyertakan `status`, `timestamp`, `success`, dan `data`; envelope login tersebut kompatibel dengan frontend. Karena tidak ada request gagal yang dilaporkan, masalah konektivitas/login belum terindikasi.

## Temuan prioritas tinggi

| Prioritas | Temuan | Dampak |
|---|---|---|
| P0 | Respons paginasi frontend mengharapkan `pagination: { page, limit, total_items, total_pages }`; dokumentasi backend menyebut `meta: { page, limit, total, total_pages }`. | Jika implementasi runtime mengikuti dokumen, `res.pagination.total_items` akan `undefined` pada store yang membacanya; pagination UI dapat salah. Format respons endpoint daftar runtime belum diverifikasi. |
| P1 | Format sukses di dokumen backend hanya mendefinisikan `success: true`; frontend mengharapkan `status` dan `timestamp`. Sampel runtime health/login yang diamati justru memuat keduanya (ditambah `success`). | Tidak tampak sebagai masalah pada sampel health/login. Perlu verifikasi endpoint lain dan perbarui dokumen backend agar konsisten dengan runtime. |
| P0 | Enum dan field konfigurasi Rules serta Campaign berbeda (rincian di bawah). | Data list/create/update tidak cocok dengan union type dan form frontend; payload dapat ditolak atau data tak dapat dirender dengan semestinya. |
| P1 | Format error backend `{ success: false, error: { code, message } }` tidak sesuai `ErrorResponse` frontend `{ status: 'ERROR', error_code, message, details?, timestamp }`. | UI login mengambil `response.data.message`, sehingga pesan backend berada pada `response.data.error.message`; pesan khusus tidak terbaca dan fallback generik tampil. |
| P1 | Kontrak Maker-Checker mengandung perbedaan format dan belum menunjukkan enforcement lengkap di UI/mock. | Approval mungkin ditolak sesuai backend walaupun UI menawarkan tombol; respons action juga tidak mengikuti tipe yang ditulis frontend. |
| P1 | Revoke voucher dijelaskan backend sebagai aksi langsung, sedangkan UI menyatakan permintaan dikirim ke antrean Maker-Checker tetapi tidak memanggil API. | UI memberi konfirmasi sukses palsu: belum ada mutasi dan proses yang ditampilkan tidak sama dengan proses backend. |

## Perbandingan kontrak inti

### Envelope dan pagination

Frontend mengonsumsi:

```json
{
  "status": "SUCCESS",
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total_items": 150,
    "total_pages": 8
  },
  "timestamp": "..."
}
```

Backend mendokumentasikan:

```json
{
  "success": true,
  "data": [],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "total_pages": 8
  }
}
```

Untuk pagination, ketidakcocokan ini berpotensi lintas-modul, tetapi perlu dikonfirmasi terhadap respons runtime endpoint list. Untuk envelope sukses, sampel runtime `GET /health` dan `POST /auth/login` menyertakan `status: 'SUCCESS'`, `timestamp`, `success: true`, dan `data`; sampel ini kompatibel dengan envelope frontend karena properti tambahan `success` tidak mengganggu pembacaan `data`. Perbarui dokumentasi backend agar mencerminkan format runtime yang sebenarnya. Setelah itu pilih satu format kanonis dan terapkan konsisten pada seluruh endpoint, kontrak TypeScript, mock, dan dokumentasi.

### Auth dan error

- Sampel runtime login yang dibagikan memiliki `status`, `timestamp`, dan `data` yang sesuai dengan kebutuhan `ApiResponse<LoginResponse>` frontend; field tambahan `success` dapat diabaikan. Bentuk respons runtime refresh masih perlu diverifikasi.
- Interceptor frontend mengirim refresh `{ refresh_token }`, membaca `data.data.access_token`, dan mengganti hanya access token. Backend mendokumentasikan rotasi refresh token. Frontend perlu menyimpan refresh token baru serta expiry baru bila backend memang merotasi keduanya.
- Error login backend menaruh pesan pada `error.message`; store frontend membaca `response.data.message`. Samakan schema error atau adaptasikan parsing frontend.
- Tabel status backend hanya menjelaskan 400/401/403/404/500. Dokumentasi belum menjabarkan respons untuk konflik/duplikasi (mis. kode unik), validasi field, rate limit, timeout/downstream dependency, atau file upload yang gagal.
- Format error belum menjelaskan apakah validasi per field disediakan. Frontend memiliki `details?: Record<string, string[]>`, tetapi backend tidak mendokumentasikan `details`.

## Perbedaan payload dan enum per modul

| Modul | Backend (`api-backend.md`) | Frontend | Analisis |
|---|---|---|---|
| Members | Status filter didokumentasikan `ACTIVE`, `SUSPENDED`, `TERMINATED`; transaksi mendokumentasikan hanya `page`, `limit`. Adjustment menerima `reason_code` contoh `CUSTOMER_COMPENSATION`. | `MemberStatus` juga mencakup `PENDING`, `DORMANT`; transaksi service mendukung `type`, `start_date`, `end_date`; UI menawarkan reason code `SYSTEM_DISRUPTION_COMPENSATION`, `PROMO_MISSING_ACCRUAL`, `FRAUD_REVERSAL`, `CUSTOMER_GOODWILL`. | Perlu samakan enum/filter dan reason code. Endpoint adjustment backend menyediakan dua alternatif path; tetapkan satu path kanonis. Respons backend `data.status/action_id/...` secara substansi cocok dengan mock, tetapi service frontend mengetik body respons seolah properti berada di level teratas. |
| Tiers | Endpoint dan payload inti cocok. | `GET /tiers` dipanggil tanpa query dan tidak memakai pagination. | Tidak ada gap payload utama. Dokumentasikan batasan/paginasi bila daftar tier dapat berkembang. |
| Rules | Contoh status menggunakan `ACTIVE`/`INACTIVE`; patch mengirim `INACTIVE`. Contoh action memakai `FIXED_RATIO` dan `MULTIPLIER`. | Enum status frontend: `DRAFT`, `ACTIVE`, `PAUSED`, `EXPIRED`; patch menerima `ACTIVE`, `PAUSED`, `DRAFT`. Enum action: `APPLY_CAMPAIGN_MULTIPLIER`, `APPLY_BONUS_POINTS`, `APPLY_CATEGORY_MULTIPLIER`. | Tidak selaras. `INACTIVE` tidak diterima tipe frontend; action backend yang dicontohkan tidak termasuk union frontend. Backend juga mencantumkan filter `status` tetapi tidak `search`, sementara frontend service mendukung keduanya. Tetapkan enum/action dan aturan kompatibilitas kondisi JSON sebelum integrasi. |
| Vouchers | Endpoint utama cocok. Inventory filter backend mencantumkan `AVAILABLE`, `CLAIMED`, `REVOKED`; upload menerima CSV/TXT satu kode per baris. | Enum juga mencakup `RESERVED`; UI menampilkan filter `RESERVED`; service menerima `status`, tetapi UI memfilter lokal. Upload mengirim multipart field `file`. | Tambahkan/tolak status `RESERVED` secara eksplisit di kontrak backend. Proses upload sebaiknya mendokumentasikan validasi file, encoding, baris invalid, dan hasil parsial. Revoke backend langsung memutasi, sedangkan frontend UI belum memanggil service revoke. |
| Campaigns | Contoh `campaign_type`: `SPEND_TARGET` atau `TRANSACTION_COUNT`; target: `ACCUMULATIVE_SPEND`; reward: `VOUCHER`; status mencakup `CANCELLED`. | `CampaignType`: `MISSION`, `STREAK`, `BADGE`, `REFERRAL`; `TargetType`: `TRANSACTION_COUNT`, `SPEND_AMOUNT`, `CATEGORY_DIVERSITY`, `CONSECUTIVE_DAYS`; `RewardType`: `BONUS_POINTS`, `VOUCHER_ISSUE`; status mencakup `PAUSED`, `EXPIRED`, bukan `CANCELLED`. | Konflik enum besar. Contoh backend juga mengisi `campaign_type` dengan tipe target (mis. `TRANSACTION_COUNT`), padahal frontend memisahkan campaign type dan target type. Buat enum resmi + contoh valid yang cocok dengan model frontend, dan tentukan transisi status. |
| Partners | Endpoint/payload inti cocok. Backend menyebut pagination di respons tetapi tidak menyatakan query pagination pada daftar partner. | UI/service memanggil `GET /partners` tanpa query; service update partner tersedia tetapi UI tidak memakainya. | Jelaskan default pagination/limit, dan dukung tanpa query atau wajibkan parameter. Update belum bagian dari alur layar aktif. |
| Settlement | Endpoint dan nama query cocok. Format periode backend berupa `YYYY-MM-DD`; parameter ditandai opsional kecuali `partner_id`. | Tanggal service menerima string ISO datetime (`...T00:00:00Z`); UI memakai rentang tanggal tetap Oktober 2026. | Sepakati tanggal saja atau RFC3339 datetime, timezone, inclusivity batas akhir, validasi rentang, serta perilaku bila tanggal tidak dikirim. Mock saat ini tidak memfilter periode. |
| Maker-Checker | Backend mensyaratkan checker berbeda dari maker. Approve merespons `data: { status, action_id, executed_at, message }`; reject memerlukan alasan. | Tipe `ApproveActionResponse` menaruh field tersebut di level top-level; UI memakai prompt/confirm dan memanggil endpoint. | Envelope approval tidak sesuai tipe service frontend. UI tidak memverifikasi role/identitas checker (otorisasi harus ditegakkan server). Mock tidak menolak self-approval. Perlu definisi state transition, aksi yang bisa di-approve, retry/idempotency, dan response konflik untuk action yang sudah diproses. |
| Dashboard | Endpoint dan field data utama sesuai. | `GET /dashboard/transaction-feed` mengirim page/limit `1/10`; chart service tidak mengirim query. | Sesuai pada contoh. Definisikan apakah feed benar-benar real-time/polling (UI hanya fetch saat mount) dan apakah chart perlu periode/granularity. |
| Audit logs | Backend menyatakan semua mutasi dicatat dan endpoint mendukung filter/paginasi. | Kontrak data cocok; UI meminta daftar tanpa parameter, service mendukung filter. | Dokumen belum menetapkan event/action yang wajib dicatat, retensi/urutan, serta apakah kegagalan downstream ikut diaudit. |
| Admin users | Path dan payload `GET/POST/PUT /users` sesuai. | UI memakai list/create; service memiliki update; mock hanya mengimplementasikan list. | Endpoint ada di dokumen backend. Update belum UI; mock tidak dapat menguji create/update. Perjelas validasi uniqueness, reset/credential policy, dan transisi status. |

## Keselarasan proses end-to-end

### Selaras secara konsep

- Login → Bearer token → refresh/logout memiliki rute dan bentuk data inti yang sejalan.
- Daftar/detail member, perubahan status, ledger, tiers, CRUD rule, upload/inventory voucher, campaign, partner, settlement, audit, serta admin users memiliki endpoint pasangan pada dokumentasi backend.
- Manual point adjustment dirancang masuk pending queue; checker menyetujui/menolak. Ini sejalan dengan konsep dual-control frontend.
- Dashboard summary/feed/chart menyediakan data yang dibutuhkan layar dashboard.

### Belum selaras atau hanya sebagian diimplementasikan

1. **Bentuk data tidak bisa langsung dikonsumsi.** Envelope/pagination/error backend berbeda dari frontend pada tingkat dasar.
2. **UI tidak memiliki alur edit/status untuk Campaign dan Partner**, meski service frontend dan endpoint backend menyediakan update.
3. **Admin user update** juga hanya tersedia pada service/backend, bukan layar yang aktif.
4. **Revoke voucher** adalah gap proses utama: tombol inventory/batch hanya menampilkan `prompt`/`alert`; tidak memanggil `voucherService.revokeVouchers`. Backend mendokumentasikan revoke langsung, bukan pending action Maker-Checker.
5. **Penyesuaian status member** dijalankan langsung lewat `PATCH`; dokumentasi backend tidak menyebut Maker-Checker untuk perubahan ini. Ini tidak bertentangan dengan alur UI yang ada, tetapi perlu dikonfirmasi sebagai kebijakan risiko.
6. **Hak akses:** frontend menyembunyikan menu dan melakukan guard berdasarkan `ROLE_PERMISSIONS` lokal. Backend menyebut RBAC dan pembatasan `SUPER_ADMIN` untuk users, tetapi tidak menyediakan matriks permission per endpoint/role. Menu tersembunyi bukan kontrol keamanan; backend wajib mengotorisasi setiap request.
7. **Maker-Checker:** UI menyediakan tombol approval berdasarkan status `PENDING`; backend harus menolak maker yang menyetujui aksinya sendiri dan aksi yang sudah resolved. Ini belum ditegakkan dalam mock dan tidak ada bukti source backend pada workspace ini.
8. **Fetch/error lifecycle:** banyak halaman/store tidak menangkap error selain `finally`; kegagalan selain login tidak ditampilkan dalam UI. Kontrak error terstruktur saja belum cukup tanpa handling frontend atau notifikasi yang sesuai.
9. **Filter/pagination UI:** beberapa query service ada tetapi UI saat ini tidak mengirimnya atau melakukan filter lokal. Backend tetap harus memberi default yang jelas dan konsisten, serta tidak mengasumsikan seluruh data dapat dikirim sekaligus.

## Kekurangan dokumentasi backend yang disarankan untuk ditutup

1. Tetapkan schema envelope tunggal untuk sukses, paginasi, dan error; sertakan `timestamp` dan contoh semua varian.
2. Tambahkan tabel kontrak per endpoint berisi field wajib/opsional, tipe, enum, format tanggal/timezone, batas panjang/range, nullable, dan contoh respons error.
3. Tetapkan enum resmi dan transisi lifecycle untuk member, rule, campaign, voucher inventory, admin, dan pending action. Perbaiki contoh Campaign/Rule agar valid terhadap enum tersebut.
4. Tetapkan path adjustment yang kanonis; hilangkan wording “atau” agar implementasi client/server tidak bercabang.
5. Jelaskan kebijakan RBAC per method/endpoint, termasuk aturan maker != checker dan batasan self-approval di sisi server.
6. Dokumentasikan error business-level: duplikasi code, invalid transition, tier masih digunakan, stok tidak cukup, action sudah resolved, file salah/parsial, dan downstream ledger gagal. Sertakan status HTTP serta kode stabil yang bisa ditangani client.
7. Jelaskan idempotency/retry untuk mutasi finansial, adjustment, approve/reject, upload dan revoke; sebutkan kunci idempotensi dan perilaku request duplikat.
8. Definisikan pagination/default sort/filter, termasuk default limit dan maksimum, pada endpoint yang saat ini tidak menyatakan query.
9. Untuk upload voucher, definisikan limit ukuran/tipe file, format baris, deduplikasi, validasi, serta bentuk laporan sukses parsial/error per baris.
10. Lengkapi operasi UI yang belum tersambung atau tandai eksplisit belum tersedia: revoke voucher, update Campaign/Partner/Admin User, serta filter audit dan transaksi.
11. Dokumentasikan audit trail yang diwajibkan: aksi yang dicatat, payload sensitif yang harus di-redact, aktor, target, waktu, hasil, dan retensi.

## Rekomendasi urutan tindak lanjut

1. **Sebelum integrasi:** sepakati dan selaraskan envelope, pagination, error shape, serta enum Campaign/Rule.
2. **Sebelum go-live:** validasi RBAC server-side, self-approval prevention, lifecycle pending action, idempotency, dan audit trail.
3. **Sebelum uji penerimaan UI:** tambahkan penanganan error untuk semua menu; hubungkan/ubah UX untuk revoke dan aksi lain yang saat ini hanya alert.
4. **Integrasi kontrak:** jalankan contract test terhadap backend nyata untuk tiap endpoint, termasuk error 400/401/403/404/409/5xx dan payload boundary. Mock MSW perlu dibuat mengikuti kontrak yang disepakati, bukan menjadi sumber kebenaran yang berbeda.

## Penilaian akhir

**Keselarasan endpoint: cukup tinggi. Keselarasan kontrak dan perilaku: rendah–sedang.** Jalur utama tersedia pada kedua dokumen, tetapi saat ini tidak aman menganggap frontend dapat langsung memakai backend hanya dengan mengganti base URL. Format response/pagination harus diselaraskan terlebih dahulu; enum Campaign/Rule, penanganan error, RBAC, dan proses revoke/Maker-Checker perlu diputuskan serta diuji bersama.
