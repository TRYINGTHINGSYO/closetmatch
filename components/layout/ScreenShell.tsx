import { ScrollView, StyleSheet, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { useWebLayout } from '@/hooks/useWebLayout';
import { PageContainer } from './PageContainer';

export function ScreenShell({
  children,
  scroll = false,
  contentStyle,
  maxWidth,
}: {
  children: React.ReactNode;
  scroll?: boolean;
  contentStyle?: ViewStyle;
  maxWidth?: number;
}) {
  const theme = useTheme();
  const { isWeb } = useWebLayout();
  const body = (
    <PageContainer fill={!scroll} maxWidth={maxWidth} style={contentStyle}>
      {children}
    </PageContainer>
  );

  return (
    <LinearGradient colors={[theme.gradientStart, theme.gradientEnd]} style={styles.fill}>
      <SafeAreaView style={styles.fill} edges={isWeb ? [] : ['top']}>
        {scroll ? (
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
          >
            {body}
          </ScrollView>
        ) : (
          body
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  scroll: { paddingTop: 16, paddingBottom: 48, flexGrow: 1 },
});
