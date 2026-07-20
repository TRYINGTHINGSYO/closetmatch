import type {
  ClothingItem,
  ItemPairing,
  MirrorCheck,
  Outfit,
  OutfitItemWithClothing,
  Profile,
  Recommendation,
  UserPreferences,
  WearHistory,
  PlannedOutfit,
} from '@/types';

/** In-memory / AsyncStorage-backed demo repository for offline & unset Supabase */
export interface ClosetMatchStore {
  profile: Profile | null;
  preferences: UserPreferences | null;
  clothingItems: ClothingItem[];
  outfits: Outfit[];
  pairings: ItemPairing[];
  wearHistory: WearHistory[];
  recommendations: Recommendation[];
  mirrorChecks: MirrorCheck[];
  plannedOutfits: PlannedOutfit[];
  sessionEmail: string | null;
}

export function createEmptyStore(): ClosetMatchStore {
  return {
    profile: null,
    preferences: null,
    clothingItems: [],
    outfits: [],
    pairings: [],
    wearHistory: [],
    recommendations: [],
    mirrorChecks: [],
    plannedOutfits: [],
    sessionEmail: null,
  };
}

export function createDemoPreferences(userId: string): UserPreferences {
  const now = new Date().toISOString();
  return {
    id: `pref-${userId}`,
    user_id: userId,
    preferred_styles: ['Casual', 'Streetwear', 'Relaxed'],
    preferred_colors: ['black', 'gray', 'white', 'navy', 'blue'],
    avoided_colors: ['neon green'],
    preferred_fits: ['Regular', 'Relaxed'],
    preferred_formality_min: 1,
    preferred_formality_max: 4,
    comfort_priority: 4,
    desired_variety: 3,
    preferred_contrast: 'medium',
    weather_enabled: true,
    notifications_enabled: false,
    daily_outfit_suggestions: false,
    laundry_reminders: false,
    planned_outfit_reminders: false,
    underused_item_suggestions: true,
    repeat_outfit_warnings: false,
    temperature_sensitivity: -1,
    mirror_check_enabled: true,
    mirror_photo_retention: 'delete_after_analysis',
    save_analysis_only: false,
    save_clothing_photos: true,
    allow_cloud_image_processing: true,
    allow_local_processing: true,
    analytics_enabled: false,
    never_use_images_for_training: true,
    recommendation_mode: 'balanced',
    created_at: now,
    updated_at: now,
  };
}

export function createDemoProfile(userId: string, displayName: string): Profile {
  const now = new Date().toISOString();
  return {
    id: userId,
    display_name: displayName,
    avatar_url: null,
    location_name: 'Austin, TX',
    latitude: 30.27,
    longitude: -97.74,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Chicago',
    preferred_temperature_unit: 'f',
    onboarding_completed: false,
    role: 'user',
    created_at: now,
    updated_at: now,
  };
}

