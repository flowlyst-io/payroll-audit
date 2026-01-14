'use client';

import Link from 'next/link';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import BarChartIcon from '@mui/icons-material/BarChart';

export default function EmptyDashboard() {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '60vh',
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 6,
          textAlign: 'center',
          maxWidth: 400,
          backgroundColor: 'grey.50',
          borderRadius: 2,
        }}
      >
        <BarChartIcon
          sx={{
            fontSize: 64,
            color: 'primary.main',
            mb: 2,
          }}
        />
        <Typography variant="h5" component="h2" gutterBottom>
          No payroll data yet
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Upload a CSV file to see payroll trends and department distribution charts.
        </Typography>
        <Button
          component={Link}
          href="/upload"
          variant="contained"
          size="large"
        >
          Upload Data
        </Button>
      </Paper>
    </Box>
  );
}
