export const toSlug = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

/** Safely turn a step or ingredient value into display text. */
export const itemText = (v: unknown): string => {
  if (v == null) return "";
  if (typeof v === "string" || typeof v === "number") return String(v);
  if (typeof v === "object") {
    const record = v as Record<string, unknown>;
    const t = record.instruction ?? record.text ?? record.step ?? record.description ?? record.name;
    if (typeof t === "string" || typeof t === "number") return String(t);
    return Object.values(record).filter((x) => typeof x === "string").join(" ");
  }
  return "";
};

export const toList = (v: unknown): unknown[] => {
  if (Array.isArray(v)) return v;
  if (typeof v === "string") {
    try {
      const p: unknown = JSON.parse(v);
      if (Array.isArray(p)) return p;
    } catch { /* plain text */ }
    return v.split(/\n+/).map((s) => s.trim()).filter(Boolean);
  }
  return [];
};
