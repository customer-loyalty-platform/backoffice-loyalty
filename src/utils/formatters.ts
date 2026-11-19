import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

/**
 * Format number as Indonesian Rupiah currency
 */
export function formatCurrency(value: number, currency = 'IDR'): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Format number with thousand separators
 */
export function formatNumber(value: number, decimals = 0): string {
  return new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Format points value (e.g., "12,500 pts")
 */
export function formatPoints(value: number): string {
  return `${formatNumber(value)} pts`;
}

/**
 * Format ISO date string to readable format
 */
export function formatDate(isoString: string, pattern = 'dd MMM yyyy'): string {
  try {
    return format(parseISO(isoString), pattern, { locale: localeId });
  } catch {
    return isoString;
  }
}

/**
 * Format ISO date string to datetime format
 */
export function formatDateTime(isoString: string): string {
  return formatDate(isoString, 'dd MMM yyyy, HH:mm');
}

/**
 * Format ISO date string to relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(isoString: string): string {
  try {
    return formatDistanceToNow(parseISO(isoString), {
      addSuffix: true,
      locale: localeId,
    });
  } catch {
    return isoString;
  }
}

/**
 * Format percentage value
 */
export function formatPercent(value: number, decimals = 1): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Format multiplier value (e.g., "1.5×")
 */
export function formatMultiplier(value: number): string {
  return `${value.toFixed(2)}×`;
}

/**
 * Truncate string with ellipsis
 */
export function truncate(str: string, maxLength = 50): string {
  if (str.length <= maxLength) return str;
  return `${str.slice(0, maxLength)}...`;
}

/**
 * Generate a color class based on status
 */
export function getStatusSeverity(status: string): string {
  const map: Record<string, string> = {
    ACTIVE: 'success',
    APPROVED: 'success',
    AVAILABLE: 'success',
    CLAIMED: 'info',
    COMPLETED: 'info',
    PENDING: 'warn',
    PENDING_APPROVAL: 'warn',
    DRAFT: 'secondary',
    RESERVED: 'warn',
    PAUSED: 'warn',
    DORMANT: 'warn',
    SUSPENDED: 'danger',
    REJECTED: 'danger',
    REVOKED: 'danger',
    TERMINATED: 'danger',
    INACTIVE: 'secondary',
    EXPIRED: 'secondary',
    DEPLETED: 'danger',
    EARN: 'success',
    REDEEM: 'info',
    EXPIRATION: 'warn',
    ADJUSTMENT_CREDIT: 'success',
    ADJUSTMENT_DEBIT: 'danger',
  };
  return map[status] || 'secondary';
}

