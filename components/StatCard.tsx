'use client';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import type { SvgIconComponent } from '@mui/icons-material';

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: SvgIconComponent;
  color: string;
}

export default function StatCard({ title, value, subtitle, icon: Icon, color }: StatCardProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        height: '100%',
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'grey.200',
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          borderColor: color,
          boxShadow: `0 4px 20px ${color}20`,
        },
      }}
    >
      <Box
        sx={{
          width: 56,
          height: 56,
          borderRadius: 2,
          backgroundColor: `${color}15`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon sx={{ fontSize: 28, color }} />
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontWeight: 500, mb: 0.5 }}
        >
          {title}
        </Typography>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            color: 'text.primary',
            lineHeight: 1.2,
          }}
        >
          {value}
        </Typography>
        {subtitle && (
          <Typography variant="caption" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </Box>
    </Paper>
  );
}
