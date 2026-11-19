# Dokumentasi API BackOffice per Menu

Dokumen ini mencatat API yang didefinisikan oleh service aplikasi, kontrak TypeScript, dan perilaku mock MSW yang tersedia. Endpoint ditulis relatif terhadap base URL.

> **Catatan status:** ini adalah dokumentasi implementasi frontend saat ini, bukan pengganti spesifikasi backend. Perbedaan antara kontrak, service, UI, dan mock disebutkan secara eksplisit di bagian terkait.

## Konfigurasi dan format umum

- Base URL default: `/api/v1/admin` (`VITE_API_BASE_URL` dapat menggantinya).
- JSON request menggunakan `Content-Type: application/json`.
- Axios timeout: 30 detik.
- Token dikirim sebagai `Authorization: Bearer <access_token>` jika tersedia.
- Envelop respons standar:

```ts
interface ApiResponse<T> {
  status: 'SUCCESS' | 'ERROR';
  data: T;
  message?: string;
  timestamp: string; // ISO-8601
}

interface PaginatedResponse<T> {
  status: 'SUCCESS' | 'ERROR';
  data: T[];
  pagination: {
    page: number;       // 1-based
    limit: number;
    total_items: number;
    total_pages: number;
  };
  timestamp: string;
}

interface ErrorResponse {
  status: 'ERROR';
  error_code: string;
  message: string;
  details?: Record<string, string[]>;
  timestamp: string;
}
```

`ErrorResponse` merupakan kontrak umum yang didefinisikan frontend. Tidak semua respons error dari mock mengikuti bentuk ini.

### Enum yang dipakai dalam payload

| Nama | Nilai |
|---|---|
| `AdminRole` | `SUPER_ADMIN`, `CAMPAIGN_SPEC`, `OPS_CS`, `FINANCE` |
| `AdminStatus` | `ACTIVE`, `SUSPENDED`, `INACTIVE` |
| `MemberStatus` | `PENDING`, `ACTIVE`, `SUSPENDED`, `DORMANT`, `TERMINATED` |
| `LedgerType` | `EARN`, `REDEEM`, `EXPIRATION`, `ADJUSTMENT_CREDIT`, `ADJUSTMENT_DEBIT` |
| `QualificationType` | `SPEND`, `VISITS`, `POINTS` |
| `RuleStatus` | `DRAFT`, `ACTIVE`, `PAUSED`, `EXPIRED` |
| `ConditionOperator` | `EQUALS`, `NOT_EQUALS`, `GREATER_THAN`, `LESS_THAN`, `BETWEEN`, `IN`, `NOT_IN`, `CONTAINS` |
| `RuleActionType` | `APPLY_CAMPAIGN_MULTIPLIER`, `APPLY_BONUS_POINTS`, `APPLY_CATEGORY_MULTIPLIER` |
| `VoucherStatus` | `AVAILABLE`, `RESERVED`, `CLAIMED`, `REVOKED` |
| `CampaignType` | `MISSION`, `STREAK`, `BADGE`, `REFERRAL` |
| `CampaignStatus` | `DRAFT`, `ACTIVE`, `PAUSED`, `COMPLETED`, `EXPIRED` |
| `TargetType` | `TRANSACTION_COUNT`, `SPEND_AMOUNT`, `CATEGORY_DIVERSITY`, `CONSECUTIVE_DAYS` |
| `RewardType` | `BONUS_POINTS`, `VOUCHER_ISSUE` |
| `PendingActionStatus` | `PENDING`, `APPROVED`, `REJECTED` |

## Menu dan endpoint

### 1. Login / sesi admin

Route UI: `/login` (autentikasi); sesi dipakai di semua menu yang dilindungi.

| Method & endpoint | Request | Respons sukses |
|---|---|---|
| `POST /auth/login` | `LoginRequest` JSON | `ApiResponse<LoginResponse>` |
| `POST /auth/refresh` | `{ refresh_token: string }` | `ApiResponse<RefreshTokenResponse>` menurut kontrak |
| `POST /auth/logout` | Tidak ada body | Service tidak memakai body respons (`Promise<void>`) |
| `GET /auth/me` | Tidak ada body; Bearer token | `ApiResponse<MeResponse>` |

