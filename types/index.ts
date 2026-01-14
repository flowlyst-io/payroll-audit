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
  dac: string; // CSV header for DAC/department
}

/**
 * Saved column preferences for auto-selecting columns on future uploads
 * Stores the header names user previously mapped to each role
 */
export interface SavedColumnPreferences {
  employeeName: string | null; // Last used header for employee
  amount: string | null; // Last used header for amount
  payPeriod: string | null; // Last used header for pay period
  dac: string | null; // Last used header for DAC
  savedAt: string; // ISO timestamp
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
  aiInsight?: string; // Persisted AI analysis (PA-14)
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

/**
 * Aggregated total for a single pay period
 * Used for dashboard trend chart
 */
export interface PeriodTotal {
  period: string;
  total: number;
}

/**
 * Aggregated total for a single DAC/department
 * Used for dashboard pie chart
 */
export interface DacTotal {
  dac: string;
  total: number;
}

/**
 * Dashboard summary statistics
 */
export interface DashboardStats {
  totalPayroll: number;
  employeeCount: number;
  periodCount: number;
  departmentCount: number;
  averagePayroll: number;
}
