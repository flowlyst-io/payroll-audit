/**
 * IndexedDB utilities for persisting payroll data
 * Uses idb library for Promise-based IndexedDB access
 */

import { openDB, type IDBPDatabase } from 'idb';
import type { StoredData, ColumnMapping, CsvRow, ComparisonSnapshot } from '@/types';

const DB_NAME = 'payroll-audit-db';
const DB_VERSION = 1;

// Store names
const DATA_STORE = 'payroll-data';
const SNAPSHOTS_STORE = 'snapshots';

// Single key for the main data (we only store one dataset at a time)
const DATA_KEY = 'current';

interface PayrollAuditDB {
  [DATA_STORE]: {
    key: string;
    value: StoredData;
  };
  [SNAPSHOTS_STORE]: {
    key: string;
    value: ComparisonSnapshot;
    indexes: { 'by-date': string };
  };
}

/**
 * Get or create the database connection
 */
async function getDB(): Promise<IDBPDatabase<PayrollAuditDB>> {
  return openDB<PayrollAuditDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Create store for main payroll data
      if (!db.objectStoreNames.contains(DATA_STORE)) {
        db.createObjectStore(DATA_STORE);
      }

      // Create store for snapshots with index
      if (!db.objectStoreNames.contains(SNAPSHOTS_STORE)) {
        const snapshotStore = db.createObjectStore(SNAPSHOTS_STORE, { keyPath: 'id' });
        snapshotStore.createIndex('by-date', 'savedAt');
      }
    },
  });
}

/**
 * Save CSV data and mapping to IndexedDB
 * Overwrites any existing data
 */
export async function saveData(
  csvData: CsvRow[],
  headers: string[],
  mapping: ColumnMapping | null
): Promise<void> {
  const data: StoredData = {
    csvData,
    headers,
    mapping,
    uploadedAt: new Date().toISOString(),
  };

  try {
    const db = await getDB();
    await db.put(DATA_STORE, data, DATA_KEY);
  } catch (error) {
    console.error('Failed to save data to IndexedDB:', error);
    throw new Error('Failed to save data.');
  }
}

/**
 * Load stored data from IndexedDB
 * Returns null if no data exists
 */
export async function loadData(): Promise<StoredData | null> {
  try {
    const db = await getDB();
    const data = await db.get(DATA_STORE, DATA_KEY);
    return data || null;
  } catch (error) {
    console.error('Failed to load data from IndexedDB:', error);
    return null;
  }
}

/**
 * Check if data exists in IndexedDB
 */
export async function hasData(): Promise<boolean> {
  try {
    const data = await loadData();
    return data !== null;
  } catch {
    return false;
  }
}

/**
 * Clear all stored data
 */
export async function clearData(): Promise<void> {
  try {
    const db = await getDB();
    await db.delete(DATA_STORE, DATA_KEY);
  } catch (error) {
    console.error('Failed to clear data:', error);
  }
}

/**
 * Update only the column mapping (preserves CSV data)
 */
export async function updateMapping(mapping: ColumnMapping): Promise<void> {
  const data = await loadData();
  if (data) {
    data.mapping = mapping;
    const db = await getDB();
    await db.put(DATA_STORE, data, DATA_KEY);
  }
}

// ============================================
// Snapshot functions (for PA-3/PA-4)
// ============================================

/**
 * Save a comparison snapshot
 */
export async function saveSnapshot(snapshot: ComparisonSnapshot): Promise<void> {
  try {
    const db = await getDB();
    await db.put(SNAPSHOTS_STORE, snapshot);
  } catch (error) {
    console.error('Failed to save snapshot:', error);
    throw new Error('Failed to save snapshot.');
  }
}

/**
 * Load all saved snapshots
 */
export async function loadSnapshots(): Promise<ComparisonSnapshot[]> {
  try {
    const db = await getDB();
    return await db.getAll(SNAPSHOTS_STORE);
  } catch (error) {
    console.error('Failed to load snapshots:', error);
    return [];
  }
}

/**
 * Delete a snapshot by ID
 */
export async function deleteSnapshot(id: string): Promise<void> {
  try {
    const db = await getDB();
    await db.delete(SNAPSHOTS_STORE, id);
  } catch (error) {
    console.error('Failed to delete snapshot:', error);
  }
}

/**
 * Clear all snapshots
 */
export async function clearSnapshots(): Promise<void> {
  try {
    const db = await getDB();
    await db.clear(SNAPSHOTS_STORE);
  } catch (error) {
    console.error('Failed to clear snapshots:', error);
  }
}
