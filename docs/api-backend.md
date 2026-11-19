# Dokumentasi API Backoffice Service (Golang)

Dokumentasi lengkap REST API untuk **Loyalty Platform BackOffice Service**. Dokumen ini mencakup seluruh endpoint, struktur header, query parameter, request payload, response payload (mengacu pada format standard response), serta kode status HTTP.

---

## 📌 Informasi Umum

- **Base URL:** `http://localhost:8080/api/v1/admin`
- **Format Pertukaran Data:** `application/json` (kecuali file upload: `multipart/form-data`)
- **Skema Autentikasi:** Bearer Token (JWT Access Token)
- **Header Standar:**
  ```http
  Authorization: Bearer <access_token>
  Content-Type: application/json
  Accept: application/json
  ```

---

## 📦 Struktur Response Standar

Semua endpoint menghasilkan response seragam menggunakan struktur berikut:

### 1. Response Sukses (Tanpa Paginasi)
```json
{
  "success": true,
  "data": { ... }
}
```

### 2. Response Sukses (Dengan Paginasi)
```json
{
  "success": true,
  "data": [ ... ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "total_pages": 8
  }
}
```

### 3. Response Gagal / Error
```json
{
  "success": false,
  "error": {
    "code": "BAD_REQUEST",
    "message": "Deskripsi pesan error secara detail"
  }
}
```

#### Daftar Kode Error Standar:
| HTTP Status | Error Code | Keterangan |
|---|---|---|
| `400` | `BAD_REQUEST` | Payload tidak valid, validasi JSON Schema gagal |
| `401` | `UNAUTHORIZED` | Token tidak ada, kadaluarsa, atau kredensial salah |
| `403` | `FORBIDDEN` | Akses ditolak oleh RBAC atau maker mencoba mengeksekusi checker |
| `404` | `NOT_FOUND` | Data / Resource yang diminta tidak ditemukan |
| `500` | `INTERNAL_ERROR` | Kesalahan sistem internal pada database / server |

---

## 📑 Daftar Modul API