```ts
interface LoginRequest { username: string; password: string }
interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number; // detik
  admin: {
    id: string; username: string; email: string;
    role: AdminRole; status: AdminStatus;
  };
}
interface RefreshTokenResponse {
  access_token: string; refresh_token: string;
  token_type: string; expires_in: number;
}
interface MeResponse {
  id: string; username: string; email: string;
  role: AdminRole; status: AdminStatus;
  permissions: string[]; created_at: string; updated_at: string;
}
```

`POST /auth/refresh` juga dipanggil otomatis oleh interceptor saat request lain menerima HTTP 401 (kecuali request login). Jika refresh gagal atau refresh token tidak tersedia, access/refresh token dihapus dan browser diarahkan ke `/login`. Request asli tidak dicoba ulang lebih dari sekali.

### 2. Dashboard

Route UI: `/`.

| Method & endpoint | Query | Respons |
|---|---|---|
| `GET /dashboard/summary` | — | `ApiResponse<DashboardSummary>` |
| `GET /dashboard/transaction-feed` | `page`, `limit`; UI meminta `page=1&limit=10` | `PaginatedResponse<PointLedgerEntry>` |
| `GET /dashboard/charts/earning-trend` | Service tidak mengirim query | `ApiResponse<ChartDataPoint[]>` |

`DashboardSummary` berisi:

- `members`: `total_registered`, `active_30d`, `active_60d`, `active_90d`, `new_today`.
- `points`: `total_circulating`, `earned_today`, `redeemed_today`, `expired_today`.
- `vouchers`: `total_active_batches`, `total_available_stock`, `claimed_today`.
- `campaigns`: `total_active`, `total_participants`, `completions_today`.

`PointLedgerEntry`: `id`, `member_id`, `type: LedgerType`, `amount`, `balance_after`, `reference_id`, `idempotency_key`, `created_at`.

`ChartDataPoint`: `date`, `total_earned`, `total_redeemed`, `total_expired`.
Kontrak juga mendefinisikan `ChartParams` (`period: '7d' | '30d' | '90d'`, `granularity: 'daily' | 'weekly'`), tetapi service dan UI saat ini tidak mengirimkannya.

### 3. Members & Balance

Route UI: `/members` dan `/members/:id`.

| Method & endpoint | Query/body | Respons |
|---|---|---|
| `GET /members` | Query: `page`, `limit`, `search?`, `status?`, `tier_id?` | `PaginatedResponse<MemberListItem>` |
| `GET /members/:id` | `id` path | `ApiResponse<MemberDetail>` |
| `PATCH /members/:id/status` | `UpdateMemberStatusRequest` | `ApiResponse<UpdateMemberStatusResponse>` |
| `POST /members/:id/adjustments` | `PointAdjustmentRequest` | Dideklarasikan service sebagai `PointAdjustmentResponse`; perbedaan format dijelaskan di bawah |
| `GET /members/:id/transactions` | Query opsional: `page`, `limit`, `type?`, `start_date?`, `end_date?` | `PaginatedResponse<PointLedgerEntry>` |

```ts
interface UpdateMemberStatusRequest { status: MemberStatus; reason: string }
interface UpdateMemberStatusResponse {
  member_id: string; previous_status: MemberStatus; new_status: MemberStatus;
  updated_by: string; updated_at: string;
}
interface PointAdjustmentRequest {
  adjustment_type: 'CREDIT' | 'DEBIT';
  amount: number;
  reason_code: string;
  notes: string;
  external_ticket_ref: string;
}
interface PointAdjustmentResponse {
  status: 'PENDING_APPROVAL';
  action_id: string;
  requires_checker: boolean;
  maker_id: string;
}
```

`MemberListItem`: `id`, `account_number`, `full_name`, `phone`, `email`, `current_tier { id, tier_name, rank }`, `balance { total_points, locked_points, expiring_points }`, `status`, `created_at`, `updated_at`.

