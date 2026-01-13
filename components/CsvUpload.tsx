'use client';

import { useCallback, useState } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { parseCSV, isValidCSVFile } from '@/utils/csvParser';
import type { ParseResult } from '@/types';

interface CsvUploadProps {
  onUploadComplete: (result: ParseResult) => void;
}

export default function CsvUpload({ onUploadComplete }: CsvUploadProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);
      setFileName(file.name);

      if (!isValidCSVFile(file)) {
        setError('Please upload a valid CSV file (.csv)');
        return;
      }

      setIsLoading(true);

      try {
        const result = await parseCSV(file);
        onUploadComplete(result);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to parse CSV file';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    },
    [onUploadComplete]
  );

  const handleFileInput = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      setIsDragOver(false);

      const file = event.dataTransfer.files?.[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 4,
        textAlign: 'center',
        borderStyle: 'dashed',
        borderWidth: 2,
        borderColor: isDragOver ? 'primary.main' : 'divider',
        backgroundColor: isDragOver ? 'action.hover' : 'background.paper',
        transition: 'all 0.2s ease',
        cursor: 'pointer',
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        accept=".csv"
        onChange={handleFileInput}
        style={{ display: 'none' }}
        id="csv-file-input"
        disabled={isLoading}
      />

      <Box sx={{ mb: 2 }}>
        {isLoading ? (
          <CircularProgress size={48} />
        ) : (
          <CloudUploadIcon sx={{ fontSize: 48, color: 'action.active' }} />
        )}
      </Box>

      <Typography variant="h6" gutterBottom>
        {isLoading ? 'Parsing CSV...' : 'Upload CSV File'}
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {isLoading
          ? 'Please wait while we process your file'
          : 'Drag and drop your CSV file here, or click to browse'}
      </Typography>

      {fileName && !error && !isLoading && (
        <Typography variant="body2" color="success.main" sx={{ mb: 2 }}>
          Selected: {fileName}
        </Typography>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2, textAlign: 'left' }}>
          {error}
        </Alert>
      )}

      <label htmlFor="csv-file-input">
        <Button
          variant="contained"
          component="span"
          disabled={isLoading}
          startIcon={<CloudUploadIcon />}
        >
          {isLoading ? 'Processing...' : 'Choose File'}
        </Button>
      </label>
    </Paper>
  );
}
