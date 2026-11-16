/**
 * Freemium gates — free core African cooking utility; soft-limit automation.
 * No fake Stripe paywall: premium is tracked locally until billing ships.
 */

const PREMIUM_KEY = "ladhaquest_premium_enabled";
const OFFLINE_PACK_COUNT_KEY = "ladhaquest_offline_pack_count";
const AI_PLAN_WEEK_KEY = "ladhaquest_ai_plan_week";

/** Free tier allowances */
export const FREE_LIMITS = {
  offlineCookPacks: 5,
  weeklyAiMealPlans: 2,
  householdMembers: 4,
} as const;

export type PremiumFeature =
  | "offline_packs_unlimited"
  | "ai_meal_plans_unlimited"
  | "advanced_substitutions_batch"
  | "household_collaboration_pro";

export type SoftGateResult = {
  allowed: boolean;
  remaining: number;
  reason?: string;
};

function isoWeekKey(d = new Date()): string {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${date.getUTCFullYear()}-W${week}`;
}

export function isPremiumUnlocked(): boolean {
  try {
    return localStorage.getItem(PREMIUM_KEY) === "1";
  } catch {
    return false;
  }
}

/** Dev/beta unlock until Stripe is wired — visible in Install / Account. */
export function setPremiumUnlocked(enabled: boolean): void {
  try {
    localStorage.setItem(PREMIUM_KEY, enabled ? "1" : "0");
    window.dispatchEvent(new CustomEvent("ladhaquest:premium", { detail: enabled }));
  } catch {
    /* ignore */
  }
}

export function getOfflinePackCount(): number {
  try {
    return Number(localStorage.getItem(OFFLINE_PACK_COUNT_KEY) || "0") || 0;
  } catch {
    return 0;
  }
}

export function incrementOfflinePackCount(): number {
  const next = getOfflinePackCount() + 1;
  try {
    localStorage.setItem(OFFLINE_PACK_COUNT_KEY, String(next));
  } catch {
    /* ignore */
  }
  return next;
}

export function canDownloadOfflinePack(): SoftGateResult {
  if (isPremiumUnlocked()) return { allowed: true, remaining: Infinity };
  const used = getOfflinePackCount();
  const remaining = Math.max(0, FREE_LIMITS.offlineCookPacks - used);
  if (remaining <= 0) {
    return {
      allowed: false,
      remaining: 0,
      reason: `Free tier includes ${FREE_LIMITS.offlineCookPacks} offline cook packs. Unlock Premium for unlimited packs.`,
    };
  }
  return { allowed: true, remaining };
}

function readAiPlanWeek(): { week: string; count: number } {
  try {
    const raw = localStorage.getItem(AI_PLAN_WEEK_KEY);
    if (!raw) return { week: isoWeekKey(), count: 0 };
    const parsed = JSON.parse(raw) as { week?: string; count?: number };
    const week = isoWeekKey();
    if (parsed.week !== week) return { week, count: 0 };
    return { week, count: Number(parsed.count) || 0 };
  } catch {
    return { week: isoWeekKey(), count: 0 };
  }
}

export function getWeeklyAiPlanCount(): number {
  return readAiPlanWeek().count;
}

export function incrementWeeklyAiPlanCount(): number {
  const { week, count } = readAiPlanWeek();
  const next = count + 1;
  try {
    localStorage.setItem(AI_PLAN_WEEK_KEY, JSON.stringify({ week, count: next }));
  } catch {
    /* ignore */
  }
  return next;
}

export function canGenerateAiMealPlan(): SoftGateResult {
  if (isPremiumUnlocked()) return { allowed: true, remaining: Infinity };
  const used = getWeeklyAiPlanCount();
  const remaining = Math.max(0, FREE_LIMITS.weeklyAiMealPlans - used);
  if (remaining <= 0) {
    return {
      allowed: false,
      remaining: 0,
      reason: `Free tier includes ${FREE_LIMITS.weeklyAiMealPlans} AI meal plans per week. Unlock Premium for unlimited planning.`,
    };
  }
  return { allowed: true, remaining };
}

export const PREMIUM_COPY = {
  headline: "LadhaQuest Premium",
  freeIncludes: [
    "African recipe discovery",
    "Save & Recipe Box folders",
    "Recipe import (URL, photo, voice) with local adaptation",
    "Basic grocery lists & local substitutions",
    "Limited weekly AI planning",
    `${FREE_LIMITS.offlineCookPacks} offline cook packs`,
  ],
  premiumIncludes: [
    "Unlimited offline packs",
    "Unlimited AI meal plans & budget optimization",
    "Advanced batch substitutions",
    "Household collaboration pro tools",
    "Early access to creator publishing analytics",
  ],
} as const;
