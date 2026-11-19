# 🏛️ Enterprise Loyalty Platform — BackOffice Command Center

[![Vue.js](https://img.shields.io/badge/Vue.js-3.5+-4FC08D?style=flat-square&logo=vue.js&logoColor=white)](https://vuejs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![PrimeVue](https://img.shields.io/badge/PrimeVue-v5-41B883?style=flat-square&logo=primevue&logoColor=white)](https://primevue.org/)
[![Pinia](https://img.shields.io/badge/Pinia-v4-FFE56E?style=flat-square&logo=pinia&logoColor=black)](https://pinia.vuejs.org/)
[![MSW](https://img.shields.io/badge/MSW-v2-FF6A00?style=flat-square&logo=mockserviceworker&logoColor=white)](https://mswjs.io/)

A high-performance, domain-agnostic administrative desktop web portal for the **Enterprise General Loyalty & Rewards Platform**. Designed for orchestrating multi-partner coalition loyalty programs, configuring dynamic points-earning rules, managing tier structures, issuing voucher batches, running gamification campaigns, auditing administrative actions, and enforcing dual-control (Maker-Checker) financial governance.

---

> ⚠️ **Architecture Notice: Decoupled Backend Services**  
> This repository houses the **Frontend Single Page Application (SPA)** only. In accordance with enterprise microservice design patterns, all data persistence, business logic evaluation, points calculations, and database mutations are handled by separate backend services:
>
> 1. **Administrative Backend (`backoffice-service`)**: Dedicated Go/Gin service running on port `8080`, providing authenticated REST APIs, RBAC enforcement, dynamic rule schema compilation, maker-checker pipelines, and audit trails.
> 2. **Customer Loyalty Engine (`loyalty-engine-service`)**: Dedicated Go service running on port `8081`, handling customer-facing high-throughput earning, burning, wallet balances, and real-time ledger accounting.
>
> **The Zero Calculation Principle:** This frontend client application **never** performs points math, executes rule engines, or mutates database tables directly. All interactions flow strictly through audited backend REST endpoints.

---

## 📑 Table of Contents

- [System Architecture & Data Flow](#-system-architecture--data-flow)
- [Key Architectural Principles](#-key-architectural-principles)
- [High-Level Operational Flows](#-high-level-operational-flows)
  - [1. Authentication & RBAC Session Flow](#1-authentication--rbac-session-flow)
  - [2. Maker-Checker Governance Flow](#2-maker-checker-governance-flow)
  - [3. Visual Earning Rule Configuration Flow](#3-visual-earning-rule-configuration-flow)
  - [4. Dual-Mode Operation (Mock vs Real API)](#4-dual-mode-operation-mock-vs-real-api)
- [Technical Stack](#-technical-stack)
- [Directory Structure](#-directory-structure)
- [Implemented Subsystems & Views](#-implemented-subsystems--views)
- [Role-Based Access Control (RBAC) Matrix](#-role-based-access-control-rbac-matrix)
- [Quick Start](#-quick-start)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Configuration](#environment-configuration)
  - [Development Server](#development-server)
  - [Production Build](#production-build)
- [Demo Credentials](#-demo-credentials)
- [Deployment Guide](#-deployment-guide)

---

## 🏛️ System Architecture & Data Flow

```text
┌───────────────────────────────────────────────────────────────────────────┐
│              Loyalty BackOffice Command Center (This Repository)          │
│       Vue 3 (Composition API) • Vite 6 • TypeScript • Tailwind CSS 4      │
│            PrimeVue v5 • Pinia 4 • Axios Interceptors • MSW v2            │
└─────────────────────────────────────┬─────────────────────────────────────┘
                                      │
               HTTPS / JSON REST APIs │ [Bearer JWT Auth / RBAC Scopes]
               (Default: Port 8080)   ▼
┌───────────────────────────────────────────────────────────────────────────┐
│        backoffice-service (Go Modular Monolith - Separate Service)        │
│    Gin-Gonic • pgx/v5 Pool • Uber Zap • JSON Schema Validator • Viper     │
└──────────────────┬─────────────────────────────────────┬──────────────────┘
                   │                                     │
    Master Writes  │                      Replica Reads  │
    (schema_backoffice)                   (schema_ledger, schema_burning)
                   ▼                                     ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                       PostgreSQL 15+ Database Engine                      │
│                                                                           │
│  ├─ schema_backoffice : admin_users, dynamic_rules, tier_definitions,     │
│  │                      campaigns, partners, admin_pending_actions,       │
│  │                      admin_audit_logs                                  │
│  ├─ schema_ledger     : members, point_ledgers (partitioned)              │
│  ├─ schema_burning    : voucher_batches, vouchers                         │
│  └─ schema_earning    : earning_transactions (partitioned)                │
└─────────────────────────────────────▲─────────────────────────────────────┘
                                      │
               High-Throughput        │ Transactions / Balances / Vouchers
               Customer Traffic       │ (Default: Port 8081)
┌─────────────────────────────────────┴─────────────────────────────────────┐
│    loyalty-engine-service (Customer Loyalty Engine - Separate Service)    │
│            Real-time Point Accrual • Voucher Burn • Ledgers               │
└───────────────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Key Architectural Principles

1. **Zero Point Calculation in Frontend:**  
   The BackOffice UI strictly presents data and gathers administrative intent. It never computes multiplier math, calculates accrual ceilings, or determines tier advancement.
2. **Dual-Control Governance (Maker-Checker):**  
   Sensitive operations—such as manual member balance adjustments (credit/debit) and voucher batch revocations—cannot be executed unilaterally. They are staged as `PENDING` actions requiring secondary verification by an authorized Checker.
3. **Backend-Ready TypeScript Contracts:**  
   Every network payload is governed by strongly typed interfaces located in `src/api/contracts/`, matching the backend REST specification with zero type-casting compromises.
4. **Resilient Token Lifecycle:**  
   The application features silent JWT access token refresh via Axios response interceptors. Expired 60-minute access tokens trigger an automatic background refresh request without interrupting the user session.
5. **Full Offline Capabilities via MSW:**  
   The application embeds Mock Service Worker (MSW v2) with mock seed generators, allowing complete frontend development, test suites, and UI demonstrations without needing active database connections or backend processes.

---

## 🔄 High-Level Operational Flows

### 1. Authentication & RBAC Session Flow

```text
[ Admin User ] ──▶ ( Enters Credentials )
                          │
                          ▼
            [ POST /api/v1/admin/auth/login ]
                          │
         ┌────────────────┴────────────────┐
         ▼                                 ▼
   [ MSW Mock Worker ]         [ Go backoffice-service ]
   (if VITE_ENABLE_MOCKS=true) (if VITE_ENABLE_MOCKS=false)
         │                                 │
         └────────────────┬────────────────┘
                          ▼
        { access_token (60m), refresh_token (7d), admin_profile }
                          │
                          ▼
           Stored in LocalStorage & Pinia `auth.store`
                          │
  ┌───────────────────────┴────────────────────────┐
  ▼                                                ▼
[ Axios Request Interceptor ]            [ Vue Router beforeEach Guard ]
Attaches: `Authorization: Bearer <JWT>`  Validates `meta.permission`
Auto-refreshes on HTTP 401               Redirects to `/` if unauthorized
```

### 2. Maker-Checker Governance Flow

```text
[ CS Agent / Maker ] ──▶ Submits Manual Point Adjustment or Voucher Revocation
                                    │
                                    ▼
                 POST /api/v1/admin/members/:id/adjustments
                 (Status: PENDING staged in schema_backoffice)
                                    │
                                    ▼
       [ Supervisor / Checker sees notification in PendingActionsView ]
                                    │
                     ┌──────────────┴──────────────┐
                     ▼                             ▼
              [ Click Approve ]             [ Click Reject ]
                     │                             │
                     ▼                             ▼
        POST .../approve (200 OK)      POST .../reject (200 OK)
                     │                             │
                     ▼                             ▼
         Committed to schema_ledger     Marked REJECTED with note
         & logged in admin_audit_logs   & logged in admin_audit_logs
```

### 3. Visual Earning Rule Configuration Flow

```text
[ Campaign Specialist ] ──▶ [ Visual Rule Builder View (/rules/create) ]
                                    │
                                    ├─ Step 1: Base Metadata (Code, Name, Multiplier)
                                    ├─ Step 2: Conditions (Spend > X, Category IN [...])
                                    └─ Step 3: Caps & Validity Dates
                                    │
                                    ▼
                        Emits Dynamic JSON Schema
                                    │
                                    ▼
                     POST /api/v1/admin/rules
                                    │
                                    ▼
               [ Backend JSONSchema Meta-Validator ]
               (santhosh-tekuri/jsonschema/v5 validation)
                                    │
                                    ▼
               Persisted to `schema_backoffice.dynamic_rules`
               (Immediately active for loyalty-engine-service)
```

### 4. Dual-Mode Operation (Mock vs Real API)

- **Mock Mode (`VITE_ENABLE_MOCKS=true`):**  
  Service Worker intercepts network traffic at the browser network level. Returns rich, in-memory mock datasets (members, transactions, vouchers, rules, audit logs). Perfect for frontend prototyping, demos, and UI test automation.
- **Production Mode (`VITE_ENABLE_MOCKS=false`):**  
  Service Worker is bypassed. Axios directs all calls to `VITE_API_BASE_URL` (pointing to `backoffice-service`), utilizing actual PostgreSQL transactions, bcrypt authentication, and database constraints.

---

## 🛠️ Technical Stack

| Layer | Technology | Description |
|---|---|---|
| **Core Framework** | **Vue.js 3.5+** | Progressive framework using Composition API (`<script setup lang="ts">`) |
| **Build Tool** | **Vite 6.4+** | Next-generation frontend tooling with lightning-fast HMR |
| **Language** | **TypeScript 5.x** | Static type checking and strict interface definitions |
| **Styling** | **Tailwind CSS v4** | Modern utility-first CSS framework integrated via `@tailwindcss/vite` |
| **UI Component Suite** | **PrimeVue v5** | Enterprise UI components (DataTable, Dialogs, Dropdowns, Badges, PrimeIcons) |
| **State Management** | **Pinia 4.x** | Intuitive, typed store management for Vue |
| **Routing** | **Vue Router 4.x** | Single Page Application routing with client-side RBAC navigation guards |
| **HTTP Client** | **Axios 1.21+** | Promise-based HTTP client with request/response interceptors |
| **Data Visualization** | **Chart.js & vue-chartjs** | Responsive charts for telemetry and transaction trend analytics |
| **Mock Engine** | **Mock Service Worker (MSW v2)** | API mocking library using Service Worker technology |
| **Date Formatting** | **date-fns 4.x** | Lightweight and modern date utility library |
| **Iconography** | **Lucide Vue Next & PrimeIcons** | Clean, accessible vector icons |

---

## 📁 Directory Structure

```text
backoffice/
├── public/
│   ├── favicon.svg               # Application branding icon
│   ├── icons.svg                 # SVG sprite definitions
│   └── mockServiceWorker.js      # MSW browser service worker script
├── src/
│   ├── api/
│   │   ├── client.ts             # Axios instance with JWT & 401 refresh interceptors
│   │   ├── contracts/            # TypeScript contracts (interfaces & API response shapes)
│   │   │   ├── audit.contract.ts
│   │   │   ├── auth.contract.ts
│   │   │   ├── campaign.contract.ts
│   │   │   ├── common.contract.ts
│   │   │   ├── dashboard.contract.ts
│   │   │   ├── member.contract.ts
│   │   │   ├── partner.contract.ts
│   │   │   ├── rule.contract.ts
│   │   │   ├── tier.contract.ts
│   │   │   ├── voucher.contract.ts
│   │   │   └── index.ts
│   │   └── services/             # Typed API client services
│   │       ├── audit.service.ts
│   │       ├── auth.service.ts
│   │       ├── campaign.service.ts
│   │       ├── dashboard.service.ts
│   │       ├── member.service.ts
│   │       ├── partner.service.ts
│   │       ├── rule.service.ts
│   │       ├── tier.service.ts
│   │       └── voucher.service.ts
│   ├── components/
│   │   └── common/               # Reusable enterprise UI components
│   │       ├── AppSidebar.vue        # Collapsible RBAC-filtered navigation bar
│   │       ├── AppTopbar.vue         # Header with user role, profile & quick logout
│   │       ├── DataTableWrapper.vue  # Reusable PrimeVue DataTable with pagination
│   │       ├── JsonViewer.vue        # Syntax-highlighted JSON viewer for dynamic rules
│   │       ├── MakerCheckerBanner.vue# Pending approval alert banner
│   │       └── StatusBadge.vue       # Color-coded status indicator component
│   ├── composables/              # Reusable stateful Composition API logic
│   │   ├── useAuth.ts
│   │   └── usePagination.ts
│   ├── layouts/
│   │   ├── AdminLayout.vue       # Primary authenticated shell (Sidebar + Topbar + Content)
│   │   └── AuthLayout.vue        # Minimal centered shell for login page
│   ├── mocks/                    # Mock Service Worker (MSW) setup & seed data
│   │   ├── browser.ts            # MSW browser worker initializer
│   │   ├── handlers/             # Modular request handlers matching backend endpoints
│   │   └── data/                 # Seed fixtures (members, rules, tiers, vouchers, etc.)
│   ├── router/
│   │   └── index.ts              # Vue Router 4 route definitions & RBAC navigation guards
│   ├── stores/                   # Centralized Pinia state modules
│   │   ├── approval.store.ts
│   │   ├── auth.store.ts
│   │   ├── campaign.store.ts
│   │   ├── dashboard.store.ts
│   │   ├── member.store.ts
│   │   ├── partner.store.ts
│   │   ├── rule.store.ts
│   │   ├── tier.store.ts
│   │   └── voucher.store.ts
│   ├── types/
│   │   └── enums.ts              # Shared TypeScript union types & enums
│   ├── utils/
│   │   ├── constants.ts          # App constants, RBAC permissions, navigation links
│   │   └── formatters.ts         # Currency, points, date, and percentage formatters
│   ├── views/                    # 15 Domain views across 8 core subsystems
│   │   ├── approvals/PendingActionsView.vue
│   │   ├── audit/AuditLogView.vue
│   │   ├── auth/LoginView.vue
│   │   ├── campaigns/CampaignListView.vue
│   │   ├── dashboard/DashboardView.vue
│   │   ├── members/MemberDetailView.vue
│   │   ├── members/MemberListView.vue
│   │   ├── partners/PartnerListView.vue
│   │   ├── partners/SettlementReportView.vue
│   │   ├── rules/RuleBuilderView.vue
│   │   ├── rules/RuleListView.vue
│   │   ├── settings/AdminUserView.vue
│   │   ├── tiers/TierListView.vue
│   │   ├── vouchers/VoucherBatchListView.vue
│   │   └── vouchers/VoucherInventoryView.vue
│   ├── App.vue                   # Root Vue component
│   └── main.ts                   # Application bootstrap & plugin registration
├── .env                          # Local environment variable configuration
├── index.html                    # Single Page Application HTML entrypoint
├── package.json                  # NPM dependencies & build scripts
├── tsconfig.json                 # TypeScript compiler configuration
├── vite.config.ts                # Vite 6 configuration with Tailwind CSS v4 & path alias
└── README.md
```

---

## 📑 Implemented Subsystems & Views

The frontend encapsulates 15 dedicated views mapped to the 8 administrative subsystems of the Loyalty Platform:

| Subsystem | View Component | Route Path | Required Permission | Backend REST Endpoints |
|---|---|---|---|---|
| **0. Authentication** | `LoginView.vue` | `/login` | Public / Guest | `POST /auth/login`<br>`POST /auth/refresh`<br>`POST /auth/logout`<br>`GET /auth/me` |
| **1. Executive Dashboard** | `DashboardView.vue` | `/` | `dashboard` | `GET /dashboard/summary`<br>`GET /dashboard/transaction-feed`<br>`GET /dashboard/charts/earning-trend` |
| **2. Member Accounts** | `MemberListView.vue`<br>`MemberDetailView.vue` | `/members`<br>`/members/:id` | `members:read`<br>`members:write` | `GET /members`<br>`GET /members/:id`<br>`PATCH /members/:id/status`<br>`POST /members/:id/adjustments`<br>`GET /members/:id/transactions` |
| **3. Tier Management** | `TierListView.vue` | `/tiers` | `tiers:read`<br>`tiers:write` | `GET /tiers`<br>`POST /tiers`<br>`PUT /tiers/:id`<br>`DELETE /tiers/:id` |
| **4. Earning Rules** | `RuleListView.vue`<br>`RuleBuilderView.vue` | `/rules`<br>`/rules/create` | `rules:read`<br>`rules:write` | `GET /rules`<br>`POST /rules`<br>`PUT /rules/:id`<br>`PATCH /rules/:id/status`<br>`DELETE /rules/:id` |
| **5. Voucher Inventory** | `VoucherBatchListView.vue`<br>`VoucherInventoryView.vue` | `/vouchers`<br>`/vouchers/:id` | `vouchers:read`<br>`vouchers:write` | `GET /voucher-batches`<br>`POST /voucher-batches`<br>`POST /voucher-batches/:id/upload-codes`<br>`GET /voucher-batches/:id/inventory`<br>`POST /voucher-batches/:id/revoke` |
| **6. Gamification Campaigns** | `CampaignListView.vue` | `/campaigns` | `campaigns:read`<br>`campaigns:write` | `GET /campaigns`<br>`POST /campaigns`<br>`PUT /campaigns/:id`<br>`PATCH /campaigns/:id/status` |
| **7. Partner Clearing & Settlement** | `PartnerListView.vue`<br>`SettlementReportView.vue` | `/partners`<br>`/partners/settlement` | `partners:read`<br>`settlement:read` | `GET /partners`<br>`POST /partners`<br>`PUT /partners/:id`<br>`GET /partners/settlement-report` |
| **8. Governance & Auditing** | `PendingActionsView.vue`<br>`AuditLogView.vue`<br>`AdminUserView.vue` | `/approvals`<br>`/audit-logs`<br>`/settings/users` | `approvals`<br>`audit-logs:read`<br>`admin-users` | `GET /pending-actions`<br>`POST /pending-actions/:id/approve`<br>`POST /pending-actions/:id/reject`<br>`GET /audit-logs`<br>`GET /users`<br>`POST /users`<br>`PUT /users/:id` |

---

## 🔐 Role-Based Access Control (RBAC) Matrix

Navigation links and router guards automatically enforce granular role-based permissions:

| Permission Scope | `SUPER_ADMIN` | `CAMPAIGN_SPEC` | `OPS_CS` | `FINANCE` |
|---|:---:|:---:|:---:|:---:|
| **Executive Dashboard & Telemetry** | ✅ | ✅ | ✅ | ✅ |
| **Member Directory & Account View** | ✅ | ✅ (Read Only) | ✅ (Read & Adjust) | ✅ (Read Only) |
| **Tier Definitions & Multipliers** | ✅ | ✅ (Manage) | ❌ | ❌ |
| **Dynamic Earning Rule Builder** | ✅ | ✅ (Manage) | ❌ | ❌ |
| **Voucher Batches & Code Pool** | ✅ | ✅ (Manage) | ❌ | ❌ |
| **Campaigns & Missions** | ✅ | ✅ (Manage) | ❌ | ❌ |
| **Partner Coalition Registry** | ✅ | ✅ (Read Only) | ❌ | ❌ |
| **Settlement & Clearing Reports** | ✅ | ❌ | ❌ | ✅ (Full Access) |
| **Maker-Checker Pending Approvals**| ✅ | ❌ | ❌ | ✅ |
| **Immutable Audit Trail Logs** | ✅ | ❌ | ❌ | ✅ (Read Only) |
| **Admin User & Role Management** | ✅ | ❌ | ❌ | ❌ |

---

## 🚀 Quick Start

### Prerequisites

- **Node.js**: `>= 20.x LTS`
- **NPM**: `>= 10.x`

### Installation

Clone the repository and install project dependencies:

```bash
# Navigate to the backoffice frontend directory
cd backoffice

# Install dependencies
npm install
```

### Environment Configuration

The application configuration is managed via `.env` files in the root folder:

```env
# URL prefix of the administrative backend REST API (backoffice-service)
VITE_API_BASE_URL=http://localhost:8080/api/v1/admin

# Toggle Mock Service Worker (MSW). Set to 'true' for standalone offline development
VITE_ENABLE_MOCKS=false
```

| Variable | Default Value | Description |
|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost:8080/api/v1/admin` | Target base URL of `backoffice-service` |
| `VITE_ENABLE_MOCKS` | `false` | When `true`, uses MSW in-browser mocking instead of live backend |

### Development Server

Run the development server with Hot Module Replacement (HMR):

```bash
npm run dev
```

The web console will be accessible at: `http://localhost:3000`

### Production Build

Verify TypeScript compilation and generate optimized distribution assets:

```bash
npm run build
```

The compiled assets will be output to the `dist/` folder, ready for deployment.

You can preview the built production bundle locally using:

```bash
npm run preview
```

---

## 👥 Demo Credentials

When running with Mock Service Worker (`VITE_ENABLE_MOCKS=true`) or against a seeded `backoffice-service` database, you can log in using these pre-configured accounts:

| Role | Username | Password | Intended Workflow |
|---|---|---|---|
| **Super Admin** | `superadmin` | `password123` | Full administrative authority across all modules & settings |
| **Campaign Specialist** | `campaign.lead` | `password123` | Configure earning rules, tiers, vouchers, and campaigns |
| **Customer Support (CS)**| `cs.agent` | `password123` | Search members, view point ledgers, submit manual adjustments (Maker) |
| **Finance Auditor** | `finance.auditor` | `password123` | Partner settlement reconciliation, approving adjustments (Checker), audit review |

---

## 🌐 Deployment Guide

When deploying the production build (`dist/`) behind an Nginx reverse proxy or static web server, ensure that HTML5 History Mode routing is configured to fallback to `index.html`:

### Example Nginx Configuration

```nginx
server {
    listen 80;
    server_name loyalty-admin.yourdomain.com;
    root /var/www/loyalty-backoffice/dist;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # SPA Routing Fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests to backoffice-service backend
    location /api/v1/admin/ {
        proxy_pass http://backoffice-service:8080/api/v1/admin/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, no-transform";
    }
}
```

---

## 📄 License

This project is proprietary and confidential. Created for the Enterprise General Loyalty & Rewards Platform.
