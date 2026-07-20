/** Privacy-safe product analytics — never log photo URLs or wardrobe contents */

export type AnalyticsEvent =
  | 'account_created'
  | 'onboarding_completed'
  | 'clothing_item_added'
  | 'ai_clothing_analysis_completed'
  | 'ai_result_corrected'
  | 'outfit_saved'
  | 'outfit_worn'
  | 'recommendation_viewed'
  | 'recommendation_accepted'
  | 'recommendation_rejected'
  | 'item_replaced'
  | 'mirror_check_started'
  | 'mirror_check_completed'
  | 'mirror_check_photo_deleted'
  | 'planned_outfit_created'
  | 'laundry_status_changed';

export interface AnalyticsProvider {
  track(event: AnalyticsEvent, props?: Record<string, string | number | boolean>): void;
}

class ConsoleAnalyticsProvider implements AnalyticsProvider {
  track(event: AnalyticsEvent, props?: Record<string, string | number | boolean>): void {
    if (process.env.NODE_ENV === 'development') {
      console.info('[analytics]', event, props ?? {});
    }
  }
}

let provider: AnalyticsProvider = new ConsoleAnalyticsProvider();

export function setAnalyticsProvider(next: AnalyticsProvider): void {
  provider = next;
}

export function track(event: AnalyticsEvent, props?: Record<string, string | number | boolean>): void {
  // Strip any accidental URL-like values
  if (props) {
    for (const [k, v] of Object.entries(props)) {
      if (typeof v === 'string' && (v.includes('http') || v.includes('file:'))) {
        delete props[k];
      }
    }
  }
  provider.track(event, props);
}
