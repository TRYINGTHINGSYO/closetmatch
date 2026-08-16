import { useState } from 'react';
import { Image, Platform, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Button } from '@/components/ui/Button';
import { ScreenShell } from '@/components/layout/ScreenShell';
import { typography } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useAppStore } from '@/stores/app-store';
import { showAlert } from '@/lib/ui/alert';
import type { ClothingAnalysisResult } from '@/lib/validation/ai-schemas';

export default function ClothingCaptureScreen() {
  const theme = useTheme();
  const router = useRouter();
  const analyzeClothing = useAppStore((s) => s.analyzeClothing);
  const setPendingClothingReview = useAppStore((s) => s.setPendingClothingReview);
  const [uri, setUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [skipAi, setSkipAi] = useState(false);

  const pick = async (fromCamera: boolean) => {
    const permission = fromCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      showAlert(
        fromCamera ? 'Camera permission needed' : 'Photo permission needed',
        'Enable access in settings, or continue by entering details manually.'
      );
      return;
    }
    const result = fromCamera
      ? await ImagePicker.launchCameraAsync({ quality: 0.85, allowsEditing: true, aspect: [3, 4] })
      : await ImagePicker.launchImageLibraryAsync({
          quality: 0.85,
          allowsEditing: true,
          aspect: [3, 4],
        });
    if (!result.canceled && result.assets[0]) {
      setUri(result.assets[0].uri);
    }
  };

  const goToReview = (imageUri: string, analysis: ClothingAnalysisResult | null) => {
    setPendingClothingReview({ imageUri, analysis });
    router.push('/clothing/review-analysis');
  };

  const continueFlow = async () => {
    if (!uri && !skipAi) {
      showAlert('Add a photo', 'Take or upload a clothing photo, or skip AI and enter details.');
      return;
    }
    setLoading(true);
    try {
      let analysis: ClothingAnalysisResult | null = null;
      if (uri && !skipAi) {
        analysis = await analyzeClothing(uri);
      }
      goToReview(uri ?? '', analysis);
    } catch (e) {
      showAlert(
        'Analysis unavailable',
        e instanceof Error
          ? `${e.message} You can still enter details manually.`
          : 'Continue manually.'
      );
      goToReview(uri ?? '', null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenShell scroll contentStyle={{ gap: 12 }}>
      {Platform.OS === 'web' ? null : <Button title="Back" variant="ghost" onPress={() => router.back()} />}
      <Text style={[styles.title, { color: theme.ink }]}>Photograph clothing</Text>
      <Text style={[styles.sub, { color: theme.inkMuted }]}>
        Laid flat or hanging, plain background, good lighting, fully visible — without other clothes overlapping.
      </Text>

      {uri ? (
        <Image source={{ uri }} style={styles.preview} accessibilityLabel="Selected clothing photo" />
      ) : (
        <View style={[styles.placeholder, { borderColor: theme.border, backgroundColor: theme.bgElevated }]}>
          <Text style={{ color: theme.inkSoft, ...typography.body, textAlign: 'center' }}>No photo yet</Text>
        </View>
      )}

      <View style={styles.actions}>
        {Platform.OS === 'web' ? (
          <Button title="Upload a photo" onPress={() => pick(false)} />
        ) : (
          <Button title="Take photo" onPress={() => pick(true)} />
        )}
        {Platform.OS === 'web' ? (
          <Button title="Use camera" variant="secondary" onPress={() => pick(true)} />
        ) : (
          <Button title="Upload photo" variant="secondary" onPress={() => pick(false)} />
        )}
        {uri ? (
          <Button title="Retake / choose another" variant="ghost" onPress={() => setUri(null)} />
        ) : null}
        <Button
          title={skipAi ? 'AI analysis off' : 'Skip AI analysis'}
          variant="ghost"
          onPress={() => setSkipAi((v) => !v)}
        />
        <Button title="Continue" loading={loading} onPress={continueFlow} />
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.hero },
  sub: { ...typography.body },
  preview: { width: '100%', height: 360, borderRadius: 20, maxWidth: 480 },
  placeholder: {
    height: 280,
    maxWidth: 480,
    borderRadius: 20,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  actions: { gap: 10, marginTop: 8, maxWidth: 420 },
});
