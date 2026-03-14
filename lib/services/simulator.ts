import { addMinutes } from "date-fns";
import { refreshEquipmentStatus } from "@/lib/services/equipment-status";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const ranges = {
  temperature: { min: 60, max: 105 },
  vibration: { min: 6, max: 20 },
  pressure: { min: 90, max: 180 }
};

function random(min: number, max: number) {
  return Number((Math.random() * (max - min) + min).toFixed(2));
}

export async function generateSensorReadings(count = 20, equipmentId?: string) {
  const supabase = await createServerSupabaseClient();

  const sensorsQuery = supabase
    .from("sensors")
    .select("id, facility_id, equipment_id, sensor_type")
    .limit(1000);

  const { data: sensors } = equipmentId ? await sensorsQuery.eq("equipment_id", equipmentId) : await sensorsQuery;

  if (!sensors || sensors.length === 0) {
    return { inserted: 0 };
  }

  const now = new Date();
  const updatedEquipmentIds = new Set<string>();
  const rows = sensors.flatMap((sensor) => {
    updatedEquipmentIds.add(sensor.equipment_id);

    const sensorType = sensor.sensor_type as keyof typeof ranges;
    const bounds = ranges[sensorType];

    return Array.from({ length: count }).map((_, idx) => ({
      facility_id: sensor.facility_id,
      equipment_id: sensor.equipment_id,
      sensor_id: sensor.id,
      reading_value: random(bounds.min, bounds.max),
      recorded_at: addMinutes(now, -idx).toISOString()
    }));
  });

  await supabase.from("sensor_readings").insert(rows);
  await Promise.all(Array.from(updatedEquipmentIds).map((id) => refreshEquipmentStatus(id)));

  return { inserted: rows.length };
}
