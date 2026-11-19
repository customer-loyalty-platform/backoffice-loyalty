// ============================================================================
// Loyalty BackOffice — Common API Response Contracts
// ============================================================================

/**
 * Standard envelope for single-resource API responses.
 *
 * @template T - The shape of the `data` payload.
 */
export interface ApiResponse<T> {
  status: 'SUCCESS' | 'ERROR';
  data: T;
  message?: string;
  /** ISO-8601 timestamp of the response. */
  timestamp: string;
}

/**
 * Envelope for paginated list responses.
 *
 * @template T - The shape of each item in the `data` array.
 */
export interface PaginatedResponse<T> {
  status: 'SUCCESS' | 'ERROR';
  data: T[];
  pagination: {
    /** Current page number (1-based). */
    page: number;
    /** Maximum items per page. */
    limit: number;
    /** Total number of items across all pages. */
    total_items: number;
    /** Total number of pages. */
    total_pages: number;
  };
  /** ISO-8601 timestamp of the response. */
  timestamp: string;
}

/**
 * Standard error response returned by the API on failure.
 */
export interface ErrorResponse {
  status: 'ERROR';
  /** Machine-readable error code (e.g. `VALIDATION_ERROR`). */
  error_code: string;
  /** Human-readable error message. */
  message: string;
  /** Per-field validation errors, keyed by field name. */
  details?: Record<string, string[]>;
  /** ISO-8601 timestamp of the response. */
  timestamp: string;
}

/**
 * Common pagination query parameters shared across list endpoints.
 */
export interface PaginationParams {
  /** Page number (1-based). */
  page: number;
  /** Maximum items per page. */
  limit: number;
}
