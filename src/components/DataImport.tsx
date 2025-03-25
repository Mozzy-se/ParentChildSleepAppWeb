/**
 * DataImport component provides functionality for importing sleep, heart rate,
 * and motion data from CSV or JSON files.
 */

import React, { useRef, useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  Alert,
} from '@mui/material';
import { Upload as UploadIcon } from '@mui/icons-material';
import { SleepData } from '../types/sleep';
import { HeartRateData } from '../types/heartRate';
import { MotionData } from '../types/motion';

/**
 * Props interface for the DataImport component
 */
interface DataImportProps {
  /** Callback function to handle imported data */
  onImport: (data: {
    sleep: SleepData[];
    heartRate: HeartRateData[];
    motion: MotionData[];
  }) => void;
}

/**
 * DataImport component that handles data import functionality
 */
export function DataImport({ onImport }: DataImportProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * Parses CSV data into structured format
   * @param csvString CSV string to parse
   * @returns Array of objects
   */
  const parseCSV = (csvString: string): any[] => {
    const lines = csvString.split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim());
    return lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim());
      const obj: any = {};
      headers.forEach((header, index) => {
        obj[header] = values[index];
      });
      return obj;
    });
  };

  /**
   * Handles file selection and import process
   * @param event File input change event
   */
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        let data;

        if (file.name.endsWith('.csv')) {
          data = parseCSV(content);
        } else if (file.name.endsWith('.json')) {
          data = JSON.parse(content);
        } else {
          throw new Error('Unsupported file format');
        }

        onImport(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to import data');
      }
    };

    reader.onerror = () => {
      setError('Failed to read file');
    };

    reader.readAsText(file);
  };

  return (
    <Paper elevation={2} sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Import Data
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          accept=".csv,.json"
          onChange={handleFileSelect}
        />
        <Button
          variant="contained"
          startIcon={<UploadIcon />}
          onClick={() => fileInputRef.current?.click()}
        >
          Import
        </Button>
      </Box>
    </Paper>
  );
} 