/**
 * DataFilter component provides functionality for filtering sleep, heart rate,
 * and motion data based on date range and other criteria.
 */

import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { SleepData } from '../types/sleep';
import { HeartRateData } from '../types/heartRate';
import { MotionData } from '../types/motion';

/**
 * Props interface for the DataFilter component
 */
interface DataFilterProps {
  /** Array of sleep data records */
  sleepData: SleepData[];
  /** Array of heart rate measurements */
  heartRateData: HeartRateData[];
  /** Array of motion measurements */
  motionData: MotionData[];
  /** Callback function to handle filtered data */
  onFilter: (filteredData: {
    sleep: SleepData[];
    heartRate: HeartRateData[];
    motion: MotionData[];
  }) => void;
}

/**
 * DataFilter component that handles data filtering functionality
 */
export function DataFilter({ sleepData, heartRateData, motionData, onFilter }: DataFilterProps) {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [minQuality, setMinQuality] = useState<number | ''>('');
  const [minDuration, setMinDuration] = useState<number | ''>('');
  const [phaseType, setPhaseType] = useState<string>('all');

  /**
   * Filters data based on selected criteria
   */
  const handleFilter = () => {
    const filteredSleep = sleepData.filter(data => {
      const date = new Date(data.date);
      const matchesDateRange = (!startDate || date >= startDate) && (!endDate || date <= endDate);
      const matchesQuality = minQuality === '' || data.quality >= minQuality;
      const matchesDuration = minDuration === '' || data.duration >= minDuration * 60; // Convert hours to minutes
      const matchesPhase = phaseType === 'all' || data.phases.some(p => p.type === phaseType);
      
      return matchesDateRange && matchesQuality && matchesDuration && matchesPhase;
    });

    const filteredHeartRate = heartRateData.filter(data => {
      const date = new Date(data.timestamp);
      return (!startDate || date >= startDate) && (!endDate || date <= endDate);
    });

    const filteredMotion = motionData.filter(data => {
      const date = new Date(data.timestamp);
      return (!startDate || date >= startDate) && (!endDate || date <= endDate);
    });

    onFilter({
      sleep: filteredSleep,
      heartRate: filteredHeartRate,
      motion: filteredMotion,
    });
  };

  /**
   * Resets all filter criteria
   */
  const handleReset = () => {
    setStartDate(null);
    setEndDate(null);
    setMinQuality('');
    setMinDuration('');
    setPhaseType('all');
    onFilter({
      sleep: sleepData,
      heartRate: heartRateData,
      motion: motionData,
    });
  };

  return (
    <Paper elevation={2} sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Filter Data
      </Typography>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <DatePicker
              label="Start Date"
              value={startDate}
              onChange={setStartDate}
              slotProps={{ textField: { fullWidth: true } }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <DatePicker
              label="End Date"
              value={endDate}
              onChange={setEndDate}
              slotProps={{ textField: { fullWidth: true } }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Minimum Quality (%)"
              type="number"
              value={minQuality}
              onChange={(e) => setMinQuality(e.target.value ? Number(e.target.value) : '')}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Minimum Duration (hours)"
              type="number"
              value={minDuration}
              onChange={(e) => setMinDuration(e.target.value ? Number(e.target.value) : '')}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Phase Type</InputLabel>
              <Select
                value={phaseType}
                label="Phase Type"
                onChange={(e) => setPhaseType(e.target.value)}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="Deep">Deep Sleep</MenuItem>
                <MenuItem value="REM">REM Sleep</MenuItem>
                <MenuItem value="Light">Light Sleep</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button variant="contained" onClick={handleFilter}>
                Apply Filter
              </Button>
              <Button variant="outlined" onClick={handleReset}>
                Reset
              </Button>
            </Box>
          </Grid>
        </Grid>
      </LocalizationProvider>
    </Paper>
  );
} 