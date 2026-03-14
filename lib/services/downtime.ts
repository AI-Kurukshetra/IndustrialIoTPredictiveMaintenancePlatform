import type { DowntimeEvent } from "@/types/domain";
import { createServerSupabaseClient } from "@/lib/supabase/server";

async function getFacilityId(userId: string) {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.from("users").select("facility_id").eq("id", userId).single();
  return data?.facility_id ?? null;
}

export async function startDowntime(input: { userId: string; equipmentId: string; cause: string }) {
  const supabase = await createServerSupabaseClient();
  const facilityId = await getFacilityId(input.userId);
  if (!facilityId) return { data: null, error: "Unable to identify facility." };

  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("downtime_events")
    .insert({
      facility_id: facilityId,
      equipment_id: input.equipmentId,
      started_at: now,
      start_time: now,
      reason: input.cause,
      cause: input.cause
    })
    .select("id, facility_id, equipment_id, start_time, end_time, cause, created_at")
    .single();

  return { data: (data as DowntimeEvent | null) ?? null, error: error?.message ?? null };
}

export async function endDowntime(downtimeId: string) {
  const supabase = await createServerSupabaseClient();
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("downtime_events")
    .update({ ended_at: now, end_time: now })
    .eq("id", downtimeId)
    .is("end_time", null)
    .select("id, facility_id, equipment_id, start_time, end_time, cause, created_at")
    .single();

  return { data: (data as DowntimeEvent | null) ?? null, error: error?.message ?? null };
}

export async function listDowntimeEvents(equipmentId?: string, limit = 30): Promise<DowntimeEvent[]> {
  const supabase = await createServerSupabaseClient();
  let query = supabase
    .from("downtime_events")
    .select("id, facility_id, equipment_id, start_time, end_time, cause, created_at")
    .order("start_time", { ascending: false })
    .limit(limit);

  if (equipmentId) {
    query = query.eq("equipment_id", equipmentId);
  }

  const { data } = await query;
  return (data ?? []) as DowntimeEvent[];
}

export function calculateUptimePercentFromEvents(
  events: Array<Pick<DowntimeEvent, "start_time" | "end_time">>,
  windowHours = 24
) {
  const windowMs = windowHours * 60 * 60 * 1000;
  const now = Date.now();
  const startWindow = now - windowMs;

  let downMs = 0;
  for (const event of events) {
    const start = new Date(event.start_time).getTime();
    const end = event.end_time ? new Date(event.end_time).getTime() : now;
    const clippedStart = Math.max(startWindow, start);
    const clippedEnd = Math.min(now, end);
    if (clippedEnd > clippedStart) {
      downMs += clippedEnd - clippedStart;
    }
  }

  const upMs = Math.max(0, windowMs - downMs);
  return Number(((upMs / windowMs) * 100).toFixed(2));
}
