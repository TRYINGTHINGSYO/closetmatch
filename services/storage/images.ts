import { STORAGE_BUCKETS } from '@/constants';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { AppError, ErrorCodes } from '@/lib/errors';

export type ImageBucket = (typeof STORAGE_BUCKETS)[keyof typeof STORAGE_BUCKETS];

/** Build private storage path: /{user_id}/{resource_id}/{filename} */
export function buildStoragePath(userId: string, resourceId: string, filename: string): string {
  return `${userId}/${resourceId}/${filename}`;
}

/**
 * Upload to a private bucket. Returns storage path (not a public URL).
 * Use createSignedUrl for temporary access — never log signed URLs in analytics.
 */
export async function uploadPrivateImage(input: {
  bucket: ImageBucket;
  userId: string;
  resourceId: string;
  filename: string;
  fileUri: string;
  contentType?: string;
}): Promise<{ path: string }> {
  if (!isSupabaseConfigured) {
    return { path: input.fileUri };
  }

  const path = buildStoragePath(input.userId, input.resourceId, input.filename);
  const response = await fetch(input.fileUri);
  const blob = await response.blob();

  const { error } = await supabase.storage.from(input.bucket).upload(path, blob, {
    contentType: input.contentType ?? 'image/jpeg',
    upsert: false,
  });

  if (error) {
    throw new AppError(error.message, ErrorCodes.UPLOAD_FAILED);
  }

  return { path };
}

export async function createSignedImageUrl(
  bucket: ImageBucket,
  path: string,
  expiresIn = 3600
): Promise<string | null> {
  if (!isSupabaseConfigured) return path;
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresIn);
  if (error) return null;
  return data.signedUrl;
}
