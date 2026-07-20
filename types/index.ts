/** ClosetMatch domain types — mirrored from Supabase schema */

export type TemperatureUnit = 'f' | 'c';
export type UserRole = 'user' | 'stylist' | 'partner' | 'parent' | 'admin' | 'moderator';

export type AvailabilityStatus =
  | 'available'
  | 'dirty'
  | 'in_laundry'
  | 'drying'
  | 'packed'
  | 'borrowed'
  | 'being_repaired'
  | 'missing'
  | 'donated'
  | 'sold'
  | 'archived'
  | 'damaged';

export type OutfitStatus = 'draft' | 'saved' | 'planned' | 'worn' | 'rejected' | 'archived';

export type RecommendationStatus =
  | 'generated'
  | 'viewed'
  | 'accepted'
  | 'modified'
  | 'rejected'
  | 'worn'
  | 'expired';

export type ClothingCategory =
  | 'top'
  | 'bottom'
  | 'one_piece'
  | 'outerwear'
  | 'shoes'
  | 'accessory'
  | 'specialty';

export type OutfitRole =
  | 'head_accessory'
  | 'top'
  | 'undershirt'
  | 'mid_layer'
  | 'outerwear'
  | 'bottom'
  | 'one_piece'
  | 'socks'
  | 'shoes'
  | 'belt'
  | 'watch'
  | 'jewelry'
  | 'bag'
  | 'other_accessory';

export type ImageType =
  | 'original'
  | 'processed'
  | 'alternate'
  | 'brand_label'
  | 'fabric_label'
  | 'receipt';

export type MirrorRetentionPolicy =
  | 'delete_after_analysis'
  | 'save_original'
  | 'save_analysis_only'
  | 'save_reduced'
  | 'save_blurred_preview';

export type RecommendationMode =
  | 'safe'
  | 'familiar'
  | 'balanced'
  | 'experimental'
  | 'max_variety';

export type ContrastPreference = 'low' | 'medium' | 'high' | 'no_preference';

