import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
  LinearProgress,
} from '@mui/material';
import {
  Bedtime,
  HealthAndSafety,
  TrendingUp,
  AccessTime,
  DirectionsRun,
  Add,
  Assessment,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface SleepStats {
  averageDuration: number;
  averageQuality: number;
  totalSleep: number;
  consistency: number;
}

export function Dashboard() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<SleepStats>({
    averageDuration: 0,
    averageQuality: 0,
    totalSleep: 0,
    consistency: 0,
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    // Simulate loading sleep data
    const loadData = async () => {
      try {
        // Here you would typically fetch data from your backend
        // For now, we'll use mock data
        const mockStats = {
          averageDuration: 7.5,
          averageQuality: 85,
          totalSleep: 52.5,
          consistency: 90,
        };
        setStats(mockStats);

        const mockActivity = [
          {
            date: new Date(),
            duration: 7.5,
            quality: 85,
            type: 'Sleep',
          },
          {
            date: new Date(Date.now() - 86400000),
            duration: 8,
            quality: 90,
            type: 'Sleep',
          },
        ];
        setRecentActivity(mockActivity);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const StatCard = ({ title, value, icon, color }: any) => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          {icon}
          <Typography variant="h6" sx={{ ml: 1 }}>
            {title}
          </Typography>
        </Box>
        <Typography variant="h4" component="div" sx={{ mb: 1 }}>
          {value}
        </Typography>
        {color && (
          <LinearProgress
            variant="determinate"
            value={value}
            sx={{ height: 8, borderRadius: 4, backgroundColor: 'rgba(0,0,0,0.1)' }}
          />
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Welcome back, {currentUser?.name || currentUser?.email}
      </Typography>

      {/* Quick Actions */}
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Quick Actions
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate('/sleep')}
            >
              Start Sleep Tracking
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<Assessment />}
              onClick={() => navigate('/health')}
            >
              View Health Data
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Sleep Statistics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Average Duration"
            value={`${stats.averageDuration}h`}
            icon={<AccessTime color="primary" />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Sleep Quality"
            value={`${stats.averageQuality}%`}
            icon={<HealthAndSafety color="success" />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Sleep"
            value={`${stats.totalSleep}h`}
            icon={<Bedtime color="info" />}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Consistency"
            value={`${stats.consistency}%`}
            icon={<TrendingUp color="warning" />}
            color="warning"
          />
        </Grid>
      </Grid>

      {/* Recent Activity */}
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Recent Activity
        </Typography>
        <List>
          {recentActivity.map((activity, index) => (
            <ListItem key={index}>
              <ListItemIcon>
                {activity.type === 'Sleep' ? <Bedtime /> : <DirectionsRun />}
              </ListItemIcon>
              <ListItemText
                primary={`${activity.type} Session`}
                secondary={`${activity.duration}h - Quality: ${activity.quality}%`}
              />
              <Typography variant="body2" color="text.secondary">
                {new Date(activity.date).toLocaleDateString()}
              </Typography>
            </ListItem>
          ))}
        </List>
      </Paper>
    </Box>
  );
} 