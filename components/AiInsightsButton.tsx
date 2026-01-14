'use client';

import { useState } from 'react';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { ComparisonRow } from '@/types';
import InsightsModal from './InsightsModal';

interface AiInsightsButtonProps {
  rows: ComparisonRow[];
  priorPeriod: string;
  currentPeriod: string;
  disabled?: boolean;
  onError: (message: string) => void;
}

/**
 * Reusable AI Insights button component
 * Handles API call, loading state, and modal display
 */
export default function AiInsightsButton({
  rows,
  priorPeriod,
  currentPeriod,
  disabled = false,
  onError,
}: AiInsightsButtonProps): React.JSX.Element {
  const [isLoading, setIsLoading] = useState(false);
  const [insights, setInsights] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleClick = async (): Promise<void> => {
    if (rows.length === 0 || !priorPeriod || !currentPeriod) {
      onError('No comparison data available');
      return;
    }

    setIsLoading(true);

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
        setInsights(data.insights);
        setModalOpen(true);
      } else {
        onError('No insights returned');
      }
    } catch (error) {
      console.error('AI Insights error:', error);
      onError('Unable to connect. Check your internet connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseModal = (): void => {
    setModalOpen(false);
  };

  return (
    <>
      <Button
        variant="contained"
        color="secondary"
        startIcon={
          isLoading ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            <AutoAwesomeIcon />
          )
        }
        onClick={handleClick}
        disabled={disabled || isLoading || rows.length === 0}
      >
        {isLoading ? 'Analyzing...' : 'AI Insights'}
      </Button>

      {insights && (
        <InsightsModal
          open={modalOpen}
          onClose={handleCloseModal}
          insights={insights}
          priorPeriod={priorPeriod}
          currentPeriod={currentPeriod}
        />
      )}
    </>
  );
}
