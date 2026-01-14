'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import { PieChart } from '@mui/x-charts/PieChart';
import type { DacTotal } from '@/types';

interface DepartmentPieChartProps {
  data: DacTotal[];
}

// Professional color palette
const COLORS = [
  '#3b82f6', // Blue
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#84cc16', // Lime
  '#f97316', // Orange
];

// Maximum departments to show individually (rest grouped as "Other")
const MAX_DEPARTMENTS = 8;

export default function DepartmentPieChart({ data }: DepartmentPieChartProps) {
  // Format currency for display
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Group smaller departments into "Other" to prevent legend overflow
  const processedData = (() => {
    if (data.length <= MAX_DEPARTMENTS) return data;

    const topDepartments = data.slice(0, MAX_DEPARTMENTS);
    const otherDepartments = data.slice(MAX_DEPARTMENTS);
    const otherTotal = otherDepartments.reduce((sum, d) => sum + d.total, 0);

    return [...topDepartments, { dac: 'Other', total: otherTotal }];
  })();

  // Calculate total for percentages
  const total = processedData.reduce((sum, d) => sum + d.total, 0);

  // Transform data for PieChart with colors
  const pieData = processedData.map((d, index) => ({
    id: index,
    value: d.total,
    label: d.dac,
    color: COLORS[index % COLORS.length],
  }));

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
        Distribution by Department
      </Typography>
      <Box sx={{ flex: 1, minHeight: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <PieChart
          colors={COLORS}
          series={[
            {
              data: pieData,
              highlightScope: { fade: 'global', highlight: 'item' },
              faded: { additionalRadius: -10, color: 'gray' },
              valueFormatter: (item) => formatCurrency(item.value),
              innerRadius: 50,
              outerRadius: 120,
              paddingAngle: 2,
              cornerRadius: 4,
              arcLabel: (item) => {
                const percent = (item.value / total) * 100;
                return percent >= 7 ? `${percent.toFixed(0)}%` : '';
              },
              arcLabelMinAngle: 30,
            },
          ]}
          width={450}
          height={300}
          margin={{ left: 10, right: 150, top: 10, bottom: 10 }}
          slotProps={{
            legend: {
              direction: 'vertical',
              position: { vertical: 'middle', horizontal: 'end' },
            },
          }}
          sx={{
            '& .MuiChartsLegend-label': {
              fontSize: '11px !important',
            },
          }}
        />
      </Box>
    </Paper>
  );
}
