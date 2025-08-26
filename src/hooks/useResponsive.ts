import { useTheme, useMediaQuery } from '@mui/material';
import { useMediaQuery as useResponsiveQuery } from 'react-responsive';

export const useResponsive = () => {
  const theme = useTheme();
  
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const isLargeDesktop = useMediaQuery(theme.breakpoints.up('lg'));
  
  const isPortrait = useResponsiveQuery({ orientation: 'portrait' });
  const isLandscape = useResponsiveQuery({ orientation: 'landscape' });
  const isRetina = useResponsiveQuery({ minResolution: '2dppx' });
  const isTouchDevice = useResponsiveQuery({ query: '(hover: none) and (pointer: coarse)' });
  
  return {
    isMobile,
    isTablet,
    isDesktop,
    isLargeDesktop,
    isPortrait,
    isLandscape,
    isRetina,
    isTouchDevice,
    
    // Utility functions
    getColumns: () => {
      if (isMobile) return 1;
      if (isTablet) return 2;
      return 3;
    },
    
    getSpacing: (size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' = 'md') => {
      const spacingMap = {
        xs: isMobile ? 1 : 2,
        sm: isMobile ? 2 : 3,
        md: isMobile ? 2 : isTablet ? 3 : 4,
        lg: isMobile ? 3 : isTablet ? 4 : 5,
        xl: isMobile ? 4 : isTablet ? 5 : 6,
      };
      return spacingMap[size];
    },
    
    getFontSize: (variant: 'h1' | 'h2' | 'h3' | 'body1' | 'body2' = 'body1') => {
      const fontSizeMap = {
        h1: isMobile ? '1.75rem' : isTablet ? '2.25rem' : '2.5rem',
        h2: isMobile ? '1.5rem' : isTablet ? '1.875rem' : '2rem',
        h3: isMobile ? '1.25rem' : isTablet ? '1.5rem' : '1.75rem',
        body1: isMobile ? '0.875rem' : '1rem',
        body2: isMobile ? '0.75rem' : '0.875rem',
      };
      return fontSizeMap[variant];
    },
    
    getButtonSize: () => {
      if (isMobile) return 'small';
      if (isTablet) return 'medium';
      return 'large';
    },
  };
};

export const useDeviceDetection = () => {
  // Move all hook calls to the top level to avoid conditional hook calls
  const isIOS1 = useResponsiveQuery({ query: '(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)' });
  const isIOS2 = useResponsiveQuery({ query: '(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)' });
  const isIOS3 = useResponsiveQuery({ query: '(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3)' });
  const isAndroid = useResponsiveQuery({ query: '(min-device-width: 320px) and (max-device-width: 480px)' });
  const isTablet = useResponsiveQuery({ minWidth: 768, maxWidth: 1024 });
  
  const isIOS = isIOS1 || isIOS2 || isIOS3;
  
  return {
    isIOS,
    isAndroid,
    isTablet,
    isMobileDevice: isIOS || isAndroid,
  };
};