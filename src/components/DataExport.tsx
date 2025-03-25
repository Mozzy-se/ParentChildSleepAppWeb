/**
 * DataExport component provides functionality for exporting sleep, heart rate,
 * and motion data in various formats (CSV, JSON) and downloading the exported data.
 */

import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Paper,
} from '@mui/material';
import { Download as DownloadIcon } from '@mui/icons-material';
import { SleepData } from '../types/sleep';
import { HeartRateData } from '../types/heartRate';
import { MotionData } from '../types/motion';

/**
 * Props interface for the DataExport component
 */
interface DataExportProps {
  /** Array of sleep data records */
  sleepData: SleepData[];
  /** Array of heart rate measurements */
  heartRateData: HeartRateData[];
  /** Array of motion measurements */
  motionData: MotionData[];
}

/**
 * DataExport component that handles data export functionality
 */
export function DataExport({ sleepData, heartRateData, motionData }: DataExportProps) {
  const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('csv');

  /**
   * Converts data to CSV format
   * @param data Array of objects to convert
   * @returns CSV string
   */
  const convertToCSV = (data: any[]): string => {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          return typeof value === 'string' ? `"${value}"` : value;
        }).join(',')
      ),
    ];
    
    return csvRows.join('\n');
  };

  /**
   * Handles the export process
   */
  const handleExport = () => {
    const exportData = {
      sleep: sleepData,
      heartRate: heartRateData,
      motion: motionData,
    };

    let content: string;
    let filename: string;
    let type: string;

    if (exportFormat === 'csv') {
      content = convertToCSV(exportData.sleep);
      filename = 'sleep_data.csv';
      type = 'text/csv';
    } else {
      content = JSON.stringify(exportData, null, 2);
      filename = 'sleep_data.json';
      type = 'application/json';
    }

    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Paper elevation={2} sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Export Data
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Format</InputLabel>
          <Select
            value={exportFormat}
            label="Format"
            onChange={(e) => setExportFormat(e.target.value as 'csv' | 'json')}
          >
            <MenuItem value="csv">CSV</MenuItem>
            <MenuItem value="json">JSON</MenuItem>
          </Select>
        </FormControl>
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={handleExport}
        >
          Export
        </Button>
      </Box>
    </Paper>
  );
} 