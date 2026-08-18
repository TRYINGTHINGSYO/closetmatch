import { StyleSheet, View, type ViewStyle } from 'react-native';
import type { GarmentKind } from '@/lib/clothing/garment-kind';
import type { GarmentPalette } from '@/lib/clothing/colors';

export function GarmentShape({
  kind,
  palette,
  knockout,
}: {
  kind: GarmentKind;
  palette: GarmentPalette;
  knockout: string;
}) {
  const { fill, accent, outline } = palette;
  const stroke: ViewStyle = { borderColor: outline, borderWidth: 1 };

  if (kind === 'pants') return <Pants fill={fill} accent={accent} stroke={stroke} long />;
  if (kind === 'shorts') return <Pants fill={fill} accent={accent} stroke={stroke} long={false} />;
  if (kind === 'skirt') return <Skirt fill={fill} stroke={stroke} />;
  if (kind === 'dress') {
    return <Dress fill={fill} accent={accent} knockout={knockout} stroke={stroke} />;
  }
  if (kind === 'sneakers' || kind === 'boots' || kind === 'loafers') {
    return <ShoePair kind={kind} fill={fill} accent={accent} stroke={stroke} />;
  }
  if (kind === 'jacket') {
    return <Jacket fill={fill} accent={accent} knockout={knockout} stroke={stroke} />;
  }
  if (kind === 'hat') return <Cap fill={fill} accent={accent} stroke={stroke} />;
  if (kind === 'watch') return <Watch fill={fill} accent={accent} stroke={stroke} />;
  if (kind === 'bag') return <Bag fill={fill} accent={accent} stroke={stroke} />;
  if (kind === 'generic') return <Hanger fill={fill} accent={accent} stroke={stroke} />;
  if (kind === 'hoodie') {
    return <Hoodie fill={fill} accent={accent} knockout={knockout} stroke={stroke} />;
  }
  if (kind === 'shirt') {
    return <Shirt fill={fill} accent={accent} knockout={knockout} stroke={stroke} />;
  }
  return <Tee fill={fill} knockout={knockout} stroke={stroke} />;
}

function Tee({
  fill,
  knockout,
  stroke,
}: {
  fill: string;
  knockout: string;
  stroke: ViewStyle;
}) {
  return (
    <View style={[styles.fill, { pointerEvents: 'none' }]}>
      <View style={[styles.teeSleeve, { backgroundColor: fill, left: '4%' }, stroke]} />
      <View style={[styles.teeSleeve, { backgroundColor: fill, right: '4%' }, stroke]} />
      <View style={[styles.teeBody, { backgroundColor: fill }, stroke]} />
      <View style={[styles.teeNeck, { backgroundColor: knockout }]} />
    </View>
  );
}

function Shirt({
  fill,
  accent,
  knockout,
  stroke,
}: {
  fill: string;
  accent: string;
  knockout: string;
  stroke: ViewStyle;
}) {
  return (
    <View style={[styles.fill, { pointerEvents: 'none' }]}>
      <View style={[styles.shirtSleeve, { backgroundColor: fill, left: '2%' }, stroke]} />
      <View style={[styles.shirtSleeve, { backgroundColor: fill, right: '2%' }, stroke]} />
      <View style={[styles.shirtBody, { backgroundColor: fill }, stroke]} />
      <View style={[styles.shirtCollar, { backgroundColor: fill, left: '34%' }, stroke]} />
      <View style={[styles.shirtCollar, { backgroundColor: fill, right: '34%' }, stroke]} />
      <View style={[styles.shirtNeck, { backgroundColor: knockout }]} />
      <View style={[styles.placket, { backgroundColor: accent }]} />
    </View>
  );
}

function Hoodie({
  fill,
  accent,
  knockout,
  stroke,
}: {
  fill: string;
  accent: string;
  knockout: string;
  stroke: ViewStyle;
}) {
  return (
    <View style={[styles.fill, { pointerEvents: 'none' }]}>
      <View style={[styles.hoodieSleeve, { backgroundColor: fill, left: '0%' }, stroke]} />
      <View style={[styles.hoodieSleeve, { backgroundColor: fill, right: '0%' }, stroke]} />
      <View style={[styles.hoodieCuff, { backgroundColor: accent, left: '2%' }]} />
      <View style={[styles.hoodieCuff, { backgroundColor: accent, right: '2%' }]} />
      <View style={[styles.hoodieBody, { backgroundColor: fill }, stroke]} />
      <View style={[styles.hoodieHem, { backgroundColor: accent }]} />
      <View style={[styles.hoodiePocket, { backgroundColor: accent }]} />
      <View style={[styles.hood, { backgroundColor: fill }, stroke]} />
      <View style={[styles.hoodOpen, { backgroundColor: knockout }]} />
    </View>
  );
}

