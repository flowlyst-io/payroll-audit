'use client';

import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select, { type SelectChangeEvent } from '@mui/material/Select';

interface PayPeriodSelectorProps {
  payPeriods: string[];
  priorPeriod: string;
  currentPeriod: string;
  onPriorChange: (value: string) => void;
  onCurrentChange: (value: string) => void;
  disabled?: boolean;
}

export default function PayPeriodSelector({
  payPeriods,
  priorPeriod,
  currentPeriod,
  onPriorChange,
  onCurrentChange,
  disabled = false,
}: PayPeriodSelectorProps) {
  const handlePriorChange = (event: SelectChangeEvent) => {
    onPriorChange(event.target.value);
  };

  const handleCurrentChange = (event: SelectChangeEvent) => {
    onCurrentChange(event.target.value);
  };

  return (
    <Box sx={{ display: 'flex', gap: 3, alignItems: 'center', flexWrap: 'wrap' }}>
      <FormControl sx={{ minWidth: 180 }} size="small" disabled={disabled}>
        <InputLabel id="prior-period-label">Prior Pay Period</InputLabel>
        <Select
          labelId="prior-period-label"
          id="prior-period-select"
          value={priorPeriod}
          label="Prior Pay Period"
          onChange={handlePriorChange}
        >
          {payPeriods.map((pp) => (
            <MenuItem key={pp} value={pp}>
              PP {pp}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl sx={{ minWidth: 180 }} size="small" disabled={disabled}>
        <InputLabel id="current-period-label">Current Pay Period</InputLabel>
        <Select
          labelId="current-period-label"
          id="current-period-select"
          value={currentPeriod}
          label="Current Pay Period"
          onChange={handleCurrentChange}
        >
          {payPeriods.map((pp) => (
            <MenuItem key={pp} value={pp}>
              PP {pp}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
}
