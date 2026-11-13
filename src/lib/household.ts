import { supabase } from "@/integrations/supabase/client";

export type HouseholdRole = "owner" | "member";

export type Household = {
  id: string;
  name: string;
  invite_code: string;
  created_by: string;
  share_pantry: boolean;
  created_at: string;
  updated_at: string;
};

export type HouseholdMember = {
  id: string;
  household_id: string;
  user_id: string;
  role: HouseholdRole;
  joined_at: string;
  profiles?: {
    full_name: string | null;
    username: string | null;
  } | null;
};

export type SharedPantryItem = {
  id: string;
  user_id: string | null;
  ingredient_name: string;
  quantity: number | null;
  unit: string | null;
  expires_at: string | null;
  added_at: string | null;
  owner_name?: string;
};

export function memberDisplayName(member: HouseholdMember): string {
  const profile = member.profiles;
  if (profile?.full_name?.trim()) return profile.full_name.trim();
  if (profile?.username?.trim()) return profile.username.trim();
  return `Member ${member.user_id.slice(0, 6)}`;
}

export async function fetchMyHousehold(): Promise<{
  household: Household | null;
  members: HouseholdMember[];
  myRole: HouseholdRole | null;
}> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { household: null, members: [], myRole: null };
  }

  const { data: membership, error: memErr } = await supabase
    .from("household_members")
    .select("id, household_id, user_id, role, joined_at")
    .eq("user_id", user.id)
    .maybeSingle();

  if (memErr) throw memErr;
  if (!membership) {
    return { household: null, members: [], myRole: null };
  }

  const { data: household, error: hErr } = await supabase
    .from("households")
    .select("*")
    .eq("id", membership.household_id)
    .single();

  if (hErr) throw hErr;

  const { data: members, error: rosterErr } = await supabase
    .from("household_members")
    .select("id, household_id, user_id, role, joined_at")
    .eq("household_id", membership.household_id)
    .order("joined_at", { ascending: true });

  if (rosterErr) throw rosterErr;

  const roster = (members || []) as HouseholdMember[];
  const userIds = roster.map((m) => m.user_id);
  let profileMap = new Map<string, { full_name: string | null; username: string | null }>();

  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, username")
      .in("id", userIds);
    profileMap = new Map(
      (profiles || []).map((p) => [
        p.id,
        { full_name: p.full_name, username: p.username },
      ])
    );
  }

  return {
    household: household as Household,
    members: roster.map((m) => ({
      ...m,
      profiles: profileMap.get(m.user_id) ?? null,
    })),
    myRole: membership.role as HouseholdRole,
  };
}

export async function createHousehold(name: string): Promise<string> {
  const { data, error } = await supabase.rpc("create_household", {
    p_name: name,
  });
  if (error) throw error;
  return data as string;
}

export async function joinHouseholdByCode(code: string): Promise<string> {
  const { data, error } = await supabase.rpc("join_household_by_code", {
    p_code: code,
  });
  if (error) throw error;
  return data as string;
}

export async function leaveHousehold(): Promise<void> {
  const { error } = await supabase.rpc("leave_household");
  if (error) throw error;
}

export async function setSharePantry(
  householdId: string,
  sharePantry: boolean
): Promise<void> {
  const { error } = await supabase
    .from("households")
    .update({ share_pantry: sharePantry })
    .eq("id", householdId);
  if (error) throw error;
}

export async function regenerateInviteCode(householdId: string): Promise<string> {
  const { data, error } = await supabase.rpc("regenerate_household_invite_code", {
    p_household_id: householdId,
  });
  if (error) throw error;
  return data as string;
}

export async function removeMember(memberId: string): Promise<void> {
  const { error } = await supabase
    .from("household_members")
    .delete()
    .eq("id", memberId);
  if (error) throw error;
}

/** Pantry items belonging to other household members (RLS gated by share_pantry). */
export async function fetchSharedHouseholdPantry(
  myUserId: string,
  members: HouseholdMember[]
): Promise<SharedPantryItem[]> {
  const otherIds = members
    .map((m) => m.user_id)
    .filter((id) => id !== myUserId);

  if (otherIds.length === 0) return [];

  const { data, error } = await supabase
    .from("pantry_items")
    .select("id, user_id, ingredient_name, quantity, unit, expires_at, added_at")
    .in("user_id", otherIds)
    .order("ingredient_name", { ascending: true });

  if (error) throw error;

  const nameById = new Map(
    members.map((m) => [m.user_id, memberDisplayName(m)] as const)
  );

  return (data || []).map((row) => ({
    ...row,
    owner_name: row.user_id ? nameById.get(row.user_id) : undefined,
  }));
}
