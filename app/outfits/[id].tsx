import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { typography } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useAppStore } from '@/stores/app-store';

export default function OutfitDetailScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const outfit = useAppStore((s) => s.outfits.find((o) => o.id === id));
  const markOutfitWorn = useAppStore((s) => s.markOutfitWorn);
  const planOutfit = useAppStore((s) => s.planOutfit);

  if (!outfit) {
    return (
      <SafeAreaView style={{ flex: 1, padding: 24, backgroundColor: theme.bg }}>
        <Text style={{ color: theme.ink }}>Outfit not found.</Text>
        <Button title="Back" onPress={() => router.back()} style={{ marginTop: 16 }} />
      </SafeAreaView>
    );
  }

  return (
    <LinearGradient colors={[theme.gradientStart, theme.gradientEnd]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content}>
          <Button title="Back" variant="ghost" onPress={() => router.back()} />
          <Text style={[styles.title, { color: theme.ink }]}>{outfit.name}</Text>
          <Text style={{ ...typography.body, color: theme.inkMuted }}>
            {outfit.occasion ?? 'Everyday'} · Worn {outfit.times_worn}×
            {outfit.rating ? ` · Rated ${outfit.rating}` : ''}
          </Text>

          <Text style={[styles.section, { color: theme.ink }]}>Items</Text>
          {outfit.items?.map((oi) => (
            <View
              key={oi.id}
              style={[styles.item, { borderColor: theme.border, backgroundColor: theme.bgElevated }]}
            >
              <Text style={{ ...typography.caption, color: theme.inkSoft }}>{oi.role}</Text>
              <Text style={{ ...typography.label, color: theme.ink }}>
                {oi.clothing_item?.name ?? 'Item'}
              </Text>
            </View>
          ))}

          <View style={{ gap: 10, marginTop: 16 }}>
            <Button title="Mark worn" onPress={() => markOutfitWorn(outfit.id, { rating: 4 })} />
            <Button
              title="Mirror Check"
              variant="secondary"
              onPress={() => router.push('/mirror-check/consent')}
            />
            <Button
              title="Plan for tomorrow"
              variant="secondary"
              onPress={() => {
                const d = new Date();
                d.setDate(d.getDate() + 1);
                planOutfit(outfit.id, d.toISOString().slice(0, 10), outfit.occasion ?? undefined);
              }}
            />
            <Button
              title="Duplicate in builder"
              variant="ghost"
              onPress={() => router.push('/outfits/builder')}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, gap: 10, paddingBottom: 40 },
  title: { ...typography.hero },
  section: { ...typography.subtitle, marginTop: 12 },
  item: { borderWidth: 1, borderRadius: 12, padding: 12 },
});
