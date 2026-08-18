import { ScrollView, StyleSheet, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WeatherAtmosphere } from '@/components/weather/WeatherAtmosphere';
import { useTheme } from '@/hooks/useTheme';
import { useWebLayout } from '@/hooks/useWebLayout';
import type { WeatherSnapshot } from '@/types';
import { PageContainer } from './PageContainer';

export function ScreenShell({
  children,
  scroll = false,
  contentStyle,
  maxWidth,
  weather = null,
}: {
  children: React.ReactNode;
  scroll?: boolean;
  contentStyle?: ViewStyle;
  maxWidth?: number;
  weather?: WeatherSnapshot | null;
}) {
  const theme = useTheme();
  const { isWeb } = useWebLayout();
  const body = (
    <PageContainer fill={!scroll} maxWidth={maxWidth} style={contentStyle}>
      {children}
    </PageContainer>
  );

  return (
    <LinearGradient colors={[theme.gradientStart, theme.gradientEnd]} style={styles.fill}>
      <WeatherAtmosphere weather={weather} />
      <SafeAreaView style={styles.fill} edges={isWeb ? [] : ['top']}>
        {scroll ? (
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
          >
            {body}
          </ScrollView>
        ) : (
          body
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  scroll: { paddingTop: 16, paddingBottom: 48, flexGrow: 1 },
});
