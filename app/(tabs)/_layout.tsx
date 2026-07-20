import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  const theme = useTheme();
  const glyphs: Record<string, string> = {
    Home: '⌂',
    Closet: '▣',
    Outfits: '☰',
    Add: '+',
    Profile: '◉',
  };
  return (
    <Text
      style={{
        fontSize: label === 'Add' ? 28 : 20,
        color: focused ? theme.accent : theme.inkSoft,
        fontWeight: focused ? '700' : '400',
      }}
    >
      {glyphs[label] ?? '•'}
    </Text>
  );
}

export default function TabsLayout() {
  const theme = useTheme();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.accent,
        tabBarInactiveTintColor: theme.inkSoft,
        tabBarStyle: {
          backgroundColor: theme.bgElevated,
          borderTopColor: theme.border,
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontFamily: 'DMSans_500Medium',
          fontSize: 11,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => <TabIcon label="Home" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="closet"
        options={{
          title: 'Closet',
          tabBarIcon: ({ focused }) => <TabIcon label="Closet" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: 'Add',
          tabBarIcon: ({ focused }) => <TabIcon label="Add" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="outfits"
        options={{
          title: 'Outfits',
          tabBarIcon: ({ focused }) => <TabIcon label="Outfits" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => <TabIcon label="Profile" focused={focused} />,
        }}
      />
      {/* Hide leftover template route if present */}
      <Tabs.Screen name="two" options={{ href: null }} />
    </Tabs>
  );
}
