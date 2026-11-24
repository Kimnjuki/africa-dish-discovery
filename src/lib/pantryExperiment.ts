/**
 * Household-randomized pantry matcher A/B experiment.
 * Control = strict cookability JSON matcher (deterministic).
 * Treatment = graph-first hybrid then JSON fallback (current production path).
 */

import { track, EVENTS } from "./analytics.ts";

export type PantryExperimentVariant = "control" | "treatment";

export const PANTRY_EXPERIMENT_ID = "pantry_cookability_v1";
const STORAGE_KEY = "ladhaquest_pantry_experiment_v1";

/** Stable 32-bit hash for assignment (FNV-1a). */
export function hashHousehold(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function assignPantryVariant(
  householdOrUserId: string,
  options?: { force?: PantryExperimentVariant | null; enabled?: boolean }
): PantryExperimentVariant {
  if (options?.force === "control" || options?.force === "treatment") return options.force;
  const envFlag =
    typeof import.meta !== "undefined"
      ? (import.meta as { env?: { VITE_PANTRY_EXPERIMENT?: string } }).env?.VITE_PANTRY_EXPERIMENT
      : undefined;
  const enabled = options?.enabled ?? String(envFlag ?? "1") !== "0";
  if (!enabled) return "treatment"; // default production path when experiment off
  return hashHousehold(`${PANTRY_EXPERIMENT_ID}:${householdOrUserId}`) % 2 === 0
    ? "control"
    : "treatment";
}

export function loadOrAssignVariant(householdOrUserId: string): PantryExperimentVariant {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as { id?: string; variant?: PantryExperimentVariant };
      if (parsed.id === householdOrUserId && (parsed.variant === "control" || parsed.variant === "treatment")) {
        return parsed.variant;
      }
    }
  } catch {
    /* ignore */
  }
  const variant = assignPantryVariant(householdOrUserId);
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ id: householdOrUserId, variant, experiment: PANTRY_EXPERIMENT_ID })
    );
  } catch {
    /* ignore */
  }
  return variant;
}

export function trackPantryExperimentExposure(
  variant: PantryExperimentVariant,
  meta?: Record<string, unknown>
) {
  track(EVENTS.PANTRY_EXPERIMENT_EXPOSURE, {
    experiment: PANTRY_EXPERIMENT_ID,
    variant,
    ...meta,
  });
}

/**
 * Approximate two-proportion sample size per arm (equal allocation).
 * Uses normal approximation with continuity ignored — planning aid only.
 */
export function estimateSampleSizePerArm(args: {
  baselineRate: number;
  mde: number;
  alpha?: number;
  power?: number;
}): { perArm: number; total: number; notes: string } {
  const p1 = Math.min(0.99, Math.max(0.01, args.baselineRate));
  const p2 = Math.min(0.99, Math.max(0.01, p1 + args.mde));
  const alpha = args.alpha ?? 0.05;
  const power = args.power ?? 0.8;
  // z approx: 1.96 for two-sided 0.05, 0.84 for 80% power
  const zAlpha = alpha <= 0.05 ? 1.96 : 1.64;
  const zBeta = power >= 0.9 ? 1.28 : 0.84;
  const pBar = (p1 + p2) / 2;
  const num =
    Math.pow(zAlpha * Math.sqrt(2 * pBar * (1 - pBar)) + zBeta * Math.sqrt(p1 * (1 - p1) + p2 * (1 - p2)), 2);
  const den = Math.pow(p2 - p1, 2);
  const perArm = Math.ceil(num / den);
  return {
    perArm,
    total: perArm * 2,
    notes: `Planning estimate only (p1=${p1}, mde=${args.mde}, α=${alpha}, power=${power}). Recompute with exact tests before launch.`,
  };
}
