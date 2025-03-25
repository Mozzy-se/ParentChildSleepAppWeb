import React from 'react';
import { Box, Typography, Grid, Paper } from '@mui/material';

export const SleepTracking: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Sleep Tracking
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="body1">
              Sleep tracking data will be displayed here.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}; 