import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  PanResponder,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { GarmentVisual } from '@/components/outfit/GarmentVisual';
import { radii, typography } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import type { ClothingItem } from '@/types';

const SWIPE = 96;

export function ClothingSwipeDeck({
  items,
  onSkip,
  onLove,
  onWearItem,
  onEmptyAction,
}: {
  items: ClothingItem[];
  onSkip: (item: ClothingItem) => void;
  onLove: (item: ClothingItem) => void;
  onWearItem: (item: ClothingItem) => void;
  onEmptyAction?: () => void;
}) {
  const theme = useTheme();
  const [index, setIndex] = useState(0);
  const pan = useRef(new Animated.ValueXY()).current;
  const itemsRef = useRef(items);
  itemsRef.current = items;
  const indexRef = useRef(index);
  indexRef.current = index;
  const onSkipRef = useRef(onSkip);
  onSkipRef.current = onSkip;
  const onLoveRef = useRef(onLove);
  onLoveRef.current = onLove;
  const onWearRef = useRef(onWearItem);
  onWearRef.current = onWearItem;

  const current = items[index];

  const rotate = pan.x.interpolate({
    inputRange: [-220, 0, 220],
    outputRange: ['-12deg', '0deg', '12deg'],
    extrapolate: 'clamp',
  });

  const advance = () => {
    pan.setValue({ x: 0, y: 0 });
    setIndex((i) => i + 1);
  };

  const fling = (dx: number, action: 'skip' | 'love') => {
    const item = itemsRef.current[indexRef.current];
    if (!item) return;
    Animated.timing(pan, {
      toValue: { x: dx, y: 0 },
      duration: 180,
      useNativeDriver: true,
    }).start(() => {
      if (action === 'love') onLoveRef.current(item);
      else onSkipRef.current(item);
      advance();
    });
  };

  const responder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 8,
        onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
          useNativeDriver: false,
        }),
        onPanResponderRelease: (_, g) => {
          if (g.dx > SWIPE) fling(420, 'love');
          else if (g.dx < -SWIPE) fling(-420, 'skip');
          else Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: true }).start();
        },
      }),
    [pan]
  );

  useEffect(() => {
    if (index >= items.length) setIndex(0);
  }, [index, items.length]);

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') fling(-420, 'skip');
      if (event.key === 'ArrowRight') fling(420, 'love');
      if (event.key === 'Enter') {
        const item = itemsRef.current[indexRef.current];
        if (!item) return;
        onWearRef.current(item);
        advance();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  if (!current) {
    return (
      <EmptyState
        title="You've seen your closet"
        message="Skip, love, or wear pieces as they come up. Add more clothes anytime."
        actionLabel="Add clothing"
        onAction={onEmptyAction}
      />
    );
  }

  const behind = items[index + 1];

  return (
    <View style={styles.wrap}>
      <Text style={{ ...typography.caption, color: theme.inkSoft, textAlign: 'center' }}>
        Swipe right to love it · left to skip · {items.length - index} left
        {Platform.OS === 'web' ? ' · arrows and Enter work too' : ''}
      </Text>
      <View style={styles.stage}>
        {behind ? (
          <View style={[styles.backSlot, { transform: [{ scale: 0.96 }, { translateY: 12 }] }]}>
            <SwipeCard item={behind} theme={theme} dimmed />
          </View>
        ) : null}
        <Animated.View
          style={[styles.frontSlot, { transform: [{ translateX: pan.x }, { translateY: pan.y }, { rotate }] }]}
          {...responder.panHandlers}
        >
          <SwipeCard item={current} theme={theme} />
        </Animated.View>
      </View>
      <View style={styles.actions}>
        <Button title="Skip" variant="ghost" style={styles.btn} onPress={() => fling(-420, 'skip')} />
        <Button
          title="Wear"
          style={styles.btn}
          onPress={() => {
            onWearItem(current);
            advance();
          }}
        />
        <Button title="Love" variant="secondary" style={styles.btn} onPress={() => fling(420, 'love')} />
      </View>
    </View>
  );
}

function SwipeCard({
  item,
  theme,
  dimmed,
}: {
  item: ClothingItem;
  theme: ReturnType<typeof useTheme>;
  dimmed?: boolean;
}) {
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.bgElevated, borderColor: theme.border, opacity: dimmed ? 0.72 : 1 },
        Platform.OS === 'web' ? ({ cursor: 'pointer' } as const) : null,
      ]}
    >
      <View style={styles.photo}>
        <GarmentVisual item={item} />
      </View>
      <View style={styles.meta}>
        <Text style={{ ...typography.title, color: theme.ink }}>{item.name}</Text>
        <Text style={{ ...typography.body, color: theme.inkMuted, textTransform: 'capitalize' }}>
          {item.primary_color} · {item.subcategory}
        </Text>
        <Text style={{ ...typography.caption, color: theme.inkSoft }}>
          {item.wear_count > 0 ? `Worn ${item.wear_count}×` : 'Never worn'}
          {item.favorite ? ' · Favorite' : ''}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 12, width: '100%', maxWidth: 460, alignSelf: 'center' },
  stage: {
    height: Platform.OS === 'web' ? 460 : 420,
    width: '100%',
  },
  backSlot: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  frontSlot: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  card: {
    flex: 1,
    borderRadius: radii.xl,
    borderWidth: 1,
    overflow: 'hidden',
  },
  photo: {
    flex: 1,
    width: '100%',
  },
  meta: { padding: 16, gap: 4 },
  actions: { flexDirection: 'row', gap: 8 },
  btn: { flex: 1 },
});
