'use client';

import { useState, useEffect, useCallback } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import AppBar from '@/components/AppBar';
import ComparisonGrid from '@/components/ComparisonGrid';
import AiInsightsButton from '@/components/AiInsightsButton';
import InlineInsights from '@/components/InlineInsights';
import { loadSnapshots, deleteSnapshot, updateSnapshotAiInsight } from '@/utils/storage';
import { exportComparisonCsv } from '@/utils/exportCsv';
import type { ComparisonSnapshot } from '@/types';

const LEFT_PANEL_WIDTH = 280;

export default function SavedComparisonsPage() {
  const [snapshots, setSnapshots] = useState<ComparisonSnapshot[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<ComparisonSnapshot | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [aiInsights, setAiInsights] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'error' });

  // Derived state
  const selectedSnapshot = snapshots.find((s) => s.id === selectedId) ?? null;

  // Load snapshots on mount
  useEffect(() => {
    async function loadData() {
      try {
        const data = await loadSnapshots();
        // Sort by date, newest first
        data.sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime());
        setSnapshots(data);
        // Auto-select first snapshot and load its AI insight if exists (PA-14)
        if (data.length > 0) {
          setSelectedId(data[0].id);
          setAiInsights(data[0].aiInsight ?? null);
        }
      } catch (error) {
        console.error('Failed to load snapshots:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  // Handle snapshot selection - load stored AI insight if exists (PA-14)
  const handleSelectSnapshot = useCallback(
    (id: string) => {
      setSelectedId(id);
      const snapshot = snapshots.find((s) => s.id === id);
      setAiInsights(snapshot?.aiInsight ?? null);
    },
    [snapshots]
  );

  // Handle export CSV
  const handleExport = useCallback(() => {
    if (!selectedSnapshot || selectedSnapshot.data.length === 0) return;
    exportComparisonCsv(
      selectedSnapshot.data,
      selectedSnapshot.priorPeriod,
      selectedSnapshot.currentPeriod
    );
  }, [selectedSnapshot]);

  // Open delete confirmation dialog
  const handleDeleteClick = useCallback(
    (e: React.MouseEvent, snapshot: ComparisonSnapshot) => {
      e.stopPropagation();
      setDeleteTarget(snapshot);
    },
    []
  );

  // Close delete dialog
  const handleDeleteCancel = useCallback(() => {
    setDeleteTarget(null);
  }, []);

  // Confirm delete
  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);
    try {
      await deleteSnapshot(deleteTarget.id);
      const updatedSnapshots = snapshots.filter((s) => s.id !== deleteTarget.id);
      setSnapshots(updatedSnapshots);

      // If deleted snapshot was selected, select first remaining or null
      if (selectedId === deleteTarget.id) {
        setSelectedId(updatedSnapshots.length > 0 ? updatedSnapshots[0].id : null);
      }

      setDeleteTarget(null);
    } catch (error) {
      console.error('Failed to delete snapshot:', error);
    } finally {
      setIsDeleting(false);
    }
  }, [deleteTarget, snapshots, selectedId]);

  // Handle AI Insights - persist to IndexedDB (PA-14)
  const handleAiInsightsReceived = useCallback(
    async (insights: string) => {
      setAiInsights(insights);
      if (selectedId) {
        // Persist to IndexedDB
        await updateSnapshotAiInsight(selectedId, insights);
        // Update local state so insight persists when switching snapshots
        setSnapshots((prev) =>
          prev.map((s) => (s.id === selectedId ? { ...s, aiInsight: insights } : s))
        );
      }
    },
    [selectedId]
  );

  const handleAiLoadingChange = useCallback((loading: boolean) => {
    setIsAiLoading(loading);
  }, []);

  const handleAiInsightsClose = useCallback(() => {
    setAiInsights(null);
  }, []);

  // Handle AI Insights error
  const handleAiError = useCallback((message: string) => {
    setSnackbar({
      open: true,
      message,
      severity: 'error',
    });
  }, []);

  // Handle snackbar close
  const handleSnackbarClose = useCallback(() => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <AppBar />
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <CircularProgress />
          <Typography>Loading saved comparisons...</Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <AppBar />

      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left Panel - Comparison List */}
        <Box
          sx={{
            width: LEFT_PANEL_WIDTH,
            flexShrink: 0,
            borderRight: 1,
            borderColor: 'divider',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: 'background.paper',
          }}
        >
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant="h6">Saved Comparisons</Typography>
          </Box>

          {snapshots.length === 0 ? (
            <Box sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
              <Typography variant="body2">No saved comparisons</Typography>
            </Box>
          ) : (
            <List sx={{ flex: 1, overflow: 'auto', py: 0 }}>
              {snapshots.map((snapshot) => (
                <ListItemButton
                  key={snapshot.id}
                  selected={selectedId === snapshot.id}
                  onClick={() => handleSelectSnapshot(snapshot.id)}
                  sx={{
                    '&:hover .delete-button': {
                      opacity: 1,
                    },
                  }}
                >
                  <ListItemText
                    primary={snapshot.name}
                    primaryTypographyProps={{
                      noWrap: true,
                      title: snapshot.name,
                    }}
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      className="delete-button"
                      edge="end"
                      aria-label="delete"
                      size="small"
                      onClick={(e) => handleDeleteClick(e, snapshot)}
                      sx={{
                        opacity: 0,
                        transition: 'opacity 0.2s',
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItemButton>
              ))}
            </List>
          )}
        </Box>

        {/* Right Panel - Comparison Worksheet */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            backgroundColor: 'grey.50',
          }}
        >
          {!selectedSnapshot ? (
            // Empty state
            <Box
              sx={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                p: 4,
              }}
            >
              <FolderOpenIcon sx={{ fontSize: 64, color: 'action.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No Comparison Selected
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {snapshots.length === 0
                  ? 'Save a comparison from the Worksheet page to see it here.'
                  : 'Select a comparison from the list to view it.'}
              </Typography>
            </Box>
          ) : (
            <>
              {/* Header with name and export button */}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  p: 2,
                  borderBottom: 1,
                  borderColor: 'divider',
                  backgroundColor: 'background.paper',
                }}
              >
                <Typography variant="h6" noWrap sx={{ flex: 1, mr: 2 }}>
                  {selectedSnapshot.name}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<DownloadIcon />}
                    onClick={handleExport}
                    disabled={selectedSnapshot.data.length === 0}
                  >
                    Export CSV
                  </Button>
                  <AiInsightsButton
                    rows={selectedSnapshot.data}
                    priorPeriod={selectedSnapshot.priorPeriod}
                    currentPeriod={selectedSnapshot.currentPeriod}
                    disabled={selectedSnapshot.data.length === 0}
                    isLoading={isAiLoading}
                    onInsightsReceived={handleAiInsightsReceived}
                    onLoadingChange={handleAiLoadingChange}
                    onError={handleAiError}
                  />
                </Box>
              </Box>

              {/* AI Insights - inline display */}
              {aiInsights && (
                <Box sx={{ px: 2, pt: 2 }}>
                  <InlineInsights insights={aiInsights} onClose={handleAiInsightsClose} />
                </Box>
              )}

              {/* Comparison Grid */}
              {selectedSnapshot.data.length > 0 ? (
                <Box sx={{ flex: 1, minHeight: 0, p: 2, pt: aiInsights ? 0 : 2 }}>
                  {/* onRowUpdate is a no-op because grid is readOnly; required by component interface */}
                  <ComparisonGrid rows={selectedSnapshot.data} onRowUpdate={() => {}} readOnly />
                </Box>
              ) : (
                <Box
                  sx={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography color="text.secondary">No data in this comparison.</Typography>
                </Box>
              )}
            </>
          )}
        </Box>
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteTarget !== null}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">Delete Comparison?</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete &quot;{deleteTarget?.name}&quot;? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} disabled={isDeleting}>
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" disabled={isDeleting}>
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Error Snackbar */}
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
