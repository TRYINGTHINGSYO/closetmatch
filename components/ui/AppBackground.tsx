import { Image, StyleSheet, View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { useAppStore } from '@/stores/app-store';

export function AppBackground({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  const appearance = useAppStore((s) => s.appearance);
  const photo =
    appearance.backgroundStyle === 'photo' ? appearance.backgroundImageUri : null;

  return (
    <View style={[styles.fill, { backgroundColor: theme.bg }]}>
      {photo ? (
        <Image
          source={{ uri: photo }}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
          accessibilityIgnoresInvertColors
        />
      ) : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
});
