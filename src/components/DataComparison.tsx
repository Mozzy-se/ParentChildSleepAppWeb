/**
 * DataComparison component provides functionality for comparing sleep data
 * between different time periods or users.
 */

import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { SleepData } from '../types/sleep';
import { HeartRateData } from '../types/heartRate';
import { MotionData } from '../types/motion';

/**
 * Props interface for the DataComparison component
 */
interface DataComparisonProps {
  /** Array of sleep data records */
  sleepData: SleepData[];
  /** Array of heart rate measurements */
  heartRateData: HeartRateData[];
  /** Array of motion measurements */
  motionData: MotionData[];
}

/**
 * DataComparison component that provides comparison functionality for sleep data
 */
export function DataComparison({ sleepData, heartRateData, motionData }: DataComparisonProps) {
  const [comparisonType, setComparisonType] = useState<'period' | 'user'>('period');
  const [period1, setPeriod1] = useState<string>('week');
  const [period2, setPeriod2] = useState<string>('month');

  /**
   * Calculates statistics for a given period
   * @param period The time period to calculate statistics for
   * @returns Object containing calculated statistics
   */
  const calculatePeriodStats = (period: string) => {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case 'year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default:
        startDate = new Date(now.setDate(now.getDate() - 7));
    }

    const periodData = sleepData.filter(data => new Date(data.date) >= startDate);
    
    if (periodData.length === 0) {
      return {
        duration: 0,
        quality: 0,
        deepSleep: 0,
        remSleep: 0,
        lightSleep: 0,
      };
    }

    const totalDuration = periodData.reduce((sum, data) => sum + data.duration, 0);
    const totalQuality = periodData.reduce((sum, data) => sum + data.quality, 0);
    
    let totalDeep = 0;
    let totalRem = 0;
    let totalLight = 0;
    let totalPhaseDuration = 0;

    periodData.forEach(data => {
      data.phases.forEach(phase => {
        switch (phase.type) {
          case 'Deep':
            totalDeep += phase.duration;
            break;
          case 'REM':
            totalRem += phase.duration;
            break;
          case 'Light':
            totalLight += phase.duration;
            break;
        }
        totalPhaseDuration += phase.duration;
      });
    });

    return {
      duration: (totalDuration / periodData.length / 60).toFixed(1),
      quality: (totalQuality / periodData.length).toFixed(1),
      deepSleep: ((totalDeep / totalPhaseDuration) * 100).toFixed(1),
      remSleep: ((totalRem / totalPhaseDuration) * 100).toFixed(1),
      lightSleep: ((totalLight / totalPhaseDuration) * 100).toFixed(1),
    };
  };

  const period1Stats = calculatePeriodStats(period1);
  const period2Stats = calculatePeriodStats(period2);

  return (
    <Paper elevation={2} sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Data Comparison
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Period 1</InputLabel>
            <Select
              value={period1}
              label="Period 1"
              onChange={(e) => setPeriod1(e.target.value)}
            >
              <MenuItem value="week">Last Week</MenuItem>
              <MenuItem value="month">Last Month</MenuItem>
              <MenuItem value="year">Last Year</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Period 2</InputLabel>
            <Select
              value={period2}
              label="Period 2"
              onChange={(e) => setPeriod2(e.target.value)}
            >
              <MenuItem value="week">Last Week</MenuItem>
              <MenuItem value="month">Last Month</MenuItem>
              <MenuItem value="year">Last Year</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Metric</TableCell>
                  <TableCell align="right">Period 1</TableCell>
                  <TableCell align="right">Period 2</TableCell>
                  <TableCell align="right">Difference</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>Average Duration (hours)</TableCell>
                  <TableCell align="right">{period1Stats.duration}</TableCell>
                  <TableCell align="right">{period2Stats.duration}</TableCell>
                  <TableCell align="right">
                    {(Number(period1Stats.duration) - Number(period2Stats.duration)).toFixed(1)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Average Quality (%)</TableCell>
                  <TableCell align="right">{period1Stats.quality}</TableCell>
                  <TableCell align="right">{period2Stats.quality}</TableCell>
                  <TableCell align="right">
                    {(Number(period1Stats.quality) - Number(period2Stats.quality)).toFixed(1)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Deep Sleep (%)</TableCell>
                  <TableCell align="right">{period1Stats.deepSleep}</TableCell>
                  <TableCell align="right">{period2Stats.deepSleep}</TableCell>
                  <TableCell align="right">
                    {(Number(period1Stats.deepSleep) - Number(period2Stats.deepSleep)).toFixed(1)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>REM Sleep (%)</TableCell>
                  <TableCell align="right">{period1Stats.remSleep}</TableCell>
                  <TableCell align="right">{period2Stats.remSleep}</TableCell>
                  <TableCell align="right">
                    {(Number(period1Stats.remSleep) - Number(period2Stats.remSleep)).toFixed(1)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Light Sleep (%)</TableCell>
                  <TableCell align="right">{period1Stats.lightSleep}</TableCell>
                  <TableCell align="right">{period2Stats.lightSleep}</TableCell>
                  <TableCell align="right">
                    {(Number(period1Stats.lightSleep) - Number(period2Stats.lightSleep)).toFixed(1)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>
    </Paper>
  );
} 