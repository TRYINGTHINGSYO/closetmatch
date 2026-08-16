import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { applyAppearance, DEFAULT_APPEARANCE } from '@/constants/appearance';
import { colors, type ThemeColors } from '@/constants/theme';
import { useAppStore } from '@/stores/app-store';

const ThemeContext = createContext<ThemeColors>(colors.light);

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const scheme = useColorScheme();
  const appearance = useAppStore((s) => s.appearance) ?? DEFAULT_APPEARANCE;
  const value = useMemo(() => {
    const prefersDark =
      appearance.mode === 'dark' ||
      (appearance.mode === 'system' && scheme === 'dark') ||
      appearance.backgroundStyle === 'night';
    const base = prefersDark ? colors.dark : colors.light;
    return applyAppearance(base, appearance, prefersDark);
  }, [scheme, appearance]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}

export function useIsDarkTheme() {
  const scheme = useColorScheme();
  const appearance = useAppStore((s) => s.appearance) ?? DEFAULT_APPEARANCE;
  return (
    appearance.mode === 'dark' ||
    (appearance.mode === 'system' && scheme === 'dark') ||
    appearance.backgroundStyle === 'night'
  );
}
