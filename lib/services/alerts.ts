import type { Alert } from "@/types/domain";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function listAlerts(options?: {
  includeResolved?: boolean;
  includeAcknowledged?: boolean;
  severity?: Alert["severity"];
  page?: number;
  limit?: number;
}): Promise<Alert[]> {
  const supabase = await createServerSupabaseClient();
  const includeResolved = options?.includeResolved ?? false;
  const includeAcknowledged = options?.includeAcknowledged ?? true;
  const page = options?.page ?? 1;
  const limit = options?.limit ?? 30;
  const from = Math.max(0, (page - 1) * limit);
  const to = from + limit - 1;

  let query = supabase
    .from("alerts")
    .select("id, facility_id, equipment_id, title, message, severity, is_resolved, acknowledged_at, acknowledged_by, created_at")
    .order("created_at", { ascending: false })
    .range(from, to);

  if (!includeResolved) {
    query = query.eq("is_resolved", false);
  }

  if (!includeAcknowledged) {
    query = query.is("acknowledged_at", null);
  }

  if (options?.severity) {
    query = query.eq("severity", options.severity);
  }

  const { data } = await query;
  return (data ?? []) as Alert[];
}

export async function resolveAlert(alertId: string) {
  const supabase = await createServerSupabaseClient();
  return supabase.from("alerts").update({ is_resolved: true }).eq("id", alertId);
}

export async function acknowledgeAlert(alertId: string, userId: string) {
  const supabase = await createServerSupabaseClient();
  return supabase
    .from("alerts")
    .update({ acknowledged_at: new Date().toISOString(), acknowledged_by: userId })
    .eq("id", alertId)
    .is("acknowledged_at", null);
}
