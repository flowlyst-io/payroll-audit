/**
 * CSV export utilities for comparison data
 */

import Papa from 'papaparse';
import type { ComparisonRow } from '@/types';

/**
 * Format date for filename (YYYY-MM-DD)
 */
function formatDateForFilename(date: Date = new Date()): string {
  return date.toISOString().split('T')[0];
}

/**
 * Generate filename for comparison export
 * Format: comparison-{prior}-vs-{current}-{date}.csv
 */
function generateFilename(priorPeriod: string, currentPeriod: string): string {
  const date = formatDateForFilename();
  return `comparison-${priorPeriod}-vs-${currentPeriod}-${date}.csv`;
}

/**
 * Transform comparison rows to export format
 * Uses raw numeric values (no currency formatting)
 */
function transformForExport(
  rows: ComparisonRow[]
): Record<string, string | number>[] {
  return rows.map((row) => ({
    Employee: row.employeeName,
    'Prior Amount': row.priorAmount,
    'Current Amount': row.currentAmount,
    Delta: row.delta,
    'Delta %': isFinite(row.deltaPercent) ? row.deltaPercent : 'N/A',
    'Year to Date': row.yearToDate,
    Notes: row.note,
  }));
}

/**
 * Trigger browser download of a file
 */
function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();

  // Cleanup
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export comparison data to CSV and trigger download
 * @param rows - Comparison rows to export
 * @param priorPeriod - Prior pay period value
 * @param currentPeriod - Current pay period value
 */
export function exportComparisonCsv(
  rows: ComparisonRow[],
  priorPeriod: string,
  currentPeriod: string
): void {
  const exportData = transformForExport(rows);
  const csv = Papa.unparse(exportData);
  const filename = generateFilename(priorPeriod, currentPeriod);

  downloadFile(csv, filename, 'text/csv;charset=utf-8;');
}
