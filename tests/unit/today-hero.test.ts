import { describe, expect, it } from 'vitest';
import { timeOfDayGreeting } from '@/lib/datetime/greeting';
import { formatWeatherLine } from '@/lib/weather/format';
import {
  hydrateTodayFilters,
  resolveTodayEngineContext,
  TEMPLATE_MODE_IDS,
} from '@/lib/wear/today-filters';
import type { WeatherSnapshot } from '@/types';

describe('timeOfDayGreeting', () => {
  it('returns morning, afternoon, and evening by hour', () => {
    expect(timeOfDayGreeting(new Date('2026-08-17T08:00:00'))).toBe('Good morning');
    expect(timeOfDayGreeting(new Date('2026-08-17T13:00:00'))).toBe('Good afternoon');
    expect(timeOfDayGreeting(new Date('2026-08-17T19:00:00'))).toBe('Good evening');
    expect(timeOfDayGreeting(new Date('2026-08-17T02:00:00'))).toBe('Good evening');
  });
});

describe('formatWeatherLine', () => {
  it('keeps city short and omits a unit suffix', () => {
    const weather: WeatherSnapshot = {
      temperature: 98,
      feels_like: 98.4,
      high: 101,
      low: 79,
      rain_probability: 0,
      snow_probability: 0,
      wind_mph: 6,
      humidity: 40,
      condition: 'Clear',
      location_name: 'Austin, TX',
      unit: 'f',
      fetched_at: new Date().toISOString(),
    };
    expect(formatWeatherLine(weather)).toBe('98° · Clear · Austin');
  });
});

describe('today filter mapping', () => {
  it('keeps mood as mode when priority is recommended', () => {
    expect(
      resolveTodayEngineContext({ moodId: 'safe', priorityId: '', occasionId: 'everyday' })
    ).toEqual({ mode: 'safe', occasion: 'Everyday' });
  });

  it('uses priority as mode without dropping occasion', () => {
    expect(
      resolveTodayEngineContext({
        moodId: 'balanced',
        priorityId: 'best_rated',
        occasionId: 'work',
      })
    ).toEqual({ mode: 'best_rated', occasion: 'Work' });
  });

  it('lets generator template modes win over mood and priority', () => {
    expect(TEMPLATE_MODE_IDS.has('hot')).toBe(true);
    expect(
      resolveTodayEngineContext({
        moodId: 'surprise',
        priorityId: 'best_rated',
        occasionId: 'hot',
      })
    ).toEqual({ mode: 'hot', occasion: 'Hot weather' });
  });

  it('hydrates a saved wear-today mode into the split controls', () => {
    expect(hydrateTodayFilters('surprise')).toEqual({
      moodId: 'surprise',
      priorityId: '',
      occasionId: 'everyday',
    });
    expect(hydrateTodayFilters('least_recent')).toEqual({
      moodId: 'balanced',
      priorityId: 'least_recent',
      occasionId: 'everyday',
    });
    expect(hydrateTodayFilters('work')).toEqual({
      moodId: 'balanced',
      priorityId: '',
      occasionId: 'work',
    });
  });
});
