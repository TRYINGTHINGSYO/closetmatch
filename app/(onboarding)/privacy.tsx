import { useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { typography } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useAppStore } from '@/stores/app-store';

function Row({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
  hint?: string;
}) {
  const theme = useTheme();
  return (
    <View style={[styles.row, { borderColor: theme.border }]}>
      <View style={{ flex: 1 }}>
        <Text style={{ ...typography.label, color: theme.ink }}>{label}</Text>
        {hint ? (
          <Text style={{ ...typography.caption, color: theme.inkSoft, marginTop: 4 }}>{hint}</Text>
        ) : null}
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ true: theme.accent, false: theme.border }}
        accessibilityLabel={label}
      />
    </View>
  );
}

export default function OnboardingPrivacyScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [savePhotos, setSavePhotos] = useState(true);
  const [mirrorEnabled, setMirrorEnabled] = useState(true);
  const [deleteAfter, setDeleteAfter] = useState(true);
  const [cloudProcessing, setCloudProcessing] = useState(true);
  const [analytics, setAnalytics] = useState(false);

  return (
    <LinearGradient colors={[theme.gradientStart, theme.gradientEnd]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.safe}>
          <Text style={[styles.step, { color: theme.accent }]}>Step 6 of 7</Text>
          <Text style={[styles.title, { color: theme.ink }]}>Photo privacy</Text>
          <Text style={[styles.sub, { color: theme.inkMuted }]}>
            Mirror Check photos are private by default. ClosetMatch never uses personal images for model training.
          </Text>
          <Row label="Save clothing photos" value={savePhotos} onChange={setSavePhotos} />
          <Row label="Enable Mirror Check" value={mirrorEnabled} onChange={setMirrorEnabled} />
          <Row
            label="Delete Mirror Check originals after analysis"
            value={deleteAfter}
            onChange={setDeleteAfter}
          />
          <Row
            label="Allow cloud image processing"
            value={cloudProcessing}
            onChange={setCloudProcessing}
            hint="Required for AI analysis when using a live provider."
          />
          <Row
            label="Anonymous product analytics"
            value={analytics}
            onChange={setAnalytics}
            hint="Never includes photo contents or wardrobe item lists."
          />
          <Button
            title="Continue"
            style={{ marginTop: 24 }}
            onPress={() => {
              useAppStore.setState((s) => ({
                preferences: s.preferences
                  ? {
                      ...s.preferences,
                      save_clothing_photos: savePhotos,
                      mirror_check_enabled: mirrorEnabled,
                      mirror_photo_retention: deleteAfter
                        ? 'delete_after_analysis'
                        : 'save_original',
                      allow_cloud_image_processing: cloudProcessing,
                      analytics_enabled: analytics,
                      never_use_images_for_training: true,
                    }
                  : s.preferences,
              }));
              router.push('/(onboarding)/permissions');
            }}
          />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  safe: { padding: 24, paddingBottom: 40, gap: 10 },
  step: { ...typography.caption },
  title: { ...typography.hero },
  sub: { ...typography.body, marginBottom: 8 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
});
