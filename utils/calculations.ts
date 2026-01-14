/**
 * Calculation utilities for payroll comparison
 */

import type { CsvRow, ColumnMapping, ComparisonRow, PeriodTotal, DacTotal, DashboardStats } from '@/types';

/**
 * Parse a string amount to a number, handling currency formatting
 * @param value - String value that may contain currency symbols, commas
 * @returns Parsed number or 0 if invalid
 */
export function parseAmount(value: string | undefined): number {
  if (!value) return 0;
  // Remove currency symbols, commas, and whitespace
  const cleaned = value.replace(/[$,\s]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Compare function to sort pay periods
 * Attempts numeric sort first, falls back to alphabetical
 */
function comparePayPeriods(a: string, b: string): number {
  const numA = parseFloat(a);
  const numB = parseFloat(b);

  // If both are valid numbers, sort numerically
  if (!isNaN(numA) && !isNaN(numB)) {
    return numA - numB;
  }

  // Fall back to alphabetical sort
  return a.localeCompare(b);
}

/**
 * Get unique pay periods from the data, sorted
 * @param data - CSV data rows
 * @param mapping - Column mapping configuration
 * @returns Sorted array of unique pay period values
 */
export function getUniquePayPeriods(data: CsvRow[], mapping: ColumnMapping): string[] {
  const payPeriods = new Set<string>();

  for (const row of data) {
    const pp = row[mapping.payPeriod]?.trim();
    if (pp) {
      payPeriods.add(pp);
    }
  }

  return Array.from(payPeriods).sort(comparePayPeriods);
}

/**
 * Get unique employees from the data
 * @param data - CSV data rows
 * @param mapping - Column mapping configuration
 * @returns Array of unique employee names
 */
export function getUniqueEmployees(data: CsvRow[], mapping: ColumnMapping): string[] {
  const employees = new Set<string>();

  for (const row of data) {
    const employee = row[mapping.employeeName]?.trim();
    if (employee) {
      employees.add(employee);
    }
  }

  return Array.from(employees).sort();
}

/**
 * Aggregate amounts by employee for a specific pay period
 * @param data - CSV data rows
 * @param mapping - Column mapping configuration
 * @param payPeriod - The pay period to filter by
 * @returns Map of employee name to total amount
 */
export function aggregateByEmployee(
  data: CsvRow[],
  mapping: ColumnMapping,
  payPeriod: string
): Map<string, number> {
  const result = new Map<string, number>();

  for (const row of data) {
    const pp = row[mapping.payPeriod]?.trim();
    if (pp !== payPeriod) continue;

    const employee = row[mapping.employeeName]?.trim();
    if (!employee) continue;

    const amount = parseAmount(row[mapping.amount]);
    const current = result.get(employee) || 0;
    result.set(employee, current + amount);
  }

  return result;
}

/**
 * Calculate Year-to-Date for an employee through a specific pay period
 * @param data - CSV data rows
 * @param mapping - Column mapping configuration
 * @param employee - Employee name
 * @param throughPeriod - Calculate YTD through this pay period (inclusive)
 * @param sortedPayPeriods - Pre-sorted list of all pay periods
 * @returns Cumulative sum through the specified period
 */
export function calculateYTD(
  data: CsvRow[],
  mapping: ColumnMapping,
  employee: string,
  throughPeriod: string,
  sortedPayPeriods: string[]
): number {
  // Find the index of the throughPeriod
  const throughIndex = sortedPayPeriods.indexOf(throughPeriod);
  if (throughIndex === -1) return 0;

  // Get all periods up to and including throughPeriod
  const periodsToInclude = new Set(sortedPayPeriods.slice(0, throughIndex + 1));

  let total = 0;
  for (const row of data) {
    const rowEmployee = row[mapping.employeeName]?.trim();
    if (rowEmployee !== employee) continue;

    const pp = row[mapping.payPeriod]?.trim();
    if (!pp || !periodsToInclude.has(pp)) continue;

    total += parseAmount(row[mapping.amount]);
  }

  return total;
}

/**
 * Build comparison rows for the DataGrid
 * @param data - CSV data rows
 * @param mapping - Column mapping configuration
 * @param priorPeriod - Prior pay period
 * @param currentPeriod - Current pay period
 * @param existingNotes - Optional map of employee to existing notes (for preserving edits)
 * @returns Array of ComparisonRow for the DataGrid
 */
export function buildComparisonRows(
  data: CsvRow[],
  mapping: ColumnMapping,
  priorPeriod: string,
  currentPeriod: string,
  existingNotes: Map<string, string> = new Map()
): ComparisonRow[] {
  const sortedPayPeriods = getUniquePayPeriods(data, mapping);
  const employees = getUniqueEmployees(data, mapping);

  const priorAmounts = aggregateByEmployee(data, mapping, priorPeriod);
  const currentAmounts = aggregateByEmployee(data, mapping, currentPeriod);

  const rows: ComparisonRow[] = [];

  for (const employee of employees) {
    const priorAmount = priorAmounts.get(employee) || 0;
    const currentAmount = currentAmounts.get(employee) || 0;
    const delta = currentAmount - priorAmount;

    // Calculate delta percent, handle division by zero
    let deltaPercent = 0;
    if (priorAmount !== 0) {
      deltaPercent = (delta / priorAmount) * 100;
    } else if (currentAmount !== 0) {
      // If prior is 0 but current is not, it's infinite growth
      deltaPercent = Infinity;
    }

    const yearToDate = calculateYTD(data, mapping, employee, currentPeriod, sortedPayPeriods);

    rows.push({
      employeeKey: employee, // Using employee name as key for simplicity
      employeeName: employee,
      priorAmount,
      currentAmount,
      delta,
      deltaPercent,
      yearToDate,
      note: existingNotes.get(employee) || '',
    });
  }

  return rows;
}

/**
 * Get total payroll amount for each pay period
 * Used for dashboard trend chart
 * @param data - CSV data rows
 * @param mapping - Column mapping configuration
 * @returns Array of period totals, sorted by period
 */
export function getTotalsByPeriod(
  data: CsvRow[],
  mapping: ColumnMapping
): PeriodTotal[] {
  const totals = new Map<string, number>();

  for (const row of data) {
    const period = row[mapping.payPeriod]?.trim();
    if (!period) continue;

    const amount = parseAmount(row[mapping.amount]);
    const current = totals.get(period) || 0;
    totals.set(period, current + amount);
  }

  // Convert to array and sort by period
  const result: PeriodTotal[] = [];
  for (const [period, total] of totals) {
    result.push({ period, total });
  }

  // Sort using the same logic as getUniquePayPeriods
  result.sort((a, b) => {
    const numA = parseFloat(a.period);
    const numB = parseFloat(b.period);
    if (!isNaN(numA) && !isNaN(numB)) {
      return numA - numB;
    }
    return a.period.localeCompare(b.period);
  });

  return result;
}

/**
 * Aggregate total payroll by DAC/department
 * Used for dashboard pie chart
 * @param data - CSV data rows
 * @param mapping - Column mapping configuration
 * @returns Array of DAC totals, sorted by total descending
 */
export function aggregateByDac(
  data: CsvRow[],
  mapping: ColumnMapping
): DacTotal[] {
  const totals = new Map<string, number>();

  for (const row of data) {
    const dac = row[mapping.dac]?.trim() || 'Unknown';
    const amount = parseAmount(row[mapping.amount]);
    const current = totals.get(dac) || 0;
    totals.set(dac, current + amount);
  }

  // Convert to array and sort by total descending
  const result: DacTotal[] = [];
  for (const [dac, total] of totals) {
    result.push({ dac, total });
  }

  result.sort((a, b) => b.total - a.total);

  return result;
}

/**
 * Calculate dashboard summary statistics
 * @param data - CSV data rows
 * @param mapping - Column mapping configuration
 * @returns Dashboard statistics object
 */
export function getDashboardStats(
  data: CsvRow[],
  mapping: ColumnMapping
): DashboardStats {
  let totalPayroll = 0;
  const employees = new Set<string>();
  const periods = new Set<string>();
  const departments = new Set<string>();

  for (const row of data) {
    const amount = parseAmount(row[mapping.amount]);
    totalPayroll += amount;

    const employee = row[mapping.employeeName]?.trim();
    if (employee) employees.add(employee);

    const period = row[mapping.payPeriod]?.trim();
    if (period) periods.add(period);

    const dac = row[mapping.dac]?.trim();
    if (dac) departments.add(dac);
  }

  const periodCount = periods.size;
  const averagePayroll = periodCount > 0 ? totalPayroll / periodCount : 0;

  return {
    totalPayroll,
    employeeCount: employees.size,
    periodCount,
    departmentCount: departments.size,
    averagePayroll,
  };
}
