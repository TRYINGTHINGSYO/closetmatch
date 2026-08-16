import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { Chip } from '@/components/ui/Chip';
import { EmptyState } from '@/components/ui/EmptyState';
import { STARTER_OUTFIT_CATEGORIES } from '@/constants';
import { typography } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useAppStore } from '@/stores/app-store';
import { showAlert } from '@/lib/ui/alert';

export default function OutfitBuilderScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { seedItemId, seedItemIds } = useLocalSearchParams<{ seedItemId?: string; seedItemIds?: string }>();
  const clothingItems = useAppStore((s) => s.clothingItems);
  const saveOutfit = useAppStore((s) => s.saveOutfit);
  const markOutfitWorn = useAppStore((s) => s.markOutfitWorn);
  const planOutfit = useAppStore((s) => s.planOutfit);

  const available = useMemo(
    () => clothingItems.filter((c) => c.availability_status === 'available' && !c.archived_at),
    [clothingItems]
  );

  const [selected, setSelected] = useState<string[]>(() => {
    if (seedItemIds) return seedItemIds.split(',').filter(Boolean);
    return seedItemId ? [seedItemId] : [];
  });
  const [name, setName] = useState('');
  const [occasion, setOccasion] = useState<string>('Everyday');

  const toggle = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const persist = (asWorn = false) => {
    if (selected.length < 2) {
      showAlert(
        'Add more items',
        'Select clothes you normally wear together so ClosetMatch can learn your style.'
      );
      return;
    }
    const outfit = saveOutfit({
      name: name.trim() || `${occasion} outfit`,
      itemIds: selected,
      occasion,
      status: asWorn ? 'worn' : 'saved',
    });
    if (asWorn) markOutfitWorn(outfit.id, { occasion, rating: 4 });
    router.replace(`/outfits/${outfit.id}`);
  };

  return (
    <LinearGradient colors={[theme.gradientStart, theme.gradientEnd]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content}>
          <Button title="Back" variant="ghost" onPress={() => router.back()} />
          <Text style={[styles.title, { color: theme.ink }]}>Outfit builder</Text>
          <Text style={[styles.sub, { color: theme.inkMuted }]}>
            Select clothes you normally wear together. ClosetMatch will use these examples to learn your style.
          </Text>

          <TextField
            label="Outfit name"
            value={name}
            onChangeText={setName}
            placeholder="Everyday hoodie fit"
          />

          <Text style={[styles.label, { color: theme.inkMuted }]}>Starter category</Text>
          <View style={styles.chips}>
            {STARTER_OUTFIT_CATEGORIES.map((c) => (
              <Chip
                key={c}
                label={c}
                selected={occasion === c}
                onPress={() => setOccasion(c)}
              />
            ))}
          </View>

          <Text style={[styles.label, { color: theme.ink, marginTop: 12 }]}>
            Selected ({selected.length})
          </Text>
          {available.length === 0 ? (
            <EmptyState
              title="No available clothes"
              message="Everything may be in laundry. Mark items clean, or add more to your closet."
              actionLabel="Open laundry"
              onAction={() => router.push('/laundry')}
            />
          ) : (
            available.map((item) => {
              const on = selected.includes(item.id);
              return (
                <Pressable
                  key={item.id}
                  onPress={() => toggle(item.id)}
                  style={[
                    styles.item,
                    {
                      borderColor: on ? theme.accent : theme.border,
                      backgroundColor: on ? theme.accentSoft : theme.bgElevated,
                    },
                  ]}
                  accessibilityState={{ selected: on }}
                >
                  <Text style={{ ...typography.label, color: theme.ink }}>{item.name}</Text>
                  <Text style={{ ...typography.caption, color: theme.inkMuted }}>
                    {item.subcategory} · {item.primary_color}
                  </Text>
                </Pressable>
              );
            })
          )}

          <View style={{ gap: 10, marginTop: 20 }}>
            <Button title="Save outfit" onPress={() => persist(false)} />
            <Button title="Save & mark worn" variant="secondary" onPress={() => persist(true)} />
            <Button
              title="Schedule for tomorrow"
              variant="ghost"
              onPress={() => {
                if (selected.length < 2) {
                  showAlert(
                    'Add more items',
                    'Select at least two pieces before scheduling an outfit.'
                  );
                  return;
                }
                const outfit = saveOutfit({
                  name: name.trim() || `${occasion} planned`,
                  itemIds: selected,
                  occasion,
                });
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                planOutfit(outfit.id, tomorrow.toISOString().slice(0, 10), occasion);
                router.replace('/outfits/planned');
              }}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, gap: 8, paddingBottom: 48 },
  title: { ...typography.hero },
  sub: { ...typography.body, marginBottom: 8 },
  label: { ...typography.label, marginBottom: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  item: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
  },
});
