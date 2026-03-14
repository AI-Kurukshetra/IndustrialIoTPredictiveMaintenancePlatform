"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createMaintenanceSchedule, transitionWorkOrder } from "@/lib/services/maintenance";
import { requireAuth } from "@/lib/utils/auth";
import { maintenanceScheduleSchema, workOrderLifecycleSchema } from "@/lib/validations/schemas";

function toQueryMessage(value: string) {
  return encodeURIComponent(value);
}

export async function createMaintenanceScheduleAction(formData: FormData) {
  const { user } = await requireAuth("manager");

  const parsed = maintenanceScheduleSchema.safeParse({
    equipmentId: String(formData.get("equipmentId") ?? ""),
    title: String(formData.get("title") ?? ""),
    cadenceDays: Number(formData.get("cadenceDays") ?? 0),
    nextDueAt: String(formData.get("nextDueAt") ?? "")
  });

  if (!parsed.success) {
    redirect(`/maintenance?error=${toQueryMessage("Invalid schedule details.")}`);
  }

  const result = await createMaintenanceSchedule({
    userId: user.id,
    equipmentId: parsed.data.equipmentId,
    title: parsed.data.title,
    cadenceDays: parsed.data.cadenceDays,
    nextDueAt: new Date(parsed.data.nextDueAt).toISOString()
  });
  if (result.error) {
    redirect(`/maintenance?error=${toQueryMessage(result.error)}`);
  }

  revalidatePath("/maintenance");
  redirect("/maintenance?status=schedule_created");
}

export async function transitionWorkOrderAction(formData: FormData) {
  await requireAuth("technician");

  const parsed = workOrderLifecycleSchema.safeParse({
    id: String(formData.get("id") ?? ""),
    status: String(formData.get("status") ?? ""),
    assignedTo: formData.get("assignedTo") ? String(formData.get("assignedTo")) : null,
    completionNotes: formData.get("completionNotes") ? String(formData.get("completionNotes")) : undefined
  });

  if (!parsed.success) {
    redirect(`/maintenance?error=${toQueryMessage("Invalid work order update.")}`);
  }

  const result = await transitionWorkOrder({
    id: parsed.data.id,
    status: parsed.data.status,
    assignedTo: parsed.data.assignedTo,
    completionNotes: parsed.data.completionNotes
  });

  if (result.error) {
    redirect(`/maintenance?error=${toQueryMessage(result.error)}`);
  }

  revalidatePath("/maintenance");
  redirect("/maintenance?status=work_order_updated");
}
