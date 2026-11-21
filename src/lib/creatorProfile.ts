import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

export const creatorProfileSchema = z.object({
  display_name: z.string().trim().min(2).max(80),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens"),
  bio: z.string().trim().max(800).optional().or(z.literal("")),
  country_name: z.string().trim().min(2).max(80),
  country_code: z.string().trim().max(8).optional().or(z.literal("")),
  languages: z.array(z.string().trim().min(2).max(40)).max(12).default([]),
  attribution_preference: z.string().trim().max(200).optional().or(z.literal("")),
  social_links: z
    .object({
      website: z.string().url().optional().or(z.literal("")),
      instagram: z.string().url().optional().or(z.literal("")),
      youtube: z.string().url().optional().or(z.literal("")),
      tiktok: z.string().url().optional().or(z.literal("")),
    })
    .default({}),
});

export type CreatorProfileInput = z.infer<typeof creatorProfileSchema>;

export type CreatorProfile = {
  id: string;
  user_id: string;
  slug: string;
  display_name: string;
  bio: string | null;
  country_code: string | null;
  country_name: string | null;
  languages: string[] | null;
  social_links: Record<string, string> | null;
  verified: boolean;
  attribution_preference: string | null;
  avatar_url: string | null;
};

export function slugifyCreatorName(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export async function fetchMyCreatorProfile(userId: string): Promise<CreatorProfile | null> {
  const { data, error } = await supabase
    .from("creator_profiles" as never)
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return (data as CreatorProfile | null) ?? null;
}

export async function fetchCreatorBySlug(slug: string): Promise<CreatorProfile | null> {
  const { data, error } = await supabase
    .from("creator_profiles" as never)
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return (data as CreatorProfile | null) ?? null;
}

export async function upsertCreatorProfile(
  userId: string,
  input: CreatorProfileInput,
  existingId?: string
): Promise<CreatorProfile> {
  const parsed = creatorProfileSchema.parse(input);
  const row = {
    user_id: userId,
    slug: parsed.slug,
    display_name: parsed.display_name,
    bio: parsed.bio || null,
    country_name: parsed.country_name,
    country_code: parsed.country_code || null,
    languages: parsed.languages,
    attribution_preference: parsed.attribution_preference || null,
    social_links: Object.fromEntries(
      Object.entries(parsed.social_links || {}).filter(([, v]) => Boolean(v))
    ),
    updated_at: new Date().toISOString(),
  };

  if (existingId) {
    const { data, error } = await supabase
      .from("creator_profiles" as never)
      .update(row as never)
      .eq("id", existingId)
      .eq("user_id", userId)
      .select("*")
      .single();
    if (error) throw error;
    return data as CreatorProfile;
  }

  const { data, error } = await supabase
    .from("creator_profiles" as never)
    .insert(row as never)
    .select("*")
    .single();
  if (error) throw error;
  return data as CreatorProfile;
}

export function sameAsLinks(social: Record<string, string> | null | undefined): string[] {
  if (!social) return [];
  return Object.values(social).filter((u) => typeof u === "string" && /^https?:\/\//i.test(u));
}
