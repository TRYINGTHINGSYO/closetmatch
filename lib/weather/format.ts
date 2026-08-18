import type { WeatherSnapshot } from '@/types';

export function formatWeatherLine(weather: WeatherSnapshot): string {
  const temp = Math.round(weather.feels_like);
  const place = weather.location_name.split(',')[0]?.trim() || weather.location_name;
  return `${temp}° · ${weather.condition} · ${place}`;
}
