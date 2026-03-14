import { createServerSupabaseClient } from "@/lib/supabase/server";

export interface ReliabilityMetricRow {
  equipment_id: string;
  facility_id: string;
  failure_count: number;
  mttr_hours: number;
  mtbf_hours: number | null;
  uptime_percent: number;
  maintenance_events: number;
}

export interface ReliabilitySummary {
  avgMtbfHours: number;
  avgMttrHours: number;
  avgUptimePercent: number;
}

export async function listReliabilityMetrics(limit = 25, page = 1): Promise<ReliabilityMetricRow[]> {
  const supabase = await createServerSupabaseClient();
  const from = Math.max(0, (page - 1) * limit);
  const to = from + limit - 1;

  const { data } = await supabase
    .from("equipment_reliability_metrics")
    .select("equipment_id, facility_id, failure_count, mttr_hours, mtbf_hours, uptime_percent, maintenance_events")
    .order("uptime_percent", { ascending: true })
    .range(from, to);

  return (data ?? []) as ReliabilityMetricRow[];
}

export async function getReliabilitySummary(): Promise<ReliabilitySummary> {
  const rows = await listReliabilityMetrics(200, 1);
  if (!rows.length) {
    return { avgMtbfHours: 0, avgMttrHours: 0, avgUptimePercent: 100 };
  }

  const mtbfValues = rows.map((r) => r.mtbf_hours).filter((value): value is number => value !== null);
  const avgMtbfHours = mtbfValues.length ? mtbfValues.reduce((a, b) => a + b, 0) / mtbfValues.length : 0;
  const avgMttrHours = rows.reduce((sum, row) => sum + Number(row.mttr_hours), 0) / rows.length;
  const avgUptimePercent = rows.reduce((sum, row) => sum + Number(row.uptime_percent), 0) / rows.length;

  return {
    avgMtbfHours: Number(avgMtbfHours.toFixed(2)),
    avgMttrHours: Number(avgMttrHours.toFixed(2)),
    avgUptimePercent: Number(avgUptimePercent.toFixed(2))
  };
}
