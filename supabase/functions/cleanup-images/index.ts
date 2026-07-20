// Edge Function: cleanup expired Mirror Check images per retention policy

Deno.serve(async (_req) => {
  // Intended to run on a schedule with service role:
  // 1. Find mirror_checks where retention_policy = delete_after_analysis and photo not deleted
  // 2. Remove storage objects
  // 3. Null paths + set photo_deleted_at
  // Never log personal image URLs.
  return Response.json({
    ok: true,
    message: 'Wire to service-role Supabase client in production deployments.',
  });
});
