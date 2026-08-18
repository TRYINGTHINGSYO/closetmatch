import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { RecommendationCard } from '@/components/recommendations/RecommendationCard';
import { ReadyOutfitRow } from '@/components/recommendations/ReadyOutfitCard';
import { TodayPick } from '@/components/recommendations/TodayPick';
import { ClothingSwipeDeck } from '@/components/wear/ClothingSwipeDeck';
import { EmptyState } from '@/components/ui/EmptyState';
import { ScreenShell } from '@/components/layout/ScreenShell';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { SelectMenu } from '@/components/ui/SelectMenu';
import { typography } from '@/constants/theme';
import { useIsDarkTheme, useTheme } from '@/hooks/useTheme';
import { useWebLayout } from '@/hooks/useWebLayout';
import { useAppStore } from '@/stores/app-store';
import { createWeatherProvider } from '@/services/weather/provider';
import { showAlert } from '@/lib/ui/alert';
import { sameIdSet, shuffled } from '@/lib/array';
import { timeOfDayGreeting } from '@/lib/datetime/greeting';
import { getWeatherAtmosphere } from '@/lib/weather/atmosphere';
import { formatWeatherLine } from '@/lib/weather/format';
import { outfitDisplayName } from '@/lib/outfits/display-name';
import {
  hydrateTodayFilters,
  resolveTodayEngineContext,
  TODAY_MOODS,
  TODAY_OCCASIONS,
  TODAY_PRIORITIES,
} from '@/lib/wear/today-filters';
import type { WeatherSnapshot, OutfitCandidate, ClothingItem } from '@/types';

