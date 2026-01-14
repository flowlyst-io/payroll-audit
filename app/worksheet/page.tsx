'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import SaveIcon from '@mui/icons-material/Save';
import DownloadIcon from '@mui/icons-material/Download';
import AppBar from '@/components/AppBar';
import PayPeriodSelector from '@/components/PayPeriodSelector';
import ComparisonGrid, { type ComparisonGridRef } from '@/components/ComparisonGrid';
import AiInsightsButton from '@/components/AiInsightsButton';
import { loadData, saveSnapshot } from '@/utils/storage';
import { getUniquePayPeriods, buildComparisonRows } from '@/utils/calculations';
import { generateSnapshotName } from '@/utils/formatters';
import { exportComparisonCsv } from '@/utils/exportCsv';
import type { StoredData, ComparisonRow, ComparisonSnapshot } from '@/types';

export default function WorksheetPage() {
  const router = useRouter();
  const gridRef = useRef<ComparisonGridRef>(null);

  // Loading and data state
  const [isLoading, setIsLoading] = useState(true);
  const [storedData, setStoredData] = useState<StoredData | null>(null);

  // Pay period selection
  const [priorPeriod, setPriorPeriod] = useState('');
  const [currentPeriod, setCurrentPeriod] = useState('');

  // Comparison data with notes
  const [comparisonRows, setComparisonRows] = useState<ComparisonRow[]>([]);
  const [notesMap, setNotesMap] = useState<Map<string, string>>(new Map());

  // UI state
  const [isSaving, setIsSaving] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  // Load data on mount
  useEffect(() => {
    async function loadStoredData() {
      try {
        const data = await loadData();
        if (!data || !data.mapping) {
          // No data uploaded, redirect to upload
          router.push('/upload');
          return;
        }
        setStoredData(data);
      } catch (error) {
        console.error('Failed to load data:', error);
        router.push('/upload');
      } finally {
        setIsLoading(false);
      }
    }

    loadStoredData();
  }, [router]);

  // Get unique pay periods from data
  const payPeriods = useMemo(() => {
    if (!storedData?.mapping) return [];
    return getUniquePayPeriods(storedData.csvData, storedData.mapping);
  }, [storedData]);

  // Initialize pay period selection when data loads (default to last two periods)
  useEffect(() => {
    if (payPeriods.length >= 2 && !priorPeriod && !currentPeriod) {
      setPriorPeriod(payPeriods[payPeriods.length - 2]);
      setCurrentPeriod(payPeriods[payPeriods.length - 1]);
    } else if (payPeriods.length === 1 && !priorPeriod && !currentPeriod) {
      setPriorPeriod(payPeriods[0]);
      setCurrentPeriod(payPeriods[0]);
    }
  }, [payPeriods, priorPeriod, currentPeriod]);

  // Build comparison rows when selections change
  useEffect(() => {
    if (!storedData?.mapping || !priorPeriod || !currentPeriod) {
      setComparisonRows([]);
      return;
    }

    const rows = buildComparisonRows(
      storedData.csvData,
      storedData.mapping,
      priorPeriod,
      currentPeriod,
      notesMap
    );
    setComparisonRows(rows);
  }, [storedData, priorPeriod, currentPeriod, notesMap]);

  // Handle note updates from the grid
  const handleRowUpdate = useCallback((updatedRow: ComparisonRow) => {
    setNotesMap((prev) => {
      const next = new Map(prev);
      next.set(updatedRow.employeeKey, updatedRow.note);
      return next;
    });
  }, []);

  // Handle save snapshot
  const handleSaveSnapshot = useCallback(async () => {
    if (!priorPeriod || !currentPeriod || comparisonRows.length === 0) return;

    // Commit any pending cell edits and get their values before saving
    const pendingNotes = gridRef.current?.commitPendingEdits() ?? new Map();

    // Merge pending notes into comparison rows for the snapshot
    const rowsToSave = comparisonRows.map((row) => ({
      ...row,
      note: pendingNotes.has(row.employeeKey)
        ? pendingNotes.get(row.employeeKey)!
        : row.note,
    }));

    setIsSaving(true);
    try {
      const snapshot: ComparisonSnapshot = {
        id: crypto.randomUUID(),
        name: generateSnapshotName(priorPeriod, currentPeriod),
        priorPeriod,
        currentPeriod,
        data: rowsToSave,
        savedAt: new Date().toISOString(),
      };

      await saveSnapshot(snapshot);

      setSnackbar({
        open: true,
        message: `Snapshot saved: ${snapshot.name}`,
        severity: 'success',
      });
    } catch (error) {
      console.error('Failed to save snapshot:', error);
      setSnackbar({
        open: true,
        message: 'Failed to save snapshot',
        severity: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  }, [priorPeriod, currentPeriod, comparisonRows]);

  // Handle snackbar close
  const handleSnackbarClose = useCallback(() => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  }, []);

  // Handle AI Insights error
  const handleAiError = useCallback((message: string) => {
    setSnackbar({
      open: true,
      message,
      severity: 'error',
    });
  }, []);

  // Handle export CSV
  const handleExport = useCallback(() => {
    if (comparisonRows.length === 0 || !priorPeriod || !currentPeriod) return;

    // Commit any pending cell edits and get their values before exporting
    const pendingNotes = gridRef.current?.commitPendingEdits() ?? new Map();

    // Merge pending notes into comparison rows for export
    const rowsToExport = comparisonRows.map((row) => ({
      ...row,
      note: pendingNotes.has(row.employeeKey)
        ? pendingNotes.get(row.employeeKey)!
        : row.note,
    }));

    exportComparisonCsv(rowsToExport, priorPeriod, currentPeriod);
  }, [comparisonRows, priorPeriod, currentPeriod]);

  // Loading state
  if (isLoading) {
    return (
      <Box sx={{ minHeight: '100vh', backgroundColor: 'grey.50' }}>
        <AppBar />
        <Container maxWidth="xl" sx={{ py: 4, textAlign: 'center' }}>
          <CircularProgress />
          <Typography sx={{ mt: 2 }}>Loading data...</Typography>
        </Container>
      </Box>
    );
  }

  // No data state (should redirect, but fallback)
  if (!storedData?.mapping) {
    return (
      <Box sx={{ minHeight: '100vh', backgroundColor: 'grey.50' }}>
        <AppBar />
        <Container maxWidth="xl" sx={{ py: 4, textAlign: 'center' }}>
          <Typography>No data loaded. Redirecting to upload...</Typography>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        backgroundColor: 'grey.50',
      }}
    >
      <AppBar />

      {/* Main content area - fills remaining height */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          px: 3,
          py: 2,
        }}
      >
        <Typography variant="h5" component="h1" gutterBottom>
          Payroll Comparison Worksheet
        </Typography>

        {/* Controls row */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2,
            mb: 2,
          }}
        >
          <PayPeriodSelector
            payPeriods={payPeriods}
            priorPeriod={priorPeriod}
            currentPeriod={currentPeriod}
            onPriorChange={setPriorPeriod}
            onCurrentChange={setCurrentPeriod}
          />

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onMouseDown={handleExport}
              disabled={comparisonRows.length === 0}
            >
              Export CSV
            </Button>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onMouseDown={handleSaveSnapshot}
              disabled={isSaving || comparisonRows.length === 0}
            >
              {isSaving ? 'Saving...' : 'Save Snapshot'}
            </Button>
            <AiInsightsButton
              rows={comparisonRows}
              priorPeriod={priorPeriod}
              currentPeriod={currentPeriod}
              disabled={comparisonRows.length === 0}
              onError={handleAiError}
            />
          </Box>
        </Box>

        {/* DataGrid - fills remaining space */}
        {comparisonRows.length > 0 ? (
          <Box sx={{ flex: 1, minHeight: 0 }}>
            <ComparisonGrid ref={gridRef} rows={comparisonRows} onRowUpdate={handleRowUpdate} />
          </Box>
        ) : (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography color="text.secondary">
              Select pay periods to view comparison data.
            </Typography>
          </Box>
        )}
      </Box>

      {/* Success/Error Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
