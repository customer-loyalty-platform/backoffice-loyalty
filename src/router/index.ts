import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import AdminLayout from '@/layouts/AdminLayout.vue';
import AuthLayout from '@/layouts/AuthLayout.vue';
import { useAuthStore } from '@/stores/auth.store';

const routes: RouteRecordRaw[] = [
  // Authentication Routes
  {
    path: '/auth',
    component: AuthLayout,
    children: [
      {
        path: '/login',
        name: 'Login',
        component: () => import('@/views/auth/LoginView.vue'),
        meta: { guestOnly: true, title: 'Admin Login' },
      },
    ],
  },

  // Protected Admin Console Routes
  {
    path: '/',
    component: AdminLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/DashboardView.vue'),
        meta: { title: 'Dashboard & Telemetry', permission: 'dashboard' },
      },
      {
        path: 'members',
        name: 'Members',
        component: () => import('@/views/members/MemberListView.vue'),
        meta: { title: 'Member Accounts', permission: 'members:read' },
      },
      {
        path: 'members/:id',
        name: 'MemberDetail',
        component: () => import('@/views/members/MemberDetailView.vue'),
        meta: { title: 'Member Profile & Ledger', permission: 'members:read' },
      },
      {
        path: 'tiers',
        name: 'Tiers',
        component: () => import('@/views/tiers/TierListView.vue'),
        meta: { title: 'Tier & Multipliers', permission: 'tiers:read' },
      },
      {
        path: 'rules',
        name: 'Rules',
        component: () => import('@/views/rules/RuleListView.vue'),
        meta: { title: 'Earning Rules', permission: 'rules:read' },
      },
      {
        path: 'rules/create',
        name: 'RuleCreate',
        component: () => import('@/views/rules/RuleBuilderView.vue'),
        meta: { title: 'Visual Rule Builder', permission: 'rules:write' },
      },
      {
        path: 'vouchers',
        name: 'Vouchers',
        component: () => import('@/views/vouchers/VoucherBatchListView.vue'),
        meta: { title: 'Vouchers & Inventory', permission: 'vouchers:read' },
      },
      {
        path: 'vouchers/:id',
        name: 'VoucherInventory',
        component: () => import('@/views/vouchers/VoucherInventoryView.vue'),
        meta: { title: 'Voucher Code Pool & Inventory', permission: 'vouchers:read' },
      },
      {
        path: 'campaigns',
        name: 'Campaigns',
        component: () => import('@/views/campaigns/CampaignListView.vue'),
        meta: { title: 'Campaigns & Missions', permission: 'campaigns:read' },
      },
      {
        path: 'partners',
        name: 'Partners',
        component: () => import('@/views/partners/PartnerListView.vue'),
        meta: { title: 'Partner Coalition', permission: 'partners:read' },
      },
      {
        path: 'partners/settlement',
        name: 'Settlement',
        component: () => import('@/views/partners/SettlementReportView.vue'),
        meta: { title: 'Settlement & Clearing', permission: 'settlement:read' },
      },
      {
        path: 'approvals',
        name: 'Approvals',
        component: () => import('@/views/approvals/PendingActionsView.vue'),
        meta: { title: 'Maker-Checker Approvals', permission: 'approvals' },
      },
      {
        path: 'audit-logs',
        name: 'AuditLogs',
        component: () => import('@/views/audit/AuditLogView.vue'),
        meta: { title: 'Audit Trail Logs', permission: 'audit-logs:read' },
      },
      {
        path: 'settings/users',
        name: 'AdminUsers',
        component: () => import('@/views/settings/AdminUserView.vue'),
        meta: { title: 'Admin Users (RBAC)', permission: 'admin-users' },
      },
    ],
  },

  // Fallback redirect
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation Guards: Auth & RBAC Checks
router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore();
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
  const guestOnly = to.matched.some((record) => record.meta.guestOnly);

  if (requiresAuth && !authStore.isAuthenticated) {
    return next({ path: '/login', query: { redirect: to.fullPath } });
  }

  if (guestOnly && authStore.isAuthenticated) {
    return next({ path: '/' });
  }

  // Permission Check
  const requiredPermission = to.meta.permission as string;
  if (requiredPermission && !authStore.hasPermission(requiredPermission)) {
    // If not permitted, redirect to home dashboard
    return next({ path: '/' });
  }

  next();
});

export default router;

