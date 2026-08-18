import { WEAR_TODAY_MODES } from '@/constants';

export const TODAY_MOODS = [
  { id: 'balanced', label: 'Balanced' },
  { id: 'safe', label: 'Safe' },
  { id: 'surprise', label: 'Surprise' },
] as const;

export const TODAY_PRIORITIES = [
  { id: '', label: 'Recommended' },
  { id: 'something_new', label: 'Something new' },
  { id: 'most_comfortable', label: 'Most comfortable' },
  { id: 'best_rated', label: 'Best rated' },
  { id: 'least_recent', label: 'Least recently worn' },
] as const;

/** Occasions the Today UI can send. IDs match WEAR_TODAY_MODES except Everyday. */
export const TODAY_OCCASIONS = [
  { id: 'everyday', label: 'Everyday', occasion: 'Everyday' },
  { id: 'work', label: 'Work', occasion: 'Work' },
  { id: 'school', label: 'School', occasion: 'School' },
  { id: 'date', label: 'Date', occasion: 'Date' },
  { id: 'formal', label: 'Formal', occasion: 'Formal event' },
  { id: 'casual', label: 'Casual', occasion: 'Casual' },
  { id: 'athletic', label: 'Athletic', occasion: 'Athletic' },
  { id: 'rainy', label: 'Rainy day', occasion: 'Rainy weather' },
  { id: 'cold', label: 'Cold weather', occasion: 'Cold weather' },
  { id: 'hot', label: 'Hot weather', occasion: 'Hot weather' },
] as const;

/** Generator template filters that only run when these IDs are `context.mode`. */
export const TEMPLATE_MODE_IDS = new Set(['athletic', 'hot', 'cold', 'rainy']);

const MOOD_IDS: Set<string> = new Set(TODAY_MOODS.map((m) => m.id));
const PRIORITY_IDS: Set<string> = new Set(TODAY_PRIORITIES.map((p) => p.id).filter(Boolean));
const OCCASION_IDS: Set<string> = new Set(TODAY_OCCASIONS.map((o) => o.id));

export function resolveTodayEngineContext(input: {
  moodId: string;
  priorityId: string;
  occasionId: string;
}): { mode: string; occasion: string } {
  const occasion =
    TODAY_OCCASIONS.find((o) => o.id === input.occasionId)?.occasion ?? 'Everyday';

  let mode = MOOD_IDS.has(input.moodId) ? input.moodId : 'balanced';
  if (input.priorityId && PRIORITY_IDS.has(input.priorityId)) {
    mode = input.priorityId;
  }
  if (TEMPLATE_MODE_IDS.has(input.occasionId)) {
    mode = input.occasionId;
  }

  return { mode, occasion };
}

export function hydrateTodayFilters(savedMode?: string | null): {
  moodId: string;
  priorityId: string;
  occasionId: string;
} {
  const saved = savedMode ?? '';
  if (MOOD_IDS.has(saved)) {
    return { moodId: saved, priorityId: '', occasionId: 'everyday' };
  }
  if (PRIORITY_IDS.has(saved)) {
    return { moodId: 'balanced', priorityId: saved, occasionId: 'everyday' };
  }
  if (OCCASION_IDS.has(saved)) {
    return { moodId: 'balanced', priorityId: '', occasionId: saved };
  }
  return { moodId: 'balanced', priorityId: '', occasionId: 'everyday' };
}

export function isKnownWearTodayMode(id: string): boolean {
  return WEAR_TODAY_MODES.some((mode) => mode.id === id);
}
