/**
 * LadhaQuest analytics helper (S1-13).
 *
 * Respects cookie consent: reads `ladhaquest_cookie_preferences` from
 * localStorage. Only fires when `analytics === true`.
 * In development mode (import.meta.env.DEV) events are also logged to console
 * even without consent, for debugging.
 *
 * Push destinations:
 *  - window.dataLayer  (GTM / GA4)
 *  - window.plausible  (Plausible Analytics)
 *
 * Never throws — analytics must not break the user experience.
 */

/** Blueprint event name constants. */
export const EVENTS = {
  SEARCH_PERFORMED: "search_performed",
  SEARCH_ZERO_RESULT: "search_zero_result",
  FILTER_APPLIED: "filter_applied",
  RECIPE_VIEWED: "recipe_viewed",
  RECIPE_SAVED: "recipe_saved",
  SUBSTITUTION_REQUESTED: "substitution_requested",
  SUBSTITUTION_VIEWED: "substitution_viewed",
  SUBSTITUTION_ACCEPT: "substitution_accept",
  SUBSTITUTION_REJECT: "substitution_reject",
  SUBSTITUTION_FEEDBACK: "substitution_feedback",
  COOK_MODE_STARTED: "cook_mode_started",
  COOK_MODE_COMPLETED: "cook_mode_completed",
  PLAN_CREATED: "plan_created",
  SHOPPING_LIST_EXPORTED: "shopping_list_exported",
  CREATOR_SUBMISSION_STARTED: "creator_submission_started",
  CREATOR_SUBMISSION_PUBLISHED: "creator_submission_published",
  AFFILIATE_CLICK: "affiliate_click",
  PANTRY_MATCH: "pantry_match",
  PANTRY_EXPERIMENT_EXPOSURE: "pantry_experiment_exposure",
  PANTRY_COOK_CONFIRMED: "pantry_cook_confirmed",
  PANTRY_FALSE_READY_REPORT: "pantry_false_ready_report",
  PANTRY_SAFETY_REPORT: "pantry_safety_report",
  ALIAS_REVIEWED: "alias_reviewed",
} as const;

export type EventName = (typeof EVENTS)[keyof typeof EVENTS];

const COOKIE_PREFERENCES_KEY = "ladhaquest_cookie_preferences";

function isAnalyticsConsented(): boolean {
  try {
    const raw = localStorage.getItem(COOKIE_PREFERENCES_KEY);
    if (!raw) return false;
    const prefs = JSON.parse(raw) as { analytics?: boolean };
    return prefs.analytics === true;
  } catch {
    return false;
  }
}

/**
 * Track an analytics event.
 *
 * @param event - Event name (use EVENTS constants).
 * @param props - Optional event properties.
 */
export function track(event: string, props?: Record<string, unknown>): void {
  try {
    const isDev =
      typeof import.meta !== "undefined" && (import.meta as { env?: { DEV?: boolean } }).env?.DEV;

    if (isDev) {
      // Always log in dev for debugging visibility.
      console.debug("[analytics]", event, props);
    }

    if (!isAnalyticsConsented()) return;

    const payload = { event, ...props };

    // Google Tag Manager / GA4
    type WithDataLayer = { dataLayer?: unknown[] };
    if (typeof window !== "undefined" && Array.isArray((window as unknown as WithDataLayer).dataLayer)) {
      ((window as unknown as WithDataLayer).dataLayer as unknown[]).push(payload);
    }

    // Plausible Analytics
    type WithPlausible = { plausible?: (e: string, o?: { props?: Record<string, unknown> }) => void };
    if (
      typeof window !== "undefined" &&
      typeof (window as unknown as WithPlausible).plausible === "function"
    ) {
      (window as unknown as WithPlausible).plausible!(event, props ? { props } : undefined);
    }
  } catch {
    // Never throw — analytics must not break the app.
  }
}
