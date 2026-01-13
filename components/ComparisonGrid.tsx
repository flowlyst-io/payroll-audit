'use client';

import { useState, useCallback } from 'react';
import Box from '@mui/material/Box';
import {
  DataGrid,
  GridToolbar,
  GridCellModes,
  type GridColDef,
  type GridRowModel,
  type GridCellModesModel,
  type GridCellParams,
} from '@mui/x-data-grid';
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
  // Controlled cell modes for single-click editing
  const [cellModesModel, setCellModesModel] = useState<GridCellModesModel>({});

  // Handle single-click to enter edit mode (note column only)
  const handleCellClick = useCallback(
    (params: GridCellParams) => {
      if (params.field !== 'note' || readOnly) return;

      setCellModesModel((prev) => ({
        // Reset all other cells to view mode
        ...Object.keys(prev).reduce(
          (acc, id) => ({
            ...acc,
            [id]: Object.keys(prev[id]).reduce(
              (acc2, field) => ({
                ...acc2,
                [field]: { mode: GridCellModes.View },
              }),
              {}
            ),
          }),
          {}
        ),
        // Set clicked cell to edit mode
        [params.id]: { [params.field]: { mode: GridCellModes.Edit } },
      }));
    },
    [readOnly]
  );

  // Handle arrow key navigation between note cells
  const handleCellKeyDown = useCallback(
    (
      params: GridCellParams,
      event: React.KeyboardEvent<HTMLElement> & { defaultMuiPrevented?: boolean }
    ) => {
      if (params.field !== 'note') return;
      if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;

      // Prevent default grid behavior
      event.defaultMuiPrevented = true;

      const currentIndex = rows.findIndex((r) => r.employeeKey === params.id);
      const nextIndex =
        event.key === 'ArrowDown'
          ? Math.min(currentIndex + 1, rows.length - 1)
          : Math.max(currentIndex - 1, 0);

      if (currentIndex === nextIndex) return;

      const nextRowId = rows[nextIndex].employeeKey;

      // Exit current cell and enter next cell's edit mode
      setCellModesModel({
        [params.id]: { note: { mode: GridCellModes.View } },
        [nextRowId]: { note: { mode: GridCellModes.Edit } },
      });
    },
    [rows]
  );

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
        height: '100%',
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
        cellModesModel={cellModesModel}
        onCellModesModelChange={setCellModesModel}
        onCellClick={handleCellClick}
        onCellKeyDown={handleCellKeyDown}
        disableRowSelectionOnClick
        slots={{ toolbar: GridToolbar }}
        slotProps={{
          toolbar: {
            showQuickFilter: true,
          },
        }}
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
