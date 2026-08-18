import type { TemperatureUnit, WeatherSnapshot } from '@/types';

export type WeatherAtmosphere = {
  colors: readonly [string, string, string];
  locations: readonly [number, number, number];
  clothingHint: string;
};

export function toFahrenheit(temp: number, unit: TemperatureUnit): number {
  return unit === 'c' ? (temp * 9) / 5 + 32 : temp;
}

function conditionKey(condition: string): 'clear' | 'cloud' | 'rain' | 'snow' | 'storm' | 'fog' {
  const c = condition.toLowerCase();
  if (c.includes('thunder') || c.includes('storm')) return 'storm';
  if (c.includes('snow')) return 'snow';
  if (c.includes('rain') || c.includes('shower') || c.includes('drizzle')) return 'rain';
  if (c.includes('fog')) return 'fog';
  if (c.includes('cloud') || c.includes('overcast')) return 'cloud';
  return 'clear';
}

/**
 * Subtle page wash from live weather. Opacity stays low so sage identity remains.
 */
export function getWeatherAtmosphere(weather: WeatherSnapshot, isDark: boolean): WeatherAtmosphere {
  const feelsF = toFahrenheit(weather.feels_like, weather.unit);
  const kind = conditionKey(weather.condition);
  const hot = feelsF >= 85;
  const warm = feelsF >= 72;
  const cold = feelsF < 48;

  if (kind === 'rain' || kind === 'storm') {
    return {
      colors: isDark
        ? (['rgba(96, 124, 142, 0.2)', 'rgba(96, 124, 142, 0.06)', 'transparent'] as const)
        : (['rgba(120, 142, 156, 0.16)', 'rgba(120, 142, 156, 0.05)', 'transparent'] as const),
      locations: [0, 0.28, 0.62],
      clothingHint: kind === 'storm' ? 'Bring a layer for rain' : 'Rain-ready looks',
    };
  }

  if (kind === 'snow') {
    return {
      colors: isDark
        ? (['rgba(148, 176, 196, 0.16)', 'rgba(148, 176, 196, 0.05)', 'transparent'] as const)
        : (['rgba(170, 190, 206, 0.18)', 'rgba(170, 190, 206, 0.06)', 'transparent'] as const),
      locations: [0, 0.3, 0.64],
      clothingHint: 'Warm layers recommended',
    };
  }

  if (hot && kind === 'clear') {
    return {
      colors: isDark
        ? (['rgba(214, 148, 86, 0.2)', 'rgba(214, 148, 86, 0.07)', 'transparent'] as const)
        : (['rgba(232, 168, 104, 0.18)', 'rgba(232, 168, 104, 0.06)', 'transparent'] as const),
      locations: [0, 0.26, 0.58],
      clothingHint: 'Lightweight outfits',
    };
  }

  if (warm && kind !== 'fog') {
    return {
      colors: isDark
        ? (['rgba(196, 150, 92, 0.14)', 'rgba(196, 150, 92, 0.04)', 'transparent'] as const)
        : (['rgba(220, 176, 118, 0.14)', 'rgba(220, 176, 118, 0.05)', 'transparent'] as const),
      locations: [0, 0.28, 0.6],
      clothingHint: 'Breathable everyday looks',
    };
  }

  if (cold) {
    return {
      colors: isDark
        ? (['rgba(78, 132, 148, 0.18)', 'rgba(78, 132, 148, 0.05)', 'transparent'] as const)
        : (['rgba(92, 140, 156, 0.14)', 'rgba(92, 140, 156, 0.05)', 'transparent'] as const),
      locations: [0, 0.3, 0.64],
      clothingHint: 'Add a warmer layer',
    };
  }

  return {
    colors: isDark
      ? (['rgba(61, 184, 159, 0.08)', 'rgba(61, 184, 159, 0.03)', 'transparent'] as const)
      : (['rgba(31, 122, 107, 0.08)', 'rgba(31, 122, 107, 0.03)', 'transparent'] as const),
    locations: [0, 0.22, 0.55],
    clothingHint: kind === 'cloud' ? 'Easy everyday looks' : 'Outfits for today',
  };
}
