/**
 * DataSync component provides functionality for synchronizing sleep, heart rate,
 * and motion data with a remote server using the CloudSyncService.
 */

import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Sync as SyncIcon } from '@mui/icons-material';
import { CloudSyncService } from '../services/cloudSyncService';
import { SleepData } from '../types/sleep';
import { HeartRateData } from '../types/heartRate';
import { MotionData } from '../types/motion';

/**
 * Props interface for the DataSync component
 */
interface DataSyncProps {
  /** Array of sleep data records */
  sleepData: SleepData[];
  /** Array of heart rate measurements */
  heartRateData: HeartRateData[];
  /** Array of motion measurements */
  motionData: MotionData[];
  /** CloudSyncService instance for handling sync operations */
  cloudSyncService: CloudSyncService;
}

/**
 * DataSync component that handles data synchronization with the cloud
 */
export function DataSync({ sleepData, heartRateData, motionData, cloudSyncService }: DataSyncProps) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  /**
   * Handles the synchronization process
   */
  const handleSync = async () => {
    setIsSyncing(true);
    setError(null);
    setSuccess(false);

    try {
      // Sync sleep data
      await cloudSyncService.syncSleepData(sleepData);
      
      // Sync heart rate data
      await cloudSyncService.syncHeartRateData(heartRateData);
      
      // Sync motion data
      await cloudSyncService.syncMotionData(motionData);

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sync data');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Sync Data
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Data synchronized successfully
        </Alert>
      )}
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
        <Button
          variant="contained"
          startIcon={isSyncing ? <CircularProgress size={20} /> : <SyncIcon />}
          onClick={handleSync}
          disabled={isSyncing}
        >
          {isSyncing ? 'Syncing...' : 'Sync'}
        </Button>
      </Box>
    </Paper>
  );
} 