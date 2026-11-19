/**
 * Application-wide constants
 */
export const APP_NAME = 'Loyalty Command Center';
export const APP_VERSION = '1.0.0';
/** API Configuration */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1/admin';
export const ENABLE_MOCKS = import.meta.env.VITE_ENABLE_MOCKS === 'true';
/** Pagination */
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 50;
export const PAGE_SIZE_OPTIONS = [10, 20, 50];
/** JWT */
export const TOKEN_KEY = 'loyalty_access_token';
export const REFRESH_TOKEN_KEY = 'loyalty_refresh_token';
export const TOKEN_EXPIRY_KEY = 'loyalty_token_expiry';
/** RBAC Permission Map — sesuai FSD §3.8.1 */
export const ROLE_PERMISSIONS = {
    SUPER_ADMIN: ['*'],
    CAMPAIGN_SPEC: [
        'dashboard',
        'members:read',
        'tiers', 'tiers:read', 'tiers:write',
        'rules', 'rules:read', 'rules:write',
        'vouchers', 'vouchers:read', 'vouchers:write',
        'campaigns', 'campaigns:read', 'campaigns:write',
        'partners:read',
        'settlement:read',
    ],
    OPS_CS: [
        'dashboard',
        'members', 'members:read', 'members:write',
        'tiers:read',
        'rules:read',
        'vouchers:read',
    ],
    FINANCE: [
        'dashboard',
        'members:read',
        'tiers:read',
        'rules:read',
        'vouchers:read',
        'settlement', 'settlement:read', 'settlement:write',
        'audit-logs', 'audit-logs:read',
    ],
};
/** Sidebar Navigation Items */
export const NAV_ITEMS = [
    {
        label: 'Dashboard',
        icon: 'LayoutDashboard',
        to: '/',
        permission: 'dashboard',
    },
    {
        label: 'Members',
        icon: 'Users',
        to: '/members',
        permission: 'members:read',
    },
    {
        label: 'Tiers',
        icon: 'Award',
        to: '/tiers',
        permission: 'tiers:read',
    },
    {
        label: 'Earning Rules',
        icon: 'Zap',
        to: '/rules',
        permission: 'rules:read',
    },
    {
        label: 'Vouchers',
        icon: 'Ticket',
        to: '/vouchers',
        permission: 'vouchers:read',
    },
    {
        label: 'Campaigns',
        icon: 'Target',
        to: '/campaigns',
        permission: 'campaigns:read',
    },
    {
        label: 'Partners',
        icon: 'Handshake',
        to: '/partners',
        permission: 'partners:read',
    },
    {
        label: 'Settlement',
        icon: 'Receipt',
        to: '/partners/settlement',
        permission: 'settlement:read',
    },
    {
        label: 'Approvals',
        icon: 'ClipboardCheck',
        to: '/approvals',
        permission: 'approvals',
    },
    {
        label: 'Audit Logs',
        icon: 'FileSearch',
        to: '/audit-logs',
        permission: 'audit-logs:read',
    },
    {
        label: 'Admin Users',
        icon: 'ShieldCheck',
        to: '/settings/users',
        permission: 'admin-users',
    },
];
