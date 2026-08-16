import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { RecommendationCard } from '@/components/recommendations/RecommendationCard';
import { ReadyOutfitCard } from '@/components/recommendations/ReadyOutfitCard';
import { ClothingSwipeDeck } from '@/components/wear/ClothingSwipeDeck';
import { EmptyState } from '@/components/ui/EmptyState';
import { Chip } from '@/components/ui/Chip';
import { ScreenShell } from '@/components/layout/ScreenShell';
import { WEAR_TODAY_MODES } from '@/constants';
import { typography } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useWebLayout } from '@/hooks/useWebLayout';
import { useAppStore } from '@/stores/app-store';
import { createWeatherProvider } from '@/services/weather/provider';
import { showAlert } from '@/lib/ui/alert';
import { sameIdSet, shuffled } from '@/lib/array';
import type { WeatherSnapshot, OutfitCandidate, ClothingItem } from '@/types';

export default function HomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { wide, isWeb } = useWebLayout();
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
  const updateClothingItem = useAppStore((s) => s.updateClothingItem);

  const [weather, setWeather] = useState<WeatherSnapshot | null>(null);
  const [mode, setMode] = useState<string>(preferences?.recommendation_mode ?? 'balanced');
  const [recs, setRecs] = useState<OutfitCandidate[]>([]);
  const [wearMode, setWearMode] = useState<'outfits' | 'swipe'>('outfits');
  const [todayLook, setTodayLook] = useState<ClothingItem[]>([]);
  const dirtyCount = clothingItems.filter((c) =>
    ['dirty', 'in_laundry', 'drying'].includes(c.availability_status)
  ).length;
  const available = clothingItems.filter(
    (c) => c.availability_status === 'available' && !c.archived_at
  );
  const swipeItems = useMemo(() => shuffled(available), [available.map((c) => c.id).join('|')]);

  const readyOutfits = useMemo(
    () =>
      outfits.filter((o) => o.status !== 'rejected' && o.status !== 'archived' && (o.items?.length ?? 0) >= 2),
    [outfits]
  );

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
      sameIdSet(o.items?.map((i) => i.clothing_item_id) ?? [], itemIds)
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

  const wearSaved = (outfitId: string) => {
    markOutfitWorn(outfitId, { rating: 4 });
    showAlert('Worn', 'Logged for today. Laundry will update shirts and similar pieces.');
  };

  const wearTodayLook = () => {
    if (todayLook.length < 2) {
      showAlert('Add another piece', 'Pick at least two items from the swipe deck to wear together.');
      return;
    }
    const outfit = saveOutfit({
      name: `Today ${new Date().toLocaleDateString()}`,
      itemIds: todayLook.map((c) => c.id),
      status: 'worn',
    });
    markOutfitWorn(outfit.id, { rating: 4 });
    recordFeedback(
      'accepted',
      todayLook.map((c) => c.id)
    );
    setTodayLook([]);
    showAlert('Worn', 'That combo is saved to your outfits.');
  };

  return (
    <ScreenShell scroll>
      <View style={[styles.heroRow, wide && styles.heroWide]}>
        <View style={{ flex: 1, gap: 6 }}>
          {!isWeb ? <Text style={[styles.brand, { color: theme.ink }]}>ClosetMatch</Text> : null}
          <Text style={[styles.hello, { color: theme.ink }]}>
            Hi {profile?.display_name || 'there'} — what should you wear today?
          </Text>
          <Text style={{ ...typography.body, color: theme.inkMuted }}>
            Start with looks you already saved, or swipe through every available piece.
          </Text>
        </View>
        {weather ? (
          <View style={[styles.weather, { backgroundColor: theme.bgElevated, borderColor: theme.border }]}>
            <Text style={[styles.weatherTemp, { color: theme.ink }]}>
              {Math.round(weather.feels_like)}°{weather.unit.toUpperCase()}
            </Text>
            <Text style={{ ...typography.caption, color: theme.inkMuted }}>
              {weather.condition} · {weather.location_name}
            </Text>
          </View>
        ) : null}
      </View>

      <View style={styles.quickLinks}>
        {dirtyCount > 0 ? (
          <Pressable
            onPress={() => router.push('/laundry')}
            style={[styles.warn, { backgroundColor: theme.accentSoft }]}
          >
            <Text style={{ color: theme.accentDeep, ...typography.label }}>{dirtyCount} in laundry</Text>
          </Pressable>
        ) : null}
        {nextPlan ? (
          <Pressable
            onPress={() => router.push('/outfits/planned')}
            style={[styles.planned, { borderColor: theme.border }]}
          >
            <Text style={{ ...typography.label, color: theme.ink }}>Planned {nextPlan.planned_date}</Text>
          </Pressable>
        ) : null}
        <Pressable
          onPress={() => router.push('/clothing/capture')}
          style={[styles.planned, { borderColor: theme.border }]}
        >
          <Text style={{ ...typography.label, color: theme.ink }}>Add clothes</Text>
        </Pressable>
        <Pressable
          onPress={() => router.push('/mirror-check/consent')}
          style={[styles.planned, { borderColor: theme.border }]}
        >
          <Text style={{ ...typography.label, color: theme.ink }}>Mirror Check</Text>
        </Pressable>
      </View>

      <Text style={[styles.section, { color: theme.ink }]}>What should I wear today?</Text>
      <View style={styles.modeRow}>
        <Chip label="Ready outfits" selected={wearMode === 'outfits'} onPress={() => setWearMode('outfits')} />
        <Chip label="Swipe clothes" selected={wearMode === 'swipe'} onPress={() => setWearMode('swipe')} />
      </View>

      {wearMode === 'outfits' ? (
        <>
          <View style={styles.chipWrap}>
            {WEAR_TODAY_MODES.slice(0, 8).map((m) => (
              <Chip
                key={m.id}
                label={m.label}
                selected={mode === m.id}
                onPress={() => {
                  setMode(m.id);
                  runRecommendations(m.id);
                }}
              />
            ))}
          </View>
          <View style={styles.quick}>
            <Button title="Refresh ideas" onPress={() => runRecommendations()} style={{ flex: 1 }} />
            <Button
              title="Build an outfit"
              variant="secondary"
              onPress={() => router.push('/outfits/builder')}
              style={{ flex: 1 }}
            />
          </View>

          {readyOutfits.length > 0 ? (
            <>
              <Text style={[styles.subhead, { color: theme.ink }]}>Looks you already have</Text>
              <View style={styles.outfitGrid}>
                {readyOutfits.slice(0, 6).map((outfit) => (
                  <ReadyOutfitCard
                    key={outfit.id}
                    outfit={outfit}
                    onOpen={() => router.push(`/outfits/${outfit.id}`)}
                    onWear={() => wearSaved(outfit.id)}
                  />
                ))}
              </View>
            </>
          ) : null}

          <Text style={[styles.subhead, { color: theme.ink }]}>Fresh suggestions</Text>
          {available.length < 2 ? (
            <EmptyState
              title="Add a few clothes first"
              message="Photograph pieces you actually own. ClosetMatch will build outfits from them."
              actionLabel="Add clothing"
              onAction={() => router.push('/clothing/capture')}
            />
          ) : recs.length === 0 ? (
            <EmptyState
              title="No suggestions right now"
              message="Several items may be in laundry, or your closet needs more variety."
              actionLabel="Open laundry"
              onAction={() => router.push('/laundry')}
            />
          ) : (
            <View style={styles.recGrid}>
              {recs.map((candidate, index) => (
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
              ))}
            </View>
          )}
        </>
      ) : (
        <>
          {todayLook.length > 0 ? (
            <View style={[styles.tray, { borderColor: theme.border, backgroundColor: theme.bgElevated }]}>
              <Text style={{ ...typography.label, color: theme.ink }}>Today’s look ({todayLook.length})</Text>
              <Text style={{ ...typography.caption, color: theme.inkMuted }}>
                {todayLook.map((c) => c.name).join(' · ')}
              </Text>
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                <Button title="Wear this combo" onPress={wearTodayLook} style={{ flex: 1 }} />
                <Button title="Clear" variant="ghost" onPress={() => setTodayLook([])} />
              </View>
            </View>
          ) : (
            <Text style={{ ...typography.body, color: theme.inkMuted, marginBottom: 12 }}>
              Tinder-style through every available piece. Wear adds it to today’s look. Two pieces make an outfit.
            </Text>
          )}
          {available.length === 0 ? (
            <EmptyState
              title="Nothing to swipe yet"
              message="Add clothes you own, then swipe through them like a deck of cards."
              actionLabel="Add clothing"
              onAction={() => router.push('/clothing/capture')}
            />
          ) : (
            <ClothingSwipeDeck
              items={swipeItems}
              onSkip={() => undefined}
              onLove={(item) => updateClothingItem(item.id, { favorite: true })}
              onWearItem={(item) => {
                setTodayLook((prev) => (prev.some((p) => p.id === item.id) ? prev : [...prev, item]));
              }}
              onEmptyAction={() => router.push('/clothing/capture')}
            />
          )}
        </>
      )}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  heroRow: { gap: 12, marginBottom: 8 },
  heroWide: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brand: { ...typography.brand, fontSize: 30 },
  hello: { ...typography.title },
  weather: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    minWidth: 180,
  },
  weatherTemp: { ...typography.title },
  quickLinks: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  warn: { paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12 },
  planned: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 },
  section: { ...typography.subtitle, marginTop: 20, marginBottom: 8 },
  subhead: { ...typography.label, marginTop: 16, marginBottom: 8 },
  modeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  quick: { flexDirection: 'row', gap: 10, marginVertical: 12 },
  outfitGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  recGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  tray: { borderWidth: 1, borderRadius: 16, padding: 14, marginBottom: 12, gap: 4 },
});
