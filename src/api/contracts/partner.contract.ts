// ============================================================================
// Loyalty BackOffice — Partner / Merchant API Contracts
// ============================================================================

// ---------------------------------------------------------------------------
// Partner Merchant
// ---------------------------------------------------------------------------

/** Full partner merchant entity as returned by the API. */
export interface PartnerMerchant {
  id: string;
  /** Unique machine-readable merchant code. */
  merchant_code: string;
  merchant_name: string;
  contact_email: string;
  contact_phone: string;
  /** Monetary value assigned to each loyalty point for settlement. */
  par_value_per_point: number;
  /** Platform commission rate (0–1 decimal, e.g. 0.05 = 5 %). */
  commission_rate: number;
  /** ISO-4217 currency code used for settlements. */
  settlement_currency: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'TERMINATED';
  /** ISO-8601 date when the partner contract starts. */
  contract_start_date: string;
  /** ISO-8601 date when the partner contract ends (open-ended if omitted). */
  contract_end_date?: string;
  /** ISO-8601 timestamps. */
  created_at: string;
  updated_at: string;
}

// ---------------------------------------------------------------------------
// Create / Update Requests
// ---------------------------------------------------------------------------

/** POST /partners — request body. */
export interface CreatePartnerRequest {
  merchant_code: string;
  merchant_name: string;
  contact_email: string;
  contact_phone: string;
  par_value_per_point: number;
  commission_rate: number;
  settlement_currency: string;
  contract_start_date: string;
  contract_end_date?: string;
}

/** PUT /partners/:id — request body (same shape as create). */
export type UpdatePartnerRequest = CreatePartnerRequest;

// ---------------------------------------------------------------------------
// Settlement
// ---------------------------------------------------------------------------

/** A single redemption transaction included in a settlement report. */
export interface SettlementTransaction {
  transaction_id: string;
  member_id: string;
  points_redeemed: number;
  /** Monetary equivalent of the redeemed points. */
  monetary_value: number;
  /** ISO-8601 datetime when the redemption occurred. */
  redeemed_at: string;
}

/**
 * Settlement report for a specific partner over a given period.
 *
 * Contains the partner summary, aggregated financials, and the
 * individual redemption transactions that make up the report.
 */
export interface SettlementReport {
  /** Partner identification. */
  partner: {
    id: string;
    merchant_name: string;
    merchant_code: string;
  };
  /** Reporting period. */
  period: {
    /** ISO-8601 start date (inclusive). */
    start: string;
    /** ISO-8601 end date (inclusive). */
    end: string;
  };
  /** Aggregated financial summary. */
  summary: {
    total_points_redeemed: number;
    par_value_per_point: number;
    /** Gross monetary liability = total_points_redeemed × par_value_per_point. */
    gross_liability: number;
    commission_rate: number;
    /** Platform commission = gross_liability × commission_rate. */
    platform_commission: number;
    /** Net amount payable to the partner = gross_liability − platform_commission. */
    net_payable_to_partner: number;
  };
  /** Individual redemption transactions within the period. */
  transactions: SettlementTransaction[];
}

/** Query parameters for generating a settlement report. */
export interface SettlementReportParams {
  partner_id: string;
  /** ISO-8601 start date (inclusive). */
  period_start: string;
  /** ISO-8601 end date (inclusive). */
  period_end: string;
}