`MemberDetail` menambahkan `lifetime_earned`, `lifetime_redeemed`, `tier_qualifying_points`, `tier_evaluation_date`, `linked_accounts[]` (`id`, `account_type`, `account_identifier`, `linked_at`) dan `recent_transactions[]`.

Perbedaan implementasi: URL adjustment yang dipanggil service adalah `/adjustments`, sedangkan komentar kontrak menyebut `/points/adjust`. Mock membalas HTTP 202 dengan `{ status: 'PENDING_APPROVAL', data: { action_id, requires_checker, maker_id }, message, timestamp }`, sementara tipe respons service mendeklarasikan properti `action_id`, `requires_checker`, `maker_id` pada level atas. Halaman detail menggunakan `recent_transactions` dari `GET /members/:id`; service `GET /members/:id/transactions` tersedia namun tidak dipanggil oleh halaman tersebut.

### 4. Tier & Multiplier

Route UI: `/tiers`.

| Method & endpoint | Request | Respons |
|---|---|---|
| `GET /tiers` | — | `ApiResponse<TierDefinition[]>` |
| `POST /tiers` | `CreateTierRequest` | `ApiResponse<TierDefinition>` |
| `PUT /tiers/:id` | `UpdateTierRequest` (sama dengan create) | `ApiResponse<TierDefinition>` |
| `DELETE /tiers/:id` | `id` path | `ApiResponse<{ message: string }>` |

```ts
interface TierPerk {
  perk_code: string; perk_name: string; description: string; is_active: boolean;
}
interface CreateTierRequest {
  tier_name: string; rank: number; qualification_type: QualificationType;
  min_threshold: number; multiplier: number; perks_config?: TierPerk[];
}
```

`TierDefinition` adalah request ditambah `id`, `perks_config: TierPerk[] | null`, `member_count?`, `created_at`, dan `updated_at`.

### 5. Earning Rules

Route UI: `/rules` dan `/rules/create`.

| Method & endpoint | Query/body | Respons |
|---|---|---|
| `GET /rules` | Query: `page`, `limit`, `status?`, `search?` | `PaginatedResponse<DynamicRule>` |
| `POST /rules` | `CreateRuleRequest` | `ApiResponse<{ rule_id: string; rule_code: string; state: string }>` |
| `PUT /rules/:id` | `UpdateRuleRequest` (sama dengan create) | `ApiResponse<DynamicRule>` |
| `PATCH /rules/:id/status` | `{ status: 'ACTIVE' | 'PAUSED' | 'DRAFT' }` | `ApiResponse<DynamicRule>` |
| `DELETE /rules/:id` | `id` path | `ApiResponse<{ message: string }>` |

```ts
interface RuleCondition {
  field: string;
  operator: ConditionOperator;
  value: string | number | boolean | (string | number)[];
}
interface RuleConditionGroup { and?: RuleCondition[]; or?: RuleCondition[] }
interface RuleAction {
  type: RuleActionType;
  multiplier_factor?: number;
  bonus_points?: number;
  max_points_cap?: number;
}
interface CreateRuleRequest {
  rule_code: string; rule_name: string; priority: number;
  start_time: string; end_time: string;
  conditions_json: RuleConditionGroup; action_json: RuleAction;
}
```

`DynamicRule` menambahkan `id`, `status: RuleStatus`, `created_by`, `created_at`, `updated_at` ke field request.

### 6. Vouchers & Inventory

Route UI: `/vouchers` dan `/vouchers/:id`.

| Method & endpoint | Query/body | Respons |
|---|---|---|
| `GET /voucher-batches` | Query: `page`, `limit`, `search?` | `PaginatedResponse<VoucherBatch>` |
| `POST /voucher-batches` | `CreateVoucherBatchRequest` | `ApiResponse<VoucherBatch>` |
| `POST /voucher-batches/:id/upload-codes` | `multipart/form-data`, field file bernama `file` | `ApiResponse<UploadCodesResponse>` |
| `GET /voucher-batches/:id/inventory` | Query opsional: `page`, `limit`, `status?` | `PaginatedResponse<VoucherInventoryItem>` |
| `POST /voucher-batches/:id/revoke` | `RevokeVouchersRequest` | Service bertipe `ApiResponse<unknown>` |

