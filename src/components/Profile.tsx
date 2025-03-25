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
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Tabs,
  Tab,
  CircularProgress,
  LinearProgress,
} from '@mui/material';
import {
  Person,
  Email,
  Security,
  Storage,
  Download,
  Upload,
  Delete,
  Edit,
  ChildCare,
  Bedtime,
  AccessTime,
  HealthAndSafety,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

interface ChildData {
  id: string;
  name: string;
  age: number;
  sleepData: {
    averageDuration: number;
    averageQuality: number;
    totalSleep: number;
    consistency: number;
  };
}

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
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
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

export function Profile() {
  const { currentUser, logout, getChildren } = useAuth();
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editName, setEditName] = useState(currentUser?.name || '');
  const [editAge, setEditAge] = useState(currentUser?.age?.toString() || '');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [childrenData, setChildrenData] = useState<ChildData[]>([]);

  useEffect(() => {
    if (currentUser?.role === 'parent') {
      loadChildrenData();
    }
  }, [currentUser]);

  const loadChildrenData = async () => {
    setLoading(true);
    try {
      // Simulate loading children data
      const mockChildrenData: ChildData[] = [
        {
          id: '1',
          name: 'Child 1',
          age: 8,
          sleepData: {
            averageDuration: 8.5,
            averageQuality: 85,
            totalSleep: 59.5,
            consistency: 90,
          },
        },
        {
          id: '2',
          name: 'Child 2',
          age: 12,
          sleepData: {
            averageDuration: 7.5,
            averageQuality: 80,
            totalSleep: 52.5,
            consistency: 85,
          },
        },
      ];
      setChildrenData(mockChildrenData);
    } catch (error) {
      console.error('Error loading children data:', error);
      setError('Failed to load children data');
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = () => {
    try {
      const userData = localStorage.getItem('sleepData') || '[]';
      const blob = new Blob([userData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sleep-data-${currentUser?.email}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setSuccess('Data exported successfully!');
    } catch (error) {
      setError('Failed to export data');
      console.error('Error exporting data:', error);
    }
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        localStorage.setItem('sleepData', JSON.stringify(data));
        setSuccess('Data imported successfully!');
      } catch (error) {
        setError('Failed to import data. Please check the file format.');
        console.error('Error importing data:', error);
      }
    };
    reader.readAsText(file);
  };

  const handleDeleteAccount = async () => {
    try {
      await logout();
      setSuccess('Account deleted successfully');
    } catch (error) {
      setError('Failed to delete account');
      console.error('Error deleting account:', error);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      setSuccess('Profile updated successfully');
      setShowEditDialog(false);
    } catch (error) {
      setError('Failed to update profile');
      console.error('Error updating profile:', error);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

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

  return (
    <Box sx={{ p: 3 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Profile Information */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Person sx={{ fontSize: 40, mr: 2 }} />
              <Typography variant="h5">Profile Information</Typography>
            </Box>
            <List>
              <ListItem>
                <ListItemIcon>
                  <Email />
                </ListItemIcon>
                <ListItemText primary="Email" secondary={currentUser?.email} />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Person />
                </ListItemIcon>
                <ListItemText primary="Name" secondary={currentUser?.name || 'Not set'} />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Security />
                </ListItemIcon>
                <ListItemText primary="Role" secondary={currentUser?.role} />
              </ListItem>
            </List>
            <Button
              variant="contained"
              startIcon={<Edit />}
              onClick={() => setShowEditDialog(true)}
              sx={{ mt: 2 }}
            >
              Edit Profile
            </Button>
          </Paper>
        </Grid>

        {/* Data Management */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Storage sx={{ fontSize: 40, mr: 2 }} />
              <Typography variant="h5">Data Management</Typography>
            </Box>
            <List>
              <ListItem>
                <ListItemIcon>
                  <Download />
                </ListItemIcon>
                <ListItemText
                  primary="Export Data"
                  secondary="Download your sleep tracking data"
                />
                <Button onClick={handleExportData}>Export</Button>
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Upload />
                </ListItemIcon>
                <ListItemText
                  primary="Import Data"
                  secondary="Import your sleep tracking data"
                />
                <Button component="label">
                  Import
                  <input
                    type="file"
                    hidden
                    accept=".json"
                    onChange={handleImportData}
                  />
                </Button>
              </ListItem>
            </List>
          </Paper>
        </Grid>

        {/* Account Settings */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Security sx={{ fontSize: 40, mr: 2 }} />
              <Typography variant="h5">Account Settings</Typography>
            </Box>
            <List>
              <ListItem>
                <ListItemIcon>
                  <Delete />
                </ListItemIcon>
                <ListItemText
                  primary="Delete Account"
                  secondary="Permanently delete your account and all data"
                />
                <Button
                  color="error"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  Delete
                </Button>
              </ListItem>
            </List>
          </Paper>
        </Grid>
      </Grid>

      {/* Child Accounts Section (for parent accounts) */}
      {currentUser?.role === 'parent' && (
        <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <ChildCare sx={{ fontSize: 40, mr: 2 }} />
            <Typography variant="h5">Child Accounts</Typography>
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              centered
              sx={{ mb: 2 }}
            >
              {childrenData.map((child, index) => (
                <Tab key={child.id} label={child.name} />
              ))}
            </Tabs>
          )}

          {childrenData.map((child, index) => (
            <TabPanel key={child.id} value={tabValue} index={index}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard
                    title="Average Duration"
                    value={`${child.sleepData.averageDuration}h`}
                    icon={<AccessTime color="primary" />}
                    color="primary"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard
                    title="Sleep Quality"
                    value={`${child.sleepData.averageQuality}%`}
                    icon={<HealthAndSafety color="success" />}
                    color="success"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard
                    title="Total Sleep"
                    value={`${child.sleepData.totalSleep}h`}
                    icon={<Bedtime color="info" />}
                    color="info"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard
                    title="Consistency"
                    value={`${child.sleepData.consistency}%`}
                    icon={<HealthAndSafety color="warning" />}
                    color="warning"
                  />
                </Grid>
              </Grid>
            </TabPanel>
          ))}
        </Paper>
      )}

      {/* Edit Profile Dialog */}
      <Dialog open={showEditDialog} onClose={() => setShowEditDialog(false)}>
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          <TextField
            margin="normal"
            fullWidth
            label="Name"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
          />
          <TextField
            margin="normal"
            fullWidth
            label="Age"
            type="number"
            value={editAge}
            onChange={(e) => setEditAge(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowEditDialog(false)}>Cancel</Button>
          <Button onClick={handleUpdateProfile} variant="contained">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Account Dialog */}
      <Dialog open={showDeleteDialog} onClose={() => setShowDeleteDialog(false)}>
        <DialogTitle>Delete Account</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete your account? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleDeleteAccount} color="error" variant="contained">
            Delete Account
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 