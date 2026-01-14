'use client';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

interface InsightsModalProps {
  open: boolean;
  onClose: () => void;
  insights: string;
  priorPeriod: string;
  currentPeriod: string;
}

/**
 * Modal component for displaying AI-generated insights
 * Shows analysis results in a clean, readable format
 */
export default function InsightsModal({
  open,
  onClose,
  insights,
  priorPeriod,
  currentPeriod,
}: InsightsModalProps): React.JSX.Element {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      aria-labelledby="insights-dialog-title"
    >
      <DialogTitle id="insights-dialog-title">
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AutoAwesomeIcon color="primary" />
          <span>AI Insights</span>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 2 }}
        >
          Analysis of comparison between <strong>{priorPeriod}</strong> and{' '}
          <strong>{currentPeriod}</strong>
        </Typography>
        <Typography
          variant="body1"
          sx={{
            whiteSpace: 'pre-wrap',
            lineHeight: 1.7,
          }}
        >
          {insights}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
