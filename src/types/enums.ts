// ============================================================================
// Loyalty BackOffice — Shared Enum / Union Types
// ============================================================================

/** Roles available for back-office admin users. */
export type AdminRole = 'SUPER_ADMIN' | 'CAMPAIGN_SPEC' | 'OPS_CS' | 'FINANCE';

/** Lifecycle status of an admin account. */
export type AdminStatus = 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';

/** Lifecycle status of a loyalty-program member. */
export type MemberStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'DORMANT' | 'TERMINATED';

/** Status of a dynamic points rule. */
export type RuleStatus = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'EXPIRED';

/** Status of a gamification campaign. */
export type CampaignStatus = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'EXPIRED';

/** Discriminator for the type of gamification campaign. */
export type CampaignType = 'MISSION' | 'STREAK' | 'BADGE' | 'REFERRAL';

/** Point-ledger transaction classification. */
export type LedgerType = 'EARN' | 'REDEEM' | 'EXPIRATION' | 'ADJUSTMENT_CREDIT' | 'ADJUSTMENT_DEBIT';

/** Lifecycle status of an individual voucher code. */
export type VoucherStatus = 'AVAILABLE' | 'RESERVED' | 'CLAIMED' | 'REVOKED';

/** How a member qualifies for tier advancement. */
export type QualificationType = 'SPEND' | 'VISITS' | 'POINTS';

/** Status of a maker-checker pending action. */
export type PendingActionStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

/** Comparison operators used inside dynamic-rule conditions. */
export type ConditionOperator =
  | 'EQUALS'
  | 'NOT_EQUALS'
  | 'GREATER_THAN'
  | 'LESS_THAN'
  | 'BETWEEN'
  | 'IN'
  | 'NOT_IN'
  | 'CONTAINS';

/** Action types that a dynamic rule can trigger. */
export type RuleActionType =
  | 'APPLY_CAMPAIGN_MULTIPLIER'
  | 'APPLY_BONUS_POINTS'
  | 'APPLY_CATEGORY_MULTIPLIER';

/** Target metric tracked by a campaign. */
export type TargetType =
  | 'TRANSACTION_COUNT'
  | 'SPEND_AMOUNT'
  | 'CATEGORY_DIVERSITY'
  | 'CONSECUTIVE_DAYS';

/** Reward granted upon campaign completion. */
export type RewardType = 'BONUS_POINTS' | 'VOUCHER_ISSUE';
