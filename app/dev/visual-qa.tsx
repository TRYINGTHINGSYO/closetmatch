import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Redirect } from 'expo-router';
import { ScreenShell } from '@/components/layout/ScreenShell';
import { GarmentVisual } from '@/components/outfit/GarmentVisual';
import { OutfitCollage } from '@/components/outfit/OutfitCollage';
import { ReadyOutfitCard } from '@/components/recommendations/ReadyOutfitCard';
import { RecommendationCard } from '@/components/recommendations/RecommendationCard';
import { TodayPick } from '@/components/recommendations/TodayPick';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { SelectMenu } from '@/components/ui/SelectMenu';
import { typography } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useWebLayout } from '@/hooks/useWebLayout';
import { garmentKind, type GarmentKind } from '@/lib/clothing/garment-kind';
import { TODAY_MOODS, TODAY_OCCASIONS, TODAY_PRIORITIES } from '@/lib/wear/today-filters';
import { createDemoPreferences, createSeedWardrobe } from '@/services/storage/demo-data';
import { generateRecommendations } from '@/services/recommendations';
import type { ClothingItem, Outfit, OutfitCandidate, OutfitRole, ScoreBreakdown } from '@/types';

const EMPTY_BREAKDOWN: ScoreBreakdown = {
  personal_pairing: 0,
  user_ratings: 0,
  saved_similarity: 0,
  style_compatibility: 0,
  color_compatibility: 0,
  weather_suitability: 0,
  occasion_suitability: 0,
  mirror_check_history: 0,
  fit_proportion: 0,
  comfort_history: 0,
  variety_recent_wear: 0,
  penalties: 0,
};

const COLOR_SWATCHES = [
  'black',
  'white',
  'gray',
  'navy',
  'blue',
  'brown',
  'khaki',
  'red',
  'glorp',
] as const;

function cloneItem(base: ClothingItem, patch: Partial<ClothingItem> & { id: string }): ClothingItem {
  return { ...base, ...patch };
}

function outfitToCandidate(outfit: Outfit): OutfitCandidate | null {
  const items = (outfit.items ?? [])
    .filter((piece) => piece.clothing_item)
    .map((piece) => ({
      clothing_item: piece.clothing_item as ClothingItem,
      role: piece.role,
    }));
  if (items.length < 2) return null;
  return {
    items,
    template_id: outfit.id,
    total_score: 0.86,
    score_breakdown: EMPTY_BREAKDOWN,
    explanation: { summary: 'saved', reasons: ['A look already in this wardrobe.'] },
  };
}

function TodayChrome() {
  const theme = useTheme();
  const { compact } = useWebLayout();
  return (
    <View style={{ gap: compact ? 8 : 12, marginBottom: compact ? 8 : 16 }}>
      <Text style={{ ...typography.label, color: theme.inkMuted }}>Good evening</Text>
      <Text style={{ ...typography.hero, fontSize: compact ? 26 : 32, lineHeight: compact ? 32 : 38, color: theme.ink }}>
        Here’s what works today
      </Text>
      <Text style={{ ...typography.body, color: theme.inkMuted }}>98° · Clear · Austin</Text>
      {compact ? null : (
        <Text style={{ ...typography.caption, color: theme.inkSoft }}>Light layers. Breathable fabrics.</Text>
      )}
      <View style={[styles.filters, compact && styles.filtersStack]}>
        <View style={[styles.moodWrap, compact && { maxWidth: '100%' }]}>
          <SegmentedControl accessibilityLabel="Mood" options={TODAY_MOODS} value="balanced" onChange={() => undefined} />
        </View>
        <View style={[styles.selectRow, compact && styles.selectRowCompact]}>
          <SelectMenu label="Occasion" value="everyday" options={TODAY_OCCASIONS} onChange={() => undefined} />
          <SelectMenu label="Priority" value="" options={TODAY_PRIORITIES} onChange={() => undefined} />
        </View>
      </View>
    </View>
  );
}

function GalleryTile({
  item,
  role,
  caption,
}: {
  item: ClothingItem;
  role?: OutfitRole | string;
  caption: string;
}) {
  const theme = useTheme();
  return (
    <View style={styles.tile}>
      <View style={[styles.tileStage, { backgroundColor: theme.bg, borderColor: theme.border }]}>
        <GarmentVisual item={item} role={role} framed={false} />
      </View>
      <Text style={{ ...typography.caption, color: theme.inkMuted }}>{caption}</Text>
    </View>
  );
}