function Jacket({
  fill,
  accent,
  knockout,
  stroke,
}: {
  fill: string;
  accent: string;
  knockout: string;
  stroke: ViewStyle;
}) {
  return (
    <View style={[styles.fill, { pointerEvents: 'none' }]}>
      <View style={[styles.jacketSleeve, { backgroundColor: fill, left: '0%' }, stroke]} />
      <View style={[styles.jacketSleeve, { backgroundColor: fill, right: '0%' }, stroke]} />
      <View style={[styles.jacketPanel, { backgroundColor: fill, left: '14%' }, stroke]} />
      <View style={[styles.jacketPanel, { backgroundColor: fill, right: '14%' }, stroke]} />
      <View style={[styles.jacketGap, { backgroundColor: knockout }]} />
      <View style={[styles.lapel, { backgroundColor: accent, left: '38%' }]} />
      <View style={[styles.lapel, { backgroundColor: accent, right: '38%' }]} />
    </View>
  );
}

function Pants({
  fill,
  accent,
  stroke,
  long,
}: {
  fill: string;
  accent: string;
  stroke: ViewStyle;
  long: boolean;
}) {
  const legH = long ? '78%' : '38%';
  return (
    <View style={[styles.fill, { pointerEvents: 'none' }]}>
      <View style={[styles.leg, { backgroundColor: fill, left: '22%', height: legH }, stroke]} />
      <View style={[styles.leg, { backgroundColor: fill, right: '22%', height: legH }, stroke]} />
      <View style={[styles.waist, { backgroundColor: fill }, stroke]} />
      <View style={[styles.fly, { backgroundColor: accent }]} />
    </View>
  );
}

function Skirt({ fill, stroke }: { fill: string; stroke: ViewStyle }) {
  return (
    <View style={[styles.fill, { pointerEvents: 'none' }]}>
      <View style={[styles.skirt, { backgroundColor: fill }, stroke]} />
      <View style={[styles.waist, { backgroundColor: fill, width: '34%', left: '33%' }, stroke]} />
    </View>
  );
}

function Dress({
  fill,
  accent,
  knockout,
  stroke,
}: {
  fill: string;
  accent: string;
  knockout: string;
  stroke: ViewStyle;
}) {
  return (
    <View style={[styles.fill, { pointerEvents: 'none' }]}>
      <View style={[styles.dressSleeve, { backgroundColor: fill, left: '10%' }, stroke]} />
      <View style={[styles.dressSleeve, { backgroundColor: fill, right: '10%' }, stroke]} />
      <View style={[styles.dressBody, { backgroundColor: fill }, stroke]} />
      <View style={[styles.dressNeck, { backgroundColor: knockout }]} />
      <View style={[styles.dressHem, { backgroundColor: accent }]} />
    </View>
  );
}

function ShoePair({
  kind,
  fill,
  accent,
  stroke,
}: {
  kind: 'sneakers' | 'boots' | 'loafers';
  fill: string;
  accent: string;
  stroke: ViewStyle;
}) {
  return (
    <View style={[styles.fill, { pointerEvents: 'none' }]}>
      <Shoe kind={kind} fill={fill} accent={accent} stroke={stroke} />
    </View>
  );
}

function Shoe({
  kind,
  fill,
  accent,
  stroke,
}: {
  kind: 'sneakers' | 'boots' | 'loafers';
  fill: string;
  accent: string;
  stroke: ViewStyle;
}) {
  if (kind === 'boots') {
    return (
      <View style={styles.fill}>
        <View style={[styles.bootShaft, { backgroundColor: fill }, stroke]} />
        <View style={[styles.bootUpper, { backgroundColor: fill }, stroke]} />
        <View style={[styles.bootHeel, { backgroundColor: fill }, stroke]} />
        <View style={[styles.bootSole, { backgroundColor: accent }]} />
      </View>
    );
  }
  if (kind === 'loafers') {
    return (
      <View style={styles.fill}>
        <View style={[styles.loafer, { backgroundColor: fill }, stroke]} />
        <View style={[styles.loaferStrap, { backgroundColor: accent }]} />
        <View style={[styles.loaferSole, { backgroundColor: accent }]} />
      </View>
    );
  }
  return (
    <View style={styles.fill}>
      <View style={[styles.sneakerTongue, { backgroundColor: fill }, stroke]} />
      <View style={[styles.sneaker, { backgroundColor: fill }, stroke]} />
      <View style={[styles.sneakerSole, { backgroundColor: accent }]} />
    </View>
  );
}

function Cap({ fill, accent, stroke }: { fill: string; accent: string; stroke: ViewStyle }) {
  return (
    <View style={[styles.fill, { pointerEvents: 'none' }]}>
      <View style={[styles.capCrown, { backgroundColor: fill }, stroke]} />
      <View style={[styles.capBill, { backgroundColor: fill }, stroke]} />
      <View style={[styles.capButton, { backgroundColor: accent }]} />
    </View>
  );
}

function Watch({ fill, accent, stroke }: { fill: string; accent: string; stroke: ViewStyle }) {
  return (
    <View style={[styles.fill, { pointerEvents: 'none' }]}>
      <View style={[styles.watchBand, { backgroundColor: accent }]} />
      <View style={[styles.watchFace, { backgroundColor: fill }, stroke]} />
      <View style={[styles.watchHand, { backgroundColor: accent }]} />
    </View>
  );
}

function Bag({ fill, accent, stroke }: { fill: string; accent: string; stroke: ViewStyle }) {
  return (
    <View style={[styles.fill, { pointerEvents: 'none' }]}>
      <View style={[styles.bagHandle, { borderColor: fill }]} />
      <View style={[styles.bagBody, { backgroundColor: fill }, stroke]} />
      <View style={[styles.bagFlap, { backgroundColor: accent }]} />
    </View>
  );
}

