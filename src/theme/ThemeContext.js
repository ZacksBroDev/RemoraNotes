import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [isDark, setIsDark] = useState(systemColorScheme === 'dark');

  useEffect(() => {
    setIsDark(systemColorScheme === 'dark');
  }, [systemColorScheme]);

  const theme = {
    isDark,
    colors: {
      // Primary colors
      primary: '#007AFF',
      primaryDark: '#0056CC',
      secondary: '#5AC8FA',
      
      // Background colors
      background: isDark ? '#000000' : '#FFFFFF',
      surface: isDark ? '#1C1C1E' : '#F2F2F7',
      surfaceSecondary: isDark ? '#2C2C2E' : '#FFFFFF',
      
      // Text colors
      text: isDark ? '#FFFFFF' : '#000000',
      textSecondary: isDark ? '#EBEBF5' : '#3C3C43',
      textTertiary: isDark ? '#EBEBF599' : '#3C3C4399',
      
      // Border and separator colors
      border: isDark ? '#38383A' : '#C6C6C8',
      separator: isDark ? '#38383A' : '#E5E5EA',
      
      // Status colors
      success: '#34C759',
      warning: '#FF9500',
      error: '#FF3B30',
      
      // Special ADHD-friendly colors
      calm: isDark ? '#5E5CE6' : '#AF52DE',
      focus: isDark ? '#64D2FF' : '#007AFF',
      gentle: isDark ? '#30B0C7' : '#5AC8FA',
      
      // Person type colors
      personal: '#FF2D92',
      client: '#007AFF',
      
      // Tab colors
      tabActive: isDark ? '#007AFF' : '#007AFF',
      tabInactive: isDark ? '#8E8E93' : '#8E8E93',
    },
    
    // ADHD-friendly spacing and sizing
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
      xxl: 48,
    },
    
    // Large, accessible touch targets
    touchTargets: {
      small: 44,
      medium: 56,
      large: 64,
    },
    
    // Typography with good contrast
    typography: {
      largeTitle: {
        fontSize: 34,
        fontWeight: 'bold',
        lineHeight: 41,
      },
      title1: {
        fontSize: 28,
        fontWeight: 'bold',
        lineHeight: 34,
      },
      title2: {
        fontSize: 22,
        fontWeight: 'bold',
        lineHeight: 28,
      },
      title3: {
        fontSize: 20,
        fontWeight: '600',
        lineHeight: 25,
      },
      headline: {
        fontSize: 17,
        fontWeight: '600',
        lineHeight: 22,
      },
      body: {
        fontSize: 17,
        fontWeight: '400',
        lineHeight: 22,
      },
      callout: {
        fontSize: 16,
        fontWeight: '400',
        lineHeight: 21,
      },
      subhead: {
        fontSize: 15,
        fontWeight: '400',
        lineHeight: 20,
      },
      footnote: {
        fontSize: 13,
        fontWeight: '400',
        lineHeight: 18,
      },
      caption1: {
        fontSize: 12,
        fontWeight: '400',
        lineHeight: 16,
      },
      caption2: {
        fontSize: 11,
        fontWeight: '400',
        lineHeight: 13,
      },
    },
    
    // Border radius for consistency
    borderRadius: {
      sm: 6,
      md: 10,
      lg: 16,
      xl: 20,
    },
    
    // Shadows
    shadows: {
      small: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: isDark ? 0.3 : 0.2,
        shadowRadius: 2,
        elevation: 1,
      },
      medium: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDark ? 0.3 : 0.25,
        shadowRadius: 4,
        elevation: 3,
      },
      large: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: isDark ? 0.3 : 0.3,
        shadowRadius: 8,
        elevation: 5,
      },
    },
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};
