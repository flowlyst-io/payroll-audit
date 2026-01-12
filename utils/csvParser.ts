/**
 * CSV parsing utilities using PapaParse
 */

import Papa from 'papaparse';
import type { CsvRow, ParseResult } from '@/types';

/**
 * Parse a CSV file and return structured data
 * @param file - The CSV file to parse
 * @returns Promise with parsed data and headers
 */
export function parseCSV(file: File): Promise<ParseResult> {
  return new Promise((resolve, reject) => {
    Papa.parse<CsvRow>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
      complete: (results) => {
        if (results.errors.length > 0) {
          // Log errors but don't fail if we have data
          console.warn('CSV parsing warnings:', results.errors);
        }

        const headers = results.meta.fields || [];
        const data = results.data;

        if (headers.length === 0) {
          reject(new Error('No headers found in CSV file'));
          return;
        }

        if (data.length === 0) {
          reject(new Error('No data rows found in CSV file'));
          return;
        }

        resolve({
          data,
          headers,
        });
      },
      error: (error) => {
        reject(new Error(`Failed to parse CSV: ${error.message}`));
      },
    });
  });
}

/**
 * Validate that a file is a CSV
 * @param file - File to validate
 * @returns true if file appears to be a CSV
 */
export function isValidCSVFile(file: File): boolean {
  // Check file extension
  const validExtensions = ['.csv'];
  const fileName = file.name.toLowerCase();
  const hasValidExtension = validExtensions.some((ext) => fileName.endsWith(ext));

  // Check MIME type (browsers may set different types)
  const validMimeTypes = ['text/csv', 'application/csv', 'text/plain'];
  const hasValidMimeType = validMimeTypes.includes(file.type) || file.type === '';

  return hasValidExtension && hasValidMimeType;
}

/**
 * Format file size for display
 * @param bytes - File size in bytes
 * @returns Formatted string (e.g., "1.5 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}
