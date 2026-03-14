import type { MaintenanceSchedule, WorkOrder } from "@/types/domain";
import { createServerSupabaseClient } from "@/lib/supabase/server";

interface Result<T> {
  data: T | null;
  error: string | null;
}

async function getFacilityIdForUser(userId: string): Promise<string | null> {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.from("users").select("facility_id").eq("id", userId).single();
  return data?.facility_id ?? null;
}

export async function listMaintenanceSchedules(limit = 20): Promise<MaintenanceSchedule[]> {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("maintenance_schedules")
    .select("id, facility_id, equipment_id, cadence_days, next_due_at, is_active, title, created_at")
    .order("next_due_at", { ascending: true })
    .limit(limit);

  return (data ?? []) as MaintenanceSchedule[];
}

export async function createMaintenanceSchedule(input: {
  userId: string;
  equipmentId: string;
  title: string;
  cadenceDays: number;
  nextDueAt: string;
}): Promise<Result<MaintenanceSchedule>> {
  const supabase = await createServerSupabaseClient();
  const facilityId = await getFacilityIdForUser(input.userId);
  if (!facilityId) return { data: null, error: "Unable to identify user facility." };

  const { data, error } = await supabase
    .from("maintenance_schedules")
    .insert({
      facility_id: facilityId,
      equipment_id: input.equipmentId,
      title: input.title,
      cadence_days: input.cadenceDays,
      next_due_at: input.nextDueAt
    })
    .select("id, facility_id, equipment_id, cadence_days, next_due_at, is_active, title, created_at")
    .single();

  return { data: (data as MaintenanceSchedule | null) ?? null, error: error?.message ?? null };
}

export async function listTechnicians() {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("users")
    .select("id, full_name, role")
    .in("role", ["technician", "manager", "admin"])
    .order("full_name", { ascending: true });

  return data ?? [];
}

export async function transitionWorkOrder(input: {
  id: string;
  status: WorkOrder["status"];
  assignedTo?: string | null;
  completionNotes?: string;
}): Promise<Result<WorkOrder>> {
  const supabase = await createServerSupabaseClient();
  const patch: Record<string, string | null> = {
    status: input.status
  };

  if (input.assignedTo !== undefined) patch.assigned_to = input.assignedTo;
  if (input.status === "completed") {
    patch.completed_at = new Date().toISOString();
    patch.completion_notes = input.completionNotes ?? null;
  }

  const { data: workOrder, error } = await supabase
    .from("work_orders")
    .update(patch)
    .eq("id", input.id)
    .select(
      "id, facility_id, equipment_id, maintenance_schedule_id, title, status, priority, due_date, assigned_to, completed_at, completion_notes, created_at"
    )
    .single();

  if (error || !workOrder) {
    return { data: null, error: error?.message ?? "Unable to update work order." };
  }

  if (input.status === "completed") {
    await supabase.from("maintenance_history").insert({
      facility_id: workOrder.facility_id,
      equipment_id: workOrder.equipment_id,
      work_order_id: workOrder.id,
      summary: input.completionNotes ?? "Completed through maintenance workflow.",
      performed_at: new Date().toISOString()
    });
  }

  return { data: workOrder as WorkOrder, error: null };
}
