import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { typography } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useAppStore } from '@/stores/app-store';

export default function AddScreen() {
  const theme = useTheme();
  const router = useRouter();
  const loadDemoWardrobe = useAppStore((s) => s.loadDemoWardrobe);
  const clothingItems = useAppStore((s) => s.clothingItems);

  return (
    <LinearGradient colors={[theme.gradientStart, theme.gradientEnd]} style={{ flex: 1 }}>
      <SafeAreaView style={styles.safe}>
        <Text style={[styles.title, { color: theme.ink }]}>Add</Text>
        <Text style={[styles.sub, { color: theme.inkMuted }]}>
          Grow your closet, save combinations you already wear, or run a private Mirror Check.
        </Text>
        <View style={styles.actions}>
          <Button title="Add clothing photo" onPress={() => router.push('/clothing/capture')} />
          <Button
            title="Build an outfit"
            variant="secondary"
            onPress={() => router.push('/outfits/builder')}
          />
          <Button
            title="Mirror Check"
            variant="secondary"
            onPress={() => router.push('/mirror-check/consent')}
          />
          <Button
            title="Import sample wardrobe"
            variant="ghost"
            onPress={() => {
              if (clothingItems.length === 0) loadDemoWardrobe();
              router.push('/(tabs)/closet');
            }}
          />
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, padding: 24 },
  title: { ...typography.hero, marginTop: 8 },
  sub: { ...typography.body, marginTop: 8, marginBottom: 24 },
  actions: { gap: 12 },
});
