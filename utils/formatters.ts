/**
 * Formatting utilities for currency, percentages, and dates
 */

/**
 * Format a number as USD currency
 * @param value - The number to format
 * @returns Formatted currency string (e.g., "$1,234.56")
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Format a number as a percentage
 * @param value - The percentage value (e.g., 4.5 for 4.5%)
 * @returns Formatted percentage string (e.g., "4.50%")
 */
export function formatPercent(value: number): string {
  if (!isFinite(value)) {
    return 'N/A';
  }
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

/**
 * Format a delta (difference) as currency with sign
 * @param value - The delta value
 * @returns Formatted currency with sign (e.g., "+$200.00" or "-$50.00")
 */
export function formatDelta(value: number): string {
  const sign = value > 0 ? '+' : '';
  return `${sign}${formatCurrency(value)}`;
}

/**
 * Format a date for snapshot names
 * @param date - The date to format
 * @returns Formatted date string (e.g., "Jan 12, 2026 14:30")
 */
export function formatSnapshotDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
}

/**
 * Generate a snapshot name from pay periods and date
 * @param priorPP - Prior pay period value
 * @param currentPP - Current pay period value
 * @param date - The date of the snapshot
 * @returns Auto-generated name (e.g., "PP10 vs PP20 - Jan 12, 2026 14:30")
 */
export function generateSnapshotName(
  priorPP: string,
  currentPP: string,
  date: Date = new Date()
): string {
  return `PP${priorPP} vs PP${currentPP} - ${formatSnapshotDate(date)}`;
}
