import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  CircularProgress,
  Tabs,
  Tab,
  Card,
  CardContent,
  Grid,
  LinearProgress,
  Alert,
  Snackbar,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Refresh as RefreshIcon, CloudUpload as CloudUploadIcon } from '@mui/icons-material';
import { WearableService, DeviceInfo } from '../services/wearableService';
import { SamsungHealthService } from '../services/samsungHealthService';
import { CloudSyncService } from '../services/cloudSyncService';
import { DataVisualization } from './DataVisualization';
import { SleepData, SleepPhase } from '../types/sleep';
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
      id={`device-tabpanel-${index}`}
      aria-labelledby={`device-tab-${index}`}
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

const samsungHealthService = new SamsungHealthService();

interface SyncStatus {
  success: boolean;
  message: string;
}

export const DeviceConnection: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [devices, setDevices] = useState<BluetoothDevice[]>([]);
  const [wearableService] = useState(() => new WearableService());
  const [cloudSyncService] = useState(() => new CloudSyncService(
    process.env.REACT_APP_API_URL || 'http://localhost:3000/api',
    process.env.REACT_APP_API_KEY || ''
  ));
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [sleepData, setSleepData] = useState<SleepData[]>([]);
  const [heartRateData, setHeartRateData] = useState<HeartRateData[]>([]);
  const [motionData, setMotionData] = useState<MotionData[]>([]);
  const [syncStatus, setSyncStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSamsungHealthInitialized, setIsSamsungHealthInitialized] = useState(false);
  const [isSamsungHealthAuthorized, setIsSamsungHealthAuthorized] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);

  useEffect(() => {
    initSamsungHealth();
  }, []);

  const initSamsungHealth = async () => {
    try {
      setError(null);
      
      const initialized = await samsungHealthService.initialize();
      setIsSamsungHealthInitialized(initialized);

      if (initialized) {
        const authorized = await samsungHealthService.checkPermissions();
        setIsSamsungHealthAuthorized(authorized);
        
        if (!authorized) {
          setShowPermissionDialog(true);
        }
      }
    } catch (error) {
      console.error('Error initializing Samsung Health:', error);
      setError('Failed to initialize Samsung Health. Please make sure you are using a Samsung device and the Samsung Health app is installed.');
    }
  };

  const handleRequestPermissions = async () => {
    try {
      setError(null);
      
      const authorized = await samsungHealthService.requestPermission();
      setIsSamsungHealthAuthorized(authorized);
      setShowPermissionDialog(false);
      
      if (authorized) {
        setSyncStatus({
          success: true,
          message: 'Successfully connected to Samsung Health!',
        });
      } else {
        setError('Failed to get permissions from Samsung Health. Please try again.');
      }
    } catch (error) {
      console.error('Error requesting permissions:', error);
      setError('Failed to request permissions from Samsung Health. Please try again.');
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setError(null);
  };

  const handleScan = async () => {
    setIsScanning(true);
    setError(null);
    try {
      const foundDevices = await wearableService.scanDevices();
      setDevices(foundDevices);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to scan for devices');
    } finally {
      setIsScanning(false);
    }
  };

  const handleConnect = async (device: BluetoothDevice) => {
    try {
      await wearableService.connectDevice(device);
      // Handle successful connection
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect to device');
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    setError(null);
    try {
      const [sleepResponse, heartRateResponse, motionResponse] = await Promise.all([
        cloudSyncService.syncSleepData(sleepData),
        cloudSyncService.syncHeartRateData(heartRateData),
        cloudSyncService.syncMotionData(motionData),
      ]);

      const allSuccessful = sleepResponse.success && heartRateResponse.success && motionResponse.success;
      setSyncStatus({
        success: allSuccessful,
        message: allSuccessful
          ? 'Data synced successfully'
          : 'Some data failed to sync',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sync data');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSamsungHealthSync = async () => {
    if (!isSamsungHealthInitialized || !isSamsungHealthAuthorized) {
      setError('Please connect to Samsung Health first.');
      return;
    }

    try {
      setIsSyncing(true);
      setError(null);

      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7); // Get last 7 days of data

      const [sleep, heartRate, motion] = await Promise.all([
        samsungHealthService.getSleepData(startDate, endDate),
        samsungHealthService.getHeartRateData(startDate, endDate),
        samsungHealthService.getMotionData(startDate, endDate),
      ]);

      console.log('Sleep data:', sleep);
      console.log('Heart rate data:', heartRate);
      console.log('Motion data:', motion);

      setSleepData(sleep);
      setHeartRateData(heartRate);
      setMotionData(motion);
      setLastSyncTime(new Date());
      setSyncStatus({
        success: true,
        message: `Synced ${sleep.length} sleep records, ${heartRate.length} heart rate records, and ${motion.length} motion records`,
      });
    } catch (error) {
      console.error('Error syncing data:', error);
      setError('Failed to sync data from Samsung Health. Please try again.');
    } finally {
      setIsSyncing(false);
    }
  };

  const renderDeviceInfo = () => {
    if (!deviceInfo) return null;

    return (
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Device Information
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Name
              </Typography>
              <Typography variant="body1">{deviceInfo.name}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Firmware Version
              </Typography>
              <Typography variant="body1">{deviceInfo.firmwareVersion}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Battery Level
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ flexGrow: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={deviceInfo.batteryLevel}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {deviceInfo.batteryLevel}%
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Manufacturer
              </Typography>
              <Typography variant="body1">{deviceInfo.manufacturer}</Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  };

  const renderSleepData = () => {
    if (sleepData.length === 0) return null;

    const latestSleep = sleepData[sleepData.length - 1];
    return (
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Latest Sleep Data
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Duration
              </Typography>
              <Typography variant="body1">
                {Math.round(latestSleep.duration / 60)} minutes
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Quality
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ flexGrow: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={latestSleep.quality}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {Math.round(latestSleep.quality)}%
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">
                Sleep Phases
              </Typography>
              <Box sx={{ mt: 1 }}>
                {latestSleep.phases.map((phase, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      mb: 0.5,
                    }}
                  >
                    <Typography variant="body2">{phase.type}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {Math.round(phase.duration / 60)} min
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Tabs value={tabValue} onChange={handleTabChange}>
        <Tab label="Samsung Health" />
        <Tab label="Bluetooth Devices" />
      </Tabs>

      <TabPanel value={tabValue} index={0}>
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Samsung Health Connection
            </Typography>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={8}>
                <Typography variant="body1">
                  Status: {isSamsungHealthInitialized ? 'Initialized' : 'Not Initialized'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Authorization: {isSamsungHealthAuthorized ? 'Authorized' : 'Not Authorized'}
                </Typography>
                {lastSyncTime && (
                  <Typography variant="body2" color="text.secondary">
                    Last Sync: {lastSyncTime.toLocaleString()}
                  </Typography>
                )}
              </Grid>
              <Grid item xs={12} sm={4}>
                {!isSamsungHealthAuthorized && (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => setShowPermissionDialog(true)}
                  >
                    Connect Samsung Health
                  </Button>
                )}
                {isSamsungHealthAuthorized && (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSamsungHealthSync}
                    disabled={isSyncing}
                  >
                    {isSyncing ? <CircularProgress size={24} /> : 'Sync Data'}
                  </Button>
                )}
              </Grid>
            </Grid>
            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
            {syncStatus && (
              <Alert severity={syncStatus.success ? 'success' : 'error'} sx={{ mt: 2 }}>
                {syncStatus.message}
              </Alert>
            )}
          </CardContent>
        </Card>

        {sleepData.length > 0 && (
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Sleep Data
              </Typography>
              <Typography variant="body2">
                {sleepData.length} sleep records available
              </Typography>
            </CardContent>
          </Card>
        )}

        {!isSamsungHealthInitialized && (
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Setup Instructions
              </Typography>
              <Typography variant="body2" paragraph>
                1. Make sure you have Samsung Health installed on your device
              </Typography>
              <Typography variant="body2" paragraph>
                2. Open Samsung Health and ensure you're logged in
              </Typography>
              <Typography variant="body2" paragraph>
                3. Grant the necessary permissions when prompted
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Note: This feature is only available on Samsung devices with Samsung Health installed.
              </Typography>
            </CardContent>
          </Card>
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Button
            variant="contained"
            onClick={handleScan}
            disabled={isScanning}
          >
            {isScanning ? <CircularProgress size={24} /> : 'Scan for Devices'}
          </Button>
          <Button
            variant="outlined"
            startIcon={<CloudUploadIcon />}
            onClick={handleSync}
            disabled={isSyncing || sleepData.length === 0}
          >
            {isSyncing ? <CircularProgress size={24} /> : 'Sync Data'}
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {syncStatus && (
          <Snackbar
            open={!!syncStatus}
            autoHideDuration={6000}
            onClose={() => setSyncStatus(null)}
          >
            <Alert
              onClose={() => setSyncStatus(null)}
              severity={syncStatus.success ? 'success' : 'warning'}
            >
              {syncStatus.message}
            </Alert>
          </Snackbar>
        )}

        {devices.length > 0 ? (
          <Box>
            {devices.map((device) => (
              <Button
                key={device.id}
                variant="outlined"
                onClick={() => handleConnect(device)}
                sx={{ mr: 1, mb: 1 }}
              >
                {device.name || 'Unknown Device'}
              </Button>
            ))}
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No devices found. Click "Scan for Devices" to start scanning.
          </Typography>
        )}

        {renderDeviceInfo()}
        {renderSleepData()}
        
        {sleepData.length > 0 && (
          <DataVisualization
            sleepData={sleepData}
            heartRateData={heartRateData}
            motionData={motionData}
          />
        )}
      </TabPanel>

      <Dialog open={showPermissionDialog} onClose={() => setShowPermissionDialog(false)}>
        <DialogTitle>Connect to Samsung Health</DialogTitle>
        <DialogContent>
          <Typography>
            This app needs access to your Samsung Health data to provide sleep tracking features.
            Please grant the following permissions:
          </Typography>
          <ul>
            <li>Sleep data</li>
            <li>Heart rate data</li>
            <li>Motion data</li>
          </ul>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPermissionDialog(false)}>Cancel</Button>
          <Button
            onClick={handleRequestPermissions}
            variant="contained"
          >
            Grant Access
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}; 