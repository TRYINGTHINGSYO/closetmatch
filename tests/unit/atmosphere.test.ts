import { describe, expect, it } from 'vitest';
import { getWeatherAtmosphere, toFahrenheit } from '@/lib/weather/atmosphere';
import type { WeatherSnapshot } from '@/types';

function snap(overrides: Partial<WeatherSnapshot>): WeatherSnapshot {
  return {
    temperature: 72,
    feels_like: 72,
    high: 78,
    low: 64,
    rain_probability: 0,
    snow_probability: 0,
    wind_mph: 5,
    humidity: 40,
    condition: 'Clear',
    location_name: 'Austin',
    unit: 'f',
    fetched_at: new Date().toISOString(),
    ...overrides,
  };
}

describe('weather atmosphere', () => {
  it('converts celsius to fahrenheit', () => {
    expect(toFahrenheit(30, 'c')).toBe(86);
    expect(toFahrenheit(86, 'f')).toBe(86);
  });

  it('uses a warm wash for hot clear weather', () => {
    const atm = getWeatherAtmosphere(snap({ feels_like: 98, condition: 'Clear' }), true);
    expect(atm.clothingHint.toLowerCase()).toContain('lightweight');
    expect(atm.colors[0]).toContain('214, 148, 86');
  });

  it('uses a cool wash for rain', () => {
    const atm = getWeatherAtmosphere(snap({ condition: 'Rain', feels_like: 68 }), true);
    expect(atm.clothingHint.toLowerCase()).toContain('rain');
    expect(atm.colors[0]).toContain('96, 124, 142');
  });

  it('stays subtle for mild cloudy weather', () => {
    const atm = getWeatherAtmosphere(snap({ condition: 'Partly cloudy', feels_like: 58 }), true);
    expect(atm.colors[0]).toContain('0.08');
  });
});