export default function HomeScreen() {
  const theme = useTheme();
  const isDark = useIsDarkTheme();
  const router = useRouter();
  const { isWeb, compact } = useWebLayout();
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
  const initialFilters = hydrateTodayFilters(preferences?.recommendation_mode);
  const [moodId, setMoodId] = useState(initialFilters.moodId);
  const [priorityId, setPriorityId] = useState(initialFilters.priorityId);
  const [occasionId, setOccasionId] = useState(initialFilters.occasionId);
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

  const greeting = timeOfDayGreeting(new Date(), profile?.timezone);
  const weatherLine = weather ? formatWeatherLine(weather) : null;
  const clothingHint = weather ? getWeatherAtmosphere(weather, isDark).clothingHint : null;
  const engine = resolveTodayEngineContext({ moodId, priorityId, occasionId });
  const heroRec = recs[0];
  const freshRecs = recs.slice(1);

  const recMeta = {
    occasion: engine.occasion,
    feelsLike: weather?.feels_like,
    temperatureUnit: weather?.unit ?? profile?.preferred_temperature_unit,
    weatherCondition: weather?.condition,
  };

  const runRecommendations = (
    nextMood = moodId,
    nextPriority = priorityId,
    nextOccasion = occasionId
  ) => {
    const { mode, occasion } = resolveTodayEngineContext({
      moodId: nextMood,
      priorityId: nextPriority,
      occasionId: nextOccasion,
    });
    const next = generateTodayRecommendations({
      mode,
      occasion,
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
  }, [clothingItems.length, weather?.temperature, moodId, priorityId, occasionId]);

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

  const saveCandidate = (candidate: OutfitCandidate) => {
    const items = candidate.items.map((slot) => slot.clothing_item);
    saveOutfit({
      name: outfitDisplayName({
        items,
        occasion: engine.occasion,
        feelsLike: weather?.feels_like,
        temperatureUnit: weather?.unit,
        weatherCondition: weather?.condition,
      }),
      itemIds: items.map((item) => item.id),
      roles: candidate.items.map((slot) => slot.role),
    });
    recordFeedback(
      'accepted',
      items.map((item) => item.id)
    );
    showAlert('Saved', 'This look is in your outfits.');
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
    <ScreenShell scroll weather={weather}>
      <View style={[styles.hero, compact && styles.heroCompact]}>
        {!isWeb ? (
          <Text style={[styles.brand, { color: theme.ink }]}>ClosetMatch</Text>
        ) : null}
        <Text style={[styles.greeting, { color: theme.inkMuted }]}>{greeting}</Text>
        <Text style={[styles.headline, compact && styles.headlineCompact, { color: theme.ink }]} accessibilityRole="header">
          Here’s what works today
        </Text>
        {weatherLine ? (
          <Text style={[styles.weatherLine, { color: theme.inkMuted }]}>{weatherLine}</Text>
        ) : null}
        {clothingHint && !compact ? (
          <Text style={[styles.hint, { color: theme.inkSoft }]}>{clothingHint}</Text>
        ) : null}
      </View>

      {wearMode === 'outfits' ? (
        <View style={[styles.filters, compact && styles.filtersStack]}>
          <View style={[styles.moodWrap, compact && styles.moodWrapFull]}>
            <SegmentedControl
              accessibilityLabel="Mood"
              options={TODAY_MOODS}
              value={moodId}
              onChange={(id) => {
                setMoodId(id);
                runRecommendations(id, priorityId, occasionId);
              }}
            />
          </View>
          <View style={[styles.selectRow, compact && styles.selectRowCompact]}>
          <SelectMenu
            label="Occasion"
            value={occasionId}
            options={TODAY_OCCASIONS}
            onChange={(id) => {
              setOccasionId(id);
              runRecommendations(moodId, priorityId, id);
            }}
          />
          <SelectMenu
            label="Priority"
            value={priorityId}
            options={TODAY_PRIORITIES}
            onChange={(id) => {
              setPriorityId(id);
              runRecommendations(moodId, id, occasionId);
            }}
          />
          </View>
        </View>
      ) : null}

      {dirtyCount > 0 || nextPlan || !isWeb ? (
        <View style={styles.quietRow}>
          {dirtyCount > 0 ? (
            <Pressable onPress={() => router.push('/laundry')} accessibilityRole="link">
              <Text style={[styles.quietLink, { color: theme.inkMuted }]}>{dirtyCount} in laundry</Text>
            </Pressable>
          ) : null}
          {nextPlan ? (
            <Pressable onPress={() => router.push('/outfits/planned')} accessibilityRole="link">
              <Text style={[styles.quietLink, { color: theme.inkMuted }]}>Planned {nextPlan.planned_date}</Text>
            </Pressable>
          ) : null}
          {!isWeb ? (
            <Pressable onPress={() => router.push('/mirror-check/consent')} accessibilityRole="link">
              <Text style={[styles.quietLink, { color: theme.inkMuted }]}>Mirror Check</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}

      {wearMode === 'outfits' ? (
        <>
          {heroRec ? (
            <TodayPick
              candidate={heroRec}
              {...recMeta}
              onWear={() => wearCandidate(heroRec)}
              onSave={() => saveCandidate(heroRec)}
              onDetails={() =>
                router.push({
                  pathname: '/outfits/builder',
                  params: {
                    seedItemIds: heroRec.items.map((slot) => slot.clothing_item.id).join(','),
                  },
                })
              }
            />
          ) : available.length < 2 ? (
            <EmptyState
              title="Add a few clothes first"
              message="Photograph pieces you actually own. ClosetMatch will build outfits from them."
              actionLabel="Add clothing"
              onAction={() => router.push('/clothing/capture')}
            />
          ) : (
            <EmptyState
              title="No suggestions right now"
              message="Several items may be in laundry, or your closet needs more variety."
              actionLabel="Open laundry"
              onAction={() => router.push('/laundry')}
            />
          )}

          <View style={styles.quietRow}>
            <Pressable onPress={() => runRecommendations()} accessibilityRole="button">
              <Text style={[styles.quietLink, { color: theme.inkMuted }]}>Refresh ideas</Text>
            </Pressable>
            <Pressable onPress={() => router.push('/outfits/builder')} accessibilityRole="link">
              <Text style={[styles.quietLink, { color: theme.inkMuted }]}>Build an outfit</Text>
            </Pressable>
            <Pressable onPress={() => setWearMode('swipe')} accessibilityRole="button">
              <Text style={[styles.quietLink, { color: theme.inkMuted }]}>Build from pieces</Text>
            </Pressable>
          </View>

          {readyOutfits.length > 0 ? (
            <View style={styles.sectionBlock}>
              <View style={styles.sectionHead}>
                <Text style={[styles.subhead, { color: theme.ink }]}>Ready outfits</Text>
              </View>
              <ReadyOutfitRow
                outfits={readyOutfits}
                onOpen={(id) => router.push(`/outfits/${id}`)}
                onWear={wearSaved}
              />
            </View>
          ) : null}

          {freshRecs.length > 0 ? (
            <View style={styles.sectionBlock}>
              <View style={styles.sectionHead}>
                <Text style={[styles.subhead, { color: theme.ink }]}>Fresh suggestions</Text>
                <Pressable onPress={() => runRecommendations()} accessibilityRole="button">
                  <Text style={[styles.quietLink, { color: theme.inkMuted, paddingVertical: 8 }]}>Refresh</Text>
                </Pressable>
              </View>
              <View style={styles.recGrid}>
                {freshRecs.map((candidate, index) => (
                  <RecommendationCard
                    key={`${candidate.template_id}-${index}`}
                    candidate={candidate}
                    {...recMeta}
                    onWear={() => wearCandidate(candidate)}
                    onSave={() => saveCandidate(candidate)}
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
            </View>
          ) : null}
        </>
      ) : (
        <>
          <Pressable onPress={() => setWearMode('outfits')} accessibilityRole="button" style={{ marginBottom: 12 }}>
            <Text style={[styles.quietLink, { color: theme.accent }]}>Back to today’s looks</Text>
          </Pressable>
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
              Wear a piece to add it to today’s look. Two pieces make an outfit.
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
  hero: { gap: 6, marginBottom: 28, maxWidth: 720 },
  heroCompact: { marginBottom: 12, gap: 4 },
  brand: { ...typography.brand, fontSize: 28, marginBottom: 8 },
  greeting: { ...typography.label },
  headline: { ...typography.hero, fontSize: 32, lineHeight: 38 },
  headlineCompact: { fontSize: 26, lineHeight: 32 },
  weatherLine: { ...typography.body, marginTop: 4 },
  hint: { ...typography.caption },
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 16,
    marginBottom: 8,
  },
  filtersStack: { flexDirection: 'column', alignItems: 'stretch', gap: 10 },
  selectRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 16 },
  selectRowCompact: { width: '100%', justifyContent: 'space-between' },
  moodWrap: { minWidth: 280, flexGrow: 1, maxWidth: 420 },
  moodWrapFull: { minWidth: 0, maxWidth: '100%' },
  quietRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  quietLink: { ...typography.label, minHeight: 44, paddingVertical: 12 },
  sectionBlock: { marginTop: 28, gap: 12 },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  subhead: { ...typography.subtitle, fontFamily: 'DMSans_700Bold' },
  recGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  tray: { borderWidth: 1, borderRadius: 16, padding: 14, marginBottom: 12, gap: 4 },
});
