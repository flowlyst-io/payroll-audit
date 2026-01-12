/**
 * localStorage utilities for persisting payroll data
 */

import type { StoredData, ColumnMapping, CsvRow, ComparisonSnapshot } from '@/types';

const DATA_STORAGE_KEY = 'payroll-audit-data';
const SNAPSHOTS_STORAGE_KEY = 'payroll-audit-snapshots';

/**
 * Save CSV data and mapping to localStorage
 * Overwrites any existing data
 */
export function saveData(
  csvData: CsvRow[],
  headers: string[],
  mapping: ColumnMapping | null
): void {
  const data: StoredData = {
    csvData,
    headers,
    mapping,
    uploadedAt: new Date().toISOString(),
  };

  try {
    localStorage.setItem(DATA_STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save data to localStorage:', error);
    throw new Error('Failed to save data. Storage may be full.');
  }
}

/**
 * Load stored data from localStorage
 * Returns null if no data exists
 */
export function loadData(): StoredData | null {
  try {
    const stored = localStorage.getItem(DATA_STORAGE_KEY);
    if (!stored) return null;
    return JSON.parse(stored) as StoredData;
  } catch (error) {
    console.error('Failed to load data from localStorage:', error);
    return null;
  }
}

/**
 * Check if data exists in localStorage
 */
export function hasData(): boolean {
  return localStorage.getItem(DATA_STORAGE_KEY) !== null;
}

/**
 * Clear all stored data
 */
export function clearData(): void {
  localStorage.removeItem(DATA_STORAGE_KEY);
}

/**
 * Update only the column mapping (preserves CSV data)
 */
export function updateMapping(mapping: ColumnMapping): void {
  const data = loadData();
  if (data) {
    data.mapping = mapping;
    localStorage.setItem(DATA_STORAGE_KEY, JSON.stringify(data));
  }
}

// ============================================
// Snapshot functions (for PA-3/PA-4)
// ============================================

/**
 * Save a comparison snapshot
 */
export function saveSnapshot(snapshot: ComparisonSnapshot): void {
  const snapshots = loadSnapshots();
  snapshots.push(snapshot);

  try {
    localStorage.setItem(SNAPSHOTS_STORAGE_KEY, JSON.stringify(snapshots));
  } catch (error) {
    console.error('Failed to save snapshot:', error);
    throw new Error('Failed to save snapshot. Storage may be full.');
  }
}

/**
 * Load all saved snapshots
 */
export function loadSnapshots(): ComparisonSnapshot[] {
  try {
    const stored = localStorage.getItem(SNAPSHOTS_STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored) as ComparisonSnapshot[];
  } catch (error) {
    console.error('Failed to load snapshots:', error);
    return [];
  }
}

/**
 * Get a single snapshot by ID
 */
export function getSnapshot(id: string): ComparisonSnapshot | null {
  const snapshots = loadSnapshots();
  return snapshots.find((s) => s.id === id) || null;
}

/**
 * Delete a snapshot by ID
 */
export function deleteSnapshot(id: string): void {
  const snapshots = loadSnapshots();
  const filtered = snapshots.filter((s) => s.id !== id);
  localStorage.setItem(SNAPSHOTS_STORAGE_KEY, JSON.stringify(filtered));
}

/**
 * Clear all snapshots
 */
export function clearSnapshots(): void {
  localStorage.removeItem(SNAPSHOTS_STORAGE_KEY);
}
