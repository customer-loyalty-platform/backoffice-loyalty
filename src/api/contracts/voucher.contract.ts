// ============================================================================
// Loyalty BackOffice — Voucher API Contracts
// ============================================================================

import type { VoucherStatus } from '@/types/enums';
import type { PaginationParams } from './common.contract';

// ---------------------------------------------------------------------------
// Voucher Batch
// ---------------------------------------------------------------------------

/**
 * A voucher batch groups a set of individual voucher codes under a single
 * campaign / partner offering.
 */
export interface VoucherBatch {
  id: string;
  /** Unique machine-readable batch identifier. */
  batch_code: string;
  /** Display title for the voucher batch. */
  title: string;
  description?: string;
  /** Brand name of the partner providing the voucher. */
  partner_brand?: string;
  /** Face value of each voucher in the batch (in settlement currency). */
  monetary_value?: number;
  /** Number of loyalty points required to claim one voucher. */
  points_cost: number;
  /** Legal terms & conditions attached to the voucher. */
  terms_conditions?: string;
  /** Total number of codes ever imported into the batch. */
  total_stock: number;
  /** Codes currently available for claiming. */
  available_stock: number;
  /** Codes that have been claimed by members. */
  claimed_stock: number;
  /** Codes that have been revoked after claiming. */
  revoked_count: number;
  /** Aggregate status of the batch. */
  status: 'ACTIVE' | 'INACTIVE' | 'DEPLETED';
  /** ISO-8601 creation timestamp. */
  created_at: string;
}

// ---------------------------------------------------------------------------
// Create Batch
// ---------------------------------------------------------------------------

/** POST /vouchers/batches — request body. */
export interface CreateVoucherBatchRequest {
  batch_code: string;
  title: string;
  description?: string;
  partner_brand?: string;
  monetary_value?: number;
  points_cost: number;
  terms_conditions?: string;
}

// ---------------------------------------------------------------------------
// Upload Codes
// ---------------------------------------------------------------------------

/** POST /vouchers/batches/:id/codes — response payload after CSV upload. */
export interface UploadCodesResponse {
  batch_id: string;
  /** Number of new codes successfully imported. */
  codes_imported: number;
  /** Number of duplicate codes that were skipped. */
  duplicates_skipped: number;
  /** Updated total stock after import. */
  new_total_stock: number;
  /** Updated available stock after import. */
  new_available_stock: number;
}

// ---------------------------------------------------------------------------
// Voucher Inventory (Individual Codes)
// ---------------------------------------------------------------------------

/** An individual voucher code within a batch. */
export interface VoucherInventoryItem {
  id: string;
  batch_id: string;
  /** The actual voucher code string. */
  voucher_code: string;
  status: VoucherStatus;
  /** Member ID who claimed this code (if claimed). */
  claimed_by?: string;
  /** ISO-8601 datetime when the code was claimed. */
  claimed_at?: string;
}

// ---------------------------------------------------------------------------
// Revoke Codes
// ---------------------------------------------------------------------------

/** POST /vouchers/revoke — request body. */
export interface RevokeVouchersRequest {
  /** IDs of the voucher inventory items to revoke. */
  voucher_ids: string[];
  /** Reason for revocation (audit trail). */
  reason: string;
}

// ---------------------------------------------------------------------------
// Search Params
// ---------------------------------------------------------------------------

/** Query parameters for the voucher batch list endpoint. */
export interface VoucherSearchParams extends PaginationParams {
  /** Free-text search across batch code and title. */
  search?: string;
}

/** Query parameters for the voucher inventory list within a batch. */
export interface VoucherInventorySearchParams extends PaginationParams {
  /** Filter by individual voucher status. */
  status?: VoucherStatus;
}
