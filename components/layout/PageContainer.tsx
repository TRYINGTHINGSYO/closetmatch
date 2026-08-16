import { StyleSheet, View, type ViewStyle } from 'react-native';
import { useWebLayout } from '@/hooks/useWebLayout';

export function PageContainer({
  children,
  style,
  fill = true,
  maxWidth,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
  fill?: boolean;
  maxWidth?: number;
}) {
  const layout = useWebLayout();
  return (
    <View
      style={[
        styles.base,
        fill && styles.fill,
        { maxWidth: maxWidth ?? layout.pageWidth, paddingHorizontal: layout.horizontalPad },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    width: '100%',
    alignSelf: 'center',
  },
  fill: { flex: 1 },
});
