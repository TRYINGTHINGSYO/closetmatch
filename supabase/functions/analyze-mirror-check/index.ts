// Supabase Edge Function: analyze-mirror-check
// Clothing-only feedback. Reject body-critical language before responding.

const FORBIDDEN = [
  /you look bad/i,
  /body looks wrong/i,
  /too (large|skinny|fat|ugly)/i,
  /unattractive/i,
  /change your body/i,
  /you look ugly/i,
  /look fat/i,
  /nobody should wear/i,
];

function assertSafe(text: string) {
  for (const p of FORBIDDEN) {
    if (p.test(text)) throw new Error('Unsafe Mirror Check language rejected');
  }
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  try {
    await req.json();
    const mock = {
      image_quality: { usable: true, issues: ['slightly dim lighting'] },
      overall_assessment:
        'The outfit has a cohesive casual look with a neutral color palette.',
      scores: {
        overall: 0.84,
        color_coordination: 0.9,
        style_cohesion: 0.86,
        fit_and_proportion: 0.73,
        occasion_match: 0.88,
        weather_suitability: 0.68,
      },
      positive_observations: [
        'The white shoes connect with the lighter details in the shirt.',
        'The dark jeans create a consistent base.',
      ],
      suggested_changes: [
        {
          priority: 1,
          area: 'outerwear',
          suggestion:
            'Try a shorter jacket if you want more separation between the jacket and pants.',
          reason: 'Both pieces currently create a long, loose silhouette.',
        },
      ],
      suggested_item_roles_to_replace: ['outerwear'],
      confidence: 0.78,
      disclaimer: 'Lighting, pose, and camera angle may affect the analysis.',
    };

    assertSafe(mock.overall_assessment);
    for (const o of mock.positive_observations) assertSafe(o);
    for (const c of mock.suggested_changes) {
      assertSafe(c.suggestion);
      assertSafe(c.reason);
    }

    if (!Deno.env.get('OPENAI_API_KEY')) {
      return Response.json(mock);
    }

    return Response.json(
      { error: 'Wire provider adapter', code: 'provider_not_wired' },
      { status: 501 }
    );
  } catch (error) {
    return Response.json(
      {
        error: error instanceof Error ? error.message : 'Mirror analysis failed',
        code: 'ai_failed',
      },
      { status: 400 }
    );
  }
});
