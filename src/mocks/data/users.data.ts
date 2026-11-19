import type { AdminUser } from '@/api/contracts/audit.contract';

export const mockAdminUsers: (AdminUser & { password: string })[] = [
  {
    id: 'adm-0000-0001',
    username: 'superadmin',
    email: 'admin@loyalty.internal',
    password: 'password123',
    role: 'SUPER_ADMIN',
    status: 'ACTIVE',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'adm-0000-0002',
    username: 'campaign.lead',
    email: 'campaign@loyalty.internal',
    password: 'password123',
    role: 'CAMPAIGN_SPEC',
    status: 'ACTIVE',
    created_at: '2026-01-15T00:00:00Z',
    updated_at: '2026-01-15T00:00:00Z',
  },
  {
    id: 'adm-0000-0003',
    username: 'cs.agent',
    email: 'cs@loyalty.internal',
    password: 'password123',
    role: 'OPS_CS',
    status: 'ACTIVE',
    created_at: '2026-02-01T00:00:00Z',
    updated_at: '2026-02-01T00:00:00Z',
  },
  {
    id: 'adm-0000-0004',
    username: 'finance.auditor',
    email: 'finance@loyalty.internal',
    password: 'password123',
    role: 'FINANCE',
    status: 'ACTIVE',
    created_at: '2026-02-15T00:00:00Z',
    updated_at: '2026-02-15T00:00:00Z',
  },
];

