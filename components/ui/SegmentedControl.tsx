import { Pressable, StyleSheet, Text, View } from 'react-native';
import { radii, typography } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';

export function SegmentedControl({
  options,
  value,
  onChange,
  accessibilityLabel,
}: {
  options: readonly { id: string; label: string }[];
  value: string;
  onChange: (id: string) => void;
  accessibilityLabel?: string;
}) {
  const theme = useTheme();

  return (
    <View
      accessibilityRole="tablist"
      accessibilityLabel={accessibilityLabel}
      style={[styles.track, { backgroundColor: theme.accentSoft }]}
    >
      {options.map((option) => {
        const selected = option.id === value;
        return (
          <Pressable
            key={option.id}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            onPress={() => onChange(option.id)}
            style={({ pressed }) => [
              styles.segment,
              selected && { backgroundColor: theme.bgElevated },
              { opacity: pressed ? 0.88 : 1 },
            ]}
          >
            <Text
              style={{
                ...typography.label,
                fontFamily: selected ? 'DMSans_700Bold' : 'DMSans_500Medium',
                color: selected ? theme.ink : theme.inkMuted,
              }}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    borderRadius: radii.lg,
    padding: 4,
    gap: 2,
    minHeight: 44,
  },
  segment: {
    flex: 1,
    minHeight: 36,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
});
