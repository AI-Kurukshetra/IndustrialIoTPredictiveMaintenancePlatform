import type { LiveMonitorSnapshot } from "@/types/domain";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function getLiveMonitorSnapshot(): Promise<LiveMonitorSnapshot> {
  const supabase = await createServerSupabaseClient();
  const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  const [{ count: readingsLastHour }, { count: openCriticalAlerts }, { data: latestReadings }] =
    await Promise.all([
      supabase
        .from("sensor_readings")
        .select("id", { count: "exact", head: true })
        .gte("recorded_at", hourAgo),
      supabase
        .from("alerts")
        .select("id", { count: "exact", head: true })
        .eq("is_resolved", false)
        .eq("severity", "critical"),
      supabase
        .from("sensor_readings")
        .select("reading_value, sensors!inner(sensor_type), recorded_at")
        .order("recorded_at", { ascending: false })
        .limit(30)
    ]);

  const sensorValues = {
    temperature: null as number | null,
    vibration: null as number | null,
    pressure: null as number | null
  };

  for (const row of latestReadings ?? []) {
    const sensorJoin = row.sensors as unknown;
    const sensor = Array.isArray(sensorJoin)
      ? (sensorJoin[0] as { sensor_type: keyof typeof sensorValues } | undefined)
      : (sensorJoin as { sensor_type: keyof typeof sensorValues } | undefined);

    if (!sensor) continue;

    if (sensorValues[sensor.sensor_type] === null) {
      sensorValues[sensor.sensor_type] = Number(row.reading_value);
    }
  }

  return {
    readingsLastHour: readingsLastHour ?? 0,
    openCriticalAlerts: openCriticalAlerts ?? 0,
    latestTemperature: sensorValues.temperature,
    latestVibration: sensorValues.vibration,
    latestPressure: sensorValues.pressure
  };
}
