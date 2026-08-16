import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { typography } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useAppStore } from '@/stores/app-store';

export default function PlannedOutfitsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const planned = useAppStore((s) => s.plannedOutfits);
  const outfits = useAppStore((s) => s.outfits);

  return (
    <LinearGradient colors={[theme.gradientStart, theme.gradientEnd]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <Button title="Back" variant="ghost" onPress={() => router.back()} />
          <Text style={[styles.title, { color: theme.ink }]}>Outfit calendar</Text>
        </View>
        {planned.length === 0 ? (
          <EmptyState
            title="You have not planned any outfits yet"
            message="Schedule an outfit from the builder or outfit detail screen."
            actionLabel="Build outfit"
            onAction={() => router.push('/outfits/builder')}
          />
        ) : (
          <FlatList
            data={planned}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: 16, gap: 10 }}
            renderItem={({ item }) => {
              const outfit = outfits.find((o) => o.id === item.outfit_id);
              return (
                <Pressable
                  onPress={() => outfit && router.push(`/outfits/${outfit.id}`)}
                  style={[
                    styles.card,
                    { backgroundColor: theme.bgElevated, borderColor: theme.border },
                  ]}
                >
                  <Text style={{ ...typography.subtitle, color: theme.ink }}>
                    {item.planned_date}
                  </Text>
                  <Text style={{ ...typography.body, color: theme.inkMuted }}>
                    {outfit?.name ?? 'Outfit'}
                    {item.occasion ? ` · ${item.occasion}` : ''}
                  </Text>
                  <Text style={{ ...typography.caption, color: theme.inkSoft, marginTop: 6 }}>
                    Reminder {item.reminder_enabled ? 'on' : 'off'} · Check forecast before leaving.
                  </Text>
                </Pressable>
              );
            }}
          />
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 12, paddingTop: 4 },
  title: { ...typography.hero, paddingHorizontal: 8 },
  card: { borderWidth: 1, borderRadius: 14, padding: 14 },
});
