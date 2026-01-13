'use client';

import { useState, useMemo } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import type { ColumnMapping } from '@/types';
import type { SelectChangeEvent } from '@mui/material/Select';

interface ColumnMapperProps {
  headers: string[];
  rowCount: number;
  onMappingComplete: (mapping: ColumnMapping) => void;
  initialMapping?: ColumnMapping | null;
}

type MappingField = 'employeeName' | 'amount' | 'payPeriod';

const fieldLabels: Record<MappingField, string> = {
  employeeName: 'Employee Name',
  amount: 'Amount',
  payPeriod: 'Pay Period',
};

const fieldDescriptions: Record<MappingField, string> = {
  employeeName: 'Column containing employee names or IDs',
  amount: 'Column containing salary/payment amounts',
  payPeriod: 'Column containing pay period identifiers',
};

export default function ColumnMapper({
  headers,
  rowCount,
  onMappingComplete,
  initialMapping,
}: ColumnMapperProps) {
  const [mapping, setMapping] = useState<Record<MappingField, string>>({
    employeeName: initialMapping?.employeeName || '',
    amount: initialMapping?.amount || '',
    payPeriod: initialMapping?.payPeriod || '',
  });

  const handleChange = (field: MappingField) => (event: SelectChangeEvent<string>) => {
    setMapping((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  // Check if all fields are mapped and unique
  const isValid = useMemo(() => {
    const values = Object.values(mapping);
    const allFilled = values.every((v) => v !== '');
    const allUnique = new Set(values).size === values.length;
    return allFilled && allUnique;
  }, [mapping]);

  // Get already selected headers (to show which ones are taken)
  const selectedHeaders = useMemo(() => {
    return new Set(Object.values(mapping).filter((v) => v !== ''));
  }, [mapping]);

  const handleContinue = () => {
    if (isValid) {
      onMappingComplete({
        employeeName: mapping.employeeName,
        amount: mapping.amount,
        payPeriod: mapping.payPeriod,
      });
    }
  };

  const fields: MappingField[] = ['employeeName', 'amount', 'payPeriod'];

  return (
    <Paper variant="outlined" sx={{ p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Map Columns
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Select which columns from your CSV correspond to each required field.
        </Typography>
        <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
          <Chip
            label={`${headers.length} columns`}
            size="small"
            variant="outlined"
          />
          <Chip
            label={`${rowCount.toLocaleString()} rows`}
            size="small"
            variant="outlined"
          />
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {fields.map((field) => (
          <FormControl key={field} fullWidth>
            <InputLabel id={`${field}-label`}>{fieldLabels[field]} *</InputLabel>
            <Select
              labelId={`${field}-label`}
              value={mapping[field]}
              label={`${fieldLabels[field]} *`}
              onChange={handleChange(field)}
            >
              <MenuItem value="">
                <em>Select a column</em>
              </MenuItem>
              {headers.map((header) => {
                const isSelected = selectedHeaders.has(header) && mapping[field] !== header;
                return (
                  <MenuItem
                    key={header}
                    value={header}
                    disabled={isSelected}
                    sx={{
                      color: isSelected ? 'text.disabled' : 'text.primary',
                    }}
                  >
                    {header}
                    {isSelected && ' (already used)'}
                  </MenuItem>
                );
              })}
            </Select>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
              {fieldDescriptions[field]}
            </Typography>
          </FormControl>
        ))}
      </Box>

      {!isValid && mapping.employeeName && mapping.amount && mapping.payPeriod && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          Each field must be mapped to a different column.
        </Alert>
      )}

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          size="large"
          onClick={handleContinue}
          disabled={!isValid}
        >
          Continue to Worksheet
        </Button>
      </Box>
    </Paper>
  );
}
