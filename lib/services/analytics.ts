import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { DowntimeEvent } from "@/types/domain";
import { listReliabilityMetrics } from "@/lib/services/reliability";

export interface SensorTrendPoint {
  timestamp: string;
  temperature: number | null;
  vibration: number | null;
  pressure: number | null;
}

export async function getSensorTrend(limit = 60): Promise<SensorTrendPoint[]> {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("sensor_readings")
    .select("recorded_at, reading_value, sensors!inner(sensor_type)")
    .order("recorded_at", { ascending: false })
    .limit(limit);

  const map = new Map<string, SensorTrendPoint>();

  for (const row of data ?? []) {
    const ts = row.recorded_at as string;
    if (!map.has(ts)) {
      map.set(ts, { timestamp: ts, temperature: null, vibration: null, pressure: null });
    }

    const sensorJoin = row.sensors as unknown;
    const sensor = Array.isArray(sensorJoin)
      ? (sensorJoin[0] as { sensor_type: "temperature" | "vibration" | "pressure" } | undefined)
      : (sensorJoin as { sensor_type: "temperature" | "vibration" | "pressure" } | undefined);

    if (!sensor) continue;
    const point = map.get(ts);
    if (point) {
      point[sensor.sensor_type] = Number(row.reading_value);
    }
  }

  return Array.from(map.values())
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    .slice(-30);
}

export async function getDowntimeHistory(limit = 40): Promise<DowntimeEvent[]> {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("downtime_events")
    .select("id, facility_id, equipment_id, start_time, end_time, cause, created_at")
    .order("start_time", { ascending: false })
    .limit(limit);

  return (data ?? []) as DowntimeEvent[];
}

export async function getEquipmentComparison(page = 1, limit = 12) {
  const reliabilityRows = await listReliabilityMetrics(limit, page);
  const supabase = await createServerSupabaseClient();

  const equipmentIds = reliabilityRows.map((row) => row.equipment_id);
  if (!equipmentIds.length) return [];

  const { data: equipment } = await supabase
    .from("equipment")
    .select("id, name, equipment_type, status")
    .in("id", equipmentIds);

  const equipmentMap = new Map((equipment ?? []).map((item) => [item.id, item]));

  return reliabilityRows.map((row) => {
    const detail = equipmentMap.get(row.equipment_id);
    return {
      equipmentId: row.equipment_id,
      name: detail?.name ?? "Unknown",
      type: detail?.equipment_type ?? "Unknown",
      status: detail?.status ?? "offline",
      mtbfHours: row.mtbf_hours,
      mttrHours: row.mttr_hours,
      uptimePercent: row.uptime_percent
    };
  });
}
