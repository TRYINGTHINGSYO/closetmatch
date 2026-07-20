// Supabase Edge Function: analyze-clothing
// Secrets stay server-side. Mobile clients call this via supabase.functions.invoke.

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  try {
    await req.json();
    const apiKey = Deno.env.get('OPENAI_API_KEY');

    const mock = {
      contains_clothing: true,
      item_count: 1,
      category: 'top',
      subcategory: 'Hoodie',
      name_suggestion: 'Black oversized pullover hoodie',
      primary_color: 'black',
      secondary_colors: ['gray'],
      pattern: 'solid',
      material_guess: ['cotton blend'],
      fit: 'oversized',
      style_tags: ['casual', 'streetwear'],
      season_tags: ['fall', 'winter'],
      occasion_tags: ['everyday', 'school'],
      warmth_score: 4,
      formality_score: 1,
      visible_features: ['drawstrings', 'front pocket'],
      brand_guess: null,
      confidence: { category: 0.9, colors: 0.9, material: 0.5 },
      needs_user_review: ['material', 'fit'],
    };

    if (!apiKey) {
      return Response.json(mock);
    }

    return Response.json(
      { error: 'Wire OpenAI vision adapter here', code: 'provider_not_wired' },
      { status: 501 }
    );
  } catch (error) {
    return Response.json(
      {
        error: error instanceof Error ? error.message : 'Invalid request',
        code: 'ai_invalid_json',
      },
      { status: 400 }
    );
  }
});