1. [Sistem & Health Check](#1-sistem--health-check)
2. [Autentikasi (Auth)](#2-autentikasi-auth)
3. [Manajemen Member (Members)](#3-manajemen-member-members)
4. [Manajemen Tier (Tiers)](#4-manajemen-tier-tiers)
5. [Aturan Perolehan Poin Dinamis (Earning Rules)](#5-aturan-perolehan-poin-dinamis-earning-rules)
6. [Katalog & Inventaris Voucher (Voucher Batches)](#6-katalog--inventaris-voucher-voucher-batches)
7. [Manajemen Kampanye (Campaigns)](#7-manajemen-kampanye-campaigns)
8. [Partner Merchant & Settlement](#8-partner-merchant--settlement)
9. [Maker-Checker (Dual-Control Approval)](#9-maker-checker-dual-control-approval)
10. [Dashboard & Monitoring](#10-dashboard--monitoring)
11. [Manajemen Admin User](#11-manajemen-admin-user)

---

## 1. Sistem & Health Check

### 1.1 Health Check
Mengecek status kesehatan service backoffice.

- **Method:** `GET`
- **URL:** `/health` *(Root URL, tanpa `/api/v1/admin`)*
- **Autentikasi:** Tidak Perlu (Public)
- **Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "service": "backoffice-service"
  }
}
```

---

## 2. Autentikasi (Auth)

### 2.1 Admin Login
Autentikasi kredensial administrator dan mendapatkan JWT access token & refresh token.

- **Method:** `POST`
- **URL:** `/api/v1/admin/auth/login`
- **Autentikasi:** Public
- **Request Body:**
```json
{
  "username": "superadmin",
  "password": "password123"
}
```
- **Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "d7a8b9c0-1234-5678-abcd-ef0123456789",
    "token_type": "Bearer",
    "expires_in": 3600,
    "admin": {
      "id": "a0000000-0000-0000-0000-000000000001",
      "username": "superadmin",
      "email": "admin@loyalty.local",
      "role": "SUPER_ADMIN",
      "status": "ACTIVE"
    }
  }
}
```

### 2.2 Refresh Access Token
Memperpanjang access token menggunakan refresh token yang masih valid.

- **Method:** `POST`
- **URL:** `/api/v1/admin/auth/refresh`
- **Autentikasi:** Public
- **Request Body:**
```json
{
  "refresh_token": "d7a8b9c0-1234-5678-abcd-ef0123456789"
}
```
- **Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "e8b9c0d1-2345-6789-bcde-f01234567890",
    "token_type": "Bearer",
    "expires_in": 3600
  }
}
```

### 2.3 Logout
Mengakhiri sesi admin.

- **Method:** `POST`
- **URL:** `/api/v1/admin/auth/logout`
- **Autentikasi:** Bearer Token
- **Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "message": "Successfully logged out"
  }
}
```

### 2.4 Get Current Admin Profile (`Me`)
Mengambil profil akun admin yang sedang login beserta izin hak aksesnya (RBAC).

- **Method:** `GET`
- **URL:** `/api/v1/admin/auth/me`
- **Autentikasi:** Bearer Token
- **Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "id": "a0000000-0000-0000-0000-000000000001",
    "username": "superadmin",
    "email": "admin@loyalty.local",
    "role": "SUPER_ADMIN",
    "status": "ACTIVE",
    "permissions": [
      "*"
    ],
    "created_at": "2026-11-09T08:00:00Z",
    "updated_at": "2026-11-09T10:30:00Z"
  }
}
```

---

## 3. Manajemen Member (Members)

### 3.1 Daftar Member (List Members)
Mengambil daftar member terdaftar dengan dukungan paginasi, pencarian, dan filter tier/status.

- **Method:** `GET`
- **URL:** `/api/v1/admin/members`
- **Autentikasi:** Bearer Token
- **Query Parameters:**
  - `page` (integer, default: 1)
  - `limit` (integer, default: 20, max: 100)
  - `search` (string, opsional - cari berdasarkan account_number / nama / email / hp)
  - `sort_by` (string, opsional - contoh: `created_at`)
  - `sort_dir` (string, opsional - `asc` | `desc`, default: `desc`)
  - `status` (string, opsional - `ACTIVE` | `SUSPENDED` | `TERMINATED`)
  - `tier_id` (UUID, opsional - filter berdasarkan ID Tier)
- **Response `200 OK`:**
```json
{
  "success": true,
  "data": [
    {
      "id": "e0000000-0000-0000-0000-000000000001",
      "account_number": "MBR-2024-0001",
      "full_name": "Member MBR-2024-0001",
      "phone": "+62811-0001",
      "email": "mbr-2024-0001@example.com",
      "current_tier": {
        "id": "b0000000-0000-0000-0000-000000000003",
        "tier_name": "Gold Tier",
        "rank": 3
      },
      "balance": {
        "total_points": 9500,
        "locked_points": 0,
        "expiring_points": 500
      },
      "status": "ACTIVE",
      "created_at": "2026-09-10T12:00:00Z",
      "updated_at": "2026-11-09T10:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "total_pages": 1
  }
}
```

### 3.2 Detail Member (Member Detail)
Mengambil informasi lengkap profil member, akumulasi poin seumur hidup, akun tertaut, dan transaksi terkini.

- **Method:** `GET`
- **URL:** `/api/v1/admin/members/:id`
- **Autentikasi:** Bearer Token
- **Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "id": "e0000000-0000-0000-0000-000000000001",
    "account_number": "MBR-2024-0001",
    "full_name": "Member MBR-2024-0001",
    "phone": "+62811-0001",
    "email": "mbr-2024-0001@example.com",
    "current_tier": {
      "id": "b0000000-0000-0000-0000-000000000003",
      "tier_name": "Gold Tier",
      "rank": 3
    },
    "balance": {
      "total_points": 9500,
      "locked_points": 0,
      "expiring_points": 500
    },
    "status": "ACTIVE",
    "lifetime_earned": 25000,
    "lifetime_redeemed": 15500,
    "tier_qualifying_points": 9500,
    "tier_evaluation_date": "2026-12-31T23:59:59Z",
    "linked_accounts": [
      {
        "id": "lnk-001",
        "account_type": "PHONE_NUMBER",
        "account_identifier": "+62811-0001",
        "linked_at": "2026-09-10T12:00:00Z"
      }
    ],
    "recent_transactions": [
      {
        "id": "tx-001",
        "member_id": "e0000000-0000-0000-0000-000000000001",
        "type": "EARN",
        "amount": 500,
        "balance_after": 9500,
        "reference_id": "INV-2026-1101",
        "idempotency_key": "idemp-001",
        "created_at": "2026-11-08T15:20:00Z"
      }
    ],
    "created_at": "2026-09-10T12:00:00Z",
    "updated_at": "2026-11-09T10:00:00Z"
  }
}
```

### 3.3 Update Status Member
Mengubah status operasional akun member (misalnya menangguhkan / mengaktifkan kembali akun).

- **Method:** `PATCH`
- **URL:** `/api/v1/admin/members/:id/status`
- **Autentikasi:** Bearer Token
- **Request Body:**
```json
{
  "status": "SUSPENDED",
  "reason": "Indikasi transaksi mencurigakan"
}
```
- **Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "member_id": "e0000000-0000-0000-0000-000000000001",
    "previous_status": "ACTIVE",
    "new_status": "SUSPENDED",
    "updated_by": "a0000000-0000-0000-0000-000000000001",
    "updated_at": "2026-11-10T11:00:00Z"
  }
}
```

### 3.4 Pengajuan Penyesuaian Poin (Point Adjustment)
Mengajukan penambahan (CREDIT) atau pemotongan (DEBIT) saldo poin member secara manual. Penyesuaian poin otomatis masuk ke antrian **Maker-Checker** untuk diverifikasi checker lain.

- **Method:** `POST`
- **URL:** `/api/v1/admin/members/:id/adjustments` *(atau `/api/v1/admin/members/:id/points/adjust`)*
- **Autentikasi:** Bearer Token
- **Request Body:**
```json
{
  "adjustment_type": "CREDIT",
  "amount": 1000,
  "reason_code": "CUSTOMER_COMPENSATION",
  "notes": "Kompensasi kendala sistem transaksi pada tanggal 8 Nov",
  "external_ticket_ref": "CS-TICKET-88910"
}
```
- **Response `202 Accepted`:**
```json
{
  "success": true,
  "data": {
    "status": "PENDING_APPROVAL",
    "action_id": "mka-90123456-789a-bcde-f012-3456789abcde",
    "requires_checker": true,
    "maker_id": "a0000000-0000-0000-0000-000000000001"
  }
}
```

### 3.5 Riwayat Transaksi Ledger Member
Mengambil buku besar (ledger) mutasi poin per member.

- **Method:** `GET`
- **URL:** `/api/v1/admin/members/:id/transactions`
- **Autentikasi:** Bearer Token
- **Query Parameters:**
  - `page` (integer, default: 1)
  - `limit` (integer, default: 20)
- **Response `200 OK`:**
```json
{
  "success": true,
  "data": [
    {
      "id": "tx-001",
      "member_id": "e0000000-0000-0000-0000-000000000001",
      "type": "EARN",
      "amount": 500,
      "balance_after": 9500,
      "reference_id": "INV-2026-1101",
      "idempotency_key": "idemp-001",
      "created_at": "2026-11-08T15:20:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "total_pages": 1
  }
}
```

---

## 4. Manajemen Tier (Tiers)

### 4.1 Daftar Tier (Get Tiers)
Mengambil seluruh konfigurasi tingkatan loyalitas yang ada.

- **Method:** `GET`
- **URL:** `/api/v1/admin/tiers`
- **Autentikasi:** Bearer Token
- **Response `200 OK`:**
```json
{
  "success": true,
  "data": [
    {
      "id": "b0000000-0000-0000-0000-000000000001",
      "tier_name": "Bronze Tier",
      "rank": 1,
      "qualification_type": "POINTS",
      "min_threshold": 0,
      "multiplier": 1.0,
      "perks_config": [
        {
          "perk_code": "WELCOME_GIFT",
          "perk_name": "Welcome Bonus",
          "description": "100 bonus points upon signup",
          "is_active": true
        }
      ],
      "member_count": 1420,
      "created_at": "2026-11-09T08:00:00Z",
      "updated_at": "2026-11-09T08:00:00Z"
    }
  ]
}
```

### 4.2 Tambah Tier Baru (Create Tier)
- **Method:** `POST`
- **URL:** `/api/v1/admin/tiers`
- **Autentikasi:** Bearer Token
- **Request Body:**
```json
{
  "tier_name": "Diamond Tier",
  "rank": 5,
  "qualification_type": "POINTS",
  "min_threshold": 50000,
  "multiplier": 2.5,
  "perks_config": [
    {
      "perk_code": "CONCIERGE_247",
      "perk_name": "24/7 Dedicated Concierge",
      "description": "Layanan asisten pribadi eksklusif 24 jam",
      "is_active": true
    }
  ]
}
```
- **Response `201 Created`:**
```json
{
  "success": true,
  "data": {
    "id": "b0000000-0000-0000-0000-000000000005",
    "tier_name": "Diamond Tier",
    "rank": 5,
    "qualification_type": "POINTS",
    "min_threshold": 50000,
    "multiplier": 2.5,
    "perks_config": [
      {
        "perk_code": "CONCIERGE_247",
        "perk_name": "24/7 Dedicated Concierge",
        "description": "Layanan asisten pribadi eksklusif 24 jam",
        "is_active": true
      }
    ],
    "member_count": 0,
    "created_at": "2026-11-10T11:15:00Z",
    "updated_at": "2026-11-10T11:15:00Z"
  }
}
```

### 4.3 Update Tier
- **Method:** `PUT`
- **URL:** `/api/v1/admin/tiers/:id`
- **Autentikasi:** Bearer Token
- **Request Body:** *(Sama dengan Create Tier Request)*
- **Response `200 OK`:** Objek data tier yang diperbarui.

### 4.4 Hapus Tier
- **Method:** `DELETE`
- **URL:** `/api/v1/admin/tiers/:id`
- **Autentikasi:** Bearer Token
- **Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "message": "Tier deleted successfully"
  }
}
```

---

## 5. Aturan Perolehan Poin Dinamis (Earning Rules)

Aturan perolehan poin menggunakan format logika kondisional JSON Schema Engine.

### 5.1 Daftar Aturan Earning (Get Rules)
- **Method:** `GET`
- **URL:** `/api/v1/admin/rules`
- **Autentikasi:** Bearer Token
- **Query Parameters:**
  - `page` (integer, default: 1)
  - `limit` (integer, default: 20)
  - `status` (string, opsional - `ACTIVE` | `INACTIVE`)
- **Response `200 OK`:**
```json
{
  "success": true,
  "data": [
    {
      "id": "d0000000-0000-0000-0000-000000000001",
      "rule_code": "RULE_BASE_FNB_1X",
      "rule_name": "Base F&B Earning Rule",
      "status": "ACTIVE",
      "priority": 10,
      "start_time": "2026-01-01T00:00:00Z",
      "end_time": "2026-12-31T23:59:59Z",
      "conditions_json": {
        "and": [
          {
            "field": "transaction.category",
            "operator": "EQUALS",
            "value": "F&B"
          },
          {
            "field": "transaction.amount",
            "operator": "GREATER_THAN",
            "value": 0
          }
        ]
      },
      "action_json": {
        "type": "FIXED_RATIO",
        "multiplier_factor": 1.0,
        "max_points_cap": 50000
      },
      "created_by": "superadmin",
      "created_at": "2026-11-09T08:00:00Z",
      "updated_at": "2026-11-09T08:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "total_pages": 1
  }
}
```

### 5.2 Buat Aturan Baru (Create Rule)
Payload `conditions_json` dan `action_json` divalidasi langsung oleh meta-validator schema JSON.

- **Method:** `POST`
- **URL:** `/api/v1/admin/rules`
- **Autentikasi:** Bearer Token
- **Request Body:**
```json
{
  "rule_code": "RULE_WEEKEND_GROCERY_2X",
  "rule_name": "Weekend Grocery 2x Multiplier",
  "priority": 20,
  "start_time": "2026-11-01T00:00:00Z",
  "end_time": "2026-11-30T23:59:59Z",
  "conditions_json": {
    "and": [
      {
        "field": "transaction.category",
        "operator": "EQUALS",
        "value": "GROCERY"
      },
      {
        "field": "transaction.day_of_week",
        "operator": "IN",
        "value": ["SATURDAY", "SUNDAY"]
      }
    ]
  },
  "action_json": {
    "type": "MULTIPLIER",
    "multiplier_factor": 2.0,
    "bonus_points": 0,
    "max_points_cap": 100000
  }
}
```
- **Response `201 Created`:**
```json
{
  "success": true,
  "data": {
    "rule_id": "d0000000-0000-0000-0000-000000000002",
    "rule_code": "RULE_WEEKEND_GROCERY_2X",
    "state": "ACTIVE"
  }
}
```

### 5.3 Update Aturan (Update Rule)
- **Method:** `PUT`
- **URL:** `/api/v1/admin/rules/:id`
- **Autentikasi:** Bearer Token
- **Request Body:** *(Sama dengan Create Rule)*
- **Response `200 OK`:** Objek data aturan yang diperbarui.

### 5.4 Update Status Aturan (Toggle Status)
- **Method:** `PATCH`
- **URL:** `/api/v1/admin/rules/:id/status`
- **Autentikasi:** Bearer Token
- **Request Body:**
```json
{
  "status": "INACTIVE"
}
```
- **Response `200 OK`:** Objek data aturan dengan status baru.

### 5.5 Hapus Aturan (Delete Rule)
- **Method:** `DELETE`
- **URL:** `/api/v1/admin/rules/:id`
- **Autentikasi:** Bearer Token
- **Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "message": "Rule deleted successfully"
  }
}
```

---

## 6. Katalog & Inventaris Voucher (Voucher Batches)

### 6.1 Daftar Batch Voucher (Get Voucher Batches)
- **Method:** `GET`
- **URL:** `/api/v1/admin/voucher-batches`
- **Autentikasi:** Bearer Token
- **Query Parameters:**
  - `page` (integer, default: 1)
  - `limit` (integer, default: 20)
- **Response `200 OK`:**
```json
{
  "success": true,
  "data": [
    {
      "id": "f0000000-0000-0000-0000-000000000001",
      "batch_code": "VB-SBX-50K",
      "title": "Starbucks IDR 50,000 E-Voucher",
      "description": "Voucher digital potongan Rp50.000 di seluruh gerai Starbucks",
      "partner_brand": "Starbucks Indonesia",
      "monetary_value": 50000.0,
      "points_cost": 5000,
      "terms_conditions": "Berlaku 30 hari sejak penukaran.",
      "total_stock": 1000,
      "available_stock": 950,
      "claimed_stock": 50,
      "revoked_count": 0,
      "status": "ACTIVE",
      "created_at": "2026-11-09T08:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "total_pages": 1
  }
}
```

### 6.2 Buat Batch Voucher Baru (Create Batch)
- **Method:** `POST`
- **URL:** `/api/v1/admin/voucher-batches`
- **Autentikasi:** Bearer Token
- **Request Body:**
```json
{
  "batch_code": "VB-GRAB-25K",
  "title": "GrabFood Voucher Rp25.000",
  "description": "Potongan belanja GrabFood minimum order Rp50.000",
  "partner_brand": "Grab Indonesia",
  "monetary_value": 25000.0,
  "points_cost": 2500,
  "terms_conditions": "Hanya berlaku untuk pesanan GrabFood."
}
```
- **Response `201 Created`:**
```json
{
  "success": true,
  "data": {
    "id": "f0000000-0000-0000-0000-000000000003",
    "batch_code": "VB-GRAB-25K",
    "title": "GrabFood Voucher Rp25.000",
    "points_cost": 2500,
    "total_stock": 0,
    "available_stock": 0,
    "claimed_stock": 0,
    "revoked_count": 0,
    "status": "ACTIVE",
    "created_at": "2026-11-10T11:30:00Z"
  }
}
```

### 6.3 Upload Kode Unik Voucher (Upload Codes CSV/TXT)
Mengunggah file berisi daftar kode unik voucher untuk menambah stok inventaris batch.

- **Method:** `POST`
- **URL:** `/api/v1/admin/voucher-batches/:id/upload-codes`
- **Autentikasi:** Bearer Token
- **Content-Type:** `multipart/form-data`
- **Form Data:**
  - `file`: File `.csv` atau `.txt` (satu kode voucher per baris)
- **Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "batch_id": "f0000000-0000-0000-0000-000000000003",
    "codes_imported": 500,
    "duplicates_skipped": 3,
    "new_total_stock": 500,
    "new_available_stock": 500
  }
}
```

### 6.4 Inventaris Kode Voucher (Get Inventory)
Melihat daftar stok kode unik voucher dalam batch beserta status penukarannya.

- **Method:** `GET`
- **URL:** `/api/v1/admin/voucher-batches/:id/inventory`
- **Autentikasi:** Bearer Token
- **Query Parameters:**
  - `page` (integer, default: 1)
  - `limit` (integer, default: 20)
  - `status` (string, opsional - `AVAILABLE` | `CLAIMED` | `REVOKED`)
- **Response `200 OK`:**
```json
{
  "success": true,
  "data": [
    {
      "id": "inv-0001",
      "batch_id": "f0000000-0000-0000-0000-000000000001",
      "voucher_code": "SBX-ABC123XYZ",
      "status": "AVAILABLE",
      "claimed_by": null,
      "claimed_at": null
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 950,
    "total_pages": 48
  }
}
```

### 6.5 Cabut / Blokir Kode Voucher (Revoke Vouchers)
- **Method:** `POST`
- **URL:** `/api/v1/admin/voucher-batches/:id/revoke`
- **Autentikasi:** Bearer Token
- **Request Body:**
```json
{
  "voucher_ids": [
    "inv-0001",
    "inv-0002"
  ],
  "reason": "Kode bocor atau kompromi keamanan"
}
```
- **Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "message": "Vouchers successfully revoked"
  }
}
```

---

## 7. Manajemen Kampanye (Campaigns)

### 7.1 Daftar Kampanye (Get Campaigns)
- **Method:** `GET`
- **URL:** `/api/v1/admin/campaigns`
- **Autentikasi:** Bearer Token
- **Query Parameters:**
  - `page` (integer, default: 1)
  - `limit` (integer, default: 20)
  - `status` (string, opsional - `DRAFT` | `ACTIVE` | `COMPLETED` | `CANCELLED`)
- **Response `200 OK`:**
```json
{
  "success": true,
  "data": [
    {
      "id": "cmp-0000-0001",
      "campaign_code": "CMP-BLACKFRIDAY-2026",
      "title": "Black Friday Mission Blast",
      "description": "Belanja 3x kategori elektronik untuk dapat 500 poin ekstra",
      "banner_url": "https://cdn.loyalty.local/banners/blackfriday.png",
      "campaign_type": "SPEND_TARGET",
      "status": "ACTIVE",
      "start_date": "2026-11-20T00:00:00Z",
      "end_date": "2026-11-30T23:59:59Z",
      "target_criteria": {
        "target_type": "ACCUMULATIVE_SPEND",
        "target_value": 500000.0,
        "category_filters": ["ELECTRONICS"],
        "time_window_days": 10
      },
      "reward_definition": {
        "reward_type": "BONUS_POINTS",
        "bonus_points": 500,
        "voucher_batch_code": null
      },
      "participant_count": 820,
      "completion_count": 145,
      "created_by": "superadmin",
      "created_at": "2026-11-09T08:00:00Z",
      "updated_at": "2026-11-09T08:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "total_pages": 1
  }
}
```

### 7.2 Buat Kampanye Baru (Create Campaign)
- **Method:** `POST`
- **URL:** `/api/v1/admin/campaigns`
- **Autentikasi:** Bearer Token
- **Request Body:**
```json
{
  "campaign_code": "CMP-YEAR-END-2026",
  "title": "Year End Mega Spree",
  "description": "Dapatkan voucher belanja dengan transaksi 5x selama Desember",
  "banner_url": "https://cdn.loyalty.local/banners/yearend.png",
  "campaign_type": "TRANSACTION_COUNT",
  "start_date": "2026-12-01T00:00:00Z",
  "end_date": "2026-12-31T23:59:59Z",
  "target_criteria": {
    "target_type": "TRANSACTION_COUNT",
    "target_value": 5.0,
    "category_filters": ["F&B", "RETAIL"],
    "time_window_days": 31
  },
  "reward_definition": {
    "reward_type": "VOUCHER",
    "bonus_points": null,
    "voucher_batch_code": "VB-SBX-50K"
  }
}
```
- **Response `201 Created`:** Objek data kampanye yang baru dibuat.

### 7.3 Update Kampanye (Update Campaign)
- **Method:** `PUT`
- **URL:** `/api/v1/admin/campaigns/:id`
- **Autentikasi:** Bearer Token
- **Request Body:** *(Sama dengan Create Campaign)*
- **Response `200 OK`:** Objek kampanye yang diperbarui.

### 7.4 Update Status Kampanye
- **Method:** `PATCH`
- **URL:** `/api/v1/admin/campaigns/:id/status`
- **Autentikasi:** Bearer Token
- **Request Body:**
```json
{
  "status": "COMPLETED"
}
```
- **Response `200 OK`:** Objek kampanye dengan status terkini.

---

## 8. Partner Merchant & Settlement

### 8.1 Daftar Partner (Get Partners)
Mengambil daftar partner merchant eksternal yang terhubung untuk redemption / settlement.

- **Method:** `GET`
- **URL:** `/api/v1/admin/partners`
- **Autentikasi:** Bearer Token
- **Response `200 OK`:**
```json
{
  "success": true,
  "data": [
    {
      "id": "c0000000-0000-0000-0000-000000000001",
      "merchant_code": "PARTNER_STARBUCKS",
      "merchant_name": "Starbucks Indonesia",
      "contact_email": "partners@starbucks.co.id",
      "contact_phone": "+6221-5000100",
      "par_value_per_point": 10.0,
      "commission_rate": 0.05,
      "settlement_currency": "IDR",
      "status": "ACTIVE",
      "contract_start_date": "2026-01-01",
      "contract_end_date": "2027-01-01",
      "created_at": "2026-11-09T08:00:00Z",
      "updated_at": "2026-11-09T08:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 1,
    "total": 1,
    "total_pages": 1
  }
}
```

### 8.2 Tambah Partner Baru (Create Partner)
- **Method:** `POST`
- **URL:** `/api/v1/admin/partners`
- **Autentikasi:** Bearer Token
- **Request Body:**
```json
{
  "merchant_code": "PARTNER_ZARA",
  "merchant_name": "Zara Retail Indonesia",
  "contact_email": "finance@zara.co.id",
  "contact_phone": "+6221-7890123",
  "par_value_per_point": 10.0,
  "commission_rate": 0.035,
  "settlement_currency": "IDR",
  "contract_start_date": "2026-12-01",
  "contract_end_date": "2027-12-01"
}
```
- **Response `201 Created`:** Objek data partner yang baru didaftarkan.

### 8.3 Update Data Partner
- **Method:** `PUT`
- **URL:** `/api/v1/admin/partners/:id`
- **Autentikasi:** Bearer Token
- **Request Body:** *(Sama dengan Create Partner)*
- **Response `200 OK`:** Objek data partner yang diperbarui.

### 8.4 Laporan Kliring & Settlement (Settlement Report)
Menghitung tagihan finansial penukaran poin merchant dalam rentang tanggal tertentu (Gross Liability, Komisi Platform, dan Net Payable).

- **Method:** `GET`
- **URL:** `/api/v1/admin/partners/settlement-report`
- **Autentikasi:** Bearer Token
- **Query Parameters:**
  - `partner_id` (string, **wajib** - ID partner)
  - `period_start` (string, opsional - format `YYYY-MM-DD`, contoh: `2026-10-01`)
  - `period_end` (string, opsional - format `YYYY-MM-DD`, contoh: `2026-10-31`)
- **Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "partner": {
      "id": "c0000000-0000-0000-0000-000000000001",
      "merchant_name": "Starbucks Indonesia",
      "merchant_code": "PARTNER_STARBUCKS"
    },
    "period": {
      "start": "2026-10-01",
      "end": "2026-10-31"
    },
    "summary": {
      "total_points_redeemed": 500000,
      "par_value_per_point": 10.0,
      "gross_liability": 5000000.0,
      "commission_rate": 0.05,
      "platform_commission": 250000.0,
      "net_payable_to_partner": 4750000.0
    },
    "transactions": [
      {
        "transaction_id": "trx-set-001",
        "member_id": "e0000000-0000-0000-0000-000000000001",
        "points_redeemed": 5000,
        "monetary_value": 50000.0,
        "redeemed_at": "2026-10-15T14:30:00Z"
      }
    ]
  }
}
```

---

## 9. Maker-Checker (Dual-Control Approval)

Mekanisme dual-control untuk mencegah fraud operasional. Admin pembuat (*Maker*) tidak diizinkan menyetujui aksinya sendiri (*Checker harus admin yang berbeda*).

### 9.1 Daftar Pengajuan Tertunda (Get Pending Actions)
- **Method:** `GET`
- **URL:** `/api/v1/admin/pending-actions`
- **Autentikasi:** Bearer Token
- **Query Parameters:**
  - `page` (integer, default: 1)
  - `limit` (integer, default: 20)
  - `status` (string, opsional - `PENDING` | `APPROVED` | `REJECTED`)
- **Response `200 OK`:**
```json
{
  "success": true,
  "data": [
    {
      "id": "mka-90123456-789a-bcde-f012-3456789abcde",
      "maker": {
        "id": "a0000000-0000-0000-0000-000000000002",
        "username": "ops_officer1",
        "role": "OPS_CS"
      },
      "checker": null,
      "action_type": "POINT_ADJUSTMENT",
      "target_resource": "e0000000-0000-0000-0000-000000000001",
      "payload": {
        "adjustment_type": "CREDIT",
        "amount": 1000,
        "reason_code": "CUSTOMER_COMPENSATION",
        "notes": "Kompensasi kendala sistem"
      },
      "status": "PENDING",
      "rejection_reason": null,
      "created_at": "2026-11-10T10:30:00Z",
      "resolved_at": null
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "total_pages": 1
  }
}
```

### 9.2 Setujui Aksi (Approve Action)
Checker menyetujui dan memicu eksekusi perubahan data yang diajukan.

- **Method:** `POST`
- **URL:** `/api/v1/admin/pending-actions/:id/approve`
- **Autentikasi:** Bearer Token *(ID admin berbeda dari pembuat aksi)*
- **Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "status": "APPROVED",
    "action_id": "mka-90123456-789a-bcde-f012-3456789abcde",
    "executed_at": "2026-11-10T11:40:00Z",
    "message": "Action successfully approved and executed"
  }
}
```

### 9.3 Tolak Aksi (Reject Action)
Checker menolak pengajuan dengan mencantumkan alasan.

- **Method:** `POST`
- **URL:** `/api/v1/admin/pending-actions/:id/reject`
- **Autentikasi:** Bearer Token
- **Request Body:**
```json
{
  "rejection_reason": "Dokumen pendukung CS ticket tidak ditemukan"
}
```
- **Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "message": "Action rejected successfully"
  }
}
```

---

## 10. Dashboard & Monitoring

### 10.1 Ringkasan Metrik Dashboard (Get Summary)
Metrik KPI akumulatif sistem: member, poin, voucher, dan kampanye.

- **Method:** `GET`
- **URL:** `/api/v1/admin/dashboard/summary`
- **Autentikasi:** Bearer Token
- **Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "members": {
      "total_registered": 154200,
      "active_30d": 98400,
      "active_60d": 121000,
      "active_90d": 135000,
      "new_today": 312
    },
    "points": {
      "total_circulating": 45200000,
      "earned_today": 320000,
      "redeemed_today": 185000,
      "expired_today": 4500
    },
    "vouchers": {
      "total_active_batches": 24,
      "total_available_stock": 18450,
      "claimed_today": 412
    },
    "campaigns": {
      "total_active": 6,
      "total_participants": 28900,
      "completions_today": 128
    }
  }
}
```

### 10.2 Live Transaction Feed (Aktivitas Ledger Terkini)
Stream transaksi poin real-time di seluruh platform.

- **Method:** `GET`
- **URL:** `/api/v1/admin/dashboard/transaction-feed`
- **Autentikasi:** Bearer Token
- **Query Parameters:**
  - `page` (integer, default: 1)
  - `limit` (integer, default: 20)
- **Response `200 OK`:**
```json
{
  "success": true,
  "data": [
    {
      "id": "tx-9901",
      "member_id": "e0000000-0000-0000-0000-000000000001",
      "type": "EARN",
      "amount": 250,
      "balance_after": 9500,
      "reference_id": "POS-TX-9901",
      "idempotency_key": "idemp-feed-01",
      "created_at": "2026-11-10T11:42:15Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 12450,
    "total_pages": 623
  }
}
```

### 10.3 Grafik Tren Earning & Burning (Charts Earning Trend)
Data harian perolehan, penukaran, dan kadaluarsa poin untuk visualisasi chart.

- **Method:** `GET`
- **URL:** `/api/v1/admin/dashboard/charts/earning-trend`
- **Autentikasi:** Bearer Token
- **Response `200 OK`:**
```json
{
  "success": true,
  "data": [
    {
      "date": "2026-11-03",
      "total_earned": 280000,
      "total_redeemed": 140000,
      "total_expired": 1200
    },
    {
      "date": "2026-11-04",
      "total_earned": 310000,
      "total_redeemed": 165000,
      "total_expired": 2000
    }
  ]
}
```

### 10.4 Jejak Audit Administrator (Audit Logs)
Merekam jejak seluruh mutasi data (`POST`, `PUT`, `PATCH`, `DELETE`) oleh admin beserta perbandingan `old_value` dan `new_value`.

- **Method:** `GET`
- **URL:** `/api/v1/admin/audit-logs`
- **Autentikasi:** Bearer Token
- **Query Parameters:**
  - `page` (integer, default: 1)
  - `limit` (integer, default: 20)
  - `admin_id` (string, opsional - filter ID admin)
  - `action` (string, opsional - filter jenis aksi, contoh: `CREATE_RULE`, `UPDATE_TIER`)
  - `start_date` (string, opsional - format ISO `YYYY-MM-DD`)
  - `end_date` (string, opsional - format ISO `YYYY-MM-DD`)
- **Response `200 OK`:**
```json
{
  "success": true,
  "data": [
    {
      "id": "aud-001",
      "admin": {
        "id": "a0000000-0000-0000-0000-000000000001",
        "username": "superadmin",
        "role": "SUPER_ADMIN"
      },
      "action": "UPDATE_MEMBER_STATUS",
      "target_resource": "e0000000-0000-0000-0000-000000000001",
      "old_value": {
        "status": "ACTIVE"
      },
      "new_value": {
        "status": "SUSPENDED"
      },
      "ip_address": "127.0.0.1",
      "created_at": "2026-11-10T11:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "total_pages": 1
  }
}
```

---

## 11. Manajemen Admin User

Hanya dapat diakses oleh role `SUPER_ADMIN`.

### 11.1 Daftar Admin User
- **Method:** `GET`
- **URL:** `/api/v1/admin/users`
- **Autentikasi:** Bearer Token (`SUPER_ADMIN`)
- **Response `200 OK`:**
```json
{
  "success": true,
  "data": [
    {
      "id": "a0000000-0000-0000-0000-000000000001",
      "username": "superadmin",
      "email": "admin@loyalty.local",
      "role": "SUPER_ADMIN",
      "status": "ACTIVE",
      "created_at": "2026-11-09T08:00:00Z",
      "updated_at": "2026-11-09T08:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 1,
    "total": 1,
    "total_pages": 1
  }
}
```

### 11.2 Tambah Akun Admin Baru (Create Admin User)
- **Method:** `POST`
- **URL:** `/api/v1/admin/users`
- **Autentikasi:** Bearer Token (`SUPER_ADMIN`)
- **Request Body:**
```json
{
  "username": "campaign_specialist1",
  "email": "specialist@loyalty.local",
  "password": "SecurePassword123!",
  "role": "CAMPAIGN_SPEC"
}
```
*Role yang didukung:* `SUPER_ADMIN`, `CAMPAIGN_SPEC`, `OPS_CS`, `FINANCE`.
- **Response `201 Created`:**
```json
{
  "success": true,
  "data": {
    "id": "a0000000-0000-0000-0000-000000000003",
    "username": "campaign_specialist1",
    "email": "specialist@loyalty.local",
    "role": "CAMPAIGN_SPEC",
    "status": "ACTIVE",
    "created_at": "2026-11-10T11:45:00Z",
    "updated_at": "2026-11-10T11:45:00Z"
  }
}
```

### 11.3 Update Akun Admin
- **Method:** `PUT`
- **URL:** `/api/v1/admin/users/:id`
- **Autentikasi:** Bearer Token (`SUPER_ADMIN`)
- **Request Body:**
```json
{
  "email": "new.specialist@loyalty.local",
  "role": "CAMPAIGN_SPEC",
  "status": "ACTIVE"
}
```
- **Response `200 OK`:** Objek data admin yang diperbarui.

