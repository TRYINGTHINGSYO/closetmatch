import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
  type ViewStyle,
} from 'react-native';
import { radii, typography } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps extends PressableProps {
  title: string;
  variant?: Variant;
  loading?: boolean;
  style?: ViewStyle;
}

export function Button({
  title,
  variant = 'primary',
  loading,
  disabled,
  style,
  ...rest
}: ButtonProps) {
  const theme = useTheme();
  const bg =
    variant === 'primary'
      ? theme.accent
      : variant === 'danger'
        ? theme.danger
        : variant === 'secondary'
          ? theme.accentSoft
          : 'transparent';
  const color =
    variant === 'primary' || variant === 'danger'
      ? '#FFFFFF'
      : variant === 'secondary'
        ? theme.accentDeep
        : theme.ink;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: bg,
          borderColor: variant === 'ghost' ? theme.border : bg,
          opacity: disabled ? 0.5 : pressed ? 0.88 : 1,
        },
        style,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={color} />
      ) : (
        <Text style={[styles.label, { color }]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    paddingHorizontal: 20,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  label: {
    ...typography.button,
  },
});
