import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type {
  ClothingItem,
  ItemPairing,
  MirrorCheck,
  Outfit,
  OutfitRole,
  Profile,
  RecommendationContext,
  UserPreferences,
  WearHistory,
  PlannedOutfit,
} from '@/types';
import {
  createDemoPreferences,
  createDemoProfile,
  createEmptyStore,
  createSeedWardrobe,
} from '@/services/storage/demo-data';
import { generateRecommendations } from '@/services/recommendations';
import { applyReplacementLearning } from '@/services/recommendations/scorer';
import { createClothingAnalysisProvider } from '@/services/ai/clothing-analysis';
import { createMirrorAnalysisProvider } from '@/services/ai/mirror-analysis';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { invokeEdgeFunction } from '@/lib/supabase/functions';
import { CATEGORY_TO_DEFAULT_ROLE } from '@/constants';
import type { ClothingAnalysisResult } from '@/lib/validation/ai-schemas';
import type { MirrorAnalysisResult } from '@/lib/validation/ai-schemas';

function uid(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

interface AppState {
  hydrated: boolean;
  sessionEmail: string | null;
  lastSignedInEmail: string | null;
  profile: Profile | null;
  preferences: UserPreferences | null;
  clothingItems: ClothingItem[];
  outfits: Outfit[];
  pairings: ItemPairing[];
  wearHistory: WearHistory[];
  mirrorChecks: MirrorCheck[];
  plannedOutfits: PlannedOutfit[];
  lastRecommendations: ReturnType<typeof generateRecommendations>;
  pendingClothingReview: {
    imageUri: string;
    analysis: ClothingAnalysisResult | null;
  } | null;

  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  clearLocalAccount: () => void;
  setPendingClothingReview: (
    review: AppState['pendingClothingReview']
  ) => void;
  completeOnboarding: (prefs: Partial<UserPreferences> & { display_name?: string; location_name?: string; preferred_temperature_unit?: 'f' | 'c'; latitude?: number | null; longitude?: number | null }) => void;
  loadDemoWardrobe: () => void;

  addClothingItem: (item: Partial<ClothingItem> & Pick<ClothingItem, 'name' | 'category' | 'subcategory' | 'primary_color'>) => ClothingItem;
  updateClothingItem: (id: string, patch: Partial<ClothingItem>) => void;
  deleteClothingItem: (id: string) => void;
  setAvailability: (id: string, status: ClothingItem['availability_status']) => void;

  analyzeClothing: (imageUri: string) => Promise<ClothingAnalysisResult>;

  saveOutfit: (input: {
    name: string;
    itemIds: string[];
    roles?: OutfitRole[];
    occasion?: string;
    status?: Outfit['status'];
  }) => Outfit;
  markOutfitWorn: (outfitId: string, opts?: { rating?: number; occasion?: string; dirtyItemIds?: string[] }) => void;

  generateTodayRecommendations: (context: RecommendationContext) => ReturnType<typeof generateRecommendations>;
  replaceRecommendationItem: (keptItemIds: string[], originalId: string, replacementId: string) => void;
  recordFeedback: (type: 'accepted' | 'rejected' | 'never_suggest', itemIds: string[]) => void;

  runMirrorCheck: (input: {
    outfitId?: string;
    imageUri: string;
    occasion?: string;
  }) => Promise<{ mirror: MirrorCheck; analysis: MirrorAnalysisResult }>;
  respondToMirrorCheck: (id: string, agreement: 'agree' | 'disagree' | 'neutral', rating?: number) => void;
  deleteMirrorPhoto: (id: string) => void;

  planOutfit: (outfitId: string, date: string, occasion?: string) => PlannedOutfit;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...createEmptyStore(),
      hydrated: false,
      lastSignedInEmail: null,
      lastRecommendations: [],
      pendingClothingReview: null,

      signUp: async (email, _password, displayName) => {
        const previous = get().lastSignedInEmail;
        const userId = uid('user');
        const next = {
          sessionEmail: email,
          lastSignedInEmail: email,
          profile: createDemoProfile(userId, displayName),
          preferences: createDemoPreferences(userId),
        };
        if (previous && previous !== email) {
          set({
            ...createEmptyStore(),
            ...next,
            hydrated: true,
          });
          return;
        }
        set(next);
      },

      signIn: async (email) => {
        const existing = get().profile;
        const lastEmail = get().lastSignedInEmail ?? get().sessionEmail;
        if (existing && (!lastEmail || lastEmail === email)) {
          set({ sessionEmail: email, lastSignedInEmail: email });
          return;
        }
        const userId = uid('user');
        const profile = createDemoProfile(userId, email.split('@')[0] ?? 'You');
        profile.onboarding_completed = true;
        const next = {
          sessionEmail: email,
          lastSignedInEmail: email,
          profile,
          preferences: createDemoPreferences(userId),
        };
        if (lastEmail && lastEmail !== email) {
          set({
            ...createEmptyStore(),
            ...next,
            hydrated: true,
          });
          return;
        }
        set(next);
      },

      signOut: async () => {
        set({
          sessionEmail: null,
        });
      },

      clearLocalAccount: () => {
        set({
          ...createEmptyStore(),
          hydrated: true,
          lastSignedInEmail: null,
          lastRecommendations: [],
          pendingClothingReview: null,
        });
      },

      setPendingClothingReview: (review) => {
        set({ pendingClothingReview: review });
      },

      completeOnboarding: (prefs) => {
        const { profile, preferences } = get();
        if (!profile || !preferences) return;
        set({
          profile: {
            ...profile,
            display_name: prefs.display_name ?? profile.display_name,
            location_name: prefs.location_name ?? profile.location_name,
            latitude: prefs.latitude ?? profile.latitude,
            longitude: prefs.longitude ?? profile.longitude,
            preferred_temperature_unit:
              prefs.preferred_temperature_unit ?? profile.preferred_temperature_unit,
            onboarding_completed: true,
            updated_at: new Date().toISOString(),
          },
          preferences: {
            ...preferences,
            ...prefs,
            updated_at: new Date().toISOString(),
          },
        });
      },

      loadDemoWardrobe: () => {
        const profile = get().profile;
        if (!profile) return;
        const seed = createSeedWardrobe(profile.id);
        set({
          clothingItems: seed.clothingItems,
          outfits: seed.outfits,
          pairings: seed.pairings,
          wearHistory: seed.wearHistory,
        });
      },

      addClothingItem: (partial) => {
        const profile = get().profile;
        if (!profile) throw new Error('Not signed in');
        const now = new Date().toISOString();
        const newItem: ClothingItem = {
          id: uid('cloth'),
          user_id: profile.id,
          description: null,
          custom_category: null,
          secondary_colors: [],
          accent_colors: [],
          pattern: null,
          material: null,
          texture: null,
          brand: null,
          model_name: null,
          sku: null,
          barcode: null,
          size: null,
          fit: null,
          length: null,
          sleeve_length: null,
          rise: null,
          cut: null,
          silhouette: null,
          stretch_level: null,
          layering_role: null,
          style_tags: [],
          season_tags: [],
          occasion_tags: [],
          weather_suitability: [],
          activity_suitability: [],
          warmth_score: 3,
          formality_score: 2,
          comfort_score: null,
          condition: 'good',
          availability_status: 'available',
          favorite: false,
          never_worn: true,
          purchase_date: null,
          price_paid: null,
          retail_price: null,
          estimated_value: null,
          store_name: null,
          gift_status: false,
          warranty: null,
          closet_location_id: null,
          notes: null,
          last_worn_at: null,
          wear_count: 0,
          wash_count: 0,
          last_washed_at: null,
          average_rating: null,
          ai_metadata: {},
          ai_confidence: {},
          user_corrected_fields: [],
          needs_review_fields: [],
          archived_at: null,
          created_at: now,
          updated_at: now,
          primary_image_url: null,
          ...partial,
        };
        set({ clothingItems: [newItem, ...get().clothingItems] });
        return newItem;
      },

      updateClothingItem: (id, patch) => {
        set({
          clothingItems: get().clothingItems.map((c) =>
            c.id === id ? { ...c, ...patch, updated_at: new Date().toISOString() } : c
          ),
        });
      },

      deleteClothingItem: (id) => {
        set({
          clothingItems: get().clothingItems.filter((c) => c.id !== id),
          outfits: get().outfits.map((outfit) => ({
            ...outfit,
            items: outfit.items?.filter((item) => item.clothing_item_id !== id) ?? [],
          })),
          pairings: get().pairings.filter((p) => p.item_a_id !== id && p.item_b_id !== id),
        });
      },

      setAvailability: (id, status) => {
        const current = get().clothingItems.find((c) => c.id === id);
        const wasLaundry =
          current &&
          ['dirty', 'in_laundry', 'drying'].includes(current.availability_status);
        const now = new Date().toISOString();
        get().updateClothingItem(id, {
          availability_status: status,
          ...(status === 'available' && wasLaundry
            ? { wash_count: (current?.wash_count ?? 0) + 1, last_washed_at: now }
            : {}),
        });
      },

      analyzeClothing: async (imageUri) => {
        const allowCloud = get().preferences?.allow_cloud_image_processing !== false;
        const provider = createClothingAnalysisProvider(
          allowCloud && isSupabaseConfigured ? invokeEdgeFunction : undefined
        );
        return provider.analyzeClothingImage({ imageUri });
      },

      saveOutfit: ({ name, itemIds, roles, occasion, status }) => {
        const profile = get().profile;
        if (!profile) throw new Error('Not signed in');
        const now = new Date().toISOString();
        const id = uid('outfit');
        const items = itemIds.map((cid, idx) => {
          const clothing = get().clothingItems.find((c) => c.id === cid);
          const role =
            roles?.[idx] ??
            (clothing ? CATEGORY_TO_DEFAULT_ROLE[clothing.category] : 'other_accessory');
          return {
            id: uid('oi'),
            outfit_id: id,
            clothing_item_id: cid,
            role,
            layer_order: idx,
            is_optional: false,
            alternative_group: null,
            created_at: now,
            clothing_item: clothing,
          };
        });

        const outfit: Outfit = {
          id,
          user_id: profile.id,
          name,
          description: null,
          occasion: occasion ?? null,
          style_tags: [],
          season: null,
          formality_score: null,
          warmth_score: null,
          temperature_min: null,
          temperature_max: null,
          weather_conditions: [],
          favorite: false,
          status: status ?? 'saved',
          rating: null,
          comfort_rating: null,
          times_worn: 0,
          last_worn_at: null,
          ai_generated: false,
          recommendation_explanation: {},
          archived_at: null,
          created_at: now,
          updated_at: now,
          items,
        };

        // Update saved-together pairings
        let pairings = [...get().pairings];
        for (let i = 0; i < itemIds.length; i++) {
          for (let j = i + 1; j < itemIds.length; j++) {
            const [a, b] = itemIds[i] < itemIds[j] ? [itemIds[i], itemIds[j]] : [itemIds[j], itemIds[i]];
            const idx = pairings.findIndex((p) => p.item_a_id === a && p.item_b_id === b);
            if (idx >= 0) {
              pairings[idx] = {
                ...pairings[idx],
                saved_together_count: pairings[idx].saved_together_count + 1,
                pairing_score: Math.min(1, pairings[idx].pairing_score + 0.04),
              };
            } else {
              pairings.push({
                id: uid('pair'),
                user_id: profile.id,
                item_a_id: a,
                item_b_id: b,
                worn_together_count: 0,
                saved_together_count: 1,
                accepted_count: 0,
                rejected_count: 0,
                replacement_count: 0,
                average_rating: null,
                mirror_positive_count: 0,
                mirror_negative_count: 0,
                pairing_score: 0.54,
                last_calculated_at: now,
                created_at: now,
                updated_at: now,
              });
            }
          }
        }

        set({ outfits: [outfit, ...get().outfits], pairings });
        return outfit;
      },

      markOutfitWorn: (outfitId, opts) => {
        const outfit = get().outfits.find((o) => o.id === outfitId);
        const profile = get().profile;
        if (!outfit || !profile) return;
        const now = new Date().toISOString();
        const itemIds = outfit.items?.map((i) => i.clothing_item_id) ?? [];

        const dirtySet = new Set(opts?.dirtyItemIds ?? []);
        const clothingItems = get().clothingItems.map((c) => {
          if (!itemIds.includes(c.id)) return c;
          const markDirty =
            dirtySet.has(c.id) ||
            (dirtySet.size === 0 && (c.category === 'top' || c.category === 'one_piece'));
          return {
            ...c,
            wear_count: c.wear_count + 1,
            last_worn_at: now,
            never_worn: false,
            availability_status: markDirty ? 'dirty' : c.availability_status,
          };
        });

        let pairings = [...get().pairings];
        for (let i = 0; i < itemIds.length; i++) {
          for (let j = i + 1; j < itemIds.length; j++) {
            const [a, b] = itemIds[i] < itemIds[j] ? [itemIds[i], itemIds[j]] : [itemIds[j], itemIds[i]];
            const idx = pairings.findIndex((p) => p.item_a_id === a && p.item_b_id === b);
            if (idx >= 0) {
              const p = pairings[idx];
              pairings[idx] = {
                ...p,
                worn_together_count: p.worn_together_count + 1,
                average_rating: opts?.rating ?? p.average_rating,
                pairing_score: Math.min(1, p.pairing_score + 0.06),
              };
            }
          }
        }

        const wear: WearHistory = {
          id: uid('wh'),
          user_id: profile.id,
          outfit_id: outfitId,
          worn_at: now,
          occasion: opts?.occasion ?? outfit.occasion,
          temperature: null,
          feels_like: null,
          weather_condition: null,
          location_context: null,
          rating: opts?.rating ?? null,
          comfort_rating: null,
          too_warm: null,
          too_cold: null,
          too_formal: null,
          too_casual: null,
          would_wear_again: null,
          notes: null,
          was_recommended: false,
          recommendation_changed: false,
          mirror_check_used: false,
          created_at: now,
        };

        set({
          clothingItems,
          pairings,
          wearHistory: [wear, ...get().wearHistory],
          outfits: get().outfits.map((o) =>
            o.id === outfitId
              ? {
                  ...o,
                  times_worn: o.times_worn + 1,
                  last_worn_at: now,
                  status: 'worn',
                  rating: opts?.rating ?? o.rating,
                }
              : o
          ),
        });
      },

      generateTodayRecommendations: (context) => {
        const recs = generateRecommendations({
          clothingItems: get().clothingItems,
          preferences: get().preferences,
          pairings: get().pairings,
          savedOutfits: get().outfits.filter((o) => o.status !== 'rejected'),
          context,
          historyCount: get().wearHistory.length + get().outfits.length,
        });
        set({ lastRecommendations: recs });
        return recs;
      },

      replaceRecommendationItem: (keptItemIds, originalId, replacementId) => {
        const profile = get().profile;
        if (!profile) return;
        const pairings = applyReplacementLearning(
          get().pairings,
          keptItemIds,
          originalId,
          replacementId,
          profile.id
        );
        set({ pairings });
      },

      recordFeedback: (type, itemIds) => {
        const profile = get().profile;
        if (!profile || itemIds.length < 2) return;
        let pairings = [...get().pairings];
        const now = new Date().toISOString();
        for (let i = 0; i < itemIds.length; i++) {
          for (let j = i + 1; j < itemIds.length; j++) {
            const [a, b] = itemIds[i] < itemIds[j] ? [itemIds[i], itemIds[j]] : [itemIds[j], itemIds[i]];
            const idx = pairings.findIndex((p) => p.item_a_id === a && p.item_b_id === b);
            const delta =
              type === 'accepted' ? 0.08 : type === 'rejected' ? -0.12 : -0.2;
            if (idx >= 0) {
              const p = pairings[idx];
              pairings[idx] = {
                ...p,
                accepted_count: type === 'accepted' ? p.accepted_count + 1 : p.accepted_count,
                rejected_count: type !== 'accepted' ? p.rejected_count + 1 : p.rejected_count,
                pairing_score: Math.max(0, Math.min(1, p.pairing_score + delta)),
                updated_at: now,
              };
            }
          }
        }
        set({ pairings });
      },

      runMirrorCheck: async ({ outfitId, imageUri, occasion }) => {
        const profile = get().profile;
        if (!profile) throw new Error('Not signed in');
        const allowCloud = get().preferences?.allow_cloud_image_processing !== false;
        const provider = createMirrorAnalysisProvider(
          allowCloud && isSupabaseConfigured ? invokeEdgeFunction : undefined
        );
        const analysis = await provider.analyzeMirrorCheck({
          imageUri,
          occasion,
        });
        const retention = get().preferences?.mirror_photo_retention ?? 'delete_after_analysis';
        const now = new Date().toISOString();
        const mirror: MirrorCheck = {
          id: uid('mirror'),
          user_id: profile.id,
          outfit_id: outfitId ?? null,
          wear_history_id: null,
          original_image_path: retention === 'delete_after_analysis' ? null : imageUri,
          processed_image_path: null,
          retention_policy: retention,
          overall_score: analysis.scores.overall,
          color_score: analysis.scores.color_coordination,
          style_score: analysis.scores.style_cohesion,
          proportion_score: analysis.scores.fit_and_proportion,
          occasion_score: analysis.scores.occasion_match,
          weather_score: analysis.scores.weather_suitability,
          confidence: analysis.confidence,
          positive_observations: analysis.positive_observations,
          suggested_changes: analysis.suggested_changes,
          suggested_replacements: analysis.suggested_item_roles_to_replace,
          image_quality: analysis.image_quality,
          user_agreement: null,
          user_rating: null,
          worn_after: null,
          photo_deleted_at: retention === 'delete_after_analysis' ? now : null,
          created_at: now,
          updated_at: now,
        };
        set({ mirrorChecks: [mirror, ...get().mirrorChecks] });
        return { mirror, analysis };
      },

      respondToMirrorCheck: (id, agreement, rating) => {
        const mirror = get().mirrorChecks.find((m) => m.id === id);
        if (!mirror) return;

        // Only influence recommendations when user confirms
        if (agreement === 'agree' && mirror.outfit_id) {
          const outfit = get().outfits.find((o) => o.id === mirror.outfit_id);
          const itemIds = outfit?.items?.map((i) => i.clothing_item_id) ?? [];
          let pairings = [...get().pairings];
          for (let i = 0; i < itemIds.length; i++) {
            for (let j = i + 1; j < itemIds.length; j++) {
              const [a, b] =
                itemIds[i] < itemIds[j] ? [itemIds[i], itemIds[j]] : [itemIds[j], itemIds[i]];
              const idx = pairings.findIndex((p) => p.item_a_id === a && p.item_b_id === b);
              if (idx >= 0) {
                pairings[idx] = {
                  ...pairings[idx],
                  mirror_positive_count: pairings[idx].mirror_positive_count + 1,
                  pairing_score: Math.min(1, pairings[idx].pairing_score + 0.05),
                };
              }
            }
          }
          set({ pairings });
        } else if (agreement === 'disagree' && mirror.outfit_id) {
          const outfit = get().outfits.find((o) => o.id === mirror.outfit_id);
          const itemIds = outfit?.items?.map((i) => i.clothing_item_id) ?? [];
          let pairings = [...get().pairings];
          for (let i = 0; i < itemIds.length; i++) {
            for (let j = i + 1; j < itemIds.length; j++) {
              const [a, b] =
                itemIds[i] < itemIds[j] ? [itemIds[i], itemIds[j]] : [itemIds[j], itemIds[i]];
              const idx = pairings.findIndex((p) => p.item_a_id === a && p.item_b_id === b);
              if (idx >= 0) {
                pairings[idx] = {
                  ...pairings[idx],
                  mirror_negative_count: pairings[idx].mirror_negative_count + 1,
                  pairing_score: Math.max(0, pairings[idx].pairing_score - 0.04),
                };
              }
            }
          }
          set({ pairings });
        }

        set({
          mirrorChecks: get().mirrorChecks.map((m) =>
            m.id === id
              ? {
                  ...m,
                  user_agreement: agreement,
                  user_rating: rating ?? m.user_rating,
                  updated_at: new Date().toISOString(),
                }
              : m
          ),
        });
      },

      deleteMirrorPhoto: (id) => {
        set({
          mirrorChecks: get().mirrorChecks.map((m) =>
            m.id === id
              ? {
                  ...m,
                  original_image_path: null,
                  processed_image_path: null,
                  photo_deleted_at: new Date().toISOString(),
                }
              : m
          ),
        });
      },

      planOutfit: (outfitId, date, occasion) => {
        const profile = get().profile;
        if (!profile) throw new Error('Not signed in');
        const planned: PlannedOutfit = {
          id: uid('plan'),
          user_id: profile.id,
          outfit_id: outfitId,
          planned_date: date,
          occasion: occasion ?? null,
          reminder_enabled: false,
          reminder_time: null,
          notes: null,
          status: 'planned',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        set({ plannedOutfits: [planned, ...get().plannedOutfits] });
        return planned;
      },
    }),
    {
      name: 'closetmatch-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        sessionEmail: state.sessionEmail,
        lastSignedInEmail: state.lastSignedInEmail,
        profile: state.profile,
        preferences: state.preferences,
        clothingItems: state.clothingItems,
        outfits: state.outfits,
        pairings: state.pairings,
        wearHistory: state.wearHistory,
        mirrorChecks: state.mirrorChecks,
        plannedOutfits: state.plannedOutfits,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.hydrated = true;
          if (!state.lastSignedInEmail && state.sessionEmail) {
            state.lastSignedInEmail = state.sessionEmail;
          }
        }
      },
    }
  )
);
