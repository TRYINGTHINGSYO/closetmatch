// Edge Function: weather proxy (optional rate limiting / caching)

Deno.serve(async (req) => {
  const url = new URL(req.url);
  const lat = url.searchParams.get('latitude');
  const lon = url.searchParams.get('longitude');
  const unit = url.searchParams.get('unit') === 'c' ? 'celsius' : 'fahrenheit';

  if (!lat || !lon) {
    return Response.json({ error: 'latitude and longitude required' }, { status: 400 });
  }

  const upstream =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,apparent_temperature,relative_humidity_2m,precipitation_probability,weather_code,wind_speed_10m` +
    `&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max` +
    `&temperature_unit=${unit}&wind_speed_unit=mph&timezone=auto`;

  const res = await fetch(upstream);
  const data = await res.json();
  return Response.json(data, { status: res.status });
});
