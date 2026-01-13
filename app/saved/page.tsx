'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import DeleteIcon from '@mui/icons-material/Delete';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import AppBar from '@/components/AppBar';
import { loadSnapshots, deleteSnapshot } from '@/utils/storage';
import type { ComparisonSnapshot } from '@/types';

/**
 * Format date for display
 */
function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

export default function SavedComparisonsPage() {
  const router = useRouter();

  const [snapshots, setSnapshots] = useState<ComparisonSnapshot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<ComparisonSnapshot | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load snapshots on mount
  useEffect(() => {
    async function loadData() {
      try {
        const data = await loadSnapshots();
        // Sort by date, newest first
        data.sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime());
        setSnapshots(data);
      } catch (error) {
        console.error('Failed to load snapshots:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  // Navigate to snapshot view
  const handleViewSnapshot = useCallback(
    (id: string) => {
      router.push(`/worksheet/${id}`);
    },
    [router]
  );

  // Open delete confirmation dialog
  const handleDeleteClick = useCallback((snapshot: ComparisonSnapshot) => {
    setDeleteTarget(snapshot);
  }, []);

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
      setSnapshots((prev) => prev.filter((s) => s.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (error) {
      console.error('Failed to delete snapshot:', error);
    } finally {
      setIsDeleting(false);
    }
  }, [deleteTarget]);

  // Loading state
  if (isLoading) {
    return (
      <Box sx={{ minHeight: '100vh', backgroundColor: 'grey.50' }}>
        <AppBar />
        <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
          <CircularProgress />
          <Typography sx={{ mt: 2 }}>Loading saved comparisons...</Typography>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'grey.50' }}>
      <AppBar />

      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Saved Comparisons
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          View and manage your saved pay period comparison snapshots.
        </Typography>

        {snapshots.length === 0 ? (
          // Empty state
          <Box
            sx={{
              textAlign: 'center',
              py: 8,
              px: 4,
              backgroundColor: 'background.paper',
              borderRadius: 2,
              border: '1px dashed',
              borderColor: 'divider',
            }}
          >
            <FolderOpenIcon sx={{ fontSize: 64, color: 'action.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No Saved Comparisons
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Save a comparison from the Worksheet page to see it here.
            </Typography>
            <Button variant="contained" onClick={() => router.push('/worksheet')}>
              Go to Worksheet
            </Button>
          </Box>
        ) : (
          // Snapshots list
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {snapshots.map((snapshot) => (
              <Card key={snapshot.id} variant="outlined">
                <CardContent
                  sx={{ cursor: 'pointer', '&:hover': { backgroundColor: 'action.hover' } }}
                  onClick={() => handleViewSnapshot(snapshot.id)}
                >
                  <Typography variant="h6" component="div">
                    {snapshot.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Saved: {formatDate(snapshot.savedAt)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {snapshot.data.length} employee{snapshot.data.length !== 1 ? 's' : ''}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-end', pt: 0 }}>
                  <IconButton
                    aria-label="delete"
                    color="error"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(snapshot);
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </CardActions>
              </Card>
            ))}
          </Box>
        )}
      </Container>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteTarget !== null}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">Delete Snapshot?</DialogTitle>
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
    </Box>
  );
}
