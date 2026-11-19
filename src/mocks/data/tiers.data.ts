import type { TierDefinition } from '@/api/contracts/tier.contract';

export const mockTiers: TierDefinition[] = [
  {
    id: 'tier-0001-bronze',
    tier_name: 'Bronze',
    rank: 1,
    qualification_type: 'POINTS',
    min_threshold: 0,
    multiplier: 1.0,
    perks_config: [
      {
        perk_code: 'BASE_EARN',
        perk_name: 'Standard Earning',
        description: 'Earn 1 point per IDR 1,000 spend',
        is_active: true,
      },
    ],
    member_count: 8520,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'tier-0002-silver',
    tier_name: 'Silver',
    rank: 2,
    qualification_type: 'POINTS',
    min_threshold: 10000,
    multiplier: 1.25,
    perks_config: [
      {
        perk_code: 'SILVER_BONUS',
        perk_name: '1.25x Multiplier',
        description: 'Earn 25% extra points on all transactions',
        is_active: true,
      },
      {
        perk_code: 'BIRTHDAY_REWARD',
        perk_name: 'Birthday Voucher',
        description: 'Free IDR 50,000 birthday e-voucher',
        is_active: true,
      },
    ],
    member_count: 3410,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'tier-0003-gold',
    tier_name: 'Gold',
    rank: 3,
    qualification_type: 'SPEND',
    min_threshold: 5000000,
    multiplier: 1.5,
    perks_config: [
      {
        perk_code: 'GOLD_BONUS',
        perk_name: '1.5x Multiplier',
        description: 'Earn 50% extra points on all transactions',
        is_active: true,
      },
      {
        perk_code: 'PRIORITY_QUEUE',
        perk_name: 'Priority Fast-Track',
        description: 'Express lane check-in and turnstile priority',
        is_active: true,
      },
    ],
    member_count: 1120,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'tier-0004-platinum',
    tier_name: 'Platinum',
    rank: 4,
    qualification_type: 'SPEND',
    min_threshold: 15000000,
    multiplier: 2.0,
    perks_config: [
      {
        perk_code: 'PLATINUM_DOUBLE',
        perk_name: '2.0x Double Points',
        description: 'Earn double points on every qualifying spend',
        is_active: true,
      },
      {
        perk_code: 'VIP_LOUNGE',
        perk_name: 'VIP Airport & Transit Lounge',
        description: 'Unlimited access to partner transit lounges',
        is_active: true,
      },
      {
        perk_code: 'DEDICATED_CS',
        perk_name: '24/7 Dedicated Concierge',
        description: 'Personal loyalty concierge and support',
        is_active: true,
      },
    ],
    member_count: 350,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
];

