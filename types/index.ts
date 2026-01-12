/**
 * Core TypeScript types for the Payroll Audit application
 */

/**
 * Represents a single row from the CSV file
 * Keys are column headers, values are string data
 */
export interface CsvRow {
  [key: string]: string;
}

/**
 * Column mapping configuration
 * Maps application roles to actual CSV header names
 */
export interface ColumnMapping {
  employeeName: string; // CSV header for employee name
  amount: string; // CSV header for amount/salary
  payPeriod: string; // CSV header for pay period
}

/**
 * Complete stored data structure for localStorage
 */
export interface StoredData {
  csvData: CsvRow[]; // Full CSV data (all columns)
  headers: string[]; // List of all column headers
  mapping: ColumnMapping | null; // Column role assignments
  uploadedAt: string; // ISO timestamp of upload
}

/**
 * Snapshot of a saved comparison
 * Used in PA-3/PA-4 for saved comparisons feature
 */
export interface ComparisonSnapshot {
  id: string; // Unique identifier
  name: string; // Auto-generated name "PP{prior} vs PP{current} - {date}"
  priorPeriod: string; // Selected prior pay period
  currentPeriod: string; // Selected current pay period
  data: ComparisonRow[]; // Snapshot of comparison data
  savedAt: string; // ISO timestamp
}

/**
 * Single row in the comparison table
 */
export interface ComparisonRow {
  employeeKey: string; // Employee identifier
  employeeName: string; // Display name
  priorAmount: number; // Amount in prior period
  currentAmount: number; // Amount in current period
  delta: number; // currentAmount - priorAmount
  deltaPercent: number; // (delta / priorAmount) * 100
  yearToDate: number; // Cumulative sum through current period
  note: string; // User-entered note
}

/**
 * Parse result from CSV parsing utility
 */
export interface ParseResult {
  data: CsvRow[];
  headers: string[];
}
