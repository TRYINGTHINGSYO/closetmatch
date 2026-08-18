import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/ui/Button';
import { OutfitCollage, type OutfitCollagePiece } from '@/components/outfit/OutfitCollage';
import { radii, typography } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useWebLayout } from '@/hooks/useWebLayout';
import { useAppStore } from '@/stores/app-store';
import { itemSummaryLine, outfitDisplayName } from '@/lib/outfits/display-name';
import type { Outfit } from '@/types';

export function ReadyOutfitCard({
  outfit,
  onWear,
  onOpen,
  width,
}: {
  outfit: Outfit;
  onWear?: () => void;
  onOpen?: () => void;
  width?: number;
}) {
  const theme = useTheme();
  const clothingItems = useAppStore((s) => s.clothingItems);
  const pieces: OutfitCollagePiece[] = (outfit.items ?? []).map((piece) => ({
    id: piece.id,
    role: piece.role,
    clothing_item:
      piece.clothing_item ?? clothingItems.find((c) => c.id === piece.clothing_item_id)!,
  })).filter((piece) => piece.clothing_item);
  const items = pieces.map((piece) => piece.clothing_item);
  const title = outfitDisplayName({ items, occasion: outfit.occasion, savedName: outfit.name });

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.bgElevated,
          borderColor: theme.border,
          width: width ?? 260,
        },
      ]}
    >
      <Pressable onPress={onOpen} accessibilityRole="button" accessibilityLabel={`Ready look, ${title}`}>
        <OutfitCollage pieces={pieces} size="ready" />
        <View style={styles.meta}>
          <Text style={{ ...typography.caption, color: theme.inkSoft }}>Ready</Text>
          <Text style={{ ...typography.subtitle, color: theme.ink }} numberOfLines={1}>
            {title}
          </Text>
          <Text style={{ ...typography.caption, color: theme.inkMuted }} numberOfLines={2}>
            {itemSummaryLine(items)}
          </Text>
        </View>
      </Pressable>
      {onWear ? <Button title="Wear today" onPress={onWear} style={styles.wear} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    flexGrow: 0,
    flexShrink: 0,
  },
  meta: { paddingHorizontal: 14, paddingTop: 12, paddingBottom: 4, gap: 4 },
  wear: { margin: 12, minHeight: 44 },
});

export function ReadyOutfitRow({
  outfits,
  onWear,
  onOpen,
}: {
  outfits: Outfit[];
  onWear: (id: string) => void;
  onOpen: (id: string) => void;
}) {
  const { compact, width, horizontalPad, xl } = useWebLayout();
  const peek = compact ? 28 : 20;
  const visible = xl ? 4 : compact ? 1 : 3;
  const cardWidth = Math.min(
    280,
    Math.max(220, (width - horizontalPad * 2 - peek - 12 * (visible - 1)) / visible)
  );

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      decelerationRate="fast"
      snapToInterval={cardWidth + 12}
      snapToAlignment="start"
      contentContainerStyle={{ gap: 12, paddingRight: peek }}
    >
      {outfits.map((outfit) => (
        <ReadyOutfitCard
          key={outfit.id}
          outfit={outfit}
          width={cardWidth}
          onOpen={() => onOpen(outfit.id)}
          onWear={() => onWear(outfit.id)}
        />
      ))}
    </ScrollView>
  );
}
