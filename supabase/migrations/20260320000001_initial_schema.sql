-- ClosetMatch initial schema
-- UUID primary keys, timestamptz, soft archival where appropriate

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  display_name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  location_name TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  timezone TEXT NOT NULL DEFAULT 'UTC',
  preferred_temperature_unit TEXT NOT NULL DEFAULT 'f' CHECK (preferred_temperature_unit IN ('f', 'c')),
  onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'stylist', 'partner', 'parent', 'admin', 'moderator')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- user_preferences
-- ---------------------------------------------------------------------------
CREATE TABLE public.user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.profiles (id) ON DELETE CASCADE,
  preferred_styles TEXT[] NOT NULL DEFAULT '{}',
  preferred_colors TEXT[] NOT NULL DEFAULT '{}',
  avoided_colors TEXT[] NOT NULL DEFAULT '{}',
  preferred_fits TEXT[] NOT NULL DEFAULT '{}',
  preferred_formality_min INTEGER NOT NULL DEFAULT 1 CHECK (preferred_formality_min BETWEEN 1 AND 5),
  preferred_formality_max INTEGER NOT NULL DEFAULT 5 CHECK (preferred_formality_max BETWEEN 1 AND 5),
  comfort_priority INTEGER NOT NULL DEFAULT 3 CHECK (comfort_priority BETWEEN 1 AND 5),
  desired_variety INTEGER NOT NULL DEFAULT 3 CHECK (desired_variety BETWEEN 1 AND 5),
  preferred_contrast TEXT NOT NULL DEFAULT 'no_preference'
    CHECK (preferred_contrast IN ('low', 'medium', 'high', 'no_preference')),
  weather_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  notifications_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  daily_outfit_suggestions BOOLEAN NOT NULL DEFAULT FALSE,
  laundry_reminders BOOLEAN NOT NULL DEFAULT FALSE,
  planned_outfit_reminders BOOLEAN NOT NULL DEFAULT FALSE,
  underused_item_suggestions BOOLEAN NOT NULL DEFAULT FALSE,
  repeat_outfit_warnings BOOLEAN NOT NULL DEFAULT FALSE,
  temperature_sensitivity INTEGER NOT NULL DEFAULT 0 CHECK (temperature_sensitivity BETWEEN -2 AND 2),
  mirror_check_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  mirror_photo_retention TEXT NOT NULL DEFAULT 'delete_after_analysis'
    CHECK (mirror_photo_retention IN (
      'delete_after_analysis',
      'save_original',
      'save_analysis_only',
      'save_reduced',
      'save_blurred_preview'
    )),
  save_analysis_only BOOLEAN NOT NULL DEFAULT FALSE,
  save_clothing_photos BOOLEAN NOT NULL DEFAULT TRUE,
  allow_cloud_image_processing BOOLEAN NOT NULL DEFAULT TRUE,
  allow_local_processing BOOLEAN NOT NULL DEFAULT TRUE,
  analytics_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  never_use_images_for_training BOOLEAN NOT NULL DEFAULT TRUE,
  recommendation_mode TEXT NOT NULL DEFAULT 'balanced'
    CHECK (recommendation_mode IN ('safe', 'familiar', 'balanced', 'experimental', 'max_variety')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- closet_locations
-- ---------------------------------------------------------------------------
CREATE TABLE public.closet_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  parent_location_id UUID REFERENCES public.closet_locations (id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX closet_locations_user_id_idx ON public.closet_locations (user_id);

-- ---------------------------------------------------------------------------
-- clothing_items
-- ---------------------------------------------------------------------------
CREATE TABLE public.clothing_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  subcategory TEXT NOT NULL,
  custom_category TEXT,
  primary_color TEXT NOT NULL DEFAULT 'unknown',
  secondary_colors TEXT[] NOT NULL DEFAULT '{}',
  accent_colors TEXT[] NOT NULL DEFAULT '{}',
  pattern TEXT,
  material TEXT,
  texture TEXT,
  brand TEXT,
  model_name TEXT,
  sku TEXT,
  barcode TEXT,
  size TEXT,
  fit TEXT,
  length TEXT,
  sleeve_length TEXT,
  rise TEXT,
  cut TEXT,
  silhouette TEXT,
  stretch_level TEXT,
  layering_role TEXT,
  style_tags TEXT[] NOT NULL DEFAULT '{}',
  season_tags TEXT[] NOT NULL DEFAULT '{}',
  occasion_tags TEXT[] NOT NULL DEFAULT '{}',
  weather_suitability TEXT[] NOT NULL DEFAULT '{}',
  activity_suitability TEXT[] NOT NULL DEFAULT '{}',
  warmth_score INTEGER NOT NULL DEFAULT 3 CHECK (warmth_score BETWEEN 1 AND 5),
  formality_score INTEGER NOT NULL DEFAULT 2 CHECK (formality_score BETWEEN 1 AND 5),
  comfort_score INTEGER CHECK (comfort_score IS NULL OR comfort_score BETWEEN 1 AND 5),
  condition TEXT NOT NULL DEFAULT 'good',
  availability_status TEXT NOT NULL DEFAULT 'available'
    CHECK (availability_status IN (
      'available', 'dirty', 'in_laundry', 'drying', 'packed', 'borrowed',
      'being_repaired', 'missing', 'donated', 'sold', 'archived', 'damaged'
    )),
  favorite BOOLEAN NOT NULL DEFAULT FALSE,
  never_worn BOOLEAN NOT NULL DEFAULT TRUE,
  purchase_date DATE,
  price_paid NUMERIC,
  retail_price NUMERIC,
  estimated_value NUMERIC,
  store_name TEXT,
  gift_status BOOLEAN NOT NULL DEFAULT FALSE,
  warranty TEXT,
  closet_location_id UUID REFERENCES public.closet_locations (id) ON DELETE SET NULL,
  notes TEXT,
  last_worn_at TIMESTAMPTZ,
  wear_count INTEGER NOT NULL DEFAULT 0,
  wash_count INTEGER NOT NULL DEFAULT 0,
  last_washed_at TIMESTAMPTZ,
  average_rating NUMERIC,
  ai_metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
  ai_confidence JSONB NOT NULL DEFAULT '{}'::JSONB,
  user_corrected_fields TEXT[] NOT NULL DEFAULT '{}',
  needs_review_fields TEXT[] NOT NULL DEFAULT '{}',
  archived_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX clothing_items_user_id_idx ON public.clothing_items (user_id);
CREATE INDEX clothing_items_category_idx ON public.clothing_items (user_id, category);
CREATE INDEX clothing_items_availability_idx ON public.clothing_items (user_id, availability_status);
CREATE INDEX clothing_items_primary_color_idx ON public.clothing_items (user_id, primary_color);
CREATE INDEX clothing_items_favorite_idx ON public.clothing_items (user_id, favorite) WHERE favorite = TRUE;

-- ---------------------------------------------------------------------------
-- clothing_images
-- ---------------------------------------------------------------------------
CREATE TABLE public.clothing_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  clothing_item_id UUID NOT NULL REFERENCES public.clothing_items (id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  image_type TEXT NOT NULL
    CHECK (image_type IN ('original', 'processed', 'alternate', 'brand_label', 'fabric_label', 'receipt')),
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  width INTEGER,
  height INTEGER,
  ai_processed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX clothing_images_item_idx ON public.clothing_images (clothing_item_id);
CREATE INDEX clothing_images_user_idx ON public.clothing_images (user_id);

-- ---------------------------------------------------------------------------
-- outfits
-- ---------------------------------------------------------------------------
CREATE TABLE public.outfits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  occasion TEXT,
  style_tags TEXT[] NOT NULL DEFAULT '{}',
  season TEXT,
  formality_score INTEGER CHECK (formality_score IS NULL OR formality_score BETWEEN 1 AND 5),
  warmth_score INTEGER CHECK (warmth_score IS NULL OR warmth_score BETWEEN 1 AND 5),
  temperature_min NUMERIC,
  temperature_max NUMERIC,
  weather_conditions TEXT[] NOT NULL DEFAULT '{}',
  favorite BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'saved', 'planned', 'worn', 'rejected', 'archived')),
  rating NUMERIC CHECK (rating IS NULL OR rating BETWEEN 1 AND 5),
  comfort_rating NUMERIC CHECK (comfort_rating IS NULL OR comfort_rating BETWEEN 1 AND 5),
  times_worn INTEGER NOT NULL DEFAULT 0,
  last_worn_at TIMESTAMPTZ,
  ai_generated BOOLEAN NOT NULL DEFAULT FALSE,
  recommendation_explanation JSONB NOT NULL DEFAULT '{}'::JSONB,
  archived_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX outfits_user_id_idx ON public.outfits (user_id);
CREATE INDEX outfits_status_idx ON public.outfits (user_id, status);
CREATE INDEX outfits_favorite_idx ON public.outfits (user_id, favorite) WHERE favorite = TRUE;

-- ---------------------------------------------------------------------------
-- outfit_items
-- ---------------------------------------------------------------------------
CREATE TABLE public.outfit_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  outfit_id UUID NOT NULL REFERENCES public.outfits (id) ON DELETE CASCADE,
  clothing_item_id UUID NOT NULL REFERENCES public.clothing_items (id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  layer_order INTEGER NOT NULL DEFAULT 0,
  is_optional BOOLEAN NOT NULL DEFAULT FALSE,
  alternative_group TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX outfit_items_outfit_idx ON public.outfit_items (outfit_id);
CREATE INDEX outfit_items_clothing_idx ON public.outfit_items (clothing_item_id);

-- ---------------------------------------------------------------------------
-- wear_history
-- ---------------------------------------------------------------------------
CREATE TABLE public.wear_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  outfit_id UUID REFERENCES public.outfits (id) ON DELETE SET NULL,
  worn_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  occasion TEXT,
  temperature NUMERIC,
  feels_like NUMERIC,
  weather_condition TEXT,
  location_context TEXT,
  rating NUMERIC CHECK (rating IS NULL OR rating BETWEEN 1 AND 5),
  comfort_rating NUMERIC CHECK (comfort_rating IS NULL OR comfort_rating BETWEEN 1 AND 5),
  too_warm BOOLEAN,
  too_cold BOOLEAN,
  too_formal BOOLEAN,
  too_casual BOOLEAN,
  would_wear_again BOOLEAN,
  notes TEXT,
  was_recommended BOOLEAN NOT NULL DEFAULT FALSE,
  recommendation_changed BOOLEAN NOT NULL DEFAULT FALSE,
  mirror_check_used BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX wear_history_user_id_idx ON public.wear_history (user_id);
CREATE INDEX wear_history_worn_at_idx ON public.wear_history (user_id, worn_at DESC);
CREATE INDEX wear_history_outfit_idx ON public.wear_history (outfit_id);

-- ---------------------------------------------------------------------------
-- wear_history_items
-- ---------------------------------------------------------------------------
CREATE TABLE public.wear_history_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wear_history_id UUID NOT NULL REFERENCES public.wear_history (id) ON DELETE CASCADE,
  clothing_item_id UUID NOT NULL REFERENCES public.clothing_items (id) ON DELETE CASCADE,
  marked_dirty BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX wear_history_items_history_idx ON public.wear_history_items (wear_history_id);

-- ---------------------------------------------------------------------------
-- outfit_feedback
-- ---------------------------------------------------------------------------
CREATE TABLE public.outfit_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  outfit_id UUID REFERENCES public.outfits (id) ON DELETE SET NULL,
  recommendation_id UUID,
  feedback_type TEXT NOT NULL,
  rating NUMERIC CHECK (rating IS NULL OR rating BETWEEN 1 AND 5),
  reason_tags TEXT[] NOT NULL DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX outfit_feedback_user_idx ON public.outfit_feedback (user_id);

-- ---------------------------------------------------------------------------
-- item_pairings
-- ---------------------------------------------------------------------------
CREATE TABLE public.item_pairings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  item_a_id UUID NOT NULL REFERENCES public.clothing_items (id) ON DELETE CASCADE,
  item_b_id UUID NOT NULL REFERENCES public.clothing_items (id) ON DELETE CASCADE,
  worn_together_count INTEGER NOT NULL DEFAULT 0,
  saved_together_count INTEGER NOT NULL DEFAULT 0,
  accepted_count INTEGER NOT NULL DEFAULT 0,
  rejected_count INTEGER NOT NULL DEFAULT 0,
  replacement_count INTEGER NOT NULL DEFAULT 0,
  average_rating NUMERIC,
  mirror_positive_count INTEGER NOT NULL DEFAULT 0,
  mirror_negative_count INTEGER NOT NULL DEFAULT 0,
  pairing_score NUMERIC NOT NULL DEFAULT 0.5,
  last_calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT item_pairings_sorted CHECK (item_a_id < item_b_id),
  CONSTRAINT item_pairings_unique UNIQUE (user_id, item_a_id, item_b_id)
);

CREATE INDEX item_pairings_user_idx ON public.item_pairings (user_id);
CREATE INDEX item_pairings_score_idx ON public.item_pairings (user_id, pairing_score DESC);

-- ---------------------------------------------------------------------------
-- recommendations
-- ---------------------------------------------------------------------------
CREATE TABLE public.recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  context JSONB NOT NULL DEFAULT '{}'::JSONB,
  total_score NUMERIC NOT NULL DEFAULT 0,
  score_breakdown JSONB NOT NULL DEFAULT '{}'::JSONB,
  explanation JSONB NOT NULL DEFAULT '{}'::JSONB,
  status TEXT NOT NULL DEFAULT 'generated'
    CHECK (status IN ('generated', 'viewed', 'accepted', 'modified', 'rejected', 'worn', 'expired')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  responded_at TIMESTAMPTZ
);

CREATE INDEX recommendations_user_idx ON public.recommendations (user_id, created_at DESC);

-- ---------------------------------------------------------------------------
-- recommendation_items
-- ---------------------------------------------------------------------------
CREATE TABLE public.recommendation_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recommendation_id UUID NOT NULL REFERENCES public.recommendations (id) ON DELETE CASCADE,
  clothing_item_id UUID NOT NULL REFERENCES public.clothing_items (id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  item_score NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX recommendation_items_rec_idx ON public.recommendation_items (recommendation_id);

-- Add FK from outfit_feedback.recommendation_id now that recommendations exists
ALTER TABLE public.outfit_feedback
  ADD CONSTRAINT outfit_feedback_recommendation_fk
  FOREIGN KEY (recommendation_id) REFERENCES public.recommendations (id) ON DELETE SET NULL;

-- ---------------------------------------------------------------------------
-- recommendation_actions
-- ---------------------------------------------------------------------------
CREATE TABLE public.recommendation_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  recommendation_id UUID NOT NULL REFERENCES public.recommendations (id) ON DELETE CASCADE,
  action TEXT NOT NULL
    CHECK (action IN (
      'accepted', 'rejected', 'saved', 'worn', 'replaced_item',
      'removed_item', 'added_item', 'mirror_check', 'never_suggest'
    )),
  original_item_id UUID REFERENCES public.clothing_items (id) ON DELETE SET NULL,
  replacement_item_id UUID REFERENCES public.clothing_items (id) ON DELETE SET NULL,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX recommendation_actions_user_idx ON public.recommendation_actions (user_id);
CREATE INDEX recommendation_actions_rec_idx ON public.recommendation_actions (recommendation_id);

-- ---------------------------------------------------------------------------
-- mirror_checks
-- ---------------------------------------------------------------------------
CREATE TABLE public.mirror_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  outfit_id UUID REFERENCES public.outfits (id) ON DELETE SET NULL,
  wear_history_id UUID REFERENCES public.wear_history (id) ON DELETE SET NULL,
  original_image_path TEXT,
  processed_image_path TEXT,
  retention_policy TEXT NOT NULL DEFAULT 'delete_after_analysis',
  overall_score NUMERIC,
  color_score NUMERIC,
  style_score NUMERIC,
  proportion_score NUMERIC,
  occasion_score NUMERIC,
  weather_score NUMERIC,
  confidence NUMERIC,
  positive_observations JSONB NOT NULL DEFAULT '[]'::JSONB,
  suggested_changes JSONB NOT NULL DEFAULT '[]'::JSONB,
  suggested_replacements JSONB NOT NULL DEFAULT '[]'::JSONB,
  image_quality JSONB NOT NULL DEFAULT '{}'::JSONB,
  user_agreement TEXT CHECK (user_agreement IS NULL OR user_agreement IN ('agree', 'disagree', 'neutral')),
  user_rating NUMERIC CHECK (user_rating IS NULL OR user_rating BETWEEN 1 AND 5),
  worn_after BOOLEAN,
  photo_deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX mirror_checks_user_idx ON public.mirror_checks (user_id, created_at DESC);

-- ---------------------------------------------------------------------------
-- clothing_analysis_jobs
-- ---------------------------------------------------------------------------
CREATE TABLE public.clothing_analysis_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  clothing_item_id UUID REFERENCES public.clothing_items (id) ON DELETE SET NULL,
  image_path TEXT NOT NULL,
  provider TEXT NOT NULL DEFAULT 'mock',
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  result JSONB,
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX clothing_analysis_jobs_user_idx ON public.clothing_analysis_jobs (user_id, created_at DESC);

-- ---------------------------------------------------------------------------
-- mirror_analysis_jobs
-- ---------------------------------------------------------------------------
CREATE TABLE public.mirror_analysis_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  mirror_check_id UUID NOT NULL REFERENCES public.mirror_checks (id) ON DELETE CASCADE,
  provider TEXT NOT NULL DEFAULT 'mock',
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  result JSONB,
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX mirror_analysis_jobs_user_idx ON public.mirror_analysis_jobs (user_id);

-- ---------------------------------------------------------------------------
-- planned_outfits
-- ---------------------------------------------------------------------------
CREATE TABLE public.planned_outfits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  outfit_id UUID NOT NULL REFERENCES public.outfits (id) ON DELETE CASCADE,
  planned_date DATE NOT NULL,
  occasion TEXT,
  reminder_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  reminder_time TIMESTAMPTZ,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'planned'
    CHECK (status IN ('planned', 'worn', 'skipped', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX planned_outfits_user_date_idx ON public.planned_outfits (user_id, planned_date);

-- ---------------------------------------------------------------------------
-- user_style_insights
-- ---------------------------------------------------------------------------
CREATE TABLE public.user_style_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  insight_type TEXT NOT NULL,
  insight_text TEXT NOT NULL,
  supporting_data JSONB NOT NULL DEFAULT '{}'::JSONB,
  confidence NUMERIC NOT NULL DEFAULT 0.5,
  user_confirmed BOOLEAN,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX user_style_insights_user_idx ON public.user_style_insights (user_id);

-- ---------------------------------------------------------------------------
-- laundry_defaults (category-based dirty rules)
-- ---------------------------------------------------------------------------
CREATE TABLE public.laundry_defaults (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  mark_dirty_after_wear BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, category)
);

-- ---------------------------------------------------------------------------
-- updated_at trigger helper
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER user_preferences_updated_at BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER closet_locations_updated_at BEFORE UPDATE ON public.closet_locations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER clothing_items_updated_at BEFORE UPDATE ON public.clothing_items
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER outfits_updated_at BEFORE UPDATE ON public.outfits
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER item_pairings_updated_at BEFORE UPDATE ON public.item_pairings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER mirror_checks_updated_at BEFORE UPDATE ON public.mirror_checks
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER planned_outfits_updated_at BEFORE UPDATE ON public.planned_outfits
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER user_style_insights_updated_at BEFORE UPDATE ON public.user_style_insights
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Auto-create profile + preferences on signup
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1), 'ClosetMatch user')
  );

  INSERT INTO public.user_preferences (user_id)
  VALUES (NEW.id);

  -- Sensible laundry defaults by category
  INSERT INTO public.laundry_defaults (user_id, category, mark_dirty_after_wear) VALUES
    (NEW.id, 'top', TRUE),
    (NEW.id, 'bottom', FALSE),
    (NEW.id, 'one_piece', TRUE),
    (NEW.id, 'outerwear', FALSE),
    (NEW.id, 'shoes', FALSE),
    (NEW.id, 'accessory', FALSE),
    (NEW.id, 'specialty', TRUE);

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
