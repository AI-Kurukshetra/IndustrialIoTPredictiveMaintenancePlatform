import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { UserRole } from "@/types/domain";

const rank: Record<UserRole, number> = {
  operator: 1,
  technician: 2,
  manager: 3,
  admin: 4
};

export async function requireAuth(minRole: UserRole = "operator") {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("id, role")
    .eq("id", user.id)
    .single();

  if (!profile || rank[profile.role as UserRole] < rank[minRole]) {
    redirect("/dashboard");
  }

  return { user, role: profile.role as UserRole };
}
