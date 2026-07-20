-- Private storage buckets for ClosetMatch
-- Paths: /{user_id}/{resource_id}/{filename}

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('clothing-originals', 'clothing-originals', FALSE, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic']),
  ('clothing-processed', 'clothing-processed', FALSE, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('mirror-check-originals', 'mirror-check-originals', FALSE, 15728640, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic']),
  ('mirror-check-processed', 'mirror-check-processed', FALSE, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('receipts', 'receipts', FALSE, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']),
  ('exports', 'exports', FALSE, 52428800, ARRAY['application/json', 'application/zip', 'text/csv']),
  ('virtual-try-on', 'virtual-try-on', FALSE, 15728640, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Helper: first path segment must equal auth.uid()
CREATE OR REPLACE FUNCTION public.storage_path_owned(object_name TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
  SELECT (storage.foldername(object_name))[1] = auth.uid()::TEXT;
$$;

-- clothing-originals
CREATE POLICY clothing_originals_select ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'clothing-originals' AND public.storage_path_owned(name));
CREATE POLICY clothing_originals_insert ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'clothing-originals' AND public.storage_path_owned(name));
CREATE POLICY clothing_originals_update ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'clothing-originals' AND public.storage_path_owned(name));
CREATE POLICY clothing_originals_delete ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'clothing-originals' AND public.storage_path_owned(name));

-- clothing-processed
CREATE POLICY clothing_processed_select ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'clothing-processed' AND public.storage_path_owned(name));
CREATE POLICY clothing_processed_insert ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'clothing-processed' AND public.storage_path_owned(name));
CREATE POLICY clothing_processed_update ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'clothing-processed' AND public.storage_path_owned(name));
CREATE POLICY clothing_processed_delete ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'clothing-processed' AND public.storage_path_owned(name));

-- mirror-check-originals
CREATE POLICY mirror_originals_select ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'mirror-check-originals' AND public.storage_path_owned(name));
CREATE POLICY mirror_originals_insert ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'mirror-check-originals' AND public.storage_path_owned(name));
CREATE POLICY mirror_originals_update ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'mirror-check-originals' AND public.storage_path_owned(name));
CREATE POLICY mirror_originals_delete ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'mirror-check-originals' AND public.storage_path_owned(name));

-- mirror-check-processed
CREATE POLICY mirror_processed_select ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'mirror-check-processed' AND public.storage_path_owned(name));
CREATE POLICY mirror_processed_insert ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'mirror-check-processed' AND public.storage_path_owned(name));
CREATE POLICY mirror_processed_update ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'mirror-check-processed' AND public.storage_path_owned(name));
CREATE POLICY mirror_processed_delete ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'mirror-check-processed' AND public.storage_path_owned(name));

-- receipts
CREATE POLICY receipts_select ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'receipts' AND public.storage_path_owned(name));
CREATE POLICY receipts_insert ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'receipts' AND public.storage_path_owned(name));
CREATE POLICY receipts_update ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'receipts' AND public.storage_path_owned(name));
CREATE POLICY receipts_delete ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'receipts' AND public.storage_path_owned(name));

-- exports
CREATE POLICY exports_select ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'exports' AND public.storage_path_owned(name));
CREATE POLICY exports_insert ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'exports' AND public.storage_path_owned(name));
CREATE POLICY exports_update ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'exports' AND public.storage_path_owned(name));
CREATE POLICY exports_delete ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'exports' AND public.storage_path_owned(name));

-- virtual-try-on
CREATE POLICY vto_select ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'virtual-try-on' AND public.storage_path_owned(name));
CREATE POLICY vto_insert ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'virtual-try-on' AND public.storage_path_owned(name));
CREATE POLICY vto_update ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'virtual-try-on' AND public.storage_path_owned(name));
CREATE POLICY vto_delete ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'virtual-try-on' AND public.storage_path_owned(name));
