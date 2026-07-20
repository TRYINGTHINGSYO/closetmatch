// Edge Function: generate-recommendations
// Optional server-side scoring for larger closets / shared logic.

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  const body = await req.json();
  // Client already runs the modular engine; this endpoint is for future scale-out.
  return Response.json({
    message: 'Use client recommendation engine or expand this function to call shared scoring.',
    received_context: body?.context ?? {},
  });
});
