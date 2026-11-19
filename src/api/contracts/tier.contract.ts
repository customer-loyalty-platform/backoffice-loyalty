// ============================================================================
// Loyalty BackOffice — Tier API Contracts
// ============================================================================

import type { QualificationType } from '@/types/enums';

// ---------------------------------------------------------------------------
// Tier Perk
// ---------------------------------------------------------------------------

/** A single perk granted to members who hold this tier. */
export interface TierPerk {
  /** Machine-readable perk identifier. */
  perk_code: string;
  /** Human-readable perk name. */
  perk_name: string;
  /** Description of the perk benefit. */
  description: string;
  /** Whether this perk is currently active. */
  is_active: boolean;
}

// ---------------------------------------------------------------------------
// Tier Definition
// ---------------------------------------------------------------------------

/**
 * Full tier definition including qualification criteria and perks.
 *
 * Tiers are ordered by `rank` (lower rank = lower tier).
 */
export interface TierDefinition {
  id: string;
  tier_name: string;
  /** Numeric rank for ordering tiers (1 = lowest). */
  rank: number;
  /** How a member qualifies for this tier. */
  qualification_type: QualificationType;
  /** Minimum threshold value for qualification (meaning depends on `qualification_type`). */
  min_threshold: number;
  /** Points-earning multiplier applied to members in this tier. */
  multiplier: number;
  /** Optional perks configuration; `null` when no perks are defined. */
  perks_config: TierPerk[] | null;
  /** Number of members currently holding this tier (optional, populated in list views). */
  member_count?: number;
  /** ISO-8601 timestamps. */
  created_at: string;
  updated_at: string;
}

// ---------------------------------------------------------------------------
// Create / Update Requests
// ---------------------------------------------------------------------------

/** POST /tiers — request body. */
export interface CreateTierRequest {
  tier_name: string;
  rank: number;
  qualification_type: QualificationType;
  min_threshold: number;
  multiplier: number;
  perks_config?: TierPerk[];
}

/** PUT /tiers/:id — request body (same shape as create). */
export type UpdateTierRequest = CreateTierRequest;
