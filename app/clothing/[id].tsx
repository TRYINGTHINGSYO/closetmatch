import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { AVAILABILITY_LABELS } from '@/constants';
import { typography } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useAppStore } from '@/stores/app-store';
import { confirmAlert } from '@/lib/ui/alert';

export default function ClothingDetailScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const item = useAppStore((s) => s.clothingItems.find((c) => c.id === id));
  const outfits = useAppStore((s) =>
    s.outfits.filter((o) => o.items?.some((oi) => oi.clothing_item_id === id))
  );
  const setAvailability = useAppStore((s) => s.setAvailability);
  const updateClothingItem = useAppStore((s) => s.updateClothingItem);
  const deleteClothingItem = useAppStore((s) => s.deleteClothingItem);

  if (!item) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg, padding: 24 }}>
        <Text style={{ color: theme.ink }}>Item not found.</Text>
        <Button title="Back" onPress={() => router.back()} style={{ marginTop: 16 }} />
      </SafeAreaView>
    );
  }

  const cpw =
    item.price_paid && item.wear_count > 0
      ? `$${(item.price_paid / item.wear_count).toFixed(2)}`
      : '—';

  return (
    <LinearGradient colors={[theme.gradientStart, theme.gradientEnd]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content}>
          <Button title="Back" variant="ghost" onPress={() => router.back()} />
          {item.primary_image_url ? (
            <Image
              source={{ uri: item.primary_image_url }}
              style={styles.heroImage}
              accessibilityLabel={`${item.name} photo`}
            />
          ) : (
            <View style={[styles.hero, { backgroundColor: theme.accentSoft }]}>
              <Text style={[styles.heroLetter, { color: theme.accentDeep }]}>
                {item.primary_color.slice(0, 1).toUpperCase()}
              </Text>
            </View>
          )}
          <Text style={[styles.title, { color: theme.ink }]}>{item.name}</Text>
          <Text style={{ ...typography.body, color: theme.inkMuted }}>
            {item.primary_color} · {item.subcategory} · {AVAILABILITY_LABELS[item.availability_status]}
          </Text>

          <View style={[styles.stats, { borderColor: theme.border }]}>
            <Stat label="Worn" value={`${item.wear_count}`} theme={theme} />
            <Stat label="Washes" value={`${item.wash_count}`} theme={theme} />
            <Stat label="Cost/wear" value={cpw} theme={theme} />
          </View>

          <Text style={[styles.section, { color: theme.ink }]}>In outfits</Text>
          {outfits.length === 0 ? (
            <Text style={{ color: theme.inkSoft, ...typography.caption }}>
              Not in any saved outfits yet.
            </Text>
          ) : (
            outfits.map((o) => (
              <Text key={o.id} style={{ color: theme.inkMuted, ...typography.body }}>
                · {o.name}
              </Text>
            ))
          )}

          <View style={styles.actions}>
            <Button
              title="Edit details"
              variant="secondary"
              onPress={() => router.push({ pathname: '/clothing/edit', params: { id: item.id } })}
            />
            <Button
              title={item.favorite ? 'Unfavorite' : 'Favorite'}
              variant="secondary"
              onPress={() => updateClothingItem(item.id, { favorite: !item.favorite })}
            />
            <Button
              title="Mark dirty"
              variant="secondary"
              onPress={() => setAvailability(item.id, 'dirty')}
            />
            <Button
              title="Mark clean"
              variant="secondary"
              onPress={() => setAvailability(item.id, 'available')}
            />
            <Button
              title="Add to outfit"
              onPress={() =>
                router.push({ pathname: '/outfits/builder', params: { seedItemId: item.id } })
              }
            />
            <Button
              title="Archive"
              variant="ghost"
              onPress={() => {
                updateClothingItem(item.id, {
                  archived_at: new Date().toISOString(),
                  availability_status: 'archived',
                });
                router.back();
              }}
            />
            <Button
              title="Delete"
              variant="danger"
              onPress={async () => {
                const ok = await confirmAlert(
                  'Delete item?',
                  'This removes the item from your closet and saved outfits.',
                  'Delete'
                );
                if (!ok) return;
                deleteClothingItem(item.id);
                router.back();
              }}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

function Stat({
  label,
  value,
  theme,
}: {
  label: string;
  value: string;
  theme: ReturnType<typeof useTheme>;
}) {
  return (
    <View style={{ flex: 1, alignItems: 'center' }}>
      <Text style={{ ...typography.title, color: theme.ink }}>{value}</Text>
      <Text style={{ ...typography.caption, color: theme.inkSoft }}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, gap: 10, paddingBottom: 48 },
  hero: {
    height: 220,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroImage: {
    width: '100%',
    height: 280,
    borderRadius: 20,
    backgroundColor: '#D7E0DC',
  },
  heroLetter: { fontFamily: 'Fraunces_600SemiBold', fontSize: 72 },
  title: { ...typography.hero },
  stats: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 14,
    marginTop: 8,
  },
  section: { ...typography.subtitle, marginTop: 12 },
  actions: { gap: 10, marginTop: 16 },
});
