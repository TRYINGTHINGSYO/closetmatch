-- Pairing score recalculation helper
-- Stores item IDs in sorted order (item_a_id < item_b_id)

CREATE OR REPLACE FUNCTION public.sorted_item_pair(a UUID, b UUID, OUT item_a UUID, OUT item_b UUID)
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  IF a < b THEN
    item_a := a;
    item_b := b;
  ELSE
    item_a := b;
    item_b := a;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.calculate_pairing_score(
  worn INTEGER,
  saved INTEGER,
  accepted INTEGER,
  rejected INTEGER,
  replacements INTEGER,
  avg_rating NUMERIC,
  mirror_pos INTEGER,
  mirror_neg INTEGER
)
RETURNS NUMERIC
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  score NUMERIC := 0.5;
  positive NUMERIC;
  negative NUMERIC;
BEGIN
  positive := (worn * 0.08) + (saved * 0.06) + (accepted * 0.1)
            + (COALESCE(avg_rating, 3) - 3) * 0.08
            + (mirror_pos * 0.07);
  negative := (rejected * 0.12) + (replacements * 0.08) + (mirror_neg * 0.07);
  score := GREATEST(0, LEAST(1, 0.5 + positive - negative));
  RETURN ROUND(score, 4);
END;
$$;

CREATE OR REPLACE FUNCTION public.upsert_item_pairing(
  p_user_id UUID,
  p_item_1 UUID,
  p_item_2 UUID,
  p_event TEXT,
  p_rating NUMERIC DEFAULT NULL
)
RETURNS public.item_pairings
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  pair RECORD;
  result public.item_pairings;
BEGIN
  IF p_item_1 = p_item_2 THEN
    RAISE EXCEPTION 'Cannot pair an item with itself';
  END IF;

  SELECT * INTO pair FROM public.sorted_item_pair(p_item_1, p_item_2);

  INSERT INTO public.item_pairings (user_id, item_a_id, item_b_id)
  VALUES (p_user_id, pair.item_a, pair.item_b)
  ON CONFLICT (user_id, item_a_id, item_b_id) DO NOTHING;

  UPDATE public.item_pairings ip
  SET
    worn_together_count = CASE WHEN p_event = 'worn' THEN ip.worn_together_count + 1 ELSE ip.worn_together_count END,
    saved_together_count = CASE WHEN p_event = 'saved' THEN ip.saved_together_count + 1 ELSE ip.saved_together_count END,
    accepted_count = CASE WHEN p_event = 'accepted' THEN ip.accepted_count + 1 ELSE ip.accepted_count END,
    rejected_count = CASE WHEN p_event = 'rejected' THEN ip.rejected_count + 1 ELSE ip.rejected_count END,
    replacement_count = CASE WHEN p_event = 'replaced' THEN ip.replacement_count + 1 ELSE ip.replacement_count END,
    mirror_positive_count = CASE WHEN p_event = 'mirror_positive' THEN ip.mirror_positive_count + 1 ELSE ip.mirror_positive_count END,
    mirror_negative_count = CASE WHEN p_event = 'mirror_negative' THEN ip.mirror_negative_count + 1 ELSE ip.mirror_negative_count END,
    average_rating = CASE
      WHEN p_rating IS NOT NULL THEN
        COALESCE((COALESCE(ip.average_rating, p_rating) + p_rating) / 2.0, p_rating)
      ELSE ip.average_rating
    END,
    last_calculated_at = NOW()
  WHERE ip.user_id = p_user_id AND ip.item_a_id = pair.item_a AND ip.item_b_id = pair.item_b
  RETURNING * INTO result;

  UPDATE public.item_pairings ip
  SET pairing_score = public.calculate_pairing_score(
    ip.worn_together_count,
    ip.saved_together_count,
    ip.accepted_count,
    ip.rejected_count,
    ip.replacement_count,
    ip.average_rating,
    ip.mirror_positive_count,
    ip.mirror_negative_count
  )
  WHERE ip.id = result.id
  RETURNING * INTO result;

  RETURN result;
