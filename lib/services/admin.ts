import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Facility, PlatformUser, UserRole } from "@/types/domain";

export async function listFacilityUsers(): Promise<PlatformUser[]> {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("users")
    .select("id, facility_id, email, full_name, role, created_at")
    .order("created_at", { ascending: false });

  return (data ?? []) as PlatformUser[];
}

export async function updateFacilityUserRole(userId: string, role: UserRole) {
  const supabase = await createServerSupabaseClient();
  return supabase.from("users").update({ role }).eq("id", userId);
}

export async function getMyFacility(): Promise<Facility | null> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase.from("users").select("facility_id").eq("id", user.id).single();
  if (!profile?.facility_id) return null;

  const { data } = await supabase
    .from("facilities")
    .select("id, name, code, location, created_at")
    .eq("id", profile.facility_id)
    .single();

  return (data as Facility | null) ?? null;
}

export async function updateMyFacility(input: { id: string; name: string; code: string; location: string }) {
  const supabase = await createServerSupabaseClient();
  return supabase
    .from("facilities")
    .update({ name: input.name, code: input.code, location: input.location })
    .eq("id", input.id);
}
