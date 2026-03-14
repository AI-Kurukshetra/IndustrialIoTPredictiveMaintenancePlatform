import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { UserRole } from "@/types/domain";

const rank: Record<UserRole, number> = {
  operator: 1,
  technician: 2,
  manager: 3,
  admin: 4
};

export async function requireApiAuth(minRole: UserRole = "operator") {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false as const, status: 401, error: "Unauthorized" };
  }

  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single();

  if (!profile || rank[profile.role as UserRole] < rank[minRole]) {
    return { ok: false as const, status: 403, error: "Forbidden" };
  }

  return { ok: true as const, user, role: profile.role as UserRole };
}
