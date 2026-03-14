import { createServerSupabaseClient } from "@/lib/supabase/server";
import { SENSOR_THRESHOLDS } from "@/lib/utils/constants";
import type { EquipmentStatus } from "@/types/domain";

type SensorMetric = "temperature" | "vibration" | "pressure";

function resolveStatus(metrics: Record<SensorMetric, number | null>): EquipmentStatus {
  const critical =
    (metrics.temperature ?? 0) >= SENSOR_THRESHOLDS.temperature.critical ||
    (metrics.vibration ?? 0) >= SENSOR_THRESHOLDS.vibration.critical ||
    (metrics.pressure ?? 0) >= SENSOR_THRESHOLDS.pressure.critical;

  if (critical) return "fault";

  const warning =
    (metrics.temperature ?? 0) >= SENSOR_THRESHOLDS.temperature.warning ||
    (metrics.vibration ?? 0) >= SENSOR_THRESHOLDS.vibration.warning ||
    (metrics.pressure ?? 0) >= SENSOR_THRESHOLDS.pressure.warning;

  if (warning) return "maintenance";
  return "online";
}

export async function refreshEquipmentStatus(equipmentId: string) {
  const supabase = await createServerSupabaseClient();
  const { data: rows } = await supabase
    .from("sensor_readings")
    .select("reading_value, sensors!inner(sensor_type), recorded_at")
    .eq("equipment_id", equipmentId)
    .order("recorded_at", { ascending: false })
    .limit(40);

  const latest: Record<SensorMetric, number | null> = {
    temperature: null,
    vibration: null,
    pressure: null
  };

  for (const row of rows ?? []) {
    const sensorJoin = row.sensors as unknown;
    const sensor = Array.isArray(sensorJoin)
      ? (sensorJoin[0] as { sensor_type: SensorMetric } | undefined)
      : (sensorJoin as { sensor_type: SensorMetric } | undefined);

    if (!sensor) continue;
    if (latest[sensor.sensor_type] === null) {
      latest[sensor.sensor_type] = Number(row.reading_value);
    }
  }

  const nextStatus = resolveStatus(latest);
  await supabase.from("equipment").update({ status: nextStatus }).eq("id", equipmentId);
  return nextStatus;
}
