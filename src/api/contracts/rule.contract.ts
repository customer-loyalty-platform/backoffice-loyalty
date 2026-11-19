// ============================================================================
// Loyalty BackOffice — Dynamic Rule API Contracts
// ============================================================================

import type { ConditionOperator, RuleActionType, RuleStatus } from '@/types/enums';
import type { PaginationParams } from './common.contract';

// ---------------------------------------------------------------------------
// Rule Conditions
// ---------------------------------------------------------------------------

/**
 * A single condition evaluated against a transaction or event payload.
 *
 * The `value` type varies depending on the `operator`:
 * - Scalar operators (EQUALS, GREATER_THAN, etc.) → `string | number | boolean`
 * - Range / set operators (BETWEEN, IN, NOT_IN) → `(string | number)[]`
 */
export interface RuleCondition {
  /** The field path in the event payload to evaluate. */
  field: string;
  /** Comparison operator. */
  operator: ConditionOperator;
  /** Comparison value(s). */
  value: string | number | boolean | (string | number)[];
}

/**
 * Logical grouping of conditions. At most one of `and` / `or` should be set.
 *
 * - `and` — all conditions must be true.
 * - `or`  — at least one condition must be true.
 */
export interface RuleConditionGroup {
  and?: RuleCondition[];
  or?: RuleCondition[];
}

// ---------------------------------------------------------------------------
// Rule Actions
// ---------------------------------------------------------------------------

/** The action executed when a rule's conditions are satisfied. */
export interface RuleAction {
  type: RuleActionType;
  /** Multiplier factor applied to points (for multiplier-type actions). */
  multiplier_factor?: number;
  /** Fixed bonus points to award (for bonus-type actions). */
  bonus_points?: number;
  /** Maximum points that can be earned from this action per transaction. */
  max_points_cap?: number;
}

// ---------------------------------------------------------------------------
// Dynamic Rule
// ---------------------------------------------------------------------------

/** Full dynamic rule entity as returned by the API. */
export interface DynamicRule {
  id: string;
  /** Unique machine-readable rule code. */
  rule_code: string;
  /** Human-readable rule name. */
  rule_name: string;
  status: RuleStatus;
  /** Evaluation priority — lower numbers are evaluated first. */
  priority: number;
  /** ISO-8601 datetime when the rule becomes effective. */
  start_time: string;
  /** ISO-8601 datetime when the rule expires. */
  end_time: string;
  /** Serialised condition tree (stored as JSON on the server). */
  conditions_json: RuleConditionGroup;
  /** Serialised action definition (stored as JSON on the server). */
  action_json: RuleAction;
  /** Admin ID of the rule creator. */
  created_by: string;
  /** ISO-8601 timestamps. */
  created_at: string;
  updated_at: string;
}

// ---------------------------------------------------------------------------
// Create / Update Requests
// ---------------------------------------------------------------------------

/** POST /rules — request body. */
export interface CreateRuleRequest {
  rule_code: string;
  rule_name: string;
  priority: number;
  start_time: string;
  end_time: string;
  conditions_json: RuleConditionGroup;
  action_json: RuleAction;
}

/** PUT /rules/:id — request body (same shape as create). */
export type UpdateRuleRequest = CreateRuleRequest;

/** PATCH /rules/:id/status — request body. */
export interface UpdateRuleStatusRequest {
  status: 'ACTIVE' | 'PAUSED' | 'DRAFT';
}

// ---------------------------------------------------------------------------
// Search Params
// ---------------------------------------------------------------------------

/** Query parameters for the rules list endpoint. */
export interface RuleSearchParams extends PaginationParams {
  /** Filter by rule status. */
  status?: RuleStatus;
  /** Free-text search across rule code and name. */
  search?: string;
}