function item(
  partial: Partial<ClothingItem> &
    Pick<ClothingItem, 'id' | 'user_id' | 'name' | 'category' | 'subcategory' | 'primary_color'>
): ClothingItem {
  const now = new Date().toISOString();
  return {
    description: null,
    custom_category: null,
    secondary_colors: [],
    accent_colors: [],
    pattern: 'solid',
    material: null,
    texture: null,
    brand: null,
    model_name: null,
    sku: null,
    barcode: null,
    size: null,
    fit: 'regular',
    length: null,
    sleeve_length: null,
    rise: null,
    cut: null,
    silhouette: null,
    stretch_level: null,
    layering_role: null,
    style_tags: ['casual'],
    season_tags: ['all'],
    occasion_tags: ['everyday'],
    weather_suitability: [],
    activity_suitability: [],
    warmth_score: 3,
    formality_score: 2,
    comfort_score: 4,
    condition: 'good',
    availability_status: 'available',
    favorite: false,
    never_worn: false,
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
}

/** Seed wardrobe matching PRODUCT_SPEC seed requirements */
export function createSeedWardrobe(userId: string): {
  clothingItems: ClothingItem[];
  outfits: Outfit[];
  pairings: ItemPairing[];
  wearHistory: WearHistory[];
} {
  const now = new Date().toISOString();
  const daysAgo = (n: number) => new Date(Date.now() - n * 86400000).toISOString();

  const clothingItems: ClothingItem[] = [
    item({
      id: 'c-tee-white',
      user_id: userId,
      name: 'White crew tee',
      category: 'top',
      subcategory: 'T-shirt',
      primary_color: 'white',
      warmth_score: 1,
      formality_score: 1,
      wear_count: 12,
      last_worn_at: daysAgo(2),
      price_paid: 18,
      favorite: true,
    }),
    item({
      id: 'c-tee-navy',
      user_id: userId,
      name: 'Navy tee',
      category: 'top',
      subcategory: 'T-shirt',
      primary_color: 'navy',
      warmth_score: 1,
      formality_score: 1,
      wear_count: 8,
      last_worn_at: daysAgo(5),
      price_paid: 22,
    }),
    item({
      id: 'c-shirt-blue',
      user_id: userId,
      name: 'Light blue button-up',
      category: 'top',
      subcategory: 'Button-up shirt',
      primary_color: 'light blue',
      style_tags: ['business casual', 'casual'],
      warmth_score: 2,
      formality_score: 3,
      wear_count: 4,
      last_worn_at: daysAgo(10),
      price_paid: 45,
      occasion_tags: ['work', 'dinner', 'everyday'],
    }),
    item({
      id: 'c-hoodie-black',
      user_id: userId,
      name: 'Black hoodie',
      category: 'top',
      subcategory: 'Hoodie',
      primary_color: 'black',
      fit: 'oversized',
      style_tags: ['casual', 'streetwear'],
      warmth_score: 4,
      formality_score: 1,
      wear_count: 15,
      last_worn_at: daysAgo(1),
      price_paid: 60,
      favorite: true,
      average_rating: 4.8,
    }),
    item({
      id: 'c-hoodie-gray',
      user_id: userId,
      name: 'Gray hoodie',
      category: 'top',
      subcategory: 'Hoodie',
      primary_color: 'gray',
      style_tags: ['casual', 'streetwear'],
      warmth_score: 4,
      formality_score: 1,
      wear_count: 6,
      last_worn_at: daysAgo(8),
      price_paid: 55,
      never_worn: false,
    }),
    item({
      id: 'c-jeans-dark',
      user_id: userId,
      name: 'Dark jeans',
      category: 'bottom',
      subcategory: 'Jeans',
      primary_color: 'navy',
      style_tags: ['casual'],
      warmth_score: 3,
      formality_score: 2,
      wear_count: 20,
      last_worn_at: daysAgo(1),
      price_paid: 80,
      favorite: true,
      average_rating: 4.7,
    }),
    item({
      id: 'c-chinos-khaki',
      user_id: userId,
      name: 'Khaki chinos',
      category: 'bottom',
      subcategory: 'Chinos',
      primary_color: 'beige',
      style_tags: ['business casual'],
      warmth_score: 2,
      formality_score: 3,
      wear_count: 5,
      last_worn_at: daysAgo(12),
      price_paid: 70,
      occasion_tags: ['work', 'everyday'],
    }),
    item({
      id: 'c-joggers-black',
      user_id: userId,
      name: 'Black joggers',
      category: 'bottom',
      subcategory: 'Joggers',
      primary_color: 'black',
      style_tags: ['athletic', 'casual'],
      warmth_score: 2,
      formality_score: 1,
      wear_count: 9,
      last_worn_at: daysAgo(3),
      price_paid: 40,
      availability_status: 'dirty',
    }),
    item({
      id: 'c-sneakers-white',
      user_id: userId,
      name: 'White sneakers',
      category: 'shoes',
      subcategory: 'Sneakers',
      primary_color: 'white',
      style_tags: ['casual', 'streetwear'],
      warmth_score: 2,
      formality_score: 1,
      wear_count: 25,
      last_worn_at: daysAgo(1),
      price_paid: 90,
      favorite: true,
      average_rating: 5,
    }),
    item({
      id: 'c-boots-black',
      user_id: userId,
      name: 'Black boots',
      category: 'shoes',
      subcategory: 'Boots',
      primary_color: 'black',
      style_tags: ['casual'],
      warmth_score: 4,
      formality_score: 3,
      wear_count: 3,
      last_worn_at: daysAgo(20),
      price_paid: 120,
    }),
    item({
      id: 'c-loafers-brown',
      user_id: userId,
      name: 'Brown loafers',
      category: 'shoes',
      subcategory: 'Loafers',
      primary_color: 'brown',
      style_tags: ['business casual'],
      warmth_score: 2,
      formality_score: 4,
      wear_count: 2,
      last_worn_at: daysAgo(30),
      price_paid: 110,
      occasion_tags: ['work', 'dinner'],
    }),
    item({
      id: 'c-jacket-denim',
      user_id: userId,
      name: 'Denim jacket',
      category: 'outerwear',
      subcategory: 'Denim jacket',
      primary_color: 'blue',
      warmth_score: 3,
      formality_score: 2,
      wear_count: 7,
      last_worn_at: daysAgo(6),
      price_paid: 95,
    }),
    item({
      id: 'c-jacket-black',
      user_id: userId,
      name: 'Black light jacket',
      category: 'outerwear',
      subcategory: 'Jacket',
      primary_color: 'black',
      warmth_score: 3,
      formality_score: 2,
      wear_count: 4,
      last_worn_at: daysAgo(15),
      price_paid: 85,
      weather_suitability: ['wind', 'cool'],
    }),
    item({
      id: 'c-cap-black',
      user_id: userId,
      name: 'Black baseball cap',
      category: 'accessory',
      subcategory: 'Baseball cap',
      primary_color: 'black',
      warmth_score: 1,
      formality_score: 1,
      wear_count: 10,
      last_worn_at: daysAgo(4),
      price_paid: 25,
    }),
    item({
      id: 'c-watch-silver',
      user_id: userId,
      name: 'Silver watch',
      category: 'accessory',
      subcategory: 'Watch',
      primary_color: 'silver',
      warmth_score: 1,
      formality_score: 3,
      wear_count: 14,
      last_worn_at: daysAgo(2),
      price_paid: 150,
    }),
  ];

  const makeOutfit = (
    id: string,
    name: string,
    itemIds: string[],
    roles: string[],
    extras: Partial<Outfit> = {}
  ): Outfit => {
    const items: OutfitItemWithClothing[] = itemIds.map((cid, idx) => ({
      id: `${id}-oi-${idx}`,
      outfit_id: id,
      clothing_item_id: cid,
      role: roles[idx] as OutfitItemWithClothing['role'],
      layer_order: idx,
      is_optional: false,
      alternative_group: null,
      created_at: now,
      clothing_item: clothingItems.find((c) => c.id === cid),
    }));
    return {
      id,
      user_id: userId,
      name,
      description: null,
      occasion: 'Everyday',
      style_tags: ['casual'],
      season: null,
      formality_score: 2,
      warmth_score: 3,
      temperature_min: 50,
      temperature_max: 70,
      weather_conditions: [],
      favorite: false,
      status: 'saved',
      rating: 4.5,
      comfort_rating: 4,
      times_worn: 3,
      last_worn_at: daysAgo(3),
      ai_generated: false,
      recommendation_explanation: {},
      archived_at: null,
      created_at: now,
      updated_at: now,
      items,
      ...extras,
    };
  };

  const outfits: Outfit[] = [
    makeOutfit(
      'o-everyday',
      'Everyday hoodie fit',
      ['c-hoodie-black', 'c-jeans-dark', 'c-sneakers-white'],
      ['top', 'bottom', 'shoes'],
      { favorite: true, rating: 5, times_worn: 8, last_worn_at: daysAgo(1) }
    ),
    makeOutfit(
      'o-work',
      'Work casual',
      ['c-shirt-blue', 'c-chinos-khaki', 'c-loafers-brown'],
      ['top', 'bottom', 'shoes'],
      { occasion: 'Work', formality_score: 3, rating: 4 }
    ),
    makeOutfit(
      'o-weekend',
      'Weekend tee',
      ['c-tee-white', 'c-jeans-dark', 'c-sneakers-white'],
      ['top', 'bottom', 'shoes'],
      { rating: 4.5 }
    ),
    makeOutfit(
      'o-cool',
      'Cool evening',
      ['c-hoodie-gray', 'c-jeans-dark', 'c-boots-black', 'c-jacket-denim'],
      ['top', 'bottom', 'shoes', 'outerwear'],
      { warmth_score: 4, rating: 4 }
    ),
    makeOutfit(
      'o-navy',
      'Navy casual',
      ['c-tee-navy', 'c-jeans-dark', 'c-sneakers-white', 'c-cap-black'],
      ['top', 'bottom', 'shoes', 'head_accessory'],
      { rating: 4.2 }
    ),
  ];

  const pair = (
    a: string,
    b: string,
    score: number,
    worn: number,
    extras: Partial<ItemPairing> = {}
  ): ItemPairing => {
    const [item_a_id, item_b_id] = a < b ? [a, b] : [b, a];
    return {
      id: `pair-${item_a_id}-${item_b_id}`,
      user_id: userId,
      item_a_id,
      item_b_id,
      worn_together_count: worn,
      saved_together_count: Math.max(1, Math.floor(worn / 2)),
      accepted_count: Math.max(0, worn - 1),
      rejected_count: 0,
      replacement_count: 0,
      average_rating: 4.5,
      mirror_positive_count: Math.floor(worn / 2),
      mirror_negative_count: 0,
      pairing_score: score,
      last_calculated_at: now,
      created_at: now,
      updated_at: now,
      ...extras,
    };
  };

  const pairings: ItemPairing[] = [
    pair('c-hoodie-black', 'c-jeans-dark', 0.94, 8),
    pair('c-hoodie-black', 'c-sneakers-white', 0.92, 8),
    pair('c-jeans-dark', 'c-sneakers-white', 0.9, 10),
    pair('c-tee-white', 'c-jeans-dark', 0.85, 6),
    pair('c-shirt-blue', 'c-chinos-khaki', 0.8, 4),
    pair('c-shirt-blue', 'c-loafers-brown', 0.78, 3),
    // Negative pairing example
    pair('c-tee-navy', 'c-boots-black', 0.08, 0, {
      rejected_count: 4,
      replacement_count: 3,
      average_rating: 1.5,
      accepted_count: 0,
      mirror_positive_count: 0,
      mirror_negative_count: 2,
    }),
  ];

  const wearHistory: WearHistory[] = Array.from({ length: 10 }).map((_, i) => ({
    id: `wh-${i}`,
    user_id: userId,
    outfit_id: outfits[i % outfits.length].id,
    worn_at: daysAgo(i + 1),
    occasion: i % 3 === 0 ? 'Work' : 'Everyday',
    temperature: 55 + (i % 5) * 3,
    feels_like: 52 + (i % 5) * 3,
    weather_condition: i % 4 === 0 ? 'Rain' : 'Partly cloudy',
    location_context: 'outdoors',
    rating: 4 + (i % 2) * 0.5,
    comfort_rating: 4,
    too_warm: false,
    too_cold: i === 2,
    too_formal: false,
    too_casual: false,
    would_wear_again: true,
    notes: null,
    was_recommended: i % 3 === 0,
    recommendation_changed: i === 4,
    mirror_check_used: i < 2,
    created_at: daysAgo(i + 1),
  }));

  return { clothingItems, outfits, pairings, wearHistory };
}
