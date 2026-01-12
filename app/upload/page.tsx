'use client';

import { useState, useCallback, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import AppBar from '@/components/AppBar';
import CsvUpload from '@/components/CsvUpload';
import ColumnMapper from '@/components/ColumnMapper';
import { saveData, loadData } from '@/utils/storage';
import type { ParseResult, ColumnMapping, StoredData } from '@/types';

// Custom hook to safely access localStorage (handles SSR)
function useStoredData(): StoredData | null {
  return useSyncExternalStore(
    // Subscribe function - localStorage doesn't have events, so we just return a no-op
    () => () => {},
    // Get client snapshot
    () => loadData(),
    // Get server snapshot (always null during SSR)
    () => null
  );
}

export default function UploadPage() {
  const router = useRouter();
  const storedData = useStoredData();

  const [parseResult, setParseResult] = useState<ParseResult | null>(() => {
    // This initializer runs once on mount
    if (typeof window !== 'undefined') {
      const data = loadData();
      if (data) {
        return { data: data.csvData, headers: data.headers };
      }
    }
    return null;
  });

  const [existingMapping, setExistingMapping] = useState<ColumnMapping | null>(() => {
    if (typeof window !== 'undefined') {
      const data = loadData();
      return data?.mapping || null;
    }
    return null;
  });

  const [showUploader, setShowUploader] = useState(() => {
    if (typeof window !== 'undefined') {
      return !loadData();
    }
    return true;
  });

  const handleUploadComplete = useCallback((result: ParseResult) => {
    setParseResult(result);
    setShowUploader(false);
    // Clear existing mapping since this is new data
    setExistingMapping(null);
  }, []);

  const handleMappingComplete = useCallback(
    (mapping: ColumnMapping) => {
      if (parseResult) {
        // Save complete data to localStorage
        saveData(parseResult.data, parseResult.headers, mapping);
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
