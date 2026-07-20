import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { radii, typography } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
}

export function Chip({ label, selected, onPress }: ChipProps) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: selected ? theme.accent : theme.bgElevated,
          borderColor: selected ? theme.accent : theme.border,
        },
      ]}
    >
      <Text style={{ ...typography.label, color: selected ? '#fff' : theme.ink }}>
        {label}
      </Text>
    </Pressable>
  );
}

export function ChipGroup({
  options,
  selected,
  onToggle,
  multi = true,
}: {
  options: readonly string[] | string[];
  selected: string[];
  onToggle: (value: string) => void;
  multi?: boolean;
}) {
  return (
    <View style={styles.group}>
      {options.map((opt) => (
        <Chip
          key={opt}
          label={opt}
          selected={selected.includes(opt)}
          onPress={() => {
            if (multi) onToggle(opt);
            else onToggle(opt);
          }}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderWidth: 1,
    borderRadius: radii.xl,
    paddingHorizontal: 14,
    paddingVertical: 10,
    minHeight: 44,
    justifyContent: 'center',
  },
  group: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
});
