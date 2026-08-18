import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getWeatherAtmosphere } from '@/lib/weather/atmosphere';
import { useIsDarkTheme } from '@/hooks/useTheme';
import type { WeatherSnapshot } from '@/types';

export function WeatherAtmosphere({ weather }: { weather: WeatherSnapshot | null }) {
  const isDark = useIsDarkTheme();
  if (!weather) return null;

  const atmosphere = getWeatherAtmosphere(weather, isDark);

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill} accessibilityElementsHidden>
      <LinearGradient
        colors={atmosphere.colors}
        locations={atmosphere.locations}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.wash}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wash: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 360,
  },
});
