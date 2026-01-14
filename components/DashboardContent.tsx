'use client';

import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import PaidIcon from '@mui/icons-material/Paid';
import PeopleIcon from '@mui/icons-material/People';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import BusinessIcon from '@mui/icons-material/Business';
import AppBar from './AppBar';
import StatCard from './StatCard';
import { loadData } from '@/utils/storage';
import { getTotalsByPeriod, aggregateByDac, getDashboardStats } from '@/utils/calculations';
import type { PeriodTotal, DacTotal, DashboardStats } from '@/types';
import EmptyDashboard from './EmptyDashboard';
import PayrollTrendChart from './PayrollTrendChart';
import DepartmentPieChart from './DepartmentPieChart';

// Currency formatter
const formatCurrency = (value: number) => {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(2)}M`;
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export default function DashboardContent() {
  const [loading, setLoading] = useState(true);
  const [hasData, setHasData] = useState(false);
  const [periodTotals, setPeriodTotals] = useState<PeriodTotal[]>([]);
  const [dacTotals, setDacTotals] = useState<DacTotal[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const storedData = await loadData();

        if (!storedData || !storedData.csvData.length || !storedData.mapping) {
          setHasData(false);
          setLoading(false);
          return;
        }

        const { csvData, mapping } = storedData;

        // Calculate aggregations
        const periods = getTotalsByPeriod(csvData, mapping);
        const dacs = aggregateByDac(csvData, mapping);
        const dashboardStats = getDashboardStats(csvData, mapping);

        setPeriodTotals(periods);
        setDacTotals(dacs);
        setStats(dashboardStats);
        setHasData(true);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        setHasData(false);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', backgroundColor: 'grey.50' }}>
        <AppBar />
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '60vh',
            gap: 2,
          }}
        >
          <CircularProgress size={48} />
          <Typography color="text.secondary">Loading dashboard...</Typography>
        </Box>
      </Box>
    );
  }

  if (!hasData) {
    return (
      <Box sx={{ minHeight: '100vh', backgroundColor: 'grey.50' }}>
        <AppBar />
        <EmptyDashboard />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'grey.50' }}>
      <AppBar />
      <Box sx={{ p: 3, maxWidth: 1600, mx: 'auto' }}>
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="h4"
            component="h1"
            sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}
          >
            Payroll Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Overview of payroll data across all pay periods
          </Typography>
        </Box>

        {/* Stat Cards */}
        {stats && (
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <StatCard
                title="Total Payroll"
                value={formatCurrency(stats.totalPayroll)}
                subtitle="All pay periods combined"
                icon={PaidIcon}
                color="#3b82f6"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <StatCard
                title="Employees"
                value={stats.employeeCount.toLocaleString()}
                subtitle="Unique employees"
                icon={PeopleIcon}
                color="#10b981"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <StatCard
                title="Pay Periods"
                value={stats.periodCount.toLocaleString()}
                subtitle={`Avg ${formatCurrency(stats.averagePayroll)}/period`}
                icon={CalendarMonthIcon}
                color="#f59e0b"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <StatCard
                title="Departments"
                value={stats.departmentCount.toLocaleString()}
                subtitle="Unique departments"
                icon={BusinessIcon}
                color="#8b5cf6"
              />
            </Grid>
          </Grid>
        )}

        {/* Charts */}
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, lg: 6 }}>
            <Box sx={{ height: 400 }}>
              <PayrollTrendChart data={periodTotals} />
            </Box>
          </Grid>
          <Grid size={{ xs: 12, lg: 6 }}>
            <Box sx={{ height: 400 }}>
              <DepartmentPieChart data={dacTotals} />
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