```ts
interface CreateVoucherBatchRequest {
  batch_code: string; title: string; description?: string;
  partner_brand?: string; monetary_value?: number; points_cost: number;
  terms_conditions?: string;
}
interface UploadCodesResponse {
  batch_id: string; codes_imported: number; duplicates_skipped: number;
  new_total_stock: number; new_available_stock: number;
}
interface VoucherInventoryItem {
  id: string; batch_id: string; voucher_code: string; status: VoucherStatus;
  claimed_by?: string; claimed_at?: string;
}
interface RevokeVouchersRequest { voucher_ids: string[]; reason: string }
```

`VoucherBatch` memuat `id`, `batch_code`, `title`, `description?`, `partner_brand?`, `monetary_value?`, `points_cost`, `terms_conditions?`, `total_stock`, `available_stock`, `claimed_stock`, `revoked_count`, `status: 'ACTIVE' | 'INACTIVE' | 'DEPLETED'`, `created_at`.

Perbedaan implementasi: komentar pada kontrak voucher menyebut `/vouchers/batches...`, tetapi service memakai `/voucher-batches...` seperti di atas. UI saat ini menampilkan filter status inventory di sisi client; filter `status` tidak dikirim saat fetch. Tombol revoke batch dan kode hanya menampilkan prompt/alert dan belum memanggil `revokeVouchers`; handler mock untuk endpoint revoke juga belum tersedia. Mock upload tidak membaca isi file dan selalu mensimulasikan 50 kode berhasil diimpor.

### 7. Campaigns & Missions

Route UI: `/campaigns`.

| Method & endpoint | Query/body | Respons |
|---|---|---|
| `GET /campaigns` | Query opsional: `page`, `limit`, `status?`, `search?` | `PaginatedResponse<Campaign>` |
| `POST /campaigns` | `CreateCampaignRequest` | `ApiResponse<Campaign>` |
| `PUT /campaigns/:id` | `UpdateCampaignRequest` (sama dengan create) | `ApiResponse<Campaign>` |
| `PATCH /campaigns/:id/status` | `{ status: 'ACTIVE' | 'PAUSED' | 'DRAFT' }` | `ApiResponse<Campaign>` |

```ts
interface TargetCriteria {
  target_type: TargetType; target_value: number;
  category_filters?: string[]; time_window_days?: number;
}
interface RewardDefinition {
  reward_type: RewardType; bonus_points?: number; voucher_batch_code?: string;
}
interface CreateCampaignRequest {
  campaign_code: string; title: string; description: string; banner_url?: string;
  campaign_type: CampaignType; start_date: string; end_date: string;
  target_criteria: TargetCriteria; reward_definition: RewardDefinition;
}
```

`Campaign` menambahkan `id`, `status: CampaignStatus`, `participant_count?`, `completion_count?`, `created_by`, `created_at`, `updated_at`.

UI saat ini hanya memanggil list dan create. Form mengisi `start_date` sebagai waktu saat ini dan `end_date` 30 hari kemudian; `target_criteria.target_type` di-hardcode ke `TRANSACTION_COUNT`, reward ke `BONUS_POINTS`. Service update/status telah tersedia, tetapi belum dipanggil oleh UI dan belum memiliki handler pada MSW.

### 8. Partner Coalition

Route UI: `/partners`.

| Method & endpoint | Query/body | Respons |
|---|---|---|
| `GET /partners` | — | `PaginatedResponse<PartnerMerchant>` |
| `POST /partners` | `CreatePartnerRequest` | `ApiResponse<PartnerMerchant>` |
| `PUT /partners/:id` | `UpdatePartnerRequest` (sama dengan create) | `ApiResponse<PartnerMerchant>` |

