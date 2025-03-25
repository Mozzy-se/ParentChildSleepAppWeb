import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  LinearProgress,
  Chip,
  IconButton,
  Tooltip,
  useTheme,
} from '@mui/material';
import {
  CheckCircle,
  Error,
  AccessTime,
  Sync,
  HealthAndSafety,
  DirectionsRun,
  Refresh,
  Info,
  TrendingUp,
  Bedtime,
} from '@mui/icons-material';
import { SamsungHealthService } from '../services/samsungHealthService';
import { useAuth } from '../contexts/AuthContext';

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
      id={`health-tabpanel-${index}`}
      aria-labelledby={`health-tab-${index}`}
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

export function HealthData() {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [sleepData, setSleepData] = useState<any[]>([]);
  const [heartRateData, setHeartRateData] = useState<any[]>([]);
  const [motionData, setMotionData] = useState<any[]>([]);
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const { currentUser } = useAuth();
  const healthService = new SamsungHealthService();

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Check if Samsung Health Bridge is available
      if (!window.SamsungHealthBridge) {
        setError('Samsung Health Bridge is not available. Please make sure you are using the native wrapper application.');
        setIsConnected(false);
        return;
      }

      const initialized = await healthService.initialize();
      if (!initialized) {
        setError('Failed to initialize Samsung Health Bridge. Please try again.');
        setIsConnected(false);
        return;
      }

      const hasPermissions = await healthService.checkPermissions();
      if (!hasPermissions) {
        setShowPermissionDialog(true);
        setIsConnected(false);
        return;
      }

      setIsConnected(true);
      await fetchHealthData();
    } catch (err) {
      setError('Failed to connect to Samsung Health');
      console.error('Connection error:', err);
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestPermissions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const granted = await healthService.requestPermission();
      if (granted) {
        setIsConnected(true);
        await fetchHealthData();
      } else {
        setError('Please grant permissions to access health data');
      }
    } catch (err) {
      setError('Failed to request permissions');
      console.error('Permission error:', err);
    } finally {
      setIsLoading(false);
      setShowPermissionDialog(false);
    }
  };

  const fetchHealthData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7); // Last 7 days

      const [sleep, heartRate, motion] = await Promise.all([
        healthService.getSleepData(startDate, endDate),
        healthService.getHeartRateData(startDate, endDate),
        healthService.getMotionData(startDate, endDate),
      ]);

      setSleepData(sleep);
      setHeartRateData(heartRate);
      setMotionData(motion);
      setLastSyncTime(new Date());
    } catch (err) {
      setError('Failed to fetch health data');
      console.error('Data fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSync = async () => {
    if (!isConnected) {
      setShowPermissionDialog(true);
      return;
    }
    await fetchHealthData();
  };

  const StatCard = ({ title, value, icon, color, subtitle }: any) => (
    <Card sx={{ height: '100%', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box sx={{ 
            backgroundColor: `${color}15`, 
            borderRadius: '50%', 
            p: 1, 
            mr: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {icon}
          </Box>
          <Box>
            <Typography variant="h6" color="text.secondary">
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>
        <Typography variant="h4" component="div" sx={{ mb: 1 }}>
          {value}
        </Typography>
        <LinearProgress
          variant="determinate"
          value={100}
          sx={{ 
            height: 4, 
            borderRadius: 2, 
            backgroundColor: `${color}30`,
            '& .MuiLinearProgress-bar': {
              backgroundColor: color,
            }
          }}
        />
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 3, 
          mb: 3,
          background: `linear-gradient(135deg, ${theme.palette.primary.main}15 0%, ${theme.palette.background.paper} 100%)`
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                Health Data Connection
              </Typography>
              <Chip
                icon={isConnected ? <CheckCircle /> : <Error />}
                label={isConnected ? 'Connected' : 'Disconnected'}
                color={isConnected ? 'success' : 'error'}
                size="small"
              />
            </Box>
            {lastSyncTime && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AccessTime fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  Last Sync: {lastSyncTime.toLocaleString()}
                </Typography>
              </Box>
            )}
          </Grid>
          <Grid item>
            <Tooltip title={isConnected ? "Sync Data" : "Connect Health Service"}>
              <IconButton
                onClick={isConnected ? handleSync : () => setShowPermissionDialog(true)}
                disabled={isLoading}
                sx={{
                  backgroundColor: theme.palette.primary.main,
                  color: 'white',
                  '&:hover': {
                    backgroundColor: theme.palette.primary.dark,
                  }
                }}
              >
                {isLoading ? <CircularProgress size={24} color="inherit" /> : <Sync />}
              </IconButton>
            </Tooltip>
          </Grid>
        </Grid>
      </Paper>

      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 2 }}
          action={
            <Button color="inherit" size="small" onClick={checkConnection}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      <Dialog 
        open={showPermissionDialog} 
        onClose={() => setShowPermissionDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <HealthAndSafety color="primary" />
            <Typography variant="h6">Connect Health Service</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            To access your health data, we need permission to read:
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon>
                <Bedtime color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Sleep data" 
                secondary="Track your sleep patterns and quality"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <HealthAndSafety color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Heart rate data" 
                secondary="Monitor your heart rate during sleep"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <DirectionsRun color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Motion data" 
                secondary="Track your movement during sleep"
              />
            </ListItem>
          </List>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2, color: 'text.secondary' }}>
            <Info fontSize="small" />
            <Typography variant="body2">
              This data will be used to provide you with personalized sleep insights and recommendations.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPermissionDialog(false)}>Cancel</Button>
          <Button
            onClick={handleRequestPermissions}
            variant="contained"
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={20} /> : null}
          >
            {isLoading ? 'Requesting...' : 'Grant Access'}
          </Button>
        </DialogActions>
      </Dialog>

      <Paper elevation={3} sx={{ p: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          centered
          sx={{ 
            mb: 3,
            '& .MuiTabs-indicator': {
              height: 3,
              borderRadius: 3,
            }
          }}
        >
          <Tab 
            label="Sleep" 
            icon={<Bedtime />} 
            iconPosition="start"
          />
          <Tab 
            label="Heart Rate" 
            icon={<HealthAndSafety />} 
            iconPosition="start"
          />
          <Tab 
            label="Motion" 
            icon={<DirectionsRun />} 
            iconPosition="start"
          />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <StatCard
                title="Average Sleep Duration"
                value={`${Math.round(sleepData[0]?.duration / 60)}h`}
                icon={<AccessTime color="primary" />}
                color={theme.palette.primary.main}
                subtitle="Last 7 days"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <StatCard
                title="Sleep Quality"
                value={`${sleepData[0]?.quality}%`}
                icon={<HealthAndSafety color="success" />}
                color={theme.palette.success.main}
                subtitle="Last 7 days"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <StatCard
                title="Deep Sleep"
                value={`${Math.round(sleepData[0]?.phases?.find((p: any) => p.type === 'Deep')?.duration / 60)}h`}
                icon={<TrendingUp color="info" />}
                color={theme.palette.info.main}
                subtitle="Last 7 days"
              />
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <StatCard
                title="Average Heart Rate"
                value={`${Math.round(heartRateData.reduce((acc: number, curr: any) => acc + curr.value, 0) / heartRateData.length)} bpm`}
                icon={<HealthAndSafety color="error" />}
                color={theme.palette.error.main}
                subtitle="Last 7 days"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <StatCard
                title="Data Points"
                value={heartRateData.length}
                icon={<TrendingUp color="secondary" />}
                color={theme.palette.secondary.main}
                subtitle="Last 7 days"
              />
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <StatCard
                title="Total Steps"
                value={motionData.reduce((acc: number, curr: any) => acc + curr.steps, 0)}
                icon={<DirectionsRun color="warning" />}
                color={theme.palette.warning.main}
                subtitle="Last 7 days"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <StatCard
                title="Distance"
                value={`${Math.round(motionData.reduce((acc: number, curr: any) => acc + curr.distance, 0) / 1000)} km`}
                icon={<TrendingUp color="info" />}
                color={theme.palette.info.main}
                subtitle="Last 7 days"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <StatCard
                title="Activity Level"
                value={`${Math.round(motionData.reduce((acc: number, curr: any) => acc + curr.magnitude, 0) / motionData.length)}`}
                icon={<HealthAndSafety color="success" />}
                color={theme.palette.success.main}
                subtitle="Average magnitude"
              />
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>
    </Box>
  );
} 