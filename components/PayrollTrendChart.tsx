'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import { LineChart } from '@mui/x-charts/LineChart';
import type { PeriodTotal } from '@/types';

interface PayrollTrendChartProps {
  data: PeriodTotal[];
}

export default function PayrollTrendChart({ data }: PayrollTrendChartProps) {
  // Format currency for display
  const formatCurrency = (value: number | null) => {
    if (value === null) return '';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Format compact currency for Y axis
  const formatCompactCurrency = (value: number | null) => {
    if (value === null) return '';
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value}`;
  };

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
        flexDirection: 'column',
      }}
    >
      <Typography
        variant="h6"
        component="h2"
        sx={{ fontWeight: 600, mb: 2, color: 'text.primary' }}
      >
        Payroll Trend by Pay Period
      </Typography>
      <Box sx={{ flex: 1, minHeight: 0, width: '100%' }}>
        <LineChart
          xAxis={[
            {
              data: data.map((d) => d.period),
              scaleType: 'point',
              tickLabelStyle: {
                fontSize: 11,
                fill: '#666',
              },
            },
          ]}
          yAxis={[
            {
              valueFormatter: formatCompactCurrency,
              tickLabelStyle: {
                fontSize: 11,
                fill: '#666',
              },
            },
          ]}
          series={[
            {
              data: data.map((d) => d.total),
              label: 'Total Payroll',
              color: '#3b82f6',
              area: true,
              showMark: true,
              valueFormatter: formatCurrency,
            },
          ]}
          height={300}
          margin={{ left: 70, right: 20, top: 20, bottom: 30 }}
          grid={{ horizontal: true }}
          sx={{
            '& .MuiAreaElement-root': {
              fill: 'url(#gradient)',
              fillOpacity: 0.3,
            },
            '& .MuiLineElement-root': {
              strokeWidth: 3,
            },
            '& .MuiMarkElement-root': {
              stroke: '#3b82f6',
              fill: '#fff',
              strokeWidth: 2,
            },
          }}
        >
          <defs>
            <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.05} />
            </linearGradient>
          </defs>
        </LineChart>
      </Box>
    </Paper>
  );
}
