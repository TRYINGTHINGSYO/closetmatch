import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { colors, type ThemeColors } from '@/constants/theme';

const ThemeContext = createContext<ThemeColors>(colors.light);

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const scheme = useColorScheme();
  const value = useMemo(
    () => (scheme === 'dark' ? colors.dark : colors.light),
    [scheme]
  );
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
