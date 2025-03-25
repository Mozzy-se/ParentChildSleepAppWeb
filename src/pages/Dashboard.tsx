import React from 'react';
import { Box, Typography, Grid, Paper } from '@mui/material';
import { DeviceConnection } from '../components/DeviceConnection';

export const Dashboard: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <DeviceConnection />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}; 