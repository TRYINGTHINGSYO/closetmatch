import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { typography } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useAppStore } from '@/stores/app-store';

export default function MirrorCheckResultScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const mirror = useAppStore((s) => s.mirrorChecks.find((m) => m.id === id));
  const respondToMirrorCheck = useAppStore((s) => s.respondToMirrorCheck);
  const deleteMirrorPhoto = useAppStore((s) => s.deleteMirrorPhoto);
  const markOutfitWorn = useAppStore((s) => s.markOutfitWorn);
  const [agreed, setAgreed] = useState(false);

  if (!mirror) {
    return (
      <SafeAreaView style={{ flex: 1, padding: 24, backgroundColor: theme.bg }}>
        <Text style={{ color: theme.ink }}>Result not found.</Text>
        <Button title="Home" onPress={() => router.replace('/(tabs)')} style={{ marginTop: 16 }} />
      </SafeAreaView>
    );
  }

  const score = Math.round((mirror.overall_score ?? 0) * 100);

  return (
    <LinearGradient colors={[theme.gradientStart, theme.gradientEnd]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={[styles.title, { color: theme.ink }]}>Mirror Check</Text>
          <Text style={{ ...typography.subtitle, color: theme.accent }}>
            Clothing cohesion {score}%
          </Text>
          <Text style={{ ...typography.caption, color: theme.inkSoft }}>
            Confidence {Math.round((mirror.confidence ?? 0) * 100)}% · Your opinion matters more than the AI.
          </Text>

          {mirror.image_quality?.issues?.length ? (
            <Text style={{ ...typography.caption, color: theme.warning, marginTop: 8 }}>
              Image notes: {mirror.image_quality.issues.join(', ')}
            </Text>
          ) : null}

          <Text style={[styles.section, { color: theme.ink }]}>What works</Text>
          {mirror.positive_observations.map((o) => (
            <Text key={o} style={{ ...typography.body, color: theme.inkMuted }}>
              · {o}
            </Text>
          ))}

          <Text style={[styles.section, { color: theme.ink }]}>Suggestions</Text>
          {mirror.suggested_changes.map((c) => (
            <View
              key={c.suggestion}
              style={[styles.card, { borderColor: theme.border, backgroundColor: theme.bgElevated }]}
            >
              <Text style={{ ...typography.label, color: theme.ink }}>{c.suggestion}</Text>
              <Text style={{ ...typography.caption, color: theme.inkSoft }}>{c.reason}</Text>
            </View>
          ))}

          <View style={styles.scores}>
            {[
              ['Color', mirror.color_score],
              ['Style', mirror.style_score],
              ['Proportion', mirror.proportion_score],
              ['Occasion', mirror.occasion_score],
              ['Weather', mirror.weather_score],
            ].map(([label, value]) => (
              <Text key={String(label)} style={{ ...typography.caption, color: theme.inkMuted }}>
                {label} {Math.round(Number(value ?? 0) * 100)}%
              </Text>
            ))}
          </View>

          <View style={{ gap: 10, marginTop: 16 }}>
            <Button
              title={agreed ? 'Thanks — saved' : 'Looks good — I agree'}
              disabled={agreed}
              onPress={() => {
                respondToMirrorCheck(mirror.id, 'agree', 5);
                setAgreed(true);
              }}
            />
            {mirror.outfit_id ? (
              <Button
                title="I wore this outfit"
                variant="secondary"
                onPress={() => markOutfitWorn(mirror.outfit_id!, { rating: 5 })}
              />
            ) : null}
            <Button
              title="I disagree"
              variant="secondary"
              onPress={() => respondToMirrorCheck(mirror.id, 'disagree')}
            />
            <Button
              title="Delete photo"
              variant="ghost"
              onPress={() => {
                deleteMirrorPhoto(mirror.id);
              }}
            />
            <Button
              title="Try another photo"
              variant="ghost"
              onPress={() => router.push('/mirror-check/capture')}
            />
            <Button title="Done" variant="ghost" onPress={() => router.replace('/(tabs)')} />
          </View>
          {mirror.photo_deleted_at ? (
            <Text style={{ ...typography.caption, color: theme.success, marginTop: 8 }}>
              Photo deleted per your retention settings.
            </Text>
          ) : null}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, gap: 8, paddingBottom: 48 },
  title: { ...typography.hero },
  section: { ...typography.subtitle, marginTop: 14 },
  card: { borderWidth: 1, borderRadius: 12, padding: 12, marginTop: 6 },
  scores: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 12 },
});
