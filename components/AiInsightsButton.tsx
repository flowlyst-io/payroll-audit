'use client';

import { useState } from 'react';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { ComparisonRow } from '@/types';

// AI Insights brand color
const AI_INSIGHTS_COLOR = '#5F5AA2';

interface AiInsightsButtonProps {
  rows: ComparisonRow[];
  priorPeriod: string;
  currentPeriod: string;
  disabled?: boolean;
  isLoading?: boolean;
  onInsightsReceived: (insights: string) => void;
  onLoadingChange: (loading: boolean) => void;
  onError: (message: string) => void;
}

/**
 * AI Insights button component
 * Triggers API call and returns insights via callback
 */
export default function AiInsightsButton({
  rows,
  priorPeriod,
  currentPeriod,
  disabled = false,
  isLoading = false,
  onInsightsReceived,
  onLoadingChange,
  onError,
}: AiInsightsButtonProps): React.JSX.Element {
  const handleClick = async (): Promise<void> => {
    if (rows.length === 0 || !priorPeriod || !currentPeriod) {
      onError('No comparison data available');
      return;
    }

    onLoadingChange(true);

    try {
      const response = await fetch('/api/insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rows,
          priorPeriod,
          currentPeriod,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        onError(data.error || 'Failed to generate insights');
        return;
      }

      if (data.insights) {
        onInsightsReceived(data.insights);
      } else {
        onError('No insights returned');
      }
    } catch (error) {
      console.error('AI Insights error:', error);
      onError('Unable to connect. Check your internet connection.');
    } finally {
      onLoadingChange(false);
    }
  };

  return (
    <Button
      variant="contained"
      startIcon={
        isLoading ? (
          <CircularProgress size={20} color="inherit" />
        ) : (
          <AutoAwesomeIcon />
        )
      }
      onClick={handleClick}
      disabled={disabled || isLoading || rows.length === 0}
      sx={{
        backgroundColor: AI_INSIGHTS_COLOR,
        '&:hover': {
          backgroundColor: '#4A4589',
        },
      }}
    >
      {isLoading ? 'Analyzing...' : 'AI Insights'}
    </Button>
  );
}
