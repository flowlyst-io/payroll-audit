'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import AppBar from '@/components/AppBar';
import CsvUpload from '@/components/CsvUpload';
import ColumnMapper from '@/components/ColumnMapper';
import {
  saveData,
  loadData,
  saveColumnPreferences,
  loadColumnPreferences,
} from '@/utils/storage';
import type {
  ParseResult,
  ColumnMapping,
  StoredData,
  SavedColumnPreferences,
} from '@/types';

/**
 * Auto-select columns based on saved preferences
 * Matches headers to preferences using exact or case-insensitive matching
 */
function autoSelectColumns(
  headers: string[],
  prefs: SavedColumnPreferences | null
): Partial<ColumnMapping> {
  if (!prefs) return {};

  const result: Partial<ColumnMapping> = {};
  const headerLower = headers.map((h) => h.toLowerCase());

  // Helper to find matching header
  const findMatch = (savedHeader: string | null): string | undefined => {
    if (!savedHeader) return undefined;
    // Exact match first
    if (headers.includes(savedHeader)) return savedHeader;
    // Case-insensitive match
    const lowerIdx = headerLower.indexOf(savedHeader.toLowerCase());
    if (lowerIdx !== -1) return headers[lowerIdx];
    return undefined;
  };

  const employeeMatch = findMatch(prefs.employeeName);
  const amountMatch = findMatch(prefs.amount);
  const payPeriodMatch = findMatch(prefs.payPeriod);
  const dacMatch = findMatch(prefs.dac);

  if (employeeMatch) result.employeeName = employeeMatch;
  if (amountMatch) result.amount = amountMatch;
  if (payPeriodMatch) result.payPeriod = payPeriodMatch;
  if (dacMatch) result.dac = dacMatch;

  return result;
}

export default function UploadPage() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [storedData, setStoredData] = useState<StoredData | null>(null);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [existingMapping, setExistingMapping] = useState<ColumnMapping | null>(null);
  const [showUploader, setShowUploader] = useState(true);
  const [savedPreferences, setSavedPreferences] = useState<SavedColumnPreferences | null>(null);

  // Load existing data and preferences from IndexedDB on mount
  useEffect(() => {
    async function loadExistingData() {
      try {
        // Load saved column preferences (for auto-select)
        const prefs = await loadColumnPreferences();
        setSavedPreferences(prefs);

        // Load existing data
        const data = await loadData();
        if (data) {
          setStoredData(data);
          setParseResult({ data: data.csvData, headers: data.headers });
          setExistingMapping(data.mapping);
          setShowUploader(false);
        }
      } catch (error) {
        console.error('Failed to load existing data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadExistingData();
  }, []);

  const handleUploadComplete = useCallback(
    (result: ParseResult) => {
      setParseResult(result);
      setShowUploader(false);

      // Auto-select columns based on saved preferences
      const autoSelected = autoSelectColumns(result.headers, savedPreferences);
      if (Object.keys(autoSelected).length > 0) {
        // Create a partial mapping with auto-selected values
        setExistingMapping(autoSelected as ColumnMapping);
      } else {
        setExistingMapping(null);
      }
    },
    [savedPreferences]
  );

  const handleMappingComplete = useCallback(
    async (mapping: ColumnMapping) => {
      if (parseResult) {
        // Save complete data to IndexedDB
        await saveData(parseResult.data, parseResult.headers, mapping);

        // Save column preferences for future auto-select
        await saveColumnPreferences(mapping);

        // Navigate to worksheet
        router.push('/worksheet');
      }
    },
    [parseResult, router]
  );

  const handleUploadNew = useCallback(() => {
    setShowUploader(true);
    setParseResult(null);
    setExistingMapping(null);
  }, []);

  // Show loading state while checking for existing data
  if (isLoading) {
    return (
      <Box sx={{ minHeight: '100vh', backgroundColor: 'grey.50' }}>
        <AppBar />
        <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
          <CircularProgress />
          <Typography sx={{ mt: 2 }}>Loading...</Typography>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'grey.50' }}>
      <AppBar />

      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Upload Payroll Data
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Upload a CSV file containing your payroll data. You&apos;ll then map the columns
          to identify employee names, amounts, and pay periods.
        </Typography>

        {storedData && !showUploader && (
          <Alert
            severity="info"
            sx={{ mb: 3 }}
            action={
              <Button color="inherit" size="small" onClick={handleUploadNew}>
                Upload New File
              </Button>
            }
          >
            You have existing data loaded ({storedData.csvData.length.toLocaleString()} rows,{' '}
            {storedData.headers.length} columns). You can update the column mapping below
            or upload a new file.
          </Alert>
        )}

        {showUploader ? (
          <CsvUpload onUploadComplete={handleUploadComplete} />
        ) : parseResult ? (
          <ColumnMapper
            headers={parseResult.headers}
            rowCount={parseResult.data.length}
            onMappingComplete={handleMappingComplete}
            initialMapping={existingMapping}
          />
        ) : null}

        {!showUploader && parseResult && (
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Button variant="text" onClick={handleUploadNew}>
              Upload a different file
            </Button>
          </Box>
        )}
      </Container>
    </Box>
  );
}
