// ============================================================================
// Loyalty BackOffice — Auth API Contracts
// ============================================================================

import type { AdminRole, AdminStatus } from '@/types/enums';

// ---------------------------------------------------------------------------
// Login
// ---------------------------------------------------------------------------

/** POST /auth/login — request body. */
export interface LoginRequest {
  username: string;
  password: string;
}

/**
 * POST /auth/login — response payload.
 *
 * Contains JWT tokens and the authenticated admin's profile summary.
 */
export interface LoginResponse {
  /** Short-lived JWT access token. */
  access_token: string;
  /** Long-lived refresh token used to obtain a new access token. */
  refresh_token: string;
  /** Token type, typically `"Bearer"`. */
  token_type: string;
  /** Access-token lifetime in seconds. */
  expires_in: number;
  /** Summary of the authenticated admin user. */
  admin: {
    id: string;
    username: string;
    email: string;
    role: AdminRole;
    status: AdminStatus;
  };
}

// ---------------------------------------------------------------------------
// Refresh Token
// ---------------------------------------------------------------------------

/** POST /auth/refresh — request body. */
export interface RefreshTokenRequest {
  refresh_token: string;
}

/** POST /auth/refresh — response payload. */
export interface RefreshTokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

// ---------------------------------------------------------------------------
// Logout
// ---------------------------------------------------------------------------

/** POST /auth/logout — response payload. */
export interface LogoutResponse {
  message: string;
}

// ---------------------------------------------------------------------------
// Current User (Me)
// ---------------------------------------------------------------------------

/**
 * GET /auth/me — response payload.
 *
 * Returns the full profile of the currently authenticated admin, including
 * their granted permissions derived from their role.
 */
export interface MeResponse {
  id: string;
  username: string;
  email: string;
  role: AdminRole;
  status: AdminStatus;
  /** Flat list of granted permission strings (e.g. `"members:write"`). */
  permissions: string[];
  created_at: string;
  updated_at: string;
}
