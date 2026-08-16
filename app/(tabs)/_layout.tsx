import { Text, View } from 'react-native';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { useWebLayout } from '@/hooks/useWebLayout';

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
  const insets = useSafeAreaInsets();
  const { isWeb } = useWebLayout();
  const hideTabBar = isWeb;
  const bottomPad = Math.max(insets.bottom, 8);

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: theme.accent,
          tabBarInactiveTintColor: theme.inkSoft,
          tabBarStyle: hideTabBar
            ? { display: 'none', height: 0 }
            : {
                backgroundColor: theme.bgElevated,
                borderTopColor: theme.border,
                height: 52 + bottomPad,
                paddingBottom: bottomPad,
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
            title: 'Today',
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
            title: 'You',
            tabBarIcon: ({ focused }) => <TabIcon label="Profile" focused={focused} />,
          }}
        />
      </Tabs>
    </View>
  );
}
