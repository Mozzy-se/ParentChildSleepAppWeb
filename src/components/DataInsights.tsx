/**
 * DataInsights component provides intelligent insights and recommendations
 * based on sleep, heart rate, and motion data analysis.
 */

import React from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { SleepData } from '../types/sleep';
import { HeartRateData } from '../types/heartRate';
import { MotionData } from '../types/motion';

/**
 * Props interface for the DataInsights component
 */
interface DataInsightsProps {
  /** Array of sleep data records */
  sleepData: SleepData[];
  /** Array of heart rate measurements */
  heartRateData: HeartRateData[];
  /** Array of motion measurements */
  motionData: MotionData[];
}

/**
 * DataInsights component that provides intelligent insights based on sleep data
 */
export function DataInsights({ sleepData, heartRateData, motionData }: DataInsightsProps) {
  /**
   * Calculates average sleep duration in hours
   */
  const calculateAverageDuration = () => {
    if (sleepData.length === 0) return 0;
    const totalDuration = sleepData.reduce((sum, data) => sum + data.duration, 0);
    return totalDuration / sleepData.length / 60;
  };

  /**
   * Calculates average sleep quality
   */
  const calculateAverageQuality = () => {
    if (sleepData.length === 0) return 0;
    const totalQuality = sleepData.reduce((sum, data) => sum + data.quality, 0);
    return totalQuality / sleepData.length;
  };

  /**
   * Calculates average heart rate during sleep
   */
  const calculateAverageHeartRate = () => {
    if (heartRateData.length === 0) return 0;
    const totalHeartRate = heartRateData.reduce((sum, data) => sum + data.value, 0);
    return totalHeartRate / heartRateData.length;
  };

  /**
   * Calculates average movement during sleep
   */
  const calculateAverageMovement = () => {
    if (motionData.length === 0) return 0;
    const totalMovement = motionData.reduce((sum, data) => sum + data.magnitude, 0);
    return totalMovement / motionData.length;
  };

  /**
   * Generates insights based on sleep data analysis
   */
  const generateInsights = () => {
    const insights: Array<{
      type: 'positive' | 'negative' | 'warning' | 'info';
      message: string;
    }> = [];

    const avgDuration = calculateAverageDuration();
    const avgQuality = calculateAverageQuality();
    const avgHeartRate = calculateAverageHeartRate();
    const avgMovement = calculateAverageMovement();

    // Duration insights
    if (avgDuration < 7) {
      insights.push({
        type: 'warning',
        message: 'Your average sleep duration is below the recommended 7-9 hours.',
      });
    } else if (avgDuration > 9) {
      insights.push({
        type: 'warning',
        message: 'Your average sleep duration is above the recommended 7-9 hours.',
      });
    }

    // Quality insights
    if (avgQuality < 70) {
      insights.push({
        type: 'negative',
        message: 'Your sleep quality is below optimal levels. Consider improving your sleep hygiene.',
      });
    } else if (avgQuality > 90) {
      insights.push({
        type: 'positive',
        message: 'Excellent sleep quality! Keep up the good habits.',
      });
    }

    // Heart rate insights
    if (avgHeartRate > 80) {
      insights.push({
        type: 'warning',
        message: 'Your average heart rate during sleep is higher than normal. Consider stress management techniques.',
      });
    }

    // Movement insights
    if (avgMovement > 0.5) {
      insights.push({
        type: 'warning',
        message: 'You tend to move more during sleep. This might indicate restlessness or discomfort.',
      });
    }

    // Add general recommendations
    insights.push({
      type: 'info',
      message: 'Maintain a consistent sleep schedule and create a relaxing bedtime routine.',
    });

    return insights;
  };

  const insights = generateInsights();

  /**
   * Returns the appropriate icon based on insight type
   * @param type The type of insight
   * @returns React component for the icon
   */
  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'positive':
        return <CheckCircleIcon color="success" />;
      case 'negative':
        return <TrendingDownIcon color="error" />;
      case 'warning':
        return <WarningIcon color="warning" />;
      default:
        return <TrendingUpIcon color="info" />;
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Sleep Insights
      </Typography>
      <List>
        {insights.map((insight, index) => (
          <React.Fragment key={index}>
            <ListItem>
              <ListItemIcon>
                {getInsightIcon(insight.type)}
              </ListItemIcon>
              <ListItemText primary={insight.message} />
            </ListItem>
            {index < insights.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </List>
    </Paper>
  );
} 