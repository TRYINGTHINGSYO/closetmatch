import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { ScreenShell } from '@/components/layout/ScreenShell';
import { typography } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useAppStore } from '@/stores/app-store';
import { confirmAlert, showAlert } from '@/lib/ui/alert';

export default function ProfileScreen() {
  const theme = useTheme();
  const router = useRouter();
  const profile = useAppStore((s) => s.profile);
  const preferences = useAppStore((s) => s.preferences);
  const clothingItems = useAppStore((s) => s.clothingItems);
  const outfits = useAppStore((s) => s.outfits);
  const wearHistory = useAppStore((s) => s.wearHistory);
  const signOut = useAppStore((s) => s.signOut);
  const clearLocalAccount = useAppStore((s) => s.clearLocalAccount);
  const loadDemoWardrobe = useAppStore((s) => s.loadDemoWardrobe);

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
    { label: 'Planned outfits', href: '/outfits/planned' },
    { label: 'Laundry', href: '/laundry' },
    { label: 'Mirror Check history', href: '/mirror-check/history' },
    { label: 'Look & feel', href: '/settings/appearance' },
    { label: 'Privacy settings', href: '/settings/privacy' },
    { label: 'Notifications', href: '/settings/notifications' },
    { label: 'Weather settings', href: '/settings/weather' },
    { label: 'Data export', href: '/settings/export' },
    { label: 'System status', href: '/settings/system-status' },
  ] as const;

  return (
    <ScreenShell scroll>
      <Text style={[styles.title, { color: theme.ink }]}>{profile?.display_name || 'Your profile'}</Text>
      <Text style={{ ...typography.body, color: theme.inkMuted }}>
        {clothingItems.length} clothes · {outfits.length} outfits · {wearHistory.length} wears
      </Text>

      <Text style={[styles.section, { color: theme.ink }]}>Style profile</Text>
      <Text style={{ ...typography.body, color: theme.inkMuted }}>
        You often lean {preferences?.preferred_styles?.slice(0, 3).join(', ') || 'casual'}. Preferred colors:{' '}
        {preferences?.preferred_colors?.slice(0, 4).join(', ') || 'not set yet'}.
      </Text>
      <Text style={{ ...typography.caption, color: theme.inkSoft, marginTop: 6 }}>
        Learned observations update as you save, wear, replace, and rate outfits. You can correct them anytime.
      </Text>

      <Text style={[styles.section, { color: theme.ink }]}>Wardrobe analytics</Text>
      <View style={[styles.card, { backgroundColor: theme.bgElevated, borderColor: theme.border }]}>
        <Text style={{ ...typography.label, color: theme.ink }}>Most worn</Text>
        {mostWorn.length === 0 ? (
          <Text style={{ ...typography.caption, color: theme.inkSoft }}>
            Add clothes and mark outfits worn to see this.
          </Text>
        ) : (
          mostWorn.map((c) => (
            <Text key={c.id} style={{ ...typography.caption, color: theme.inkMuted }}>
              {c.name} · {c.wear_count} wears
            </Text>
          ))
        )}
        <Text style={{ ...typography.label, color: theme.ink, marginTop: 10 }}>
          Never worn ({neverWorn.length})
        </Text>
        {neverWorn.length === 0 ? (
          <Text style={{ ...typography.caption, color: theme.inkSoft }}>Every item has been worn at least once.</Text>
        ) : (
          neverWorn.slice(0, 3).map((c) => (
            <Text key={c.id} style={{ ...typography.caption, color: theme.inkMuted }}>
              {c.name}
            </Text>
          ))
        )}
        <Text style={{ ...typography.label, color: theme.ink, marginTop: 10 }}>Lowest cost per wear</Text>
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
        onPress={async () => {
          const ok = await confirmAlert(
            'Delete account',
            'This clears local ClosetMatch data on this device. Cloud account deletion must be handled by the backend before production launch.',
            'Delete'
          );
          if (!ok) return;
          clearLocalAccount();
          router.replace('/(auth)/welcome');
        }}
      />
      <Button
        title="Load sample wardrobe"
        variant="ghost"
        style={{ marginTop: 16 }}
        onPress={() => {
          if (clothingItems.length > 0) {
            showAlert(
              'Closet already has clothes',
              'Sample import only runs on an empty closet so your items are not overwritten.'
            );
            return;
          }
          loadDemoWardrobe();
          router.push('/closet');
        }}
      />
      <Text style={{ ...typography.caption, color: theme.inkSoft }}>
        Optional demo data for exploring the site. Hidden from the main Add flow so your real closet stays first.
      </Text>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
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