export interface Profile {
  id: string;
  display_name: string;
  avatar_url: string | null;
  location_name: string | null;
  latitude: number | null;
  longitude: number | null;
  timezone: string;
  preferred_temperature_unit: TemperatureUnit;
  onboarding_completed: boolean;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface UserPreferences {
  id: string;
  user_id: string;
  preferred_styles: string[];
  preferred_colors: string[];
  avoided_colors: string[];
  preferred_fits: string[];
  preferred_formality_min: number;
  preferred_formality_max: number;
  comfort_priority: number;
  desired_variety: number;
  preferred_contrast: ContrastPreference;
  weather_enabled: boolean;
  notifications_enabled: boolean;
  daily_outfit_suggestions: boolean;
  laundry_reminders: boolean;
  planned_outfit_reminders: boolean;
  underused_item_suggestions: boolean;
  repeat_outfit_warnings: boolean;
  temperature_sensitivity: number;
  mirror_check_enabled: boolean;
  mirror_photo_retention: MirrorRetentionPolicy;
  save_analysis_only: boolean;
  save_clothing_photos: boolean;
  allow_cloud_image_processing: boolean;
  allow_local_processing: boolean;
  analytics_enabled: boolean;
  never_use_images_for_training: boolean;
  recommendation_mode: RecommendationMode;
  created_at: string;
  updated_at: string;
}

export interface ClosetLocation {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  parent_location_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClothingItem {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  category: ClothingCategory;
  subcategory: string;
  custom_category: string | null;
  primary_color: string;
  secondary_colors: string[];
  accent_colors: string[];
  pattern: string | null;
  material: string | null;
  texture: string | null;
  brand: string | null;
  model_name: string | null;
  sku: string | null;
  barcode: string | null;
  size: string | null;
  fit: string | null;
  length: string | null;
  sleeve_length: string | null;
  rise: string | null;
  cut: string | null;
  silhouette: string | null;
  stretch_level: string | null;
  layering_role: string | null;
  style_tags: string[];
  season_tags: string[];
  occasion_tags: string[];
  weather_suitability: string[];
  activity_suitability: string[];
  warmth_score: number;
  formality_score: number;
  comfort_score: number | null;
  condition: string;
  availability_status: AvailabilityStatus;
  favorite: boolean;
  never_worn: boolean;
  purchase_date: string | null;
  price_paid: number | null;
  retail_price: number | null;
  estimated_value: number | null;
  store_name: string | null;
  gift_status: boolean;
  warranty: string | null;
  closet_location_id: string | null;
  notes: string | null;
  last_worn_at: string | null;
  wear_count: number;
  wash_count: number;
  last_washed_at: string | null;
  average_rating: number | null;
  ai_metadata: Record<string, unknown>;
  ai_confidence: Record<string, number>;
  user_corrected_fields: string[];
  needs_review_fields: string[];
  archived_at: string | null;
  created_at: string;
  updated_at: string;
  primary_image_url?: string | null;
}

export interface ClothingImage {
  id: string;
  user_id: string;
  clothing_item_id: string;
  storage_path: string;
  image_type: ImageType;
  is_primary: boolean;
  width: number | null;
  height: number | null;
  ai_processed: boolean;
  created_at: string;
}

export interface Outfit {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  occasion: string | null;
  style_tags: string[];
  season: string | null;
  formality_score: number | null;
  warmth_score: number | null;
  temperature_min: number | null;
  temperature_max: number | null;
  weather_conditions: string[];
  favorite: boolean;
  status: OutfitStatus;
  rating: number | null;
  comfort_rating: number | null;
  times_worn: number;
  last_worn_at: string | null;
  ai_generated: boolean;
  recommendation_explanation: RecommendationExplanation | Record<string, unknown>;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
  items?: OutfitItemWithClothing[];
}

export interface OutfitItem {
  id: string;
  outfit_id: string;
  clothing_item_id: string;
  role: OutfitRole;
  layer_order: number;
  is_optional: boolean;
  alternative_group: string | null;
  created_at: string;
}

export interface OutfitItemWithClothing extends OutfitItem {
  clothing_item?: ClothingItem;
}

export interface WearHistory {
  id: string;
  user_id: string;
  outfit_id: string | null;
  worn_at: string;
  occasion: string | null;
  temperature: number | null;
  feels_like: number | null;
  weather_condition: string | null;
  location_context: string | null;
  rating: number | null;
  comfort_rating: number | null;
  too_warm: boolean | null;
  too_cold: boolean | null;
  too_formal: boolean | null;
  too_casual: boolean | null;
  would_wear_again: boolean | null;
  notes: string | null;
  was_recommended: boolean;
  recommendation_changed: boolean;
  mirror_check_used: boolean;
  created_at: string;
}

export interface ItemPairing {
  id: string;
  user_id: string;
  item_a_id: string;
  item_b_id: string;
  worn_together_count: number;
  saved_together_count: number;
  accepted_count: number;
  rejected_count: number;
  replacement_count: number;
  average_rating: number | null;
  mirror_positive_count: number;
  mirror_negative_count: number;
  pairing_score: number;
  last_calculated_at: string;
  created_at: string;
  updated_at: string;
}

export interface ScoreBreakdown {
  personal_pairing: number;
  user_ratings: number;
  saved_similarity: number;
  style_compatibility: number;
  color_compatibility: number;
  weather_suitability: number;
  occasion_suitability: number;
  mirror_check_history: number;
  fit_proportion: number;
  comfort_history: number;
  variety_recent_wear: number;
  penalties: number;
}

export interface RecommendationExplanation {
  summary: string;
  reasons: string[];
  score_breakdown?: ScoreBreakdown;
}

export interface Recommendation {
  id: string;
  user_id: string;
  context: RecommendationContext;
  total_score: number;
  score_breakdown: ScoreBreakdown;
  explanation: RecommendationExplanation;
  status: RecommendationStatus;
  created_at: string;
  responded_at: string | null;
  items?: RecommendationItemWithClothing[];
}

export interface RecommendationItem {
  id: string;
  recommendation_id: string;
  clothing_item_id: string;
  role: OutfitRole;
  item_score: number;
  created_at: string;
}

export interface RecommendationItemWithClothing extends RecommendationItem {
  clothing_item?: ClothingItem;
}

export interface RecommendationContext {
  occasion?: string;
  style?: string;
  mode?: RecommendationMode | string;
  desired_formality?: number;
  desired_comfort?: number;
  temperature?: number;
  feels_like?: number;
  rain_probability?: number;
  weather_condition?: string;
  time_outdoors?: 'low' | 'medium' | 'high';
  walking_amount?: 'low' | 'medium' | 'high';
  mood?: string;
  include_unavailable?: boolean;
  seed_item_id?: string;
}

export interface MirrorCheck {
  id: string;
  user_id: string;
  outfit_id: string | null;
  wear_history_id: string | null;
  original_image_path: string | null;
  processed_image_path: string | null;
  retention_policy: MirrorRetentionPolicy;
  overall_score: number | null;
  color_score: number | null;
  style_score: number | null;
  proportion_score: number | null;
  occasion_score: number | null;
  weather_score: number | null;
  confidence: number | null;
  positive_observations: string[];
  suggested_changes: MirrorSuggestedChange[];
  suggested_replacements: string[];
  image_quality: MirrorImageQuality;
  user_agreement: 'agree' | 'disagree' | 'neutral' | null;
  user_rating: number | null;
  worn_after: boolean | null;
  photo_deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface MirrorSuggestedChange {
  priority: number;
  area: string;
  suggestion: string;
  reason: string;
}

export interface MirrorImageQuality {
  usable: boolean;
  issues: string[];
}

export interface PlannedOutfit {
  id: string;
  user_id: string;
  outfit_id: string;
  planned_date: string;
  occasion: string | null;
  reminder_enabled: boolean;
  reminder_time: string | null;
  notes: string | null;
  status: 'planned' | 'worn' | 'skipped' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface UserStyleInsight {
  id: string;
  user_id: string;
  insight_type: string;
  insight_text: string;
  supporting_data: Record<string, unknown>;
  confidence: number;
  user_confirmed: boolean | null;
  created_at: string;
  updated_at: string;
}

export interface WeatherSnapshot {
  temperature: number;
  feels_like: number;
  high: number;
  low: number;
  rain_probability: number;
  snow_probability: number;
  wind_mph: number;
  humidity: number;
  condition: string;
  location_name: string;
  unit: TemperatureUnit;
  fetched_at: string;
}

export interface OutfitCandidate {
  items: Array<{ clothing_item: ClothingItem; role: OutfitRole }>;
  template_id: string;
  total_score: number;
  score_breakdown: ScoreBreakdown;
  explanation: RecommendationExplanation;
}
