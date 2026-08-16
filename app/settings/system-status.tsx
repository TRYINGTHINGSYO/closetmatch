import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { typography } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { isSupabaseConfigured } from '@/lib/supabase/client';

function StatusRow({
  label,
  value,
  detail,
  last,
}: {
  label: string;
  value: string;
  detail: string;
  last?: boolean;
}) {
  const theme = useTheme();
  return (
    <View style={[styles.row, { borderColor: theme.border, borderBottomWidth: last ? 0 : StyleSheet.hairlineWidth }]}>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={{ ...typography.label, color: theme.ink }}>{label}</Text>
        <Text style={{ ...typography.caption, color: theme.inkSoft }}>{detail}</Text>
      </View>
      <Text style={{ ...typography.label, color: theme.accent }}>{value}</Text>
    </View>
  );
}

export default function SystemStatusScreen() {
  const theme = useTheme();
  const router = useRouter();
  const aiRequested = process.env.EXPO_PUBLIC_AI_PROVIDER === 'openai';
  const aiProvider = aiRequested && isSupabaseConfigured ? 'Edge AI' : 'Mock AI';
  const weatherProvider = process.env.EXPO_PUBLIC_WEATHER_PROVIDER === 'mock' ? 'Mock' : 'Open-Meteo';

  return (
    <LinearGradient colors={[theme.gradientStart, theme.gradientEnd]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content}>
          <Button title="Back" variant="ghost" onPress={() => router.back()} />
          <Text style={[styles.title, { color: theme.ink }]}>System status</Text>
          <Text style={{ ...typography.body, color: theme.inkMuted }}>
            This shows which parts of ClosetMatch are running locally and which are connected to cloud services.
          </Text>

          <View style={[styles.card, { backgroundColor: theme.bgElevated, borderColor: theme.border }]}>
            <StatusRow
              label="Platform"
              value={Platform.OS === 'web' ? 'Web' : Platform.OS === 'ios' ? 'iOS' : 'Android'}
              detail="One Expo codebase targets browser, iPhone/iPad, and Android."
            />
            <StatusRow
              label="Cloud backend"
              value={isSupabaseConfigured ? 'Configured' : 'Local demo'}
              detail={
                isSupabaseConfigured
                  ? 'Supabase credentials are present. Full database sync still needs repository wiring.'
                  : 'Wardrobe data is stored locally on this device/browser.'
              }
            />
            <StatusRow
              label="Clothing + Mirror AI"
              value={aiProvider}
              detail={
                aiProvider === 'Edge AI'
                  ? 'Client will invoke Supabase Edge Functions. If the live adapter is not ready, ClosetMatch falls back to demo analysis.'
                  : 'Deterministic demo analysis; no paid AI call is made.'
              }
            />
            <StatusRow
              label="Weather"
              value={weatherProvider}
              detail="Used to adjust daily outfit recommendations when weather is enabled."
              last
            />
          </View>

          {!isSupabaseConfigured ? (
            <Text style={{ ...typography.caption, color: theme.inkSoft }}>
              Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to switch on the cloud client.
            </Text>
          ) : null}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, gap: 12, paddingBottom: 48 },
  title: { ...typography.hero },
  card: { borderWidth: 1, borderRadius: 16, paddingHorizontal: 14 },
  row: {
    minHeight: 74,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 12,
  },
});
