import { AppShell } from "@/components/dashboard/app-shell";
import { requireAuth } from "@/lib/utils/auth";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { role } = await requireAuth();
  return <AppShell role={role}>{children}</AppShell>;
}
