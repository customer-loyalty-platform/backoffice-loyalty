import type { PartnerMerchant, SettlementReport } from '@/api/contracts/partner.contract';

export const mockPartners: PartnerMerchant[] = [
  {
    id: 'prt-0001-kenangan',
    merchant_code: 'MRCH_KOPI_KENANGAN',
    merchant_name: 'PT Bumi Berkah Boga (Kopi Kenangan)',
    contact_email: 'partnership@kopikenangan.com',
    contact_phone: '+62215082001',
    par_value_per_point: 10.0,
    commission_rate: 0.15,
    settlement_currency: 'IDR',
    status: 'ACTIVE',
    contract_start_date: '2026-01-01T00:00:00Z',
    contract_end_date: '2026-12-31T23:59:59Z',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'prt-0002-mrt',
    merchant_code: 'MRCH_MRT_JAKARTA',
    merchant_name: 'PT MRT Jakarta (Perseroda)',
    contact_email: 'loyalty@jakartamrt.co.id',
    contact_phone: '+62213906444',
    par_value_per_point: 10.0,
    commission_rate: 0.1,
    settlement_currency: 'IDR',
    status: 'ACTIVE',
    contract_start_date: '2025-06-01T00:00:00Z',
    contract_end_date: '2027-05-31T23:59:59Z',
    created_at: '2025-06-01T00:00:00Z',
    updated_at: '2025-06-01T00:00:00Z',
  },
  {
    id: 'prt-0003-alfa',
    merchant_code: 'MRCH_ALFAMART',
    merchant_name: 'PT Sumber Alfaria Trijaya Tbk',
    contact_email: 'merchant@alfamart.co.id',
    contact_phone: '+622155755999',
    par_value_per_point: 10.0,
    commission_rate: 0.2,
    settlement_currency: 'IDR',
    status: 'ACTIVE',
    contract_start_date: '2026-03-01T00:00:00Z',
    contract_end_date: '2027-02-28T23:59:59Z',
    created_at: '2026-03-01T00:00:00Z',
    updated_at: '2026-03-01T00:00:00Z',
  },
];

export const mockSettlementReports: Record<string, SettlementReport> = {
  'prt-0001-kenangan': {
    partner: {
      id: 'prt-0001-kenangan',
      merchant_name: 'PT Bumi Berkah Boga (Kopi Kenangan)',
      merchant_code: 'MRCH_KOPI_KENANGAN',
    },
    period: {
      start: '2026-10-01T00:00:00Z',
      end: '2026-10-31T23:59:59Z',
    },
    summary: {
      total_points_redeemed: 1290000,
      par_value_per_point: 10.0,
      gross_liability: 12900000,
      commission_rate: 0.15,
      platform_commission: 1935000,
      net_payable_to_partner: 10965000,
    },
    transactions: [
      { transaction_id: 'SET-TRX-001', member_id: 'usr_99201920', points_redeemed: 5000, monetary_value: 50000, redeemed_at: '2026-10-05T12:30:00Z' },
      { transaction_id: 'SET-TRX-002', member_id: 'usr_88301142', points_redeemed: 5000, monetary_value: 50000, redeemed_at: '2026-10-08T15:20:00Z' },
      { transaction_id: 'SET-TRX-003', member_id: 'usr_66192834', points_redeemed: 10000, monetary_value: 100000, redeemed_at: '2026-10-15T09:10:00Z' },
    ],
  },
};

