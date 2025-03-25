/**
 * DataAnalysis component provides statistical analysis and insights
 * for sleep, heart rate, and motion data.
 */

import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { SleepData } from '../types/sleep';
import { HeartRateData } from '../types/heartRate';
import { MotionData } from '../types/motion';

/**
 * Props interface for the DataAnalysis component
 */
interface DataAnalysisProps {
  /** Array of sleep data records */
  sleepData: SleepData[];
  /** Array of heart rate measurements */
  heartRateData: HeartRateData[];
  /** Array of motion measurements */
  motionData: MotionData[];
}

/**
 * DataAnalysis component that provides statistical analysis of sleep data
 */
export function DataAnalysis({ sleepData, heartRateData, motionData }: DataAnalysisProps) {
  /**
   * Calculates average sleep duration in hours
   */
  const calculateAverageDuration = () => {
    if (sleepData.length === 0) return 0;
    const totalDuration = sleepData.reduce((sum, data) => sum + data.duration, 0);
    return (totalDuration / sleepData.length / 60).toFixed(1);
  };

  /**
   * Calculates average sleep quality
   */
  const calculateAverageQuality = () => {
    if (sleepData.length === 0) return 0;
    const totalQuality = sleepData.reduce((sum, data) => sum + data.quality, 0);
    return (totalQuality / sleepData.length).toFixed(1);
  };

  /**
   * Calculates phase distribution percentages
   */
  const calculatePhaseDistribution = () => {
    if (sleepData.length === 0) return { deep: 0, rem: 0, light: 0 };

    let totalDeep = 0;
    let totalRem = 0;
    let totalLight = 0;
    let totalDuration = 0;

    sleepData.forEach(data => {
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
        totalDuration += phase.duration;
      });
    });

    return {
      deep: ((totalDeep / totalDuration) * 100).toFixed(1),
      rem: ((totalRem / totalDuration) * 100).toFixed(1),
      light: ((totalLight / totalDuration) * 100).toFixed(1),
    };
  };

  /**
   * Calculates average heart rate during sleep
   */
  const calculateAverageHeartRate = () => {
    if (heartRateData.length === 0) return 0;
    const totalHeartRate = heartRateData.reduce((sum, data) => sum + data.value, 0);
    return (totalHeartRate / heartRateData.length).toFixed(1);
  };

  /**
   * Calculates average movement during sleep
   */
  const calculateAverageMovement = () => {
    if (motionData.length === 0) return 0;
    const totalMovement = motionData.reduce((sum, data) => sum + data.magnitude, 0);
    return (totalMovement / motionData.length).toFixed(2);
  };

  const phaseDistribution = calculatePhaseDistribution();

  return (
    <Paper elevation={2} sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Sleep Analysis
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" gutterBottom>
            Sleep Statistics
          </Typography>
          <List>
            <ListItem>
              <ListItemText
                primary="Average Duration"
                secondary={`${calculateAverageDuration()} hours`}
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Average Quality"
                secondary={`${calculateAverageQuality()}%`}
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Average Heart Rate"
                secondary={`${calculateAverageHeartRate()} bpm`}
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Average Movement"
                secondary={`${calculateAverageMovement()} m/s²`}
              />
            </ListItem>
          </List>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" gutterBottom>
            Sleep Phase Distribution
          </Typography>
          <List>
            <ListItem>
              <ListItemText
                primary="Deep Sleep"
                secondary={`${phaseDistribution.deep}%`}
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="REM Sleep"
                secondary={`${phaseDistribution.rem}%`}
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Light Sleep"
                secondary={`${phaseDistribution.light}%`}
              />
            </ListItem>
          </List>
        </Grid>
      </Grid>
    </Paper>
  );
} 