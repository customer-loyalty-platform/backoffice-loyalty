// ============================================================================
// Loyalty BackOffice — Member API Contracts
// ============================================================================

import type { LedgerType, MemberStatus } from '@/types/enums';
import type { PaginationParams } from './common.contract';

// ---------------------------------------------------------------------------
// Point Ledger
// ---------------------------------------------------------------------------

/** A single entry in the member's point ledger. */
export interface PointLedgerEntry {
  id: string;
  member_id: string;
  /** Classification of this ledger movement. */
  type: LedgerType;
  /** Signed point amount (positive for credits, negative for debits). */
  amount: number;
  /** Running balance after this entry was applied. */
  balance_after: number;
  /** External reference (e.g. transaction ID, campaign code). */
  reference_id: string;
  /** Client-generated key to prevent duplicate processing. */
  idempotency_key: string;
  /** ISO-8601 creation timestamp. */
  created_at: string;
}

// ---------------------------------------------------------------------------
// Member List / Detail
// ---------------------------------------------------------------------------

/** Compact member representation used in list views. */
export interface MemberListItem {
  id: string;
  account_number: string;
  full_name: string;
  phone: string;
  email: string;
  /** The member's current tier assignment. */
  current_tier: {
    id: string;
    tier_name: string;
    rank: number;
  };
  /** Real-time point balance snapshot. */
  balance: {
    total_points: number;
    locked_points: number;
    expiring_points: number;
  };
  status: MemberStatus;
  /** ISO-8601 timestamps. */
  created_at: string;
  updated_at: string;
}

/**
 * Full member profile used in detail views.
 *
 * Extends the list item with lifetime aggregates, tier-qualifying info,
 * linked payment accounts, and recent ledger entries.
 */
export interface MemberDetail extends MemberListItem {
  /** Total points earned across the member's lifetime. */
  lifetime_earned: number;
  /** Total points redeemed across the member's lifetime. */
  lifetime_redeemed: number;
  /** Points counted toward the next tier evaluation. */
  tier_qualifying_points: number;
  /** ISO-8601 date of the next scheduled tier evaluation. */
  tier_evaluation_date: string;
  /** External accounts linked to this member (e.g. bank cards, wallets). */
  linked_accounts: LinkedAccount[];
  /** Most recent ledger entries (server-limited). */
  recent_transactions: PointLedgerEntry[];
}

/** An external account linked to a loyalty member. */
export interface LinkedAccount {
  id: string;
  account_type: string;
  account_identifier: string;
  linked_at: string;
}

// ---------------------------------------------------------------------------
// Member Status Update
// ---------------------------------------------------------------------------

/** PATCH /members/:id/status — request body. */
export interface UpdateMemberStatusRequest {
  status: MemberStatus;
  reason: string;
}

/** PATCH /members/:id/status — response payload. */
export interface UpdateMemberStatusResponse {
  member_id: string;
  previous_status: MemberStatus;
  new_status: MemberStatus;
  /** Admin who performed the status change. */
  updated_by: string;
  /** ISO-8601 timestamp of the change. */
  updated_at: string;
}

// ---------------------------------------------------------------------------
// Point Adjustment (Maker-Checker)
// ---------------------------------------------------------------------------

/**
 * POST /members/:id/points/adjust — request body.
 *
 * Initiates a maker-checker workflow; the adjustment is not applied
 * immediately but requires checker approval.
 */
export interface PointAdjustmentRequest {
  adjustment_type: 'CREDIT' | 'DEBIT';
  amount: number;
  reason_code: string;
  notes: string;
  /** Optional reference to an external support ticket. */
  external_ticket_ref: string;
}

/** POST /members/:id/points/adjust — response payload. */
export interface PointAdjustmentResponse {
  status: 'PENDING_APPROVAL';
  /** ID of the created pending action. */
  action_id: string;
  /** Whether a checker's approval is required. */
  requires_checker: boolean;
  /** Admin ID of the maker who initiated the adjustment. */
  maker_id: string;
}

// ---------------------------------------------------------------------------
// Search / Filter Params
// ---------------------------------------------------------------------------

/** Query parameters for the member list endpoint. */
export interface MemberSearchParams extends PaginationParams {
  /** Free-text search across name, email, phone, account number. */
  search?: string;
  /** Filter by member status. */
  status?: MemberStatus;
  /** Filter by tier ID. */
  tier_id?: string;
}

/** Query parameters for a member's transaction history. */
export interface TransactionSearchParams extends PaginationParams {
  /** Filter by ledger type. */
  type?: LedgerType;
  /** ISO-8601 start date (inclusive). */
  start_date?: string;
  /** ISO-8601 end date (inclusive). */
  end_date?: string;
}
