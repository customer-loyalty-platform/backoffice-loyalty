// ============================================================================
// Loyalty BackOffice — Dashboard API Contracts
// ============================================================================

// ---------------------------------------------------------------------------
// Dashboard Summary
// ---------------------------------------------------------------------------

/**
 * Aggregated dashboard summary providing a snapshot of key programme metrics.
 *
 * Returned by GET /dashboard/summary.
 */
export interface DashboardSummary {
  /** Member registration & activity metrics. */
  members: {
    total_registered: number;
    /** Members active within the last 30 days. */
    active_30d: number;
    /** Members active within the last 60 days. */
    active_60d: number;
    /** Members active within the last 90 days. */
    active_90d: number;
    /** Members registered today. */
    new_today: number;
  };
  /** Points economy metrics (all values are absolute point amounts). */
  points: {
    /** Total points currently in circulation (earned − redeemed − expired). */
    total_circulating: number;
    earned_today: number;
    redeemed_today: number;
    expired_today: number;
  };
  /** Voucher programme metrics. */
  vouchers: {
    /** Number of voucher batches with status ACTIVE. */
    total_active_batches: number;
    /** Sum of available stock across all active batches. */
    total_available_stock: number;
    /** Vouchers claimed today. */
    claimed_today: number;
  };
  /** Campaign programme metrics. */
  campaigns: {
    /** Number of campaigns currently ACTIVE. */
    total_active: number;
    /** Total participants across all active campaigns. */
    total_participants: number;
    /** Campaign completions recorded today. */
    completions_today: number;
  };
}

// ---------------------------------------------------------------------------
// Chart Data
// ---------------------------------------------------------------------------

/** A single data point in a time-series chart. */
export interface ChartDataPoint {
  /** ISO-8601 date string (granularity-dependent). */
  date: string;
  total_earned: number;
  total_redeemed: number;
  total_expired: number;
}

/** Query parameters for the dashboard chart endpoint. */
export interface ChartParams {
  /** Time period to cover. */
  period: '7d' | '30d' | '90d';
  /** Aggregation granularity. */
  granularity: 'daily' | 'weekly';
}
