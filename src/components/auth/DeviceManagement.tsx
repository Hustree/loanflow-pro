import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Alert,
  Chip,
  Stack,
  Card,
  CardContent,
  Divider,
  CircularProgress,
  Tooltip,
  Badge,
} from '@mui/material';
import {
  Smartphone,
  Computer,
  Tablet,
  Delete,
  Add,
  Security,
  AccessTime,
  CheckCircle,
  Warning,
  Info,
  Apple,
  Android,
  Window,
  DesktopWindows,
} from '@mui/icons-material';
import { format, formatDistanceToNow } from 'date-fns';
import { useDispatch, useSelector } from 'react-redux';
import { 
  loadUserPasskeys, 
  removePasskey,
  checkPasskeySupport,
} from '../../store/slices/passkeySlice';
import { RootState, AppDispatch } from '../../store/store';
import { PasskeyRegistration } from './PasskeyRegistration';

interface Props {
  userEmail: string;
  userName: string;
}

export const DeviceManagement: React.FC<Props> = ({ userEmail, userName }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<any>(null);
  const [showAddDevice, setShowAddDevice] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const { 
    devices, 
    isSupported,
    error,
  } = useSelector((state: RootState) => state.passkey);

  useEffect(() => {
    loadDevices();
    dispatch(checkPasskeySupport());
  }, [dispatch, userEmail]);

  const loadDevices = async () => {
    setLoading(true);
    try {
      await dispatch(loadUserPasskeys(userEmail)).unwrap();
    } catch (err) {
      console.error('Failed to load devices:', err);
    } finally {
      setLoading(false);
    }
  };

  const getDeviceIcon = (type: string, os?: string) => {
    // OS-specific icons
    if (os?.toLowerCase().includes('ios') || os?.toLowerCase().includes('mac')) {
      return <Apple />;
    }
    if (os?.toLowerCase().includes('android')) {
      return <Android />;
    }
    if (os?.toLowerCase().includes('windows')) {
      return <Window />;
    }
    
    // Device type icons
    switch (type) {
      case 'mobile':
        return <Smartphone />;
      case 'tablet':
        return <Tablet />;
      case 'desktop':
        return <Computer />;
      default:
        return <DesktopWindows />;
    }
  };

  const getBrowserIcon = (browser: string) => {
    const browserLower = browser.toLowerCase();
    if (browserLower.includes('safari')) {
      return '🧭';
    }
    if (browserLower.includes('chrome')) {
      return '🌐';
    }
    if (browserLower.includes('firefox')) {
      return '🦊';
    }
    if (browserLower.includes('edge')) {
      return '🌊';
    }
    return '🌐';
  };

  const handleDeleteClick = (device: any) => {
    setSelectedDevice(device);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedDevice) return;
    
    try {
      await dispatch(removePasskey({ 
        passkeyId: selectedDevice.id, 
        email: userEmail 
      })).unwrap();
      
      setDeleteDialogOpen(false);
      setSelectedDevice(null);
    } catch (err) {
      console.error('Failed to remove device:', err);
    }
  };

  const handleAddDeviceComplete = () => {
    setShowAddDevice(false);
    loadDevices(); // Reload the device list
  };

  const isCurrentDevice = (device: any) => {
    const ua = navigator.userAgent;
    const currentBrowser = 
      ua.includes('Chrome') ? 'Chrome' :
      ua.includes('Safari') && !ua.includes('Chrome') ? 'Safari' :
      ua.includes('Firefox') ? 'Firefox' :
      ua.includes('Edge') ? 'Edge' : 'Unknown';
    
    // Simple check - can be improved
    return device.browser === currentBrowser && 
           new Date(device.lastUsed).toDateString() === new Date().toDateString();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (showAddDevice) {
    return (
      <PasskeyRegistration
        email={userEmail}
        displayName={userName}
        onComplete={handleAddDeviceComplete}
        onSkip={() => setShowAddDevice(false)}
      />
    );
  }

  return (
    <Paper elevation={2} sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Stack spacing={3}>
        {/* Header */}
        <Box>
          <Typography variant="h5" gutterBottom>
            <Security sx={{ mr: 1, verticalAlign: 'middle' }} />
            Trusted Devices
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage devices that can sign in to your account using passkeys
          </Typography>
        </Box>

        {/* Device Limit Alert */}
        {devices.length >= 5 && (
          <Alert severity="warning" icon={<Warning />}>
            You've reached the maximum of 5 devices. Remove an old device to add a new one.
          </Alert>
        )}

        {/* Info Alert */}
        {devices.length === 0 && (
          <Alert severity="info" icon={<Info />}>
            No passkeys registered yet. Add a passkey to enable secure, passwordless login.
          </Alert>
        )}

        {/* Device List */}
        {devices.length > 0 && (
          <List>
            {devices.map((device, index) => (
              <React.Fragment key={device.id}>
                {index > 0 && <Divider />}
                <ListItem sx={{ py: 2 }}>
                  <ListItemIcon>
                    <Badge
                      badgeContent={isCurrentDevice(device) ? 
                        <CheckCircle sx={{ fontSize: 12 }} /> : null
                      }
                      color="success"
                      overlap="circular"
                    >
                      {getDeviceIcon(device.type, device.os)}
                    </Badge>
                  </ListItemIcon>
                  
                  <ListItemText
                    primary={
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="subtitle1">
                          {device.name}
                        </Typography>
                        {isCurrentDevice(device) && (
                          <Chip 
                            label="This device" 
                            size="small" 
                            color="success"
                            variant="outlined"
                          />
                        )}
                      </Stack>
                    }
                    secondary={
                      <Stack spacing={0.5} sx={{ mt: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          {getBrowserIcon(device.browser)} {device.browser} • {device.os}
                        </Typography>
                        <Stack direction="row" spacing={2}>
                          <Typography variant="caption" color="text.secondary">
                            <AccessTime sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
                            Added {format(new Date(device.createdAt), 'MMM d, yyyy')}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Last used {formatDistanceToNow(new Date(device.lastUsed), { addSuffix: true })}
                          </Typography>
                        </Stack>
                      </Stack>
                    }
                  />
                  
                  <ListItemSecondaryAction>
                    <Tooltip title={isCurrentDevice(device) ? 
                      "Cannot remove current device" : "Remove device"
                    }>
                      <span>
                        <IconButton
                          edge="end"
                          onClick={() => handleDeleteClick(device)}
                          disabled={isCurrentDevice(device)}
                          color="error"
                        >
                          <Delete />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </ListItemSecondaryAction>
                </ListItem>
              </React.Fragment>
            ))}
          </List>
        )}

        {/* Add Device Button */}
        <Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setShowAddDevice(true)}
            disabled={!isSupported || devices.length >= 5}
            fullWidth={devices.length === 0}
          >
            Add {devices.length > 0 ? 'Another' : 'a'} Device
          </Button>
          
          {!isSupported && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Your current device doesn't support passkeys
            </Typography>
          )}
        </Box>

        {/* Security Tips */}
        <Card variant="outlined" sx={{ bgcolor: 'grey.50' }}>
          <CardContent>
            <Typography variant="subtitle2" gutterBottom>
              <Info sx={{ fontSize: 18, mr: 0.5, verticalAlign: 'middle' }} />
              Security Tips
            </Typography>
            <List dense>
              <ListItem disableGutters>
                <ListItemText 
                  primary="• Remove devices you no longer use or recognize"
                  primaryTypographyProps={{ variant: 'body2' }}
                />
              </ListItem>
              <ListItem disableGutters>
                <ListItemText 
                  primary="• Each device uses unique encryption keys for maximum security"
                  primaryTypographyProps={{ variant: 'body2' }}
                />
              </ListItem>
              <ListItem disableGutters>
                <ListItemText 
                  primary="• Your biometric data never leaves your device"
                  primaryTypographyProps={{ variant: 'body2' }}
                />
              </ListItem>
            </List>
          </CardContent>
        </Card>
      </Stack>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Remove Device?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to remove "{selectedDevice?.name}" from your trusted devices? 
            You'll need to register it again to use passkey authentication on this device.
          </DialogContentText>
          {selectedDevice && (
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                Device: {selectedDevice.browser} on {selectedDevice.os}
              </Typography>
              <Typography variant="caption">
                Last used: {formatDistanceToNow(new Date(selectedDevice.lastUsed), { addSuffix: true })}
              </Typography>
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error"
            variant="contained"
          >
            Remove Device
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};