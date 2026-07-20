import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { typography } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useAppStore } from '@/stores/app-store';

export default function ProfileScreen() {
  const theme = useTheme();
  const router = useRouter();
  const profile = useAppStore((s) => s.profile);
  const preferences = useAppStore((s) => s.preferences);
  const clothingItems = useAppStore((s) => s.clothingItems);
  const outfits = useAppStore((s) => s.outfits);
  const wearHistory = useAppStore((s) => s.wearHistory);
  const signOut = useAppStore((s) => s.signOut);

  const mostWorn = [...clothingItems].sort((a, b) => b.wear_count - a.wear_count).slice(0, 3);
  const neverWorn = clothingItems.filter((c) => c.wear_count === 0 || c.never_worn);
  const costPerWear = clothingItems
    .filter((c) => c.price_paid && c.wear_count > 0)
    .map((c) => ({
      name: c.name,
      cpw: (c.price_paid ?? 0) / c.wear_count,
    }))
    .sort((a, b) => a.cpw - b.cpw)
    .slice(0, 3);

  const links = [
    { label: 'Wear history & calendar', href: '/history' },
    { label: 'Laundry', href: '/laundry' },
    { label: 'Privacy settings', href: '/settings/privacy' },
    { label: 'Notifications', href: '/settings/notifications' },
    { label: 'Weather settings', href: '/settings/weather' },
    { label: 'Data export', href: '/settings/export' },
  ] as const;

  return (
    <LinearGradient colors={[theme.gradientStart, theme.gradientEnd]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={[styles.title, { color: theme.ink }]}>{profile?.display_name}</Text>
          <Text style={{ ...typography.body, color: theme.inkMuted }}>
            {clothingItems.length} clothes · {outfits.length} outfits · {wearHistory.length} wears
          </Text>

          <Text style={[styles.section, { color: theme.ink }]}>Style profile</Text>
          <Text style={{ ...typography.body, color: theme.inkMuted }}>
            You often lean {preferences?.preferred_styles?.slice(0, 3).join(', ') || 'casual'}.
            Preferred colors: {preferences?.preferred_colors?.slice(0, 4).join(', ') || 'not set yet'}.
          </Text>
          <Text style={{ ...typography.caption, color: theme.inkSoft, marginTop: 6 }}>
            Learned observations update as you save, wear, replace, and rate outfits. You can correct them anytime.
          </Text>

          <Text style={[styles.section, { color: theme.ink }]}>Wardrobe analytics</Text>
          <View style={[styles.card, { backgroundColor: theme.bgElevated, borderColor: theme.border }]}>
            <Text style={{ ...typography.label, color: theme.ink }}>Most worn</Text>
            {mostWorn.map((c) => (
              <Text key={c.id} style={{ ...typography.caption, color: theme.inkMuted }}>
                {c.name} · {c.wear_count} wears
              </Text>
            ))}
            <Text style={{ ...typography.label, color: theme.ink, marginTop: 10 }}>
              Never worn ({neverWorn.length})
            </Text>
            {neverWorn.slice(0, 3).map((c) => (
              <Text key={c.id} style={{ ...typography.caption, color: theme.inkMuted }}>
                {c.name}
              </Text>
            ))}
            <Text style={{ ...typography.label, color: theme.ink, marginTop: 10 }}>
              Lowest cost per wear
            </Text>
            {costPerWear.length === 0 ? (
              <Text style={{ ...typography.caption, color: theme.inkSoft }}>
                Add purchase prices to track cost per wear.
              </Text>
            ) : (
              costPerWear.map((c) => (
                <Text key={c.name} style={{ ...typography.caption, color: theme.inkMuted }}>
                  {c.name} · ${c.cpw.toFixed(2)}/wear
                </Text>
              ))
            )}
          </View>

          {links.map((link) => (
            <Pressable
              key={link.href}
              onPress={() => router.push(link.href)}
              style={[styles.link, { borderColor: theme.border }]}
            >
              <Text style={{ ...typography.body, color: theme.ink }}>{link.label}</Text>
              <Text style={{ color: theme.inkSoft }}>›</Text>
            </Pressable>
          ))}

          <Button
            title="Sign out"
            variant="ghost"
            style={{ marginTop: 20 }}
            onPress={async () => {
              await signOut();
              router.replace('/(auth)/welcome');
            }}
          />
          <Button
            title="Delete account"
            variant="danger"
            style={{ marginTop: 8 }}
            onPress={() =>
              Alert.alert(
                'Delete account',
                'This removes local ClosetMatch data on this device. With Supabase connected, account deletion also removes cloud data and private photos.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                      useAppStore.setState({
                        sessionEmail: null,
                        profile: null,
                        preferences: null,
                        clothingItems: [],
                        outfits: [],
                        pairings: [],
                        wearHistory: [],
                        mirrorChecks: [],
                        plannedOutfits: [],
                      });
                      router.replace('/(auth)/welcome');
                    },
                  },
                ]
              )
            }
          />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 48, gap: 10 },
  title: { ...typography.hero },
  section: { ...typography.subtitle, marginTop: 16 },
  card: { borderWidth: 1, borderRadius: 16, padding: 14, gap: 4 },
  link: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
});
