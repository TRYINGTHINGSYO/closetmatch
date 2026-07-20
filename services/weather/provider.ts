import type { TemperatureUnit, WeatherSnapshot } from '@/types';
import { AppError, ErrorCodes } from '@/lib/errors';

export interface WeatherProvider {
  readonly name: string;
  getWeather(input: {
    latitude?: number;
    longitude?: number;
    locationName?: string;
    unit: TemperatureUnit;
  }): Promise<WeatherSnapshot>;
}

/** Mock weather for development / offline */
export class MockWeatherProvider implements WeatherProvider {
  readonly name = 'mock';

  async getWeather(input: {
    locationName?: string;
    unit: TemperatureUnit;
  }): Promise<WeatherSnapshot> {
    const isC = input.unit === 'c';
    return {
      temperature: isC ? 14 : 58,
      feels_like: isC ? 12 : 54,
      high: isC ? 17 : 63,
      low: isC ? 9 : 48,
      rain_probability: 0.2,
      snow_probability: 0,
      wind_mph: 8,
      humidity: 55,
      condition: 'Partly cloudy',
      location_name: input.locationName ?? 'Your city',
      unit: input.unit,
      fetched_at: new Date().toISOString(),
    };
  }
}

/** Open-Meteo via edge function (no API key) or direct when allowed */
export class OpenMeteoWeatherProvider implements WeatherProvider {
  readonly name = 'open-meteo';

  async getWeather(input: {
    latitude?: number;
    longitude?: number;
    locationName?: string;
    unit: TemperatureUnit;
  }): Promise<WeatherSnapshot> {
    if (input.latitude == null || input.longitude == null) {
      return new MockWeatherProvider().getWeather(input);
    }

    try {
      const tempUnit = input.unit === 'c' ? 'celsius' : 'fahrenheit';
      const url =
        `https://api.open-meteo.com/v1/forecast?latitude=${input.latitude}` +
        `&longitude=${input.longitude}&current=temperature_2m,apparent_temperature,relative_humidity_2m,precipitation_probability,weather_code,wind_speed_10m` +
        `&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max` +
        `&temperature_unit=${tempUnit}&wind_speed_unit=mph&timezone=auto`;

      const res = await fetch(url);
      if (!res.ok) throw new Error('Weather request failed');
      const data = (await res.json()) as {
        current: {
          temperature_2m: number;
          apparent_temperature: number;
          relative_humidity_2m: number;
          precipitation_probability: number | null;
          weather_code: number;
          wind_speed_10m: number;
        };
        daily: {
          temperature_2m_max: number[];
          temperature_2m_min: number[];
          precipitation_probability_max: number[];
        };
      };

      return {
        temperature: data.current.temperature_2m,
        feels_like: data.current.apparent_temperature,
        high: data.daily.temperature_2m_max[0],
        low: data.daily.temperature_2m_min[0],
        rain_probability: (data.daily.precipitation_probability_max[0] ?? 0) / 100,
        snow_probability: 0,
        wind_mph: data.current.wind_speed_10m,
        humidity: data.current.relative_humidity_2m,
        condition: weatherCodeToLabel(data.current.weather_code),
        location_name: input.locationName ?? 'Current location',
        unit: input.unit,
        fetched_at: new Date().toISOString(),
      };
    } catch {
      throw new AppError('Weather unavailable right now.', ErrorCodes.WEATHER_UNAVAILABLE);
    }
  }
}

function weatherCodeToLabel(code: number): string {
  if (code === 0) return 'Clear';
  if (code <= 3) return 'Partly cloudy';
  if (code <= 48) return 'Foggy';
  if (code <= 67) return 'Rain';
  if (code <= 77) return 'Snow';
  if (code <= 82) return 'Showers';
  if (code <= 99) return 'Thunderstorm';
  return 'Unknown';
}

export function createWeatherProvider(): WeatherProvider {
  if (process.env.EXPO_PUBLIC_WEATHER_PROVIDER === 'mock') {
    return new MockWeatherProvider();
  }
  return new OpenMeteoWeatherProvider();
}