export default function VisualQaScreen() {
  const theme = useTheme();
  const preview = useMemo(() => {
    const seed = createSeedWardrobe('visual-qa');
    const prefs = createDemoPreferences('visual-qa');
    const recs = generateRecommendations({
      clothingItems: seed.clothingItems,
      preferences: prefs,
      pairings: seed.pairings,
      savedOutfits: seed.outfits,
      context: {
        occasion: 'Everyday',
        temperature: 98,
        feels_like: 98,
        weather_condition: 'Clear',
        mode: 'balanced',
      },
      historyCount: seed.wearHistory.length,
      limit: 5,
    });
    const byId = (id: string) => seed.clothingItems.find((item) => item.id === id)!;
    const missing: { kind: GarmentKind; item: ClothingItem; role: OutfitRole }[] = [
      {
        kind: 'shorts',
        role: 'bottom',
        item: cloneItem(byId('c-chinos-khaki'), {
          id: 'qa-shorts',
          name: 'Khaki shorts',
          subcategory: 'Shorts',
          category: 'bottom',
        }),
      },
      {
        kind: 'dress',
        role: 'one_piece',
        item: cloneItem(byId('c-tee-navy'), {
          id: 'qa-dress',
          name: 'Navy dress',
          subcategory: 'Dress',
          category: 'one_piece',
        }),
      },
      {
        kind: 'skirt',
        role: 'bottom',
        item: cloneItem(byId('c-hoodie-black'), {
          id: 'qa-skirt',
          name: 'Black skirt',
          subcategory: 'Skirt',
          category: 'bottom',
          primary_color: 'black',
        }),
      },
      {
        kind: 'bag',
        role: 'bag',
        item: cloneItem(byId('c-loafers-brown'), {
          id: 'qa-bag',
          name: 'Brown bag',
          subcategory: 'Bag',
          category: 'accessory',
        }),
      },
      {
        kind: 'generic',
        role: 'other_accessory',
        item: cloneItem(byId('c-loafers-brown'), {
          id: 'qa-generic',
          name: 'Brown belt',
          subcategory: 'Belt',
          category: 'accessory',
        }),
      },
    ];
    return { seed, recs, missing };
  }, []);

  if (!__DEV__) return <Redirect href="/" />;

  const { seed, recs, missing } = preview;
  const hero = recs[0];
  const fresh = recs.slice(1);
  const cool = outfitToCandidate(seed.outfits.find((outfit) => outfit.id === 'o-cool')!);
  const work = outfitToCandidate(seed.outfits.find((outfit) => outfit.id === 'o-work')!);
  const recMeta = {
    occasion: 'Everyday',
    feelsLike: 98,
    temperatureUnit: 'f' as const,
    weatherCondition: 'Clear',
  };

  const seedKinds: { kind: GarmentKind; item: ClothingItem; role: OutfitRole }[] = seed.clothingItems.map((item) => {
    const kind = garmentKind(item);
    let role: OutfitRole = 'top';
    if (item.category === 'bottom') role = 'bottom';
    else if (item.category === 'shoes') role = 'shoes';
    else if (item.category === 'outerwear') role = 'outerwear';
    else if (item.category === 'one_piece') role = 'one_piece';
    else if (item.category === 'accessory') {
      if (kind === 'hat') role = 'head_accessory';
      else if (kind === 'watch') role = 'watch';
      else if (kind === 'bag') role = 'bag';
      else role = 'other_accessory';
    }
    return { kind, item, role };
  });

  const kindExamples = [
    ...seedKinds.filter((entry, index, list) => list.findIndex((other) => other.kind === entry.kind) === index),
    ...missing,
  ];

  return (
    <ScreenShell scroll contentStyle={{ gap: 28, paddingBottom: 64 }}>
      <View>
        <Text style={{ ...typography.caption, color: theme.inkSoft, letterSpacing: 1.2, textTransform: 'uppercase' }}>
          Development only
        </Text>
        <Text style={{ ...typography.hero, color: theme.ink }}>Stage 3.5 visual QA</Text>
        <Text style={{ ...typography.body, color: theme.inkMuted, maxWidth: 640 }}>
          Seed wardrobe silhouettes, collages, and Today composition. Not linked from production navigation.
        </Text>
      </View>

      <View nativeID="visual-qa-desktop-today" style={{ gap: 16 }}>
        <Text style={{ ...typography.subtitle, color: theme.ink }}>Desktop Today composition</Text>
        <TodayChrome />
        {hero ? (
          <TodayPick candidate={hero} {...recMeta} onWear={() => undefined} onSave={() => undefined} onDetails={() => undefined} />
        ) : null}
        <Text style={{ ...typography.subtitle, color: theme.ink }}>Ready outfits</Text>
        <View style={styles.readyRow}>
          {seed.outfits.map((outfit) => (
            <ReadyOutfitCard key={outfit.id} outfit={outfit} width={240} onWear={() => undefined} onOpen={() => undefined} />
          ))}
        </View>
        <Text style={{ ...typography.subtitle, color: theme.ink }}>Fresh suggestions</Text>
        <View style={styles.freshRow}>
          {fresh.map((candidate, index) => (
            <RecommendationCard
              key={`${candidate.template_id}-${index}`}
              candidate={candidate}
              {...recMeta}
              onWear={() => undefined}
              onSave={() => undefined}
            />
          ))}
        </View>
      </View>

      <View nativeID="visual-qa-mobile-today" style={{ gap: 12 }}>
        <Text style={{ ...typography.subtitle, color: theme.ink }}>Mobile Today composition (~390px)</Text>
        <View style={[styles.mobileFrame, { borderColor: theme.border, backgroundColor: theme.bgElevated }]}>
        <TodayChrome />
          {hero ? (
            <TodayPick candidate={hero} {...recMeta} onWear={() => undefined} onSave={() => undefined} onDetails={() => undefined} />
          ) : null}
        </View>
      </View>

      <View style={{ gap: 12 }}>
        <Text style={{ ...typography.subtitle, color: theme.ink }}>Seed outfit collages</Text>
        <Text style={{ ...typography.caption, color: theme.inkMuted }}>
          Mixed color, dark garments, white garments, outerwear. Labels are below the visual, not on it.
        </Text>
        <View style={styles.collageGrid}>
          {seed.outfits.map((outfit) => (
            <View key={outfit.id} style={[styles.collageCard, { borderColor: theme.border, backgroundColor: theme.bgElevated }]}>
              <OutfitCollage
                size="hero"
                pieces={(outfit.items ?? [])
                  .filter((piece) => piece.clothing_item)
                  .map((piece) => ({
                    id: piece.id,
                    role: piece.role,
                    clothing_item: piece.clothing_item as ClothingItem,
                  }))}
              />
              <Text style={{ ...typography.caption, color: theme.inkMuted, padding: 12 }}>{outfit.name}</Text>
            </View>
          ))}
        </View>
        {cool ? <TodayPick candidate={cool} occasion="Everyday" feelsLike={62} temperatureUnit="f" weatherCondition="Clear" /> : null}
        {work ? (
          <RecommendationCard candidate={work} occasion="Work" feelsLike={72} temperatureUnit="f" weatherCondition="Clear" />
        ) : null}
      </View>

      <View nativeID="visual-qa-gallery" style={{ gap: 12 }}>
        <Text style={{ ...typography.subtitle, color: theme.ink }}>Garment fallback gallery</Text>
        <Text style={{ ...typography.caption, color: theme.inkMuted }}>
          Seed items where they exist. Shorts, dress, skirt, bag, and generic are seed clones with only category/name overrides.
        </Text>
        <View style={styles.gallery}>
          {kindExamples.map((entry) => (
            <GalleryTile
              key={entry.item.id}
              item={entry.item}
              role={entry.role}
              caption={`${entry.kind} · ${entry.item.primary_color}`}
            />
          ))}
        </View>
      </View>

      <View style={{ gap: 12 }}>
        <Text style={{ ...typography.subtitle, color: theme.ink }}>Color pass (tee)</Text>
        <View style={styles.gallery}>
          {COLOR_SWATCHES.map((color) => {
            const item = cloneItem(seed.clothingItems[0], {
              id: `qa-tee-${color}`,
              primary_color: color,
              name: `${color} tee`,
            });
            return <GalleryTile key={color} item={item} role="top" caption={color} />;
          })}
        </View>
      </View>

      <View style={{ gap: 12 }}>
        <Text style={{ ...typography.subtitle, color: theme.ink }}>Same kinds, unlabeled</Text>
        <View style={styles.gallery}>
          {kindExamples.map((entry) => (
            <View key={`bare-${entry.item.id}`} style={styles.tile}>
              <View style={[styles.tileStage, { backgroundColor: theme.bg, borderColor: theme.border }]}>
                <GarmentVisual item={entry.item} role={entry.role} framed={false} />
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 16,
  },
  filtersStack: { flexDirection: 'column', alignItems: 'stretch', gap: 10 },
  selectRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 16 },
  selectRowCompact: { width: '100%', justifyContent: 'space-between' },
  moodWrap: { minWidth: 280, flexGrow: 1, maxWidth: 420 },
  readyRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  freshRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  mobileFrame: {
    width: 390,
    maxWidth: '100%',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 20,
    padding: 16,
    overflow: 'hidden',
  },
  collageGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  collageCard: {
    width: 320,
    maxWidth: '100%',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 20,
    overflow: 'hidden',
  },
  gallery: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  tile: { width: 132, gap: 6 },
  tileStage: {
    height: 148,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
});