```ts
interface CreatePartnerRequest {
  merchant_code: string; merchant_name: string;
  contact_email: string; contact_phone: string;
  par_value_per_point: number; commission_rate: number;
  settlement_currency: string; contract_start_date: string;
  contract_end_date?: string;
}
```

`PartnerMerchant` menambahkan `id`, `status: 'ACTIVE' | 'SUSPENDED' | 'TERMINATED'`, `created_at`, `updated_at`.
`commission_rate` berupa desimal (contoh `0.05` = 5%).

UI saat ini memakai list/create. Service update tersedia namun belum dipakai UI dan mock tidak memiliki handler update.

### 9. Clearing & Settlement

Route UI: `/partners/settlement`.

| Method & endpoint | Query | Respons |
|---|---|---|
| `GET /partners/settlement-report` | `partner_id`, `period_start`, `period_end` | `ApiResponse<SettlementReport>` |

```ts
interface SettlementReportParams {
  partner_id: string; period_start: string; period_end: string;
}
interface SettlementReport {
  partner: { id: string; merchant_name: string; merchant_code: string };
  period: { start: string; end: string };
  summary: {
    total_points_redeemed: number; par_value_per_point: number;
    gross_liability: number; commission_rate: number;
    platform_commission: number; net_payable_to_partner: number;
  };
  transactions: Array<{
    transaction_id: string; member_id: string; points_redeemed: number;
    monetary_value: number; redeemed_at: string;
  }>;
}
```

UI mengirim periode tetap `2026-10-01T00:00:00Z` hingga `2026-10-31T23:59:59Z`; pilihan partner menentukan `partner_id`. Ekspor CSV dibuat di browser, tidak memanggil endpoint tambahan. Mock menggunakan data report yang tersedia dan tidak menerapkan filter periode.

### 10. Approvals (Maker-Checker)

Route UI: `/approvals`.

| Method & endpoint | Query/body | Respons |
|---|---|---|
| `GET /pending-actions` | Query opsional pada service: `page`, `limit`, `status?`; UI tidak mengirim parameter | `PaginatedResponse<PendingAction>` |
| `POST /pending-actions/:id/approve` | Tidak ada body | Service bertipe `ApproveActionResponse` |
| `POST /pending-actions/:id/reject` | `{ rejection_reason: string }` | `ApiResponse<unknown>` |

```ts
interface PendingAction {
  id: string;
  maker: { id: string; username: string; role: AdminRole };
  checker?: { id: string; username: string };
  action_type: string; target_resource: string;
  payload: Record<string, unknown>; status: PendingActionStatus;
  rejection_reason?: string; created_at: string; resolved_at?: string;
}
interface ApproveActionResponse {
  status: 'APPROVED'; action_id: string; executed_at: string; message: string;
}
interface RejectActionRequest { rejection_reason: string }
```

Perbedaan implementasi: mock approval mengembalikan `{ status: 'APPROVED', data: { action_id, executed_at }, message, timestamp }`, tetapi service/tipe respons mengharapkan `action_id` dan `executed_at` di level atas.

### 11. Audit Trail Logs

Route UI: `/audit-logs`.

| Method & endpoint | Query | Respons |
|---|---|---|
| `GET /audit-logs` | Service mendukung `page`, `limit`, `admin_id?`, `action?`, `start_date?`, `end_date?`; UI tidak mengirim parameter | `PaginatedResponse<AuditLogEntry>` |

`AuditLogEntry`:

```ts
interface AuditLogEntry {
  id: string;
  admin: { id: string; username: string; role: AdminRole };
  action: string; target_resource: string;
  old_value?: Record<string, unknown>;
  new_value?: Record<string, unknown>;
  ip_address: string; created_at: string;
}
```

Tidak ada operasi mutasi audit log pada UI.

### 12. Admin RBAC Users

Route UI: `/settings/users`.

