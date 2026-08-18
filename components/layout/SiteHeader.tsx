import { Pressable, StyleSheet, Text, View } from 'react-native';
import { usePathname, useRouter } from 'expo-router';
import { APP_NAME } from '@/constants';
import { radii, typography } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useWebLayout } from '@/hooks/useWebLayout';
import { useAppStore } from '@/stores/app-store';

const APP_LINKS = [
  { label: 'Today', href: '/', prefixes: ['/', '/(tabs)'] },
  { label: 'Closet', href: '/closet', prefixes: ['/closet'] },
  { label: 'Outfits', href: '/outfits', prefixes: ['/outfits'] },
  { label: 'Laundry', href: '/laundry', prefixes: ['/laundry'] },
  { label: 'Mirror Check', href: '/mirror-check/consent', prefixes: ['/mirror-check'] },
  { label: 'You', href: '/profile', prefixes: ['/profile', '/settings', '/history'] },
] as const;

function linkActive(pathname: string, prefixes: readonly string[]): boolean {
  const path = pathname || '/';
  return prefixes.some((prefix) => {
    if (prefix === '/') return path === '/' || path === '/(tabs)' || path === '/(tabs)/index';
    return path === prefix || path.startsWith(`${prefix}/`);
  });
}

export function SiteHeader() {
  const theme = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const { horizontalPad } = useWebLayout();
  const sessionEmail = useAppStore((s) => s.sessionEmail);
  const onboarded = useAppStore((s) => s.profile?.onboarding_completed);
  const signedIn = Boolean(sessionEmail && onboarded);
  const addActive = linkActive(pathname, ['/add', '/clothing']);

  return (
    <View
      style={[
        styles.bar,
        {
          backgroundColor: theme.bgElevated,
          borderBottomColor: theme.border,
          paddingHorizontal: horizontalPad,
        },
      ]}
    >
      <Pressable
        onPress={() => router.push(signedIn ? '/' : '/(auth)/welcome')}
        accessibilityRole="link"
      >
        <Text style={[styles.brand, { color: theme.ink }]}>{APP_NAME}</Text>
      </Pressable>
      {signedIn ? (
        <View style={styles.navCluster}>
          <View style={styles.links}>
            {APP_LINKS.map((link) => {
              const active = linkActive(pathname, link.prefixes);
              return (
                <Pressable
                  key={link.href}
                  onPress={() => router.push(link.href)}
                  accessibilityRole="link"
                  accessibilityState={{ selected: active }}
                  style={[
                    styles.link,
                    active && { borderBottomColor: theme.accent },
                  ]}
                >
                  <Text
                    style={{
                      ...typography.label,
                      color: active ? theme.ink : theme.inkMuted,
                    }}
                  >
                    {link.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <Pressable
            onPress={() => router.push('/add')}
            accessibilityRole="button"
            accessibilityLabel="Add clothes"
            accessibilityState={{ selected: addActive }}
            style={({ pressed }) => [
              styles.add,
              {
                backgroundColor: addActive ? theme.accentDeep : theme.accent,
                opacity: pressed ? 0.88 : 1,
              },
            ]}
          >
            <Text style={styles.addLabel}>Add</Text>
          </Pressable>
        </View>
      ) : sessionEmail ? (
        <Text style={{ ...typography.caption, color: theme.inkMuted }}>Finishing setup</Text>
      ) : (
        <View style={styles.links}>
          <Pressable onPress={() => router.push('/look')} accessibilityRole="link">
            <Text style={{ ...typography.label, color: theme.inkMuted }}>Look & feel</Text>
          </Pressable>
          <Pressable onPress={() => router.push('/(auth)/sign-in')} accessibilityRole="link">
            <Text style={{ ...typography.label, color: theme.accent }}>Sign in</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    rowGap: 10,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    zIndex: 20,
  },
  brand: {
    ...typography.subtitle,
    fontFamily: 'Fraunces_600SemiBold',
    fontSize: 20,
  },
  navCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 22,
    flexWrap: 'wrap',
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  links: { flexDirection: 'row', alignItems: 'center', gap: 4, flexWrap: 'wrap' },
  link: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  add: {
    minHeight: 40,
    paddingHorizontal: 16,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addLabel: {
    ...typography.label,
    fontFamily: 'DMSans_700Bold',
    color: '#FFFFFF',
  },
});