function Hanger({ fill, accent, stroke }: { fill: string; accent: string; stroke: ViewStyle }) {
  return (
    <View style={[styles.fill, { pointerEvents: 'none' }]}>
      <View style={[styles.hangerHook, { borderColor: fill }]} />
      <View style={[styles.hangerBar, { backgroundColor: fill }]} />
      <View style={[styles.hangerGarment, { backgroundColor: accent }, stroke]} />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  teeSleeve: {
    position: 'absolute',
    top: '22%',
    width: '28%',
    height: '16%',
    borderRadius: 14,
  },
  teeBody: {
    position: 'absolute',
    left: '22%',
    right: '22%',
    top: '18%',
    bottom: '16%',
    borderRadius: 18,
  },
  teeNeck: {
    position: 'absolute',
    left: '40%',
    right: '40%',
    top: '14%',
    height: '12%',
    borderRadius: 999,
  },
  shirtSleeve: {
    position: 'absolute',
    top: '22%',
    width: '28%',
    height: '44%',
    borderRadius: 8,
  },
  shirtBody: {
    position: 'absolute',
    left: '22%',
    right: '22%',
    top: '20%',
    bottom: '10%',
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  shirtCollar: {
    position: 'absolute',
    top: '8%',
    width: '18%',
    height: '16%',
    borderRadius: 3,
  },
  shirtNeck: {
    position: 'absolute',
    left: '44%',
    right: '44%',
    top: '14%',
    height: '10%',
    borderRadius: 6,
  },
  placket: {
    position: 'absolute',
    left: '48.5%',
    width: 3,
    top: '26%',
    bottom: '16%',
    borderRadius: 2,
  },
  hoodieSleeve: {
    position: 'absolute',
    top: '26%',
    width: '30%',
    height: '42%',
    borderRadius: 16,
  },
  hoodieCuff: {
    position: 'absolute',
    bottom: '28%',
    width: '18%',
    height: '8%',
    borderRadius: 8,
  },
  hoodieBody: {
    position: 'absolute',
    left: '20%',
    right: '20%',
    top: '24%',
    bottom: '12%',
    borderRadius: 16,
  },
  hoodieHem: {
    position: 'absolute',
    left: '22%',
    right: '22%',
    bottom: '12%',
    height: '8%',
    borderRadius: 8,
  },
  hoodiePocket: {
    position: 'absolute',
    left: '30%',
    right: '30%',
    top: '54%',
    height: '16%',
    borderRadius: 10,
  },
  hood: {
    position: 'absolute',
    left: '30%',
    right: '30%',
    top: '4%',
    height: '28%',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  hoodOpen: {
    position: 'absolute',
    left: '38%',
    right: '38%',
    top: '10%',
    height: '16%',
    borderRadius: 16,
  },
  jacketSleeve: {
    position: 'absolute',
    top: '18%',
    width: '24%',
    height: '52%',
    borderRadius: 10,
  },
  jacketPanel: {
    position: 'absolute',
    top: '14%',
    width: '28%',
    bottom: '8%',
    borderRadius: 8,
  },
  jacketGap: {
    position: 'absolute',
    left: '42%',
    right: '42%',
    top: '16%',
    bottom: '10%',
  },
  lapel: {
    position: 'absolute',
    top: '16%',
    width: '14%',
    height: '22%',
    borderRadius: 3,
  },
  waist: {
    position: 'absolute',
    left: '28%',
    width: '44%',
    height: '11%',
    top: '10%',
    borderRadius: 6,
  },
  leg: {
    position: 'absolute',
    top: '16%',
    width: '24%',
    borderRadius: 8,
  },
  fly: {
    position: 'absolute',
    left: '49%',
    width: 2,
    top: '16%',
    height: '14%',
    borderRadius: 1,
  },
  skirt: {
    position: 'absolute',
    left: '16%',
    right: '16%',
    top: '18%',
    bottom: '10%',
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
  },
  dressSleeve: {
    position: 'absolute',
    top: '10%',
    width: '20%',
    height: '14%',
    borderRadius: 12,
  },
  dressBody: {
    position: 'absolute',
    left: '24%',
    right: '24%',
    top: '10%',
    bottom: '6%',
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    borderBottomLeftRadius: 34,
    borderBottomRightRadius: 34,
  },
  dressNeck: {
    position: 'absolute',
    left: '42%',
    right: '42%',
    top: '8%',
    height: '8%',
    borderRadius: 999,
  },
  dressHem: {
    position: 'absolute',
    left: '24%',
    right: '24%',
    bottom: '6%',
    height: 7,
    borderBottomLeftRadius: 34,
    borderBottomRightRadius: 34,
  },
  shoeRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'stretch',
    paddingHorizontal: '2%',
    gap: 4,
  },
  shoeSlot: { flex: 1 },
  sneaker: {
    position: 'absolute',
    left: '10%',
    right: '14%',
    bottom: '28%',
    height: '32%',
    borderTopLeftRadius: 22,
    borderBottomLeftRadius: 22,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 8,
  },
  sneakerTongue: {
    position: 'absolute',
    left: '22%',
    width: '30%',
    bottom: '52%',
    height: '20%',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  sneakerSole: {
    position: 'absolute',
    left: '10%',
    right: '12%',
    bottom: '16%',
    height: 12,
    borderRadius: 6,
  },
  bootShaft: {
    position: 'absolute',
    left: '48%',
    right: '18%',
    top: '6%',
    height: '56%',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  bootUpper: {
    position: 'absolute',
    left: '10%',
    right: '16%',
    bottom: '24%',
    height: '30%',
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 4,
  },
  bootHeel: {
    position: 'absolute',
    right: '16%',
    width: '20%',
    bottom: '20%',
    height: '24%',
    borderRadius: 4,
  },
  bootSole: {
    position: 'absolute',
    left: '10%',
    right: '14%',
    bottom: '12%',
    height: 10,
    borderRadius: 3,
  },
  loafer: {
    position: 'absolute',
    left: '10%',
    right: '16%',
    bottom: '30%',
    height: '26%',
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 6,
  },
  loaferStrap: {
    position: 'absolute',
    left: '32%',
    width: '34%',
    bottom: '46%',
    height: 8,
    borderRadius: 4,
  },
  loaferSole: {
    position: 'absolute',
    left: '12%',
    right: '16%',
    bottom: '22%',
    height: 6,
    borderRadius: 2,
  },
  capCrown: {
    position: 'absolute',
    left: '28%',
    right: '28%',
    top: '22%',
    height: '34%',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
  },
  capBill: {
    position: 'absolute',
    left: '48%',
    right: '10%',
    top: '48%',
    height: 10,
    borderRadius: 8,
  },
  capButton: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    left: '47%',
    top: '24%',
  },
  watchBand: {
    position: 'absolute',
    left: '42%',
    right: '42%',
    top: '10%',
    bottom: '10%',
    borderRadius: 5,
  },
  watchFace: {
    position: 'absolute',
    width: '46%',
    aspectRatio: 1,
    left: '27%',
    top: '26%',
    borderRadius: 999,
  },
  watchHand: {
    position: 'absolute',
    width: 2,
    height: '14%',
    left: '49%',
    top: '32%',
    borderRadius: 1,
  },
  bagHandle: {
    position: 'absolute',
    left: '30%',
    right: '30%',
    top: '10%',
    height: '24%',
    borderWidth: 3,
    borderBottomWidth: 0,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    backgroundColor: 'transparent',
  },
  bagBody: {
    position: 'absolute',
    left: '20%',
    right: '20%',
    top: '28%',
    bottom: '14%',
    borderRadius: 12,
  },
  bagFlap: {
    position: 'absolute',
    left: '20%',
    right: '20%',
    top: '28%',
    height: '16%',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  hangerHook: {
    position: 'absolute',
    left: '44%',
    width: '14%',
    top: '4%',
    height: '18%',
    borderWidth: 3,
    borderBottomWidth: 0,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    backgroundColor: 'transparent',
  },
  hangerBar: {
    position: 'absolute',
    left: '16%',
    right: '16%',
    top: '20%',
    height: 5,
    borderRadius: 2,
  },
  hangerGarment: {
    position: 'absolute',
    left: '26%',
    right: '26%',
    top: '24%',
    bottom: '16%',
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
  },
});