| Method & endpoint | Query/body | Respons |
|---|---|---|
| `GET /users` | — | Service: `PaginatedResponse<AdminUser>` |
| `POST /users` | `CreateAdminUserRequest` | `ApiResponse<AdminUser>` |
| `PUT /users/:id` | `UpdateAdminUserRequest` | `ApiResponse<AdminUser>` |

```ts
interface AdminUser {
  id: string; username: string; email: string; role: AdminRole;
  status: AdminStatus; created_at: string; updated_at: string;
}
interface CreateAdminUserRequest {
  username: string; email: string; password: string; role: AdminRole;
}
interface UpdateAdminUserRequest {
  email?: string; role?: AdminRole; status?: AdminStatus;
}
```

Kontrak memberi komentar endpoint `/admin-users`, tetapi service dan UI menggunakan `/users`. UI hanya memakai `GET /users` dan `POST /users`; mock hanya mengimplementasikan `GET /users`, sehingga create/update tidak dapat dites melalui mock saat ini.

## Penanganan error yang ada di aplikasi

### Penanganan global

1. Axios meneruskan error HTTP sebagai rejected promise; interceptor hanya memiliki alur khusus untuk HTTP 401 (refresh satu kali selain endpoint login).
2. Bila refresh gagal, token lokal dibersihkan dan browser diarahkan ke `/login`.
3. Store menu umumnya memakai `finally` untuk mengembalikan `isLoading`, lalu membiarkan error tetap reject. Tidak ada parser global yang mengubah error menjadi `ErrorResponse` atau notification.
4. Login menangkap error: pesan `response.data.message` disimpan ke `authStore.error`; jika tidak ada, UI menampilkan `Login failed. Please check credentials.` Halaman Login menampilkan pesan tersebut.
5. `fetchCurrentUser()` dan `logout()` mengabaikan error. Logout tetap membersihkan token di `finally`.
6. Pada menu selain login, UI tidak menyediakan tampilan error konsisten. Form submit/aksi menunggu request dan hanya menampilkan alert sukses setelah berhasil; jika gagal, handler tidak menangkap error sehingga tidak menampilkan error terformat.

### Error dari handler mock yang terdefinisi

| API | Status | Isi error mock |
|---|---:|---|
| `POST /auth/login` dengan kredensial tidak valid | 401 | `error_code: INVALID_CREDENTIALS`, pesan kredensial tidak benar, `timestamp` |
| `GET /members/:id` jika tidak ditemukan | 404 | `error_code: NOT_FOUND`, pesan `Member tidak ditemukan`, `timestamp` |
| `PATCH /members/:id/status` jika tidak ditemukan | 404 | `status: ERROR`, pesan `Member not found` |
| `PUT /tiers/:id` jika tidak ditemukan | 404 | `status: ERROR`, pesan `Tier not found` |
| `PUT /rules/:id` atau `PATCH /rules/:id/status` jika tidak ditemukan | 404 | `status: ERROR`, pesan `Rule not found` |
| `POST /voucher-batches/:id/upload-codes` jika batch tidak ditemukan | 404 | `status: ERROR`, pesan `Batch not found` |
| `POST /pending-actions/:id/approve` atau `/reject` jika action tidak ditemukan | 404 | `status: ERROR`, pesan `Action not found` |

Selain error login dan `GET /members/:id`, mock di atas umumnya tidak menyertakan `error_code` maupun `timestamp`; jadi bentuknya belum seragam dengan `ErrorResponse`. Endpoint mock yang tidak disebut dalam tabel tidak memiliki skenario error eksplisit.

## Sumber implementasi

- Daftar route/menu dan permission: `src/router/index.ts`, `src/components/common/AppSidebar.vue`.
- Axios, base URL, dan interceptor: `src/api/client.ts`, `src/utils/constants.ts`.
- Service endpoint: `src/api/services/*.ts`.
- Bentuk request/response dan enum: `src/api/contracts/*.contract.ts`, `src/types/enums.ts`.
- Perilaku lokal mock: `src/mocks/handlers/index.ts`.
- Call site, payload form, dan penanganan UI: `src/views/**/*.vue`, `src/stores/*.ts`.