END;
$$;

-- Mark outfit worn: updates wear counts, laundry, pairings
CREATE OR REPLACE FUNCTION public.mark_outfit_worn(
  p_outfit_id UUID,
  p_occasion TEXT DEFAULT NULL,
  p_rating NUMERIC DEFAULT NULL,
  p_comfort_rating NUMERIC DEFAULT NULL,
  p_temperature NUMERIC DEFAULT NULL,
  p_weather_condition TEXT DEFAULT NULL,
  p_was_recommended BOOLEAN DEFAULT FALSE,
  p_recommendation_changed BOOLEAN DEFAULT FALSE,
  p_dirty_item_ids UUID[] DEFAULT NULL
)
RETURNS public.wear_history
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_wear public.wear_history;
  item_rec RECORD;
  item_ids UUID[];
  i INT;
  j INT;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF NOT public.owns_outfit(p_outfit_id) THEN
    RAISE EXCEPTION 'Outfit not found';
  END IF;

  INSERT INTO public.wear_history (
    user_id, outfit_id, occasion, rating, comfort_rating,
    temperature, weather_condition, was_recommended, recommendation_changed
  ) VALUES (
    v_user_id, p_outfit_id, p_occasion, p_rating, p_comfort_rating,
    p_temperature, p_weather_condition, p_was_recommended, p_recommendation_changed
  ) RETURNING * INTO v_wear;

  SELECT ARRAY_AGG(clothing_item_id) INTO item_ids
  FROM public.outfit_items WHERE outfit_id = p_outfit_id;

  FOR item_rec IN
    SELECT oi.clothing_item_id, ci.category
    FROM public.outfit_items oi
    JOIN public.clothing_items ci ON ci.id = oi.clothing_item_id
    WHERE oi.outfit_id = p_outfit_id
  LOOP
    INSERT INTO public.wear_history_items (wear_history_id, clothing_item_id, marked_dirty)
    VALUES (
      v_wear.id,
      item_rec.clothing_item_id,
      COALESCE(
        item_rec.clothing_item_id = ANY(COALESCE(p_dirty_item_ids, '{}'::UUID[])),
        (SELECT mark_dirty_after_wear FROM public.laundry_defaults
         WHERE user_id = v_user_id AND category = item_rec.category),
        FALSE
      )
    );

    UPDATE public.clothing_items
    SET
      wear_count = wear_count + 1,
      last_worn_at = NOW(),
      never_worn = FALSE,
      availability_status = CASE
        WHEN item_rec.clothing_item_id = ANY(COALESCE(p_dirty_item_ids, '{}'::UUID[]))
          OR COALESCE((SELECT mark_dirty_after_wear FROM public.laundry_defaults
                       WHERE user_id = v_user_id AND category = item_rec.category), FALSE)
        THEN 'dirty'
        ELSE availability_status
      END
    WHERE id = item_rec.clothing_item_id AND user_id = v_user_id;
  END LOOP;

  -- Update all pair combinations
  IF item_ids IS NOT NULL AND array_length(item_ids, 1) >= 2 THEN
    FOR i IN 1..array_length(item_ids, 1) LOOP
      FOR j IN (i + 1)..array_length(item_ids, 1) LOOP
        PERFORM public.upsert_item_pairing(v_user_id, item_ids[i], item_ids[j], 'worn', p_rating);
      END LOOP;
    END LOOP;
  END IF;

  UPDATE public.outfits
  SET
    times_worn = times_worn + 1,
    last_worn_at = NOW(),
    status = 'worn',
    rating = COALESCE(p_rating, rating),
    comfort_rating = COALESCE(p_comfort_rating, comfort_rating)
  WHERE id = p_outfit_id AND user_id = v_user_id;

  RETURN v_wear;
END;
$$;

GRANT EXECUTE ON FUNCTION public.mark_outfit_worn TO authenticated;
GRANT EXECUTE ON FUNCTION public.upsert_item_pairing TO authenticated;
GRANT EXECUTE ON FUNCTION public.calculate_pairing_score TO authenticated;
