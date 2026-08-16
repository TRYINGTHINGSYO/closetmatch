import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { RecommendationCard } from '@/components/recommendations/RecommendationCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { ChipGroup } from '@/components/ui/Chip';
import { APP_NAME, WEAR_TODAY_MODES } from '@/constants';
import { typography } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useAppStore } from '@/stores/app-store';
import { createWeatherProvider } from '@/services/weather/provider';
import { showAlert } from '@/lib/ui/alert';
import type { WeatherSnapshot, OutfitCandidate } from '@/types';

function sameItemSet(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const set = new Set(a);
  return b.every((id) => set.has(id));
}

export default function HomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const profile = useAppStore((s) => s.profile);
  const preferences = useAppStore((s) => s.preferences);
  const clothingItems = useAppStore((s) => s.clothingItems);
  const outfits = useAppStore((s) => s.outfits);
  const plannedOutfits = useAppStore((s) => s.plannedOutfits);
  const generateTodayRecommendations = useAppStore((s) => s.generateTodayRecommendations);
  const saveOutfit = useAppStore((s) => s.saveOutfit);
  const markOutfitWorn = useAppStore((s) => s.markOutfitWorn);
  const recordFeedback = useAppStore((s) => s.recordFeedback);
  const replaceRecommendationItem = useAppStore((s) => s.replaceRecommendationItem);

  const [weather, setWeather] = useState<WeatherSnapshot | null>(null);
  const [mode, setMode] = useState<string>(preferences?.recommendation_mode ?? 'balanced');
  const [recs, setRecs] = useState<OutfitCandidate[]>([]);
  const dirtyCount = clothingItems.filter((c) =>
    ['dirty', 'in_laundry', 'drying'].includes(c.availability_status)
  ).length;
  const availableCount = clothingItems.filter((c) => c.availability_status === 'available').length;

  const nextPlan = useMemo(() => {
    return [...plannedOutfits].sort((a, b) => a.planned_date.localeCompare(b.planned_date))[0];
  }, [plannedOutfits]);

  useEffect(() => {
    if (!preferences?.weather_enabled) return;
    createWeatherProvider()
      .getWeather({
        latitude: profile?.latitude ?? undefined,
        longitude: profile?.longitude ?? undefined,
        locationName: profile?.location_name ?? undefined,
        unit: profile?.preferred_temperature_unit ?? 'f',
      })
      .then(setWeather)
      .catch(() => setWeather(null));
  }, [preferences?.weather_enabled, profile]);

  const runRecommendations = (selectedMode = mode) => {
    const next = generateTodayRecommendations({
      mode: selectedMode,
      occasion:
        selectedMode === 'work'
          ? 'Work'
          : selectedMode === 'date'
            ? 'Date'
            : selectedMode === 'school'
              ? 'School'
              : selectedMode === 'formal'
                ? 'Formal event'
                : 'Everyday',
      temperature: weather?.temperature,
      feels_like: weather?.feels_like,
      rain_probability: weather?.rain_probability,
      weather_condition: weather?.condition,
      style: preferences?.preferred_styles?.[0],
    });
    setRecs(next);
  };

  useEffect(() => {
    if (clothingItems.length >= 2) runRecommendations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clothingItems.length, weather?.temperature, mode]);

  const wearCandidate = (candidate: OutfitCandidate) => {
    const itemIds = candidate.items.map((i) => i.clothing_item.id);
    const existing = outfits.find((o) =>
      sameItemSet(o.items?.map((i) => i.clothing_item_id) ?? [], itemIds)
    );
    const outfit =
      existing ??
      saveOutfit({
        name: `Worn ${new Date().toLocaleDateString()}`,
        itemIds,
        roles: candidate.items.map((i) => i.role),
        status: 'worn',
      });
    markOutfitWorn(outfit.id, { rating: 4 });
    recordFeedback('accepted', itemIds);
    runRecommendations();
  };

  return (
    <LinearGradient colors={[theme.gradientStart, theme.gradientEnd]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={[styles.brand, { color: theme.ink }]}>{APP_NAME}</Text>
          <Text style={[styles.hello, { color: theme.inkMuted }]}>
            Hi {profile?.display_name || 'there'} — what should you wear today?
          </Text>

          {weather ? (
            <View style={[styles.weather, { backgroundColor: theme.bgElevated, borderColor: theme.border }]}>
              <Text style={[styles.weatherTemp, { color: theme.ink }]}>
                {Math.round(weather.feels_like)}°{weather.unit.toUpperCase()} feels like
              </Text>
              <Text style={{ ...typography.body, color: theme.inkMuted }}>
                {weather.condition} · {weather.location_name} · H {Math.round(weather.high)}° / L{' '}
                {Math.round(weather.low)}°
              </Text>
              {(preferences?.temperature_sensitivity ?? 0) < 0 ? (
                <Text style={{ ...typography.caption, color: theme.inkSoft, marginTop: 4 }}>
                  Accounting for your cold sensitivity.
                </Text>
              ) : null}
            </View>
          ) : null}

          {dirtyCount > 0 ? (
            <Pressable
              onPress={() => router.push('/laundry')}
              style={[styles.warn, { backgroundColor: theme.accentSoft }]}
            >
              <Text style={{ color: theme.accentDeep, ...typography.label }}>
                {dirtyCount} item{dirtyCount === 1 ? '' : 's'} in laundry · Tap to manage
              </Text>
            </Pressable>
          ) : null}

          {nextPlan ? (
            <Pressable
              onPress={() => router.push('/outfits/planned')}
              style={[styles.planned, { borderColor: theme.border }]}
            >
              <Text style={{ ...typography.label, color: theme.ink }}>Planned outfit</Text>
              <Text style={{ ...typography.caption, color: theme.inkMuted }}>
                {nextPlan.planned_date}
                {nextPlan.occasion ? ` · ${nextPlan.occasion}` : ''}
              </Text>
            </Pressable>
          ) : null}

          <Text style={[styles.section, { color: theme.ink }]}>What Should I Wear Today?</Text>
          <ChipGroup
            options={WEAR_TODAY_MODES.slice(0, 8).map((m) => m.label)}
            selected={[WEAR_TODAY_MODES.find((m) => m.id === mode)?.label ?? 'Balanced variety']}
            onToggle={(label) => {
              const found = WEAR_TODAY_MODES.find((m) => m.label === label);
              if (found) {
                setMode(found.id);
                runRecommendations(found.id);
              }
            }}
            multi={false}
          />

          <View style={styles.quick}>
            <Button title="Refresh ideas" onPress={() => runRecommendations()} style={{ flex: 1 }} />
            <Button
              title="Mirror Check"
              variant="secondary"
              onPress={() => router.push('/mirror-check/consent')}
              style={{ flex: 1 }}
            />
          </View>

          {availableCount < 2 ? (
            <EmptyState
              title="Add a few clothes first"
              message="Photograph your first items to start building your digital closet."
              actionLabel="Add clothing"
              onAction={() => router.push('/clothing/capture')}
            />
          ) : recs.length === 0 ? (
            <EmptyState
              title="No suggestions right now"
              message="Several items may be marked dirty, or your closet needs more variety."
              actionLabel="Open laundry"
              onAction={() => router.push('/laundry')}
            />
          ) : (
            recs.map((candidate, index) => (
              <RecommendationCard
                key={`${candidate.template_id}-${index}`}
                candidate={candidate}
                index={index}
                onWear={() => wearCandidate(candidate)}
                onSave={() => {
                  saveOutfit({
                    name: `Saved look ${index + 1}`,
                    itemIds: candidate.items.map((i) => i.clothing_item.id),
                    roles: candidate.items.map((i) => i.role),
                  });
                  recordFeedback(
                    'accepted',
                    candidate.items.map((i) => i.clothing_item.id)
                  );
                  showAlert('Saved', 'This look is in your outfits.');
                }}
                onReject={() => {
                  recordFeedback(
                    'rejected',
                    candidate.items.map((i) => i.clothing_item.id)
                  );
                  runRecommendations();
                }}
                onReplace={() => {
                  const roles = ['shoes', 'accessory', 'outerwear', 'top'] as const;
                  for (const role of roles) {
                    const slot = candidate.items.find((i) => i.role === role);
                    if (!slot) continue;
                    const alt = clothingItems.find(
                      (c) =>
                        c.availability_status === 'available' &&
                        c.id !== slot.clothing_item.id &&
                        (role === 'accessory'
                          ? c.category === 'accessory'
                          : c.category === role || (role === 'top' && c.category === 'top'))
                    );
                    if (alt) {
                      const kept = candidate.items
                        .filter((i) => i.clothing_item.id !== slot.clothing_item.id)
                        .map((i) => i.clothing_item.id);
                      replaceRecommendationItem(kept, slot.clothing_item.id, alt.id);
                      runRecommendations();
                      return;
                    }
                  }
                  showAlert('No swap available', 'Add another similar item to replace a piece in this look.');
                }}
                onMirrorCheck={() => router.push('/mirror-check/consent')}
              />
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 40, gap: 12 },
  brand: { ...typography.brand, fontSize: 28 },
  hello: { ...typography.body },
  weather: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    gap: 4,
  },
  weatherTemp: { ...typography.title },
  warn: { padding: 12, borderRadius: 12 },
  planned: { borderWidth: 1, borderRadius: 12, padding: 12 },
  section: { ...typography.subtitle, marginTop: 8 },
  quick: { flexDirection: 'row', gap: 10, marginVertical: 8 },
});
