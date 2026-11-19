// ============================================================================
// Loyalty BackOffice — Audit, Pending Actions & Admin User Contracts
// ============================================================================

import type { AdminRole, AdminStatus, PendingActionStatus } from '@/types/enums';
import type { PaginationParams } from './common.contract';

// ---------------------------------------------------------------------------
// Pending Actions (Maker-Checker)
// ---------------------------------------------------------------------------

/**
 * A pending action awaiting checker approval or rejection.
 *
 * Created by the "maker" and resolved by the "checker" in the
 * maker-checker workflow.
 */
export interface PendingAction {
  id: string;
  /** The admin who initiated the action. */
  maker: {
    id: string;
    username: string;
    role: AdminRole;
  };
  /** The admin who approved or rejected the action (populated after resolution). */
  checker?: {
    id: string;
    username: string;
  };
  /** Descriptive label for the action (e.g. `"POINT_ADJUSTMENT"`). */
  action_type: string;
  /** Identifier of the resource being acted upon (e.g. member ID). */
  target_resource: string;
  /** Serialised request payload that will be executed upon approval. */
  payload: Record<string, unknown>;
  status: PendingActionStatus;
  /** Reason provided when the action is rejected. */
  rejection_reason?: string;
  /** ISO-8601 timestamp when the action was created. */
  created_at: string;
  /** ISO-8601 timestamp when the action was approved or rejected. */
  resolved_at?: string;
}

// ---------------------------------------------------------------------------
// Approve / Reject
// ---------------------------------------------------------------------------

/** POST /pending-actions/:id/approve — response payload. */
export interface ApproveActionResponse {
  status: 'APPROVED';
  action_id: string;
  /** ISO-8601 timestamp when the action was executed. */
  executed_at: string;
  message: string;
}

/** POST /pending-actions/:id/reject — request body. */
export interface RejectActionRequest {
  rejection_reason: string;
}

// ---------------------------------------------------------------------------
// Audit Log
// ---------------------------------------------------------------------------

/** An immutable audit-log entry capturing an administrative action. */
export interface AuditLogEntry {
  id: string;
  /** The admin who performed the action. */
  admin: {
    id: string;
    username: string;
    role: AdminRole;
  };
  /** Human-readable action description (e.g. `"UPDATE_MEMBER_STATUS"`). */
  action: string;
  /** Identifier of the affected resource. */
  target_resource: string;
  /** Previous value (JSON-serialised, if applicable). */
  old_value?: Record<string, unknown>;
  /** New value (JSON-serialised, if applicable). */
  new_value?: Record<string, unknown>;
  /** IP address of the admin at the time of the action. */
  ip_address: string;
  /** ISO-8601 creation timestamp. */
  created_at: string;
}

// ---------------------------------------------------------------------------
// Admin Users
// ---------------------------------------------------------------------------

/** Back-office admin user entity. */
export interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: AdminRole;
  status: AdminStatus;
  /** ISO-8601 timestamps. */
  created_at: string;
  updated_at: string;
}

/** POST /admin-users — request body. */
export interface CreateAdminUserRequest {
  username: string;
  email: string;
  password: string;
  role: AdminRole;
}

/** PATCH /admin-users/:id — request body (all fields optional). */
export interface UpdateAdminUserRequest {
  email?: string;
  role?: AdminRole;
  status?: AdminStatus;
}

// ---------------------------------------------------------------------------
// Search Params
// ---------------------------------------------------------------------------

/** Query parameters for the audit log list endpoint. */
export interface AuditLogSearchParams extends PaginationParams {
  /** Filter by the admin who performed the action. */
  admin_id?: string;
  /** Filter by action type. */
  action?: string;
  /** ISO-8601 start date (inclusive). */
  start_date?: string;
  /** ISO-8601 end date (inclusive). */
  end_date?: string;
}

/** Query parameters for the pending actions list endpoint. */
export interface PendingActionSearchParams extends PaginationParams {
  /** Filter by pending action status. */
  status?: PendingActionStatus;
}
