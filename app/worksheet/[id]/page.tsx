'use client';

import { useState, useEffect, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DownloadIcon from '@mui/icons-material/Download';
import AppBar from '@/components/AppBar';
import PayPeriodSelector from '@/components/PayPeriodSelector';
import ComparisonGrid from '@/components/ComparisonGrid';
import { getSnapshot } from '@/utils/storage';
import { exportComparisonCsv } from '@/utils/exportCsv';
import type { ComparisonSnapshot } from '@/types';

interface SnapshotViewPageProps {
  params: Promise<{ id: string }>;
}

export default function SnapshotViewPage({ params }: SnapshotViewPageProps) {
  const router = useRouter();
  const { id } = use(params);

  const [snapshot, setSnapshot] = useState<ComparisonSnapshot | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load snapshot on mount
  useEffect(() => {
    async function loadData() {
      try {
        const data = await getSnapshot(id);
        if (!data) {
          // Snapshot not found, redirect to saved list
          router.push('/saved');
          return;
        }
        setSnapshot(data);
      } catch (error) {
        console.error('Failed to load snapshot:', error);
        router.push('/saved');
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [id, router]);

  // Handle export CSV
  const handleExport = useCallback(() => {
    if (!snapshot || snapshot.data.length === 0) return;
    exportComparisonCsv(snapshot.data, snapshot.priorPeriod, snapshot.currentPeriod);
  }, [snapshot]);

  // Loading state
  if (isLoading) {
    return (
      <Box sx={{ minHeight: '100vh', backgroundColor: 'grey.50' }}>
        <AppBar />
        <Container maxWidth="xl" sx={{ py: 4, textAlign: 'center' }}>
          <CircularProgress />
          <Typography sx={{ mt: 2 }}>Loading snapshot...</Typography>
        </Container>
      </Box>
    );
  }

  // Snapshot not found (should redirect, but fallback)
  if (!snapshot) {
    return (
      <Box sx={{ minHeight: '100vh', backgroundColor: 'grey.50' }}>
        <AppBar />
        <Container maxWidth="xl" sx={{ py: 4, textAlign: 'center' }}>
          <Typography>Snapshot not found. Redirecting...</Typography>
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
        {/* Header with back link */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
          <Button
            component={Link}
            href="/saved"
            startIcon={<ArrowBackIcon />}
            size="small"
            sx={{ textTransform: 'none' }}
          >
            Back to Saved Comparisons
          </Button>
        </Box>

        <Typography variant="h5" component="h1" gutterBottom>
          {snapshot.name}
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
            payPeriods={[snapshot.priorPeriod, snapshot.currentPeriod]}
            priorPeriod={snapshot.priorPeriod}
            currentPeriod={snapshot.currentPeriod}
            onPriorChange={() => {}}
            onCurrentChange={() => {}}
            disabled
          />

          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleExport}
            disabled={snapshot.data.length === 0}
          >
            Export CSV
          </Button>
        </Box>

        {/* DataGrid - fills remaining space */}
        {snapshot.data.length > 0 ? (
          <Box sx={{ flex: 1, minHeight: 0 }}>
            <ComparisonGrid rows={snapshot.data} onRowUpdate={() => {}} readOnly />
          </Box>
        ) : (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography color="text.secondary">No data in this snapshot.</Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}
