import { supabase, requireSupabaseConfig } from '@/lib/supabase/client';
import { AppError, ErrorCodes } from '@/lib/errors';

/** Invoke a Supabase Edge Function and normalize network/function failures. */
export async function invokeEdgeFunction<T = unknown>(
  name: string,
  body: unknown
): Promise<T> {
  requireSupabaseConfig();

  const { data, error } = await supabase.functions.invoke(name, {
    body: body as Record<string, unknown>,
  });
  if (error) {
    throw new AppError(
      error.message || `Edge Function ${name} failed.`,
      ErrorCodes.NETWORK
    );
  }

  if (data && typeof data === 'object' && 'error' in data) {
    const payload = data as { error?: string; code?: string };
    if (payload.error) {
      throw new AppError(payload.error, payload.code ?? ErrorCodes.AI_FAILED);
    }
  }

  return data as T;
}
