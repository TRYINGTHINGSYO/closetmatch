// Edge Function: export-user-data

Deno.serve(async (req) => {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Production: verify JWT, pull user-owned tables, zip JSON to exports bucket,
  // return signed URL. Exclude raw Mirror Check binaries unless explicitly requested.
  return Response.json({
    status: 'accepted',
    note: 'Implement with service role + signed export URL. Do not include training use of images.',
  });
});
