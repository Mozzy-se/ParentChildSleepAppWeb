/**
 * DataVisualization component provides a comprehensive view of sleep, heart rate,
 * and motion data through various charts and visualizations using the Recharts library.
 */

import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { SleepData, SleepPhase } from '../types/sleep';
import { HeartRateData } from '../types/heartRate';
import { MotionData } from '../types/motion';

/**
 * Props interface for the DataVisualization component
 */
interface DataVisualizationProps {
  /** Array of sleep data records */
  sleepData: SleepData[];
  /** Array of heart rate measurements */
  heartRateData: HeartRateData[];
  /** Array of motion measurements */
  motionData: MotionData[];
}

/**
 * DataVisualization component that renders various charts and graphs
 * for visualizing sleep, heart rate, and motion data
 */
export function DataVisualization({ sleepData, heartRateData, motionData }: DataVisualizationProps) {
  // Format data for sleep duration chart
  const sleepDurationData = sleepData.map(data => ({
    date: data.date.toLocaleDateString(),
    duration: data.duration / 60, // Convert to hours
  }));


  // Format data for sleep phases chart
  const sleepPhasesData = sleepData.map(data => {
    const phases = data.phases;
    const getPhaseDuration = (type: 'Deep' | 'REM' | 'Light') => {
      const phase = phases.find(p => p.type === type);
      return phase ? phase.duration / 60 : 0;
    };

    return {
      date: data.date.toLocaleDateString(),
      Deep: getPhaseDuration('Deep'),
      REM: getPhaseDuration('REM'),
      Light: getPhaseDuration('Light'),
    };
  });

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Sleep Duration Chart */}
        <Grid item xs={12} md={12}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Sleep Duration
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sleepDurationData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="duration"
                    fill="#8884d8"
                    name="Duration (hours)"
                  />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Sleep Phases Chart */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Sleep Phases Distribution
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sleepPhasesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Deep" stackId="a" fill="#8884d8" name="Deep Sleep" />
                  <Bar dataKey="REM" stackId="a" fill="#82ca9d" name="REM Sleep" />
                  <Bar dataKey="Light" stackId="a" fill="#ffc658" name="Light Sleep" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Heart Rate Chart */}
        <Grid item xs={12} md={12}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Heart Rate During Sleep
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={heartRateData.map(data => ({
                  time: new Date(data.timestamp).toLocaleTimeString(),
                  heartRate: data.value,
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis label={{ value: 'BPM', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="heartRate"
                    stroke="#8884d8"
                    name="Heart Rate (bpm)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
} 