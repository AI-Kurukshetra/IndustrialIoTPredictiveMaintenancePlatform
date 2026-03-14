"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { acknowledgeAlert, resolveAlert } from "@/lib/services/alerts";
import { requireAuth } from "@/lib/utils/auth";

function q(value: string) {
  return encodeURIComponent(value);
}

export async function acknowledgeAlertAction(formData: FormData) {
  const { user } = await requireAuth("technician");
  const id = String(formData.get("id") ?? "");
  if (!id) {
    redirect(`/alerts?error=${q("Invalid alert id.")}`);
  }

  const { error } = await acknowledgeAlert(id, user.id);
  if (error) {
    redirect(`/alerts?error=${q(error.message)}`);
  }

  revalidatePath("/alerts");
  revalidatePath("/dashboard");
  redirect("/alerts?status=acknowledged");
}

export async function resolveAlertAction(formData: FormData) {
  await requireAuth("technician");
  const id = String(formData.get("id") ?? "");
  if (!id) {
    redirect(`/alerts?error=${q("Invalid alert id.")}`);
  }

  const { error } = await resolveAlert(id);
  if (error) {
    redirect(`/alerts?error=${q(error.message)}`);
  }

  revalidatePath("/alerts");
  revalidatePath("/dashboard");
  redirect("/alerts?status=resolved");
}
