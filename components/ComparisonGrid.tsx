'use client';

import { useCallback } from 'react';
import Box from '@mui/material/Box';
import { DataGrid, type GridColDef, type GridRowModel } from '@mui/x-data-grid';
import { formatCurrency, formatDelta, formatPercent } from '@/utils/formatters';
import type { ComparisonRow } from '@/types';

interface ComparisonGridProps {
  rows: ComparisonRow[];
  onRowUpdate: (updatedRow: ComparisonRow) => void;
  readOnly?: boolean;
}

export default function ComparisonGrid({
  rows,
  onRowUpdate,
  readOnly = false,
}: ComparisonGridProps) {
  const columns: GridColDef<ComparisonRow>[] = [
    {
      field: 'employeeName',
      headerName: 'Employee',
      flex: 1,
      minWidth: 180,
    },
    {
      field: 'priorAmount',
      headerName: 'Prior Amount',
      width: 130,
      type: 'number',
      valueFormatter: (value: number) => formatCurrency(value),
    },
    {
      field: 'currentAmount',
      headerName: 'Current Amount',
      width: 140,
      type: 'number',
      valueFormatter: (value: number) => formatCurrency(value),
      cellClassName: (params) => {
        // Highlight if different from prior
        if (params.row.priorAmount !== params.row.currentAmount) {
          return 'highlight-different';
        }
        return '';
      },
    },
    {
      field: 'delta',
      headerName: 'Delta',
      width: 120,
      type: 'number',
      valueFormatter: (value: number) => formatDelta(value),
    },
    {
      field: 'deltaPercent',
      headerName: 'Delta %',
      width: 100,
      type: 'number',
      valueFormatter: (value: number) => formatPercent(value),
    },
    {
      field: 'yearToDate',
      headerName: 'Year-to-Date',
      width: 130,
      type: 'number',
      valueFormatter: (value: number) => formatCurrency(value),
    },
    {
      field: 'note',
      headerName: 'Notes',
      flex: 1,
      minWidth: 200,
      editable: !readOnly,
    },
  ];

  const processRowUpdate = useCallback(
    (newRow: GridRowModel<ComparisonRow>, oldRow: GridRowModel<ComparisonRow>) => {
      // Only update if note changed
      if (newRow.note !== oldRow.note) {
        onRowUpdate(newRow as ComparisonRow);
      }
      return newRow;
    },
    [onRowUpdate]
  );

  return (
    <Box
      sx={{
        width: '100%',
        height: 600,
        '& .highlight-different': {
          backgroundColor: 'warning.light',
          fontWeight: 'bold',
        },
      }}
    >
      <DataGrid
        rows={rows}
        columns={columns}
        getRowId={(row) => row.employeeKey}
        processRowUpdate={processRowUpdate}
        disableRowSelectionOnClick
        initialState={{
          pagination: {
            paginationModel: { pageSize: 25 },
          },
        }}
        pageSizeOptions={[10, 25, 50, 100]}
        sx={{
          '& .MuiDataGrid-cell:focus': {
            outline: 'none',
          },
        }}
      />
    </Box>
  );
}
