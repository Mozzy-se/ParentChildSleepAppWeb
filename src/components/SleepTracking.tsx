import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Bedtime,
  AccessTime,
  TrendingUp,
  HealthAndSafety,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { DataVisualization } from './DataVisualization';
import { SleepData } from '../types/sleep';
import { HeartRateData } from '../types/heartRate';
import { MotionData } from '../types/motion';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`sleep-tabpanel-${index}`}
      aria-labelledby={`sleep-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

interface UserSleepData {
  userId: string;
  userName: string;
  sleepData: SleepData[];
  heartRateData: HeartRateData[];
  motionData: MotionData[];
}

export function SleepTracking() {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usersData, setUsersData] = useState<UserSleepData[]>([]);
  const { currentUser } = useAuth();

  useEffect(() => {
    loadSleepData();
  }, []);

  const loadSleepData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Simulate loading data for multiple users (replace with actual API calls)
      const mockUsersData: UserSleepData[] = [
        {
          userId: currentUser?.id || '1',
          userName: currentUser?.name || 'Parent',
          sleepData: [
            {
              date: new Date(),
              duration: 480, // 8 hours in minutes
              quality: 85,
              phases: [
                { type: 'Deep', startTime: new Date(), duration: 120 },
                { type: 'REM', startTime: new Date(), duration: 90 },
                { type: 'Light', startTime: new Date(), duration: 270 },
              ],
              heartRate: [65, 68, 70, 72, 70, 68, 65],
              movement: [0, 1, 0, 2, 1, 0, 1],
            },
          ],
          heartRateData: Array.from({ length: 7 }, (_, i) => ({
            timestamp: Date.now() - (6 - i) * 3600000,
            value: 65 + Math.random() * 5,
            confidence: 0.95,
            source: 'Mock Device',
          })),
          motionData: Array.from({ length: 7 }, (_, i) => ({
            timestamp: Date.now() - (6 - i) * 3600000,
            x: Math.random() * 2,
            y: Math.random() * 2,
            z: Math.random() * 2,
            magnitude: Math.random() * 2,
            source: 'Mock Device',
          })),
        },
        {
          userId: '2',
          userName: 'Child 1',
          sleepData: [
            {
              date: new Date(),
              duration: 540, // 9 hours in minutes
              quality: 90,
              phases: [
                { type: 'Deep', startTime: new Date(), duration: 150 },
                { type: 'REM', startTime: new Date(), duration: 120 },
                { type: 'Light', startTime: new Date(), duration: 270 },
              ],
              heartRate: [70, 72, 75, 78, 75, 72, 70],
              movement: [1, 2, 1, 3, 2, 1, 2],
            },
          ],
          heartRateData: Array.from({ length: 7 }, (_, i) => ({
            timestamp: Date.now() - (6 - i) * 3600000,
            value: 70 + Math.random() * 5,
            confidence: 0.95,
            source: 'Mock Device',
          })),
          motionData: Array.from({ length: 7 }, (_, i) => ({
            timestamp: Date.now() - (6 - i) * 3600000,
            x: Math.random() * 2,
            y: Math.random() * 2,
            z: Math.random() * 2,
            magnitude: Math.random() * 2,
            source: 'Mock Device',
          })),
        },
        {
          userId: '3',
          userName: 'Child 2',
          sleepData: [
            {
              date: new Date(),
              duration: 510, // 8.5 hours in minutes
              quality: 88,
              phases: [
                { type: 'Deep', startTime: new Date(), duration: 135 },
                { type: 'REM', startTime: new Date(), duration: 105 },
                { type: 'Light', startTime: new Date(), duration: 270 },
              ],
              heartRate: [68, 70, 73, 75, 73, 70, 68],
              movement: [0, 1, 0, 2, 1, 0, 1],
            },
          ],
          heartRateData: Array.from({ length: 7 }, (_, i) => ({
            timestamp: Date.now() - (6 - i) * 3600000,
            value: 68 + Math.random() * 5,
            confidence: 0.95,
            source: 'Mock Device',
          })),
          motionData: Array.from({ length: 7 }, (_, i) => ({
            timestamp: Date.now() - (6 - i) * 3600000,
            x: Math.random() * 2,
            y: Math.random() * 2,
            z: Math.random() * 2,
            magnitude: Math.random() * 2,
            source: 'Mock Device',
          })),
        },
      ];

      setUsersData(mockUsersData);
    } catch (err) {
      setError('Failed to load sleep data');
      console.error('Error loading sleep data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

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
        Sleep Tracking
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          {usersData.map(user => (
            <React.Fragment key={user.userId}>
              <Grid item xs={12} sm={6} md={4}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <AccessTime color="primary" />
                      <Typography variant="h6" sx={{ ml: 1 }}>
                        {user.userName}
                      </Typography>
                    </Box>
                    <Typography variant="h4">
                      {Math.round(user.sleepData[0]?.duration / 60)}h
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Sleep Duration
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <HealthAndSafety color="success" />
                      <Typography variant="h6" sx={{ ml: 1 }}>
                        {user.userName}
                      </Typography>
                    </Box>
                    <Typography variant="h4">
                      {user.sleepData[0]?.quality}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Sleep Quality
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <TrendingUp color="info" />
                      <Typography variant="h6" sx={{ ml: 1 }}>
                        {user.userName}
                      </Typography>
                    </Box>
                    <Typography variant="h4">
                      {(() => {
                        const deepPhase = user.sleepData[0]?.phases?.find(p => p.type === 'Deep');
                        return deepPhase ? Math.round(deepPhase.duration / 60) : 0;
                      })()}h
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Deep Sleep
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </React.Fragment>
          ))}
        </Grid>
      </Paper>

      <Paper elevation={3} sx={{ p: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          centered
          sx={{ mb: 2 }}
        >
          <Tab label="Overview" />
          <Tab label="Details" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <DataVisualization 
            sleepData={usersData[0]?.sleepData || []}
            heartRateData={usersData[0]?.heartRateData || []}
            motionData={usersData[0]?.motionData || []}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>
            Sleep Phases
          </Typography>
          <Grid container spacing={2}>
            {usersData.map(user => (
              <Grid item xs={12} key={user.userId}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {user.userName}
                    </Typography>
                    {user.sleepData[0]?.phases?.map((phase, index) => (
                      <Typography key={index} variant="body2">
                        {phase.type} Sleep: {Math.round(phase.duration / 60)} hours
                      </Typography>
                    ))}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>
      </Paper>
    </Box>
  );
} 