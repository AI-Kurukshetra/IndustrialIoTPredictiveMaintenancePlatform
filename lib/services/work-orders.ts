import type { WorkOrder } from "@/types/domain";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function listWorkOrders(limit = 30, page = 1): Promise<WorkOrder[]> {
  const supabase = await createServerSupabaseClient();
  const from = Math.max(0, (page - 1) * limit);
  const to = from + limit - 1;
  const { data } = await supabase
    .from("work_orders")
    .select(
      "id, facility_id, equipment_id, maintenance_schedule_id, title, status, priority, due_date, assigned_to, completed_at, completion_notes, created_at"
    )
    .order("created_at", { ascending: false })
    .range(from, to);

  return (data ?? []) as WorkOrder[];
}

export async function createWorkOrder(input: {
  equipmentId: string;
  title: string;
  priority: WorkOrder["priority"];
  dueDate?: string;
}) {
  const supabase = await createServerSupabaseClient();
  const { data: equipment, error: equipmentError } = await supabase
    .from("equipment")
    .select("facility_id")
    .eq("id", input.equipmentId)
    .single();

  if (equipmentError || !equipment) {
    return { data: null, error: equipmentError ?? new Error("Equipment not found") };
  }

  return supabase.from("work_orders").insert({
    facility_id: equipment.facility_id,
    equipment_id: input.equipmentId,
    title: input.title,
    status: "open",
    priority: input.priority,
    due_date: input.dueDate ?? null
  });
}
