import type { Alert, DashboardSnapshot } from "@/types/domain";
import { getReliabilitySummary } from "@/lib/services/reliability";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function getDashboardSnapshot(): Promise<DashboardSnapshot> {
  const supabase = await createServerSupabaseClient();

  const [
    { count: equipmentCount },
    { count: activeAlerts },
    { data: scores },
    { data: workOrders },
    { data: equipmentStatuses },
    reliability
  ] = await Promise.all([
    supabase.from("equipment").select("id", { count: "exact", head: true }),
    supabase.from("alerts").select("id", { count: "exact", head: true }).eq("is_resolved", false),
    supabase.from("equipment_health_scores").select("score, calculated_at").order("calculated_at", { ascending: false }).limit(20),
    supabase
      .from("work_orders")
      .select("id, facility_id, equipment_id, maintenance_schedule_id, title, status, priority, due_date, assigned_to, completed_at, completion_notes, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase.from("equipment").select("status"),
    getReliabilitySummary()
  ]);

  const avgHealthScore =
    scores && scores.length > 0
      ? scores.reduce((sum, row) => sum + Number(row.score), 0) / scores.length
      : 100;

  const statusCount = (equipmentStatuses ?? []).reduce<Record<string, number>>((acc, row) => {
    acc[row.status] = (acc[row.status] ?? 0) + 1;
    return acc;
  }, {});

  return {
    equipmentCount: equipmentCount ?? 0,
    activeAlerts: activeAlerts ?? 0,
    avgHealthScore,
    uptimePercent: reliability.avgUptimePercent,
    mtbfHours: reliability.avgMtbfHours,
    mttrHours: reliability.avgMttrHours,
    equipmentByStatus: [
      { status: "online", count: statusCount.online ?? 0 },
      { status: "maintenance", count: statusCount.maintenance ?? 0 },
      { status: "fault", count: statusCount.fault ?? 0 },
      { status: "offline", count: statusCount.offline ?? 0 }
    ],
    healthTrend: scores?.slice(0, 10).map((s, idx) => ({ label: `T-${idx + 1}`, score: Number(s.score) })) ?? [],
    recentWorkOrders: (workOrders ?? []) as DashboardSnapshot["recentWorkOrders"]
  };
}

export async function getActiveAlerts(options?: {
  includeResolved?: boolean;
  severity?: "low" | "medium" | "high" | "critical";
  limit?: number;
  page?: number;
}): Promise<Alert[]> {
  const supabase = await createServerSupabaseClient();
  const includeResolved = options?.includeResolved ?? false;
  const limit = options?.limit ?? 50;
  const page = options?.page ?? 1;
  const from = Math.max(0, (page - 1) * limit);
  const to = from + limit - 1;

  let query = supabase
    .from("alerts")
    .select("id, facility_id, equipment_id, title, message, severity, is_resolved, created_at")
    .order("created_at", { ascending: false })
    .range(from, to);

  if (!includeResolved) {
    query = query.eq("is_resolved", false);
  }

  if (options?.severity) {
    query = query.eq("severity", options.severity);
  }

  const { data } = await query;
  return (data ?? []) as Alert[];
}
