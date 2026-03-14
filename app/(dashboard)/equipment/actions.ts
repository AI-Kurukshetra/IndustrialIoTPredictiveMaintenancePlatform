"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createEquipment, deleteEquipment, updateEquipment } from "@/lib/services/equipment";
import { endDowntime, startDowntime } from "@/lib/services/downtime";
import { requireAuth } from "@/lib/utils/auth";
import { downtimeEndSchema, downtimeStartSchema, equipmentSchema } from "@/lib/validations/schemas";

function encodeMessage(message: string) {
  return encodeURIComponent(message);
}

export async function createEquipmentAction(formData: FormData) {
  const { user } = await requireAuth("manager");

  const parsed = equipmentSchema.safeParse({
    name: String(formData.get("name") ?? ""),
    equipmentType: String(formData.get("equipmentType") ?? ""),
    serialNumber: String(formData.get("serialNumber") ?? ""),
    status: String(formData.get("status") ?? "")
  });

  if (!parsed.success) {
    redirect(`/equipment?error=${encodeMessage("Invalid equipment details.")}`);
  }

  const result = await createEquipment(user.id, parsed.data);
  if (result.error) {
    redirect(`/equipment?error=${encodeMessage(result.error)}`);
  }

  revalidatePath("/equipment");
  redirect("/equipment?status=created");
}

export async function updateEquipmentAction(formData: FormData) {
  await requireAuth("manager");

  const parsed = equipmentSchema.safeParse({
    id: String(formData.get("id") ?? ""),
    name: String(formData.get("name") ?? ""),
    equipmentType: String(formData.get("equipmentType") ?? ""),
    serialNumber: String(formData.get("serialNumber") ?? ""),
    status: String(formData.get("status") ?? "")
  });

  if (!parsed.success || !parsed.data.id) {
    redirect(`/equipment?error=${encodeMessage("Invalid update request.")}`);
  }

  const result = await updateEquipment(parsed.data.id, parsed.data);
  if (result.error) {
    redirect(`/equipment/${parsed.data.id}/edit?error=${encodeMessage(result.error)}`);
  }

  revalidatePath("/equipment");
  revalidatePath(`/equipment/${parsed.data.id}/edit`);
  redirect(`/equipment/${parsed.data.id}/edit?status=updated`);
}

export async function deleteEquipmentAction(formData: FormData) {
  await requireAuth("manager");

  const id = String(formData.get("id") ?? "");
  const parsed = equipmentSchema.pick({ id: true }).safeParse({ id });

  if (!parsed.success || !parsed.data.id) {
    redirect(`/equipment?error=${encodeMessage("Invalid delete request.")}`);
  }

  const result = await deleteEquipment(parsed.data.id);
  if (result.error) {
    redirect(`/equipment/${parsed.data.id}/edit?error=${encodeMessage(result.error)}`);
  }

  revalidatePath("/equipment");
  redirect("/equipment?status=deleted");
}

export async function startDowntimeAction(formData: FormData) {
  const { user } = await requireAuth("technician");

  const parsed = downtimeStartSchema.safeParse({
    equipmentId: String(formData.get("equipmentId") ?? ""),
    cause: String(formData.get("cause") ?? "")
  });

  if (!parsed.success) {
    redirect(`/equipment?error=${encodeMessage("Invalid downtime start request.")}`);
  }

  const result = await startDowntime({
    userId: user.id,
    equipmentId: parsed.data.equipmentId,
    cause: parsed.data.cause
  });

  if (result.error) {
    redirect(`/equipment/${parsed.data.equipmentId}/edit?error=${encodeMessage(result.error)}`);
  }

  revalidatePath("/equipment");
  revalidatePath(`/equipment/${parsed.data.equipmentId}/edit`);
  redirect(`/equipment/${parsed.data.equipmentId}/edit?status=downtime_started`);
}

export async function endDowntimeAction(formData: FormData) {
  await requireAuth("technician");

  const downtimeId = String(formData.get("downtimeId") ?? "");
  const equipmentId = String(formData.get("equipmentId") ?? "");
  const parsed = downtimeEndSchema.safeParse({ downtimeId });

  if (!parsed.success) {
    redirect(`/equipment/${equipmentId}/edit?error=${encodeMessage("Invalid downtime end request.")}`);
  }

  const result = await endDowntime(parsed.data.downtimeId);
  if (result.error) {
    redirect(`/equipment/${equipmentId}/edit?error=${encodeMessage(result.error)}`);
  }

  revalidatePath("/equipment");
  revalidatePath(`/equipment/${equipmentId}/edit`);
  redirect(`/equipment/${equipmentId}/edit?status=downtime_closed`);
}
