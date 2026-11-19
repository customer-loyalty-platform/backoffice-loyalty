export const mockRules = [
    {
        id: 'rul-0001-offpeak',
        rule_code: 'RULE_OFFPEAK_TRANSIT_2026',
        rule_name: 'Off-Peak Travel 2x Bonus Points',
        status: 'ACTIVE',
        priority: 10,
        start_time: '2026-11-01T00:00:00Z',
        end_time: '2026-12-31T23:59:59Z',
        conditions_json: {
            and: [
                { field: 'transaction.time', operator: 'BETWEEN', value: ['10:00:00', '16:00:00'] },
                { field: 'transaction.category', operator: 'EQUALS', value: 'TRANSIT_OFFPEAK' },
                { field: 'member.status', operator: 'EQUALS', value: 'ACTIVE' },
            ],
        },
        action_json: {
            type: 'APPLY_CAMPAIGN_MULTIPLIER',
            multiplier_factor: 2.0,
            max_points_cap: 1000,
        },
        created_by: 'adm-0000-0002',
        created_at: '2026-10-25T10:00:00Z',
        updated_at: '2026-10-25T10:00:00Z',
    },
    {
        id: 'rul-0002-weekend',
        rule_code: 'RULE_WEEKEND_FNB_BOOST',
        rule_name: 'Weekend F&B Partner 1.5x Booster',
        status: 'ACTIVE',
        priority: 8,
        start_time: '2026-11-01T00:00:00Z',
        end_time: '2026-12-31T23:59:59Z',
        conditions_json: {
            and: [
                { field: 'transaction.category', operator: 'EQUALS', value: 'FNB' },
                { field: 'transaction.channel', operator: 'IN', value: ['POS_PARTNER', 'ONLINE'] },
            ],
        },
        action_json: {
            type: 'APPLY_CATEGORY_MULTIPLIER',
            multiplier_factor: 1.5,
        },
        created_by: 'adm-0000-0002',
        created_at: '2026-10-28T14:30:00Z',
        updated_at: '2026-10-28T14:30:00Z',
    },
    {
        id: 'rul-0003-onboarding',
        rule_code: 'RULE_FIRST_TRX_BONUS',
        rule_name: 'First Transaction 500 Bonus Points',
        status: 'ACTIVE',
        priority: 15,
        start_time: '2026-01-01T00:00:00Z',
        end_time: '2026-12-31T23:59:59Z',
        conditions_json: {
            and: [
                { field: 'member.transaction_count', operator: 'EQUALS', value: 0 },
                { field: 'transaction.amount', operator: 'GREATER_THAN', value: 50000 },
            ],
        },
        action_json: {
            type: 'APPLY_BONUS_POINTS',
            bonus_points: 500,
        },
        created_by: 'adm-0000-0001',
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
    },
    {
        id: 'rul-0004-holiday',
        rule_code: 'RULE_YEAR_END_SHOPPING',
        rule_name: 'Year-End Retail Mega Earning',
        status: 'DRAFT',
        priority: 5,
        start_time: '2026-12-15T00:00:00Z',
        end_time: '2027-01-05T23:59:59Z',
        conditions_json: {
            and: [
                { field: 'transaction.category', operator: 'EQUALS', value: 'RETAIL' },
                { field: 'transaction.amount', operator: 'GREATER_THAN', value: 250000 },
            ],
        },
        action_json: {
            type: 'APPLY_CAMPAIGN_MULTIPLIER',
            multiplier_factor: 2.5,
        },
        created_by: 'adm-0000-0002',
        created_at: '2026-11-05T16:00:00Z',
        updated_at: '2026-11-05T16:00:00Z',
    },
];
