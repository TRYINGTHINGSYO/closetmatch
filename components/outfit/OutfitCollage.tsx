import { StyleSheet, View } from 'react-native';
import type { ClothingItem, OutfitRole } from '@/types';
import { collageLayout } from '@/lib/outfits/collage-layout';
import { useTheme } from '@/hooks/useTheme';
import { useWebLayout } from '@/hooks/useWebLayout';
import { GarmentVisual } from './GarmentVisual';

export type OutfitCollagePiece = {
  id: string;
  role?: OutfitRole | string | null;
  clothing_item: ClothingItem;
};

export function OutfitCollage({
  pieces,
  size = 'fresh',
}: {
  pieces: OutfitCollagePiece[];
  size?: 'hero' | 'ready' | 'fresh';
}) {
  const theme = useTheme();
  const { compact, wide } = useWebLayout();
  const items = pieces.filter((piece) => piece.clothing_item);
  const layout = collageLayout(
    items.map((piece) => ({
      id: piece.id,
      role: piece.role,
      category: piece.clothing_item.category,
    }))
  );
  const height =
    size === 'hero' ? (compact ? 268 : wide ? 420 : 340) : size === 'ready' ? 176 : 208;

  return (
    <View
      style={[
        styles.canvas,
        {
          height,
          backgroundColor: theme.bg,
        },
      ]}
      accessibilityRole="image"
      accessibilityLabel={items.map((piece) => piece.clothing_item.name).join(', ')}
    >
      {layout.map((rect) => {
        const piece = items.find((entry) => entry.id === rect.id);
        if (!piece) return null;
        return (
          <View
            key={rect.id}
            style={{
              position: 'absolute',
              left: `${rect.x * 100}%`,
              top: `${rect.y * 100}%`,
              width: `${rect.w * 100}%`,
              height: `${rect.h * 100}%`,
              zIndex: rect.zIndex,
            }}
          >
            <GarmentVisual item={piece.clothing_item} role={piece.role} framed={false} />
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  canvas: {
    width: '100%',
    borderRadius: 20,
    overflow: 'hidden',
  },
});
