import type { PostgrestError } from "@supabase/supabase-js";
import type { Equipment, EquipmentStatus, Sensor } from "@/types/domain";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export interface EquipmentInput {
  name: string;
  equipmentType: string;
  serialNumber: string;
  status: EquipmentStatus;
}

export interface ServiceResult<T> {
  data: T | null;
  error: string | null;
}

function mapError(error: PostgrestError | null) {
  if (!error) return null;
  if (error.code === "23505") return "Serial number already exists.";
  return "Operation failed. Please try again.";
}

async function getUserFacilityId(userId: string): Promise<string | null> {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.from("users").select("facility_id").eq("id", userId).single();
  return data?.facility_id ?? null;
}

export async function listEquipment(limit = 20, page = 1): Promise<Equipment[]> {
  const supabase = await createServerSupabaseClient();
  const from = Math.max(0, (page - 1) * limit);
  const to = from + limit - 1;
  const { data } = await supabase
    .from("equipment")
    .select("id, facility_id, name, equipment_type, serial_number, status, created_at")
    .order("created_at", { ascending: false })
    .range(from, to);

  return (data ?? []) as Equipment[];
}

export async function getEquipmentById(equipmentId: string): Promise<Equipment | null> {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("equipment")
    .select("id, facility_id, name, equipment_type, serial_number, status, created_at")
    .eq("id", equipmentId)
    .single();

  return (data as Equipment | null) ?? null;
}

export async function createEquipment(userId: string, input: EquipmentInput): Promise<ServiceResult<Equipment>> {
  const supabase = await createServerSupabaseClient();
  const facilityId = await getUserFacilityId(userId);

  if (!facilityId) {
    return { data: null, error: "Unable to identify your facility." };
  }

  const { data, error } = await supabase
    .from("equipment")
    .insert({
      facility_id: facilityId,
      name: input.name,
      equipment_type: input.equipmentType,
      serial_number: input.serialNumber,
      status: input.status
    })
    .select("id, facility_id, name, equipment_type, serial_number, status, created_at")
    .single();

  return { data: (data as Equipment | null) ?? null, error: mapError(error) };
}

export async function updateEquipment(equipmentId: string, input: EquipmentInput): Promise<ServiceResult<Equipment>> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("equipment")
    .update({
      name: input.name,
      equipment_type: input.equipmentType,
      serial_number: input.serialNumber,
      status: input.status
    })
    .eq("id", equipmentId)
    .select("id, facility_id, name, equipment_type, serial_number, status, created_at")
    .single();

  return { data: (data as Equipment | null) ?? null, error: mapError(error) };
}

export async function deleteEquipment(equipmentId: string): Promise<ServiceResult<{ id: string }>> {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("equipment").delete().eq("id", equipmentId);

  return { data: error ? null : { id: equipmentId }, error: mapError(error) };
}

export async function getEquipmentSensors(equipmentId: string): Promise<Sensor[]> {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("sensors")
    .select("id, facility_id, equipment_id, sensor_type, unit, created_at")
    .eq("equipment_id", equipmentId);

  return (data ?? []) as Sensor[];
}
