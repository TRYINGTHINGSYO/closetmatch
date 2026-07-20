-- ClosetMatch Row Level Security policies
-- Users can only access their own data.

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.closet_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clothing_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clothing_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outfits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outfit_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wear_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wear_history_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outfit_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.item_pairings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendation_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mirror_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clothing_analysis_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mirror_analysis_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planned_outfits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_style_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.laundry_defaults ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- Direct ownership helpers
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_owner(owner_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
  SELECT auth.uid() = owner_id;
$$;

CREATE OR REPLACE FUNCTION public.owns_outfit(target_outfit_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.outfits o
    WHERE o.id = target_outfit_id AND o.user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.owns_wear_history(target_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.wear_history wh
    WHERE wh.id = target_id AND wh.user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.owns_recommendation(target_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.recommendations r
    WHERE r.id = target_id AND r.user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.owns_mirror_check(target_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.mirror_checks m
    WHERE m.id = target_id AND m.user_id = auth.uid()
  );
$$;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
CREATE POLICY profiles_select_own ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY profiles_update_own ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY profiles_insert_own ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- ---------------------------------------------------------------------------
-- user_preferences
-- ---------------------------------------------------------------------------
CREATE POLICY user_preferences_all_own ON public.user_preferences
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- closet_locations
-- ---------------------------------------------------------------------------
CREATE POLICY closet_locations_all_own ON public.closet_locations
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- clothing_items
-- ---------------------------------------------------------------------------
CREATE POLICY clothing_items_all_own ON public.clothing_items
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- clothing_images
-- ---------------------------------------------------------------------------
CREATE POLICY clothing_images_all_own ON public.clothing_images
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- outfits
-- ---------------------------------------------------------------------------
CREATE POLICY outfits_all_own ON public.outfits
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- outfit_items (child of outfits)
-- ---------------------------------------------------------------------------
CREATE POLICY outfit_items_select_own ON public.outfit_items
  FOR SELECT USING (public.owns_outfit(outfit_id));
CREATE POLICY outfit_items_insert_own ON public.outfit_items
  FOR INSERT WITH CHECK (public.owns_outfit(outfit_id));
CREATE POLICY outfit_items_update_own ON public.outfit_items
  FOR UPDATE USING (public.owns_outfit(outfit_id));
CREATE POLICY outfit_items_delete_own ON public.outfit_items
  FOR DELETE USING (public.owns_outfit(outfit_id));

-- ---------------------------------------------------------------------------
-- wear_history
-- ---------------------------------------------------------------------------
CREATE POLICY wear_history_all_own ON public.wear_history
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- wear_history_items
-- ---------------------------------------------------------------------------
CREATE POLICY wear_history_items_select_own ON public.wear_history_items
  FOR SELECT USING (public.owns_wear_history(wear_history_id));
CREATE POLICY wear_history_items_insert_own ON public.wear_history_items
  FOR INSERT WITH CHECK (public.owns_wear_history(wear_history_id));
CREATE POLICY wear_history_items_update_own ON public.wear_history_items
  FOR UPDATE USING (public.owns_wear_history(wear_history_id));
CREATE POLICY wear_history_items_delete_own ON public.wear_history_items
  FOR DELETE USING (public.owns_wear_history(wear_history_id));

-- ---------------------------------------------------------------------------
-- outfit_feedback
-- ---------------------------------------------------------------------------
CREATE POLICY outfit_feedback_all_own ON public.outfit_feedback
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- item_pairings
-- ---------------------------------------------------------------------------
CREATE POLICY item_pairings_all_own ON public.item_pairings
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- recommendations
-- ---------------------------------------------------------------------------
CREATE POLICY recommendations_all_own ON public.recommendations
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- recommendation_items
-- ---------------------------------------------------------------------------
CREATE POLICY recommendation_items_select_own ON public.recommendation_items
  FOR SELECT USING (public.owns_recommendation(recommendation_id));
CREATE POLICY recommendation_items_insert_own ON public.recommendation_items
  FOR INSERT WITH CHECK (public.owns_recommendation(recommendation_id));
CREATE POLICY recommendation_items_update_own ON public.recommendation_items
  FOR UPDATE USING (public.owns_recommendation(recommendation_id));
CREATE POLICY recommendation_items_delete_own ON public.recommendation_items
  FOR DELETE USING (public.owns_recommendation(recommendation_id));

-- ---------------------------------------------------------------------------
-- recommendation_actions
-- ---------------------------------------------------------------------------
CREATE POLICY recommendation_actions_all_own ON public.recommendation_actions
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- mirror_checks
-- ---------------------------------------------------------------------------
CREATE POLICY mirror_checks_all_own ON public.mirror_checks
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- clothing_analysis_jobs
-- ---------------------------------------------------------------------------
CREATE POLICY clothing_analysis_jobs_all_own ON public.clothing_analysis_jobs
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- mirror_analysis_jobs
-- ---------------------------------------------------------------------------
CREATE POLICY mirror_analysis_jobs_all_own ON public.mirror_analysis_jobs
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- planned_outfits
-- ---------------------------------------------------------------------------
CREATE POLICY planned_outfits_all_own ON public.planned_outfits
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- user_style_insights
-- ---------------------------------------------------------------------------
CREATE POLICY user_style_insights_all_own ON public.user_style_insights
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- laundry_defaults
-- ---------------------------------------------------------------------------
CREATE POLICY laundry_defaults_all_own ON public.laundry_defaults
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
