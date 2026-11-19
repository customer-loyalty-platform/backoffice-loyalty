import { http, HttpResponse } from 'msw';
import { mockAdminUsers } from '../data/users.data';
import { mockTiers } from '../data/tiers.data';
import { mockMembers, mockLedgers } from '../data/members.data';
import { mockRules } from '../data/rules.data';
import { mockVoucherBatches, mockVoucherInventory } from '../data/vouchers.data';
import { mockCampaigns } from '../data/campaigns.data';
import { mockPartners, mockSettlementReports } from '../data/partners.data';
import { mockPendingActions, mockAuditLogs } from '../data/audit.data';
import { API_BASE_URL } from '@/utils/constants';
// In-memory state so modifications persist within the browser session
let tiers = [...mockTiers];
let members = [...mockMembers];
let ledgers = [...mockLedgers];
let rules = [...mockRules];
let voucherBatches = [...mockVoucherBatches];
let voucherInventory = [...mockVoucherInventory];
let campaigns = [...mockCampaigns];
let partners = [...mockPartners];
let pendingActions = [...mockPendingActions];
let auditLogs = [...mockAuditLogs];
let adminUsers = [...mockAdminUsers];
export const handlers = [
    // ==========================================
    // AUTHENTICATION
    // ==========================================
    http.post(`${API_BASE_URL}/auth/login`, async ({ request }) => {
        const body = (await request.json());
        const user = adminUsers.find((u) => (u.username === body.username || u.email === body.username) && u.password === body.password);
        if (!user) {
            return HttpResponse.json({
                status: 'ERROR',
                error_code: 'INVALID_CREDENTIALS',
                message: 'Username atau password salah. Coba: superadmin / password123',
                timestamp: new Date().toISOString(),
            }, { status: 401 });
        }
        return HttpResponse.json({
            status: 'SUCCESS',
            data: {
                access_token: `mock-jwt-${user.role.toLowerCase()}-${Date.now()}`,
                refresh_token: `mock-refresh-${user.id}-${Date.now()}`,
                token_type: 'Bearer',
                expires_in: 3600,
                admin: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    status: user.status,
                },
            },
            timestamp: new Date().toISOString(),
        });
    }),
    http.post(`${API_BASE_URL}/auth/refresh`, () => {
        return HttpResponse.json({
            status: 'SUCCESS',
            data: {
                access_token: `mock-jwt-refreshed-${Date.now()}`,
                expires_in: 3600,
            },
            timestamp: new Date().toISOString(),
        });
    }),
    http.post(`${API_BASE_URL}/auth/logout`, () => {
        return HttpResponse.json({
            status: 'SUCCESS',
            message: 'Session terminated.',
            timestamp: new Date().toISOString(),
        });
    }),
    http.get(`${API_BASE_URL}/auth/me`, ({ request }) => {
        const authHeader = request.headers.get('Authorization') || '';
        const user = adminUsers[0]; // Default to superadmin for dev mock
        return HttpResponse.json({
            status: 'SUCCESS',
            data: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                status: user.status,
                permissions: ['*'],
                created_at: user.created_at,
            },
            timestamp: new Date().toISOString(),
        });
    }),
    // ==========================================
    // DASHBOARD
    // ==========================================
    http.get(`${API_BASE_URL}/dashboard/summary`, () => {
        return HttpResponse.json({
            status: 'SUCCESS',
            data: {
                members: {
                    total_registered: 13400,
                    active_30d: 9820,
                    active_60d: 11200,
                    active_90d: 12150,
                    new_today: 48,
                },
                points: {
                    total_circulating: 52180900,
                    earned_today: 142500,
                    redeemed_today: 89000,
                    expired_today: 1200,
                },
                vouchers: {
                    total_active_batches: voucherBatches.filter((b) => b.status === 'ACTIVE').length,
                    total_available_stock: voucherBatches.reduce((acc, b) => acc + b.available_stock, 0),
                    claimed_today: 184,
                },
                campaigns: {
                    total_active: campaigns.filter((c) => c.status === 'ACTIVE').length,
                    total_participants: campaigns.reduce((acc, c) => acc + (c.participant_count || 0), 0),
                    completions_today: 92,
                },
            },
            timestamp: new Date().toISOString(),
        });
    }),
    http.get(`${API_BASE_URL}/dashboard/transaction-feed`, ({ request }) => {
        const url = new URL(request.url);
        const page = parseInt(url.searchParams.get('page') || '1', 10);
        const limit = parseInt(url.searchParams.get('limit') || '20', 10);
        const start = (page - 1) * limit;
        const paginated = ledgers.slice(start, start + limit);
        return HttpResponse.json({
            status: 'SUCCESS',
            data: paginated,
            pagination: {
                page,
                limit,
                total_items: ledgers.length,
                total_pages: Math.ceil(ledgers.length / limit),
            },
            timestamp: new Date().toISOString(),
        });
    }),
    http.get(`${API_BASE_URL}/dashboard/charts/earning-trend`, () => {
        return HttpResponse.json({
            status: 'SUCCESS',
            data: [
                { date: '03 Nov', total_earned: 95000, total_redeemed: 62000, total_expired: 100 },
                { date: '04 Nov', total_earned: 112000, total_redeemed: 71000, total_expired: 150 },
                { date: '05 Nov', total_earned: 128000, total_redeemed: 84000, total_expired: 0 },
                { date: '06 Nov', total_earned: 135000, total_redeemed: 91000, total_expired: 50 },
                { date: '07 Nov', total_earned: 140000, total_redeemed: 88000, total_expired: 200 },
                { date: '08 Nov', total_earned: 165000, total_redeemed: 110000, total_expired: 300 },
                { date: '09 Nov', total_earned: 142500, total_redeemed: 89000, total_expired: 120 },
            ],
            timestamp: new Date().toISOString(),
        });
    }),
    // ==========================================
    // MEMBERS & ACCOUNTS
    // ==========================================
    http.get(`${API_BASE_URL}/members`, ({ request }) => {
        const url = new URL(request.url);
        const page = parseInt(url.searchParams.get('page') || '1', 10);
        const limit = parseInt(url.searchParams.get('limit') || '20', 10);
        const search = url.searchParams.get('search')?.toLowerCase() || '';
        const status = url.searchParams.get('status');
        let filtered = members;
        if (search) {
            filtered = filtered.filter((m) => m.full_name.toLowerCase().includes(search) ||
                m.account_number.toLowerCase().includes(search) ||
                m.phone.includes(search) ||
                m.email.toLowerCase().includes(search));
        }
        if (status) {
            filtered = filtered.filter((m) => m.status === status);
        }
        const start = (page - 1) * limit;
        const paginated = filtered.slice(start, start + limit);
        return HttpResponse.json({
            status: 'SUCCESS',
            data: paginated,
            pagination: {
                page,
                limit,
                total_items: filtered.length,
                total_pages: Math.ceil(filtered.length / limit),
            },
            timestamp: new Date().toISOString(),
        });
    }),
    http.get(`${API_BASE_URL}/members/:id`, ({ params }) => {
        const member = members.find((m) => m.id === params.id);
        if (!member) {
            return HttpResponse.json({ status: 'ERROR', error_code: 'NOT_FOUND', message: 'Member tidak ditemukan', timestamp: new Date().toISOString() }, { status: 404 });
        }
        return HttpResponse.json({
            status: 'SUCCESS',
            data: member,
            timestamp: new Date().toISOString(),
        });
    }),
    http.patch(`${API_BASE_URL}/members/:id/status`, async ({ params, request }) => {
        const body = (await request.json());
        const memberIndex = members.findIndex((m) => m.id === params.id);
        if (memberIndex === -1) {
            return HttpResponse.json({ status: 'ERROR', message: 'Member not found' }, { status: 404 });
        }
        const prev = members[memberIndex].status;
        members[memberIndex].status = body.status;
        members[memberIndex].updated_at = new Date().toISOString();
        // Log to audit
        auditLogs.unshift({
            id: `aud-${Date.now()}`,
            admin: { id: 'adm-0000-0001', username: 'superadmin', role: 'SUPER_ADMIN' },
            action: 'UPDATE_MEMBER_STATUS',
            target_resource: `members/${params.id}`,
            old_value: { status: prev },
            new_value: { status: body.status, reason: body.reason },
            ip_address: '127.0.0.1',
            created_at: new Date().toISOString(),
        });
        return HttpResponse.json({
            status: 'SUCCESS',
            data: {
                member_id: params.id,
                previous_status: prev,
                new_status: body.status,
                updated_by: 'superadmin',
                updated_at: new Date().toISOString(),
            },
            timestamp: new Date().toISOString(),
        });
    }),
    http.post(`${API_BASE_URL}/members/:id/adjustments`, async ({ params, request }) => {
        const body = (await request.json());
        const actionId = `act-${Date.now()}`;
        const newAction = {
            id: actionId,
            maker: { id: 'adm-0000-0003', username: 'cs.agent', role: 'OPS_CS' },
            action_type: 'POINT_ADJUSTMENT',
            target_resource: `members/${params.id}/adjustments`,
            payload: { member_id: params.id, ...body },
            status: 'PENDING',
            created_at: new Date().toISOString(),
        };
        pendingActions.unshift(newAction);
        return HttpResponse.json({
            status: 'PENDING_APPROVAL',
            data: {
                action_id: actionId,
                requires_checker: true,
                maker_id: 'adm-0000-0003',
            },
            message: 'Permintaan penyesuaian poin berhasil dibuat dan masuk antrean persetujuan (Maker-Checker).',
            timestamp: new Date().toISOString(),
        }, { status: 202 });
    }),
    http.get(`${API_BASE_URL}/members/:id/transactions`, ({ params }) => {
        const txs = ledgers.filter((l) => l.member_id === params.id);
        return HttpResponse.json({
            status: 'SUCCESS',
            data: txs,
            pagination: { page: 1, limit: 50, total_items: txs.length, total_pages: 1 },
            timestamp: new Date().toISOString(),
        });
    }),
    // ==========================================
    // TIERS & MULTIPLIERS
    // ==========================================
    http.get(`${API_BASE_URL}/tiers`, () => {
        return HttpResponse.json({
            status: 'SUCCESS',
            data: tiers,
            timestamp: new Date().toISOString(),
        });
    }),
    http.post(`${API_BASE_URL}/tiers`, async ({ request }) => {
        const body = (await request.json());
        const newTier = {
            id: `tier-${Date.now()}`,
            ...body,
            member_count: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
        tiers.push(newTier);
        return HttpResponse.json({ status: 'SUCCESS', data: newTier, message: 'Tier configuration saved successfully.' }, { status: 201 });
    }),
    http.put(`${API_BASE_URL}/tiers/:id`, async ({ params, request }) => {
        const body = (await request.json());
        const index = tiers.findIndex((t) => t.id === params.id);
        if (index === -1)
            return HttpResponse.json({ status: 'ERROR', message: 'Tier not found' }, { status: 404 });
        tiers[index] = { ...tiers[index], ...body, updated_at: new Date().toISOString() };
        return HttpResponse.json({ status: 'SUCCESS', data: tiers[index] });
    }),
    http.delete(`${API_BASE_URL}/tiers/:id`, ({ params }) => {
        tiers = tiers.filter((t) => t.id !== params.id);
        return HttpResponse.json({ status: 'SUCCESS', message: 'Tier removed successfully.' });
    }),
    // ==========================================
    // RULES BUILDER
    // ==========================================
    http.get(`${API_BASE_URL}/rules`, ({ request }) => {
        const url = new URL(request.url);
        const search = url.searchParams.get('search')?.toLowerCase() || '';
        const status = url.searchParams.get('status');
        let filtered = rules;
        if (search)
            filtered = filtered.filter((r) => r.rule_name.toLowerCase().includes(search) || r.rule_code.toLowerCase().includes(search));
        if (status)
            filtered = filtered.filter((r) => r.status === status);
        return HttpResponse.json({
            status: 'SUCCESS',
            data: filtered,
            pagination: { page: 1, limit: 50, total_items: filtered.length, total_pages: 1 },
            timestamp: new Date().toISOString(),
        });
    }),
    http.post(`${API_BASE_URL}/rules`, async ({ request }) => {
        const body = (await request.json());
        const newRule = {
            id: `rul-${Date.now()}`,
            ...body,
            status: 'ACTIVE',
            created_by: 'adm-0000-0002',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
        rules.unshift(newRule);
        return HttpResponse.json({
            status: 'SUCCESS',
            data: { rule_id: newRule.id, rule_code: newRule.rule_code, state: 'ACTIVE' },
            message: 'Dynamic rule successfully stored in PostgreSQL for runtime engine evaluation.',
            timestamp: new Date().toISOString(),
        }, { status: 201 });
    }),
    http.put(`${API_BASE_URL}/rules/:id`, async ({ params, request }) => {
        const body = (await request.json());
        const index = rules.findIndex((r) => r.id === params.id);
        if (index === -1)
            return HttpResponse.json({ status: 'ERROR', message: 'Rule not found' }, { status: 404 });
        rules[index] = { ...rules[index], ...body, updated_at: new Date().toISOString() };
        return HttpResponse.json({ status: 'SUCCESS', data: rules[index] });
    }),
    http.patch(`${API_BASE_URL}/rules/:id/status`, async ({ params, request }) => {
        const body = (await request.json());
        const index = rules.findIndex((r) => r.id === params.id);
        if (index === -1)
            return HttpResponse.json({ status: 'ERROR', message: 'Rule not found' }, { status: 404 });
        rules[index].status = body.status;
        rules[index].updated_at = new Date().toISOString();
        return HttpResponse.json({ status: 'SUCCESS', data: rules[index] });
    }),
    http.delete(`${API_BASE_URL}/rules/:id`, ({ params }) => {
        rules = rules.filter((r) => r.id !== params.id);
        return HttpResponse.json({ status: 'SUCCESS', message: 'Rule deleted.' });
    }),
    // ==========================================
    // VOUCHERS & INVENTORY
    // ==========================================
    http.get(`${API_BASE_URL}/voucher-batches`, ({ request }) => {
        const url = new URL(request.url);
        const search = url.searchParams.get('search')?.toLowerCase() || '';
        let filtered = voucherBatches;
        if (search)
            filtered = filtered.filter((b) => b.title.toLowerCase().includes(search) || b.batch_code.toLowerCase().includes(search));
        return HttpResponse.json({
            status: 'SUCCESS',
            data: filtered,
            pagination: { page: 1, limit: 50, total_items: filtered.length, total_pages: 1 },
            timestamp: new Date().toISOString(),
        });
    }),
    http.post(`${API_BASE_URL}/voucher-batches`, async ({ request }) => {
        const body = (await request.json());
        const newBatch = {
            id: `btc-${Date.now()}`,
            ...body,
            total_stock: 0,
            available_stock: 0,
            claimed_stock: 0,
            revoked_count: 0,
            status: 'ACTIVE',
            created_at: new Date().toISOString(),
        };
        voucherBatches.unshift(newBatch);
        return HttpResponse.json({ status: 'SUCCESS', data: newBatch }, { status: 201 });
    }),
    http.post(`${API_BASE_URL}/voucher-batches/:id/upload-codes`, async ({ params }) => {
        const batch = voucherBatches.find((b) => b.id === params.id);
        if (!batch)
            return HttpResponse.json({ status: 'ERROR', message: 'Batch not found' }, { status: 404 });
        batch.total_stock += 50;
        batch.available_stock += 50;
        return HttpResponse.json({
            status: 'SUCCESS',
            data: {
                batch_id: params.id,
                codes_imported: 50,
                duplicates_skipped: 0,
                new_total_stock: batch.total_stock,
                new_available_stock: batch.available_stock,
            },
            timestamp: new Date().toISOString(),
        });
    }),
    http.get(`${API_BASE_URL}/voucher-batches/:id/inventory`, ({ params }) => {
        const items = voucherInventory.filter((v) => v.batch_id === params.id);
        return HttpResponse.json({
            status: 'SUCCESS',
            data: items,
            pagination: { page: 1, limit: 50, total_items: items.length, total_pages: 1 },
            timestamp: new Date().toISOString(),
        });
    }),
    // ==========================================
    // CAMPAIGNS
    // ==========================================
    http.get(`${API_BASE_URL}/campaigns`, () => {
        return HttpResponse.json({
            status: 'SUCCESS',
            data: campaigns,
            pagination: { page: 1, limit: 50, total_items: campaigns.length, total_pages: 1 },
            timestamp: new Date().toISOString(),
        });
    }),
    http.post(`${API_BASE_URL}/campaigns`, async ({ request }) => {
        const body = (await request.json());
        const newCmp = {
            id: `cmp-${Date.now()}`,
            ...body,
            status: 'ACTIVE',
            participant_count: 0,
            completion_count: 0,
            created_by: 'adm-0000-0002',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
        campaigns.unshift(newCmp);
        return HttpResponse.json({ status: 'SUCCESS', data: newCmp }, { status: 201 });
    }),
    // ==========================================
    // PARTNERS & SETTLEMENT
    // ==========================================
    http.get(`${API_BASE_URL}/partners`, () => {
        return HttpResponse.json({
            status: 'SUCCESS',
            data: partners,
            pagination: { page: 1, limit: 50, total_items: partners.length, total_pages: 1 },
            timestamp: new Date().toISOString(),
        });
    }),
    http.post(`${API_BASE_URL}/partners`, async ({ request }) => {
        const body = (await request.json());
        const newPartner = {
            id: `prt-${Date.now()}`,
            ...body,
            status: 'ACTIVE',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
        partners.unshift(newPartner);
        return HttpResponse.json({ status: 'SUCCESS', data: newPartner }, { status: 201 });
    }),
    http.get(`${API_BASE_URL}/partners/settlement-report`, ({ request }) => {
        const url = new URL(request.url);
        const partnerId = url.searchParams.get('partner_id') || 'prt-0001-kenangan';
        const report = mockSettlementReports[partnerId] || mockSettlementReports['prt-0001-kenangan'];
        return HttpResponse.json({
            status: 'SUCCESS',
            data: report,
            timestamp: new Date().toISOString(),
        });
    }),
    // ==========================================
    // PENDING ACTIONS (MAKER-CHECKER)
    // ==========================================
    http.get(`${API_BASE_URL}/pending-actions`, ({ request }) => {
        const url = new URL(request.url);
        const status = url.searchParams.get('status');
        let filtered = pendingActions;
        if (status)
            filtered = filtered.filter((a) => a.status === status);
        return HttpResponse.json({
            status: 'SUCCESS',
            data: filtered,
            pagination: { page: 1, limit: 50, total_items: filtered.length, total_pages: 1 },
            timestamp: new Date().toISOString(),
        });
    }),
    http.post(`${API_BASE_URL}/pending-actions/:id/approve`, ({ params }) => {
        const action = pendingActions.find((a) => a.id === params.id);
        if (!action)
            return HttpResponse.json({ status: 'ERROR', message: 'Action not found' }, { status: 404 });
        action.status = 'APPROVED';
        action.resolved_at = new Date().toISOString();
        action.checker = { id: 'adm-0000-0001', username: 'superadmin' };
        // Dispatched to ledger
        if (action.action_type === 'POINT_ADJUSTMENT') {
            const payload = action.payload;
            ledgers.unshift({
                id: `ldg-${Date.now()}`,
                member_id: payload.member_id,
                type: payload.adjustment_type === 'CREDIT' ? 'ADJUSTMENT_CREDIT' : 'ADJUSTMENT_DEBIT',
                amount: payload.amount,
                balance_after: 13500,
                reference_id: payload.external_ticket_ref || 'CS-ADJ',
                idempotency_key: `idemp-${Date.now()}`,
                created_at: new Date().toISOString(),
            });
        }
        return HttpResponse.json({
            status: 'APPROVED',
            data: {
                action_id: params.id,
                executed_at: new Date().toISOString(),
            },
            message: 'Aksi telah disetujui. Perintah transaksi telah dikirimkan ke ledger service.',
            timestamp: new Date().toISOString(),
        });
    }),
    http.post(`${API_BASE_URL}/pending-actions/:id/reject`, async ({ params, request }) => {
        const body = (await request.json());
        const action = pendingActions.find((a) => a.id === params.id);
        if (!action)
            return HttpResponse.json({ status: 'ERROR', message: 'Action not found' }, { status: 404 });
        action.status = 'REJECTED';
        action.rejection_reason = body.rejection_reason || 'Ditolak oleh supervisor';
        action.resolved_at = new Date().toISOString();
        action.checker = { id: 'adm-0000-0001', username: 'superadmin' };
        return HttpResponse.json({
            status: 'SUCCESS',
            message: 'Aksi telah ditolak.',
            timestamp: new Date().toISOString(),
        });
    }),
    // ==========================================
    // AUDIT LOGS
    // ==========================================
    http.get(`${API_BASE_URL}/audit-logs`, () => {
        return HttpResponse.json({
            status: 'SUCCESS',
            data: auditLogs,
            pagination: { page: 1, limit: 50, total_items: auditLogs.length, total_pages: 1 },
            timestamp: new Date().toISOString(),
        });
    }),
    // ==========================================
    // ADMIN USERS
    // ==========================================
    http.get(`${API_BASE_URL}/users`, () => {
        const list = adminUsers.map(({ password, ...u }) => u);
        return HttpResponse.json({
            status: 'SUCCESS',
            data: list,
            pagination: { page: 1, limit: 50, total_items: list.length, total_pages: 1 },
            timestamp: new Date().toISOString(),
        });
    }),
];
