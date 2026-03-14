"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { updateMyFacility, updateFacilityUserRole } from "@/lib/services/admin";
import { requireAuth } from "@/lib/utils/auth";
import { adminUserRoleSchema, facilityUpdateSchema } from "@/lib/validations/schemas";

function toQueryMessage(message: string) {
  return encodeURIComponent(message);
}

export async function updateFacilityUserRoleAction(formData: FormData) {
  await requireAuth("admin");

  const parsed = adminUserRoleSchema.safeParse({
    userId: String(formData.get("userId") ?? ""),
    role: String(formData.get("role") ?? "")
  });

  if (!parsed.success) {
    redirect(`/admin/users?error=${toQueryMessage("Invalid user role update request.")}`);
  }

  const { error } = await updateFacilityUserRole(parsed.data.userId, parsed.data.role);
  if (error) {
    redirect(`/admin/users?error=${toQueryMessage(error.message)}`);
  }

  revalidatePath("/admin/users");
  redirect("/admin/users?status=updated");
}

export async function updateFacilityAction(formData: FormData) {
  await requireAuth("admin");

  const parsed = facilityUpdateSchema.safeParse({
    id: String(formData.get("id") ?? ""),
    name: String(formData.get("name") ?? ""),
    code: String(formData.get("code") ?? ""),
    location: String(formData.get("location") ?? "")
  });

  if (!parsed.success) {
    redirect(`/admin/facility?error=${toQueryMessage("Invalid facility update request.")}`);
  }

  const { error } = await updateMyFacility(parsed.data);
  if (error) {
    redirect(`/admin/facility?error=${toQueryMessage(error.message)}`);
  }

  revalidatePath("/admin/facility");
  revalidatePath("/dashboard");
  redirect("/admin/facility?status=updated");
}
