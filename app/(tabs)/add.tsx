import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { ScreenShell } from '@/components/layout/ScreenShell';
import { typography } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';

export default function AddScreen() {
  const theme = useTheme();
  const router = useRouter();

  return (
    <ScreenShell scroll>
      <Text style={[styles.title, { color: theme.ink }]}>Add</Text>
      <Text style={[styles.sub, { color: theme.inkMuted }]}>
        Grow your closet, save combinations you already wear, or run a private Mirror Check.
      </Text>
      <View style={styles.actions}>
        <Button title="Add clothing photo" onPress={() => router.push('/clothing/capture')} />
        <Button title="Build an outfit" variant="secondary" onPress={() => router.push('/outfits/builder')} />
        <Button
          title="Mirror Check"
          variant="secondary"
          onPress={() => router.push('/mirror-check/consent')}
        />
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.hero, marginTop: 8 },
  sub: { ...typography.body, marginTop: 8, marginBottom: 24 },
  actions: { gap: 12, maxWidth: 420 },
});
