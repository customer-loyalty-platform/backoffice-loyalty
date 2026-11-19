// ============================================================================
// Loyalty BackOffice — Campaign API Contracts
// ============================================================================

import type {
  CampaignStatus,
  CampaignType,
  RewardType,
  TargetType,
} from '@/types/enums';
import type { PaginationParams } from './common.contract';

// ---------------------------------------------------------------------------
// Target & Reward Definitions
// ---------------------------------------------------------------------------

/**
 * Defines the completion criteria for a campaign.
 *
 * Members must meet the `target_value` for the chosen `target_type`
 * within the optional `time_window_days`.
 */
export interface TargetCriteria {
  /** The metric being tracked. */
  target_type: TargetType;
  /** Numeric threshold the member must reach. */
  target_value: number;
  /** Optional list of transaction-category codes that qualify. */
  category_filters?: string[];
  /** Rolling window (in days) within which progress is measured. */
  time_window_days?: number;
}

/**
 * Defines the reward granted upon campaign completion.
 */
export interface RewardDefinition {
  reward_type: RewardType;
  /** Bonus points to credit (when `reward_type` is `BONUS_POINTS`). */
  bonus_points?: number;
  /** Batch code of the voucher to issue (when `reward_type` is `VOUCHER_ISSUE`). */
  voucher_batch_code?: string;
}

// ---------------------------------------------------------------------------
// Campaign Entity
// ---------------------------------------------------------------------------

/** Full campaign entity as returned by the API. */
export interface Campaign {
  id: string;
  /** Unique machine-readable campaign code. */
  campaign_code: string;
  title: string;
  description: string;
  /** URL of the campaign banner image. */
  banner_url?: string;
  campaign_type: CampaignType;
  status: CampaignStatus;
  /** ISO-8601 start date of the campaign. */
  start_date: string;
  /** ISO-8601 end date of the campaign. */
  end_date: string;
  /** Completion criteria for participants. */
  target_criteria: TargetCriteria;
  /** Reward granted upon completion. */
  reward_definition: RewardDefinition;
  /** Number of members who have joined the campaign (optional, populated in list views). */
  participant_count?: number;
  /** Number of members who have completed the campaign (optional). */
  completion_count?: number;
  /** Admin ID of the campaign creator. */
  created_by: string;
  /** ISO-8601 timestamps. */
  created_at: string;
  updated_at: string;
}

// ---------------------------------------------------------------------------
// Create / Update Requests
// ---------------------------------------------------------------------------

/** POST /campaigns — request body. */
export interface CreateCampaignRequest {
  campaign_code: string;
  title: string;
  description: string;
  banner_url?: string;
  campaign_type: CampaignType;
  start_date: string;
  end_date: string;
  target_criteria: TargetCriteria;
  reward_definition: RewardDefinition;
}

/** PUT /campaigns/:id — request body (same shape as create). */
export type UpdateCampaignRequest = CreateCampaignRequest;

/** PATCH /campaigns/:id/status — request body. */
export interface UpdateCampaignStatusRequest {
  status: 'ACTIVE' | 'PAUSED' | 'DRAFT';
}

// ---------------------------------------------------------------------------
// Search Params
// ---------------------------------------------------------------------------

/** Query parameters for the campaigns list endpoint. */
export interface CampaignSearchParams extends PaginationParams {
  /** Filter by campaign status. */
  status?: CampaignStatus;
  /** Free-text search across campaign code and title. */
  search?: string;
}
