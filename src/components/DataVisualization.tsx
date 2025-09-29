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
  users?: { userName: string; sleepData: SleepData[] }[];
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

  // Weekdays vs Weekends average sleep (hours)
  // Weekdays = Sun–Thu (divide by 5), Weekends = Fri–Sat (divide by 2)
    const weekdayEntries = sleepData.filter(d => {
      const dow = d.date.getDay(); // 0=Sun..6=Sat
      return dow >= 0 && dow <= 4; // Sun–Thu
    });
    const weekendEntries = sleepData.filter(d => {
      const dow = d.date.getDay();
      return dow === 5 || dow === 6; // Fri–Sat
    });

  const avgWeekdayHours =
    weekdayEntries.length
      ? weekdayEntries.reduce((sum, d) => sum + (d.duration || 0), 0) / 60 / weekdayEntries.length
      : 0;

  const avgWeekendHours =
    weekendEntries.length
      ? weekendEntries.reduce((sum, d) => sum + (d.duration || 0), 0) / 60 / weekendEntries.length
      : 0;

  const weekdayVsWeekendData = [
    { label: 'Weekdays (Sun–Thu)', hours: Number(avgWeekdayHours.toFixed(2)) },
    { label: 'Weekends (Fri–Sat)', hours: Number(avgWeekendHours.toFixed(2)) },
  ];

  // Sleep Efficiency (totals across provided sleepData)
  // Falls back to duration if timeInBed is missing.
  type SleepDataExt = SleepData & { timeInBed?: number };

  const totals = (sleepData as SleepDataExt[]).reduce(
    (acc, d) => {
      const inBed = (d.timeInBed ?? d.duration) || 0; // minutes
      const asleep = d.duration || 0;                  // minutes
      acc.inBed += inBed;
      acc.asleep += asleep;
      return acc;
    },
    { inBed: 0, asleep: 0 }
  );

  const efficiencyPct =
    totals.inBed > 0 ? Math.round((totals.asleep / totals.inBed) * 100) : 0;

  const sleepEfficiencyData = [
    { label: 'Time in Bed', hours: Number((totals.inBed / 60).toFixed(2)) },
    { label: 'Asleep',     hours: Number((totals.asleep / 60).toFixed(2)) },
  ];

  // --- Times Woken Up (last 5 days) ---
  type SleepWithAwakenings = SleepData & { awakenings?: number };

  // Helper: normalize to midnight to compare dates by day only
  const dayKey = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

  // Build an array of the last 5 calendar days: [today-4, ..., today]
  const lastFiveDays: Date[] = Array.from({ length: 5 }, (_, i) => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - (4 - i));
    return d;
  });

  // For each of the last 5 days, find the night record (if any) and take 'awakenings', default 0
  const timesWokenData = lastFiveDays.map(d => {
    const rec = (sleepData as SleepWithAwakenings[]).find(s => dayKey(s.date) === dayKey(d));
    const count = rec?.awakenings ?? 0;
    return { date: d.toLocaleDateString(), awakenings: count };
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

        {/* Weekdays vs Weekends Average Sleep */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Average Sleep: Weekdays vs Weekends
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weekdayVsWeekendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="hours" name="Avg Hours" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Sleep Efficiency */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Sleep Efficiency
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Efficiency: {efficiencyPct}%
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sleepEfficiencyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="hours" name="Hours" fill="#82ca9d" />
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
        <Grid item xs={12} md={6}>
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

        {/* Times Woken Up (last 5 days) */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Times Woken Up (Past 5 Days)
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timesWokenData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis label={{ value: 'Times Woken', angle: -90, position: 'insideLeft' }} allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="awakenings" stroke="#8884d8" name="Times Woken" />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
} 