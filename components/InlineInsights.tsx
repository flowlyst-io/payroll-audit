'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ReactMarkdown from 'react-markdown';

// AI Insights brand color and light shade for background
const AI_INSIGHTS_COLOR = '#5F5AA2';
const AI_INSIGHTS_BG = 'rgba(95, 90, 162, 0.08)';
const AI_INSIGHTS_BORDER = 'rgba(95, 90, 162, 0.25)';

interface InlineInsightsProps {
  insights: string;
  onClose: () => void;
}

/**
 * Inline display component for AI-generated insights
 * Shows above the data grid with a fancy purple-tinted background
 */
export default function InlineInsights({
  insights,
  onClose,
}: InlineInsightsProps): React.JSX.Element {
  return (
    <Box
      sx={{
        backgroundColor: AI_INSIGHTS_BG,
        border: `1px solid ${AI_INSIGHTS_BORDER}`,
        borderRadius: 2,
        p: 2,
        mb: 2,
        position: 'relative',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 1.5,
        }}
      >
        <AutoAwesomeIcon
          sx={{
            color: AI_INSIGHTS_COLOR,
            fontSize: 24,
            mt: 0.25,
            flexShrink: 0,
          }}
        />
        <Box sx={{ flex: 1, pr: 4 }}>
          <Typography
            variant="subtitle2"
            sx={{
              color: AI_INSIGHTS_COLOR,
              fontWeight: 600,
              mb: 0.75,
            }}
          >
            AI Insights
          </Typography>
          <Box
            sx={{
              color: 'text.primary',
              lineHeight: 1.7,
              '& p': { margin: '0.5em 0' },
              '& p:first-of-type': { marginTop: 0 },
              '& p:last-of-type': { marginBottom: 0 },
              '& ul, & ol': { margin: '0.5em 0', paddingLeft: '1.5em' },
              '& li': { marginBottom: '0.25em' },
              '& strong': { fontWeight: 600 },
              fontSize: '0.875rem',
            }}
          >
            <ReactMarkdown>{insights}</ReactMarkdown>
          </Box>
        </Box>
        <IconButton
          size="small"
          onClick={onClose}
          aria-label="Close insights"
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            color: AI_INSIGHTS_COLOR,
            '&:hover': {
              backgroundColor: 'rgba(95, 90, 162, 0.12)',
            },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>
    </Box>
  );
}
