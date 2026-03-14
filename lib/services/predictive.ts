import { refreshEquipmentStatus } from "@/lib/services/equipment-status";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { HEALTH_SCORE_ALERT_THRESHOLD, ROLLING_WINDOW_SIZE, SENSOR_THRESHOLDS } from "@/lib/utils/constants";

type SensorMetric = "temperature" | "vibration" | "pressure";
type SensorBucket = Record<SensorMetric, number[]>;
type SensorJoinRow = { sensor_type: SensorMetric };

function avg(values: number[]) {
  return values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
}

function normalizeRisk(metric: SensorMetric, value: number) {
  const { warning, critical } = SENSOR_THRESHOLDS[metric];
  if (value <= warning) return 0;
  if (value >= critical) return 1;
  return (value - warning) / (critical - warning);
}

export async function calculateHealthScore(equipmentId: string) {
  const supabase = await createServerSupabaseClient();
  const { data: readings } = await supabase
    .from("sensor_readings")
    .select("reading_value, sensors!inner(sensor_type)")
    .eq("equipment_id", equipmentId)
    .order("recorded_at", { ascending: false })
    .limit(ROLLING_WINDOW_SIZE * 3);

  const bucket: SensorBucket = { temperature: [], vibration: [], pressure: [] };

  for (const row of readings ?? []) {
    const sensorJoin = row.sensors as unknown;
    const sensor = Array.isArray(sensorJoin)
      ? (sensorJoin[0] as SensorJoinRow | undefined)
      : (sensorJoin as SensorJoinRow | undefined);

    if (!sensor) {
      continue;
    }

    bucket[sensor.sensor_type].push(Number(row.reading_value));
  }

  const rolling = {
    temperature: avg(bucket.temperature.slice(0, ROLLING_WINDOW_SIZE)),
    vibration: avg(bucket.vibration.slice(0, ROLLING_WINDOW_SIZE)),
    pressure: avg(bucket.pressure.slice(0, ROLLING_WINDOW_SIZE))
  };

  const risk =
    (normalizeRisk("temperature", rolling.temperature) +
      normalizeRisk("vibration", rolling.vibration) +
      normalizeRisk("pressure", rolling.pressure)) /
    3;

  const score = Math.round(Math.max(0, Math.min(100, (1 - risk) * 100)));

  const { data: equipment } = await supabase.from("equipment").select("facility_id").eq("id", equipmentId).single();

  if (!equipment) return null;

  await supabase.from("equipment_health_scores").insert({
    facility_id: equipment.facility_id,
    equipment_id: equipmentId,
    score,
    model_version: "v1-threshold-rolling"
  });

  if (score < HEALTH_SCORE_ALERT_THRESHOLD) {
    await supabase.from("alerts").insert({
      facility_id: equipment.facility_id,
      equipment_id: equipmentId,
      title: "Health score below threshold",
      message: `Equipment health dropped to ${score}`,
      severity: score < 40 ? "critical" : "high"
    });
  }

  await refreshEquipmentStatus(equipmentId);
  return score;
}
