import Link from "next/link";
import { ArrowLeft, PauseCircle, PlayCircle, Save, Trash2 } from "lucide-react";
import type { EquipmentStatus } from "@/types/domain";
import { PageState } from "@/components/ui/page-state";
import { deleteEquipmentAction, endDowntimeAction, startDowntimeAction, updateEquipmentAction } from "@/app/(dashboard)/equipment/actions";
import { listDowntimeEvents } from "@/lib/services/downtime";
import { getEquipmentById } from "@/lib/services/equipment";
import { requireAuth } from "@/lib/utils/auth";

const statusOptions: EquipmentStatus[] = ["online", "maintenance", "offline", "fault"];

function StatusMessage({ status, error }: { status?: string; error?: string }) {
  if (error) return <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>;
  if (!status) return null;

  const textMap: Record<string, string> = {
    updated: "Equipment updated successfully.",
    downtime_started: "Downtime event started.",
    downtime_closed: "Downtime event closed."
  };

  return <p className="rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{textMap[status] ?? status}</p>;
}

export default async function EquipmentEditPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ status?: string; error?: string }>;
}) {
  const [{ role }, route, query] = await Promise.all([requireAuth("technician"), params, searchParams]);
  const canManage = role === "admin" || role === "manager";
  const [equipment, downtimeEvents] = await Promise.all([getEquipmentById(route.id), listDowntimeEvents(route.id, 20)]);

  if (!equipment) {
    return <PageState title="Equipment not found" message="The requested equipment record does not exist in your facility." />;
  }

  const activeDowntime = downtimeEvents.find((event) => !event.end_time);

  return (
    <>
      <header className="space-y-2">
        <Link href="/equipment" className="inline-flex items-center gap-1 text-sm text-cyan-700 hover:text-cyan-800">
          <ArrowLeft className="h-4 w-4" />
          Back to Equipment
        </Link>
        <h2 className="text-2xl font-semibold">Equipment Details</h2>
      </header>

      <StatusMessage status={query.status} error={query.error} />

      {canManage ? (
        <section className="rounded-xl bg-white p-5 shadow">
          <form action={updateEquipmentAction} className="grid gap-3 md:grid-cols-2">
            <input type="hidden" name="id" value={equipment.id} />
            <label className="space-y-1 text-sm text-slate-700"><span>Name</span><input name="name" required defaultValue={equipment.name} className="w-full rounded border border-slate-200 px-3 py-2" /></label>
            <label className="space-y-1 text-sm text-slate-700"><span>Type</span><input name="equipmentType" required defaultValue={equipment.equipment_type} className="w-full rounded border border-slate-200 px-3 py-2" /></label>
            <label className="space-y-1 text-sm text-slate-700"><span>Serial Number</span><input name="serialNumber" required defaultValue={equipment.serial_number} className="w-full rounded border border-slate-200 px-3 py-2" /></label>
            <label className="space-y-1 text-sm text-slate-700"><span>Status</span><select name="status" defaultValue={equipment.status} className="w-full rounded border border-slate-200 px-3 py-2">{statusOptions.map((status) => (<option key={status} value={status}>{status}</option>))}</select></label>
            <div className="flex flex-wrap gap-2 md:col-span-2">
              <button type="submit" className="inline-flex items-center gap-1 rounded bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"><Save className="h-4 w-4" />Save Changes</button>
            </div>
          </form>
        </section>
      ) : (
        <section className="rounded-xl bg-white p-5 shadow"><p className="text-sm text-slate-700">Read-only view for technicians. Managers/admins can edit equipment details.</p></section>
      )}

      <section className="rounded-xl bg-white p-5 shadow">
        <h3 className="text-lg font-semibold">Downtime Tracking</h3>
        <p className="mt-1 text-sm text-slate-600">Track outage windows and causes to improve reliability metrics.</p>

        {activeDowntime ? (
          <form action={endDowntimeAction} className="mt-4 flex flex-wrap items-center gap-2">
            <input type="hidden" name="downtimeId" value={activeDowntime.id} />
            <input type="hidden" name="equipmentId" value={equipment.id} />
            <span className="rounded bg-amber-50 px-3 py-2 text-sm text-amber-700">Active since {new Date(activeDowntime.start_time).toLocaleString()}</span>
            <button type="submit" className="inline-flex items-center gap-1 rounded bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"><PauseCircle className="h-4 w-4" />End Downtime</button>
          </form>
        ) : (
          <form action={startDowntimeAction} className="mt-4 grid gap-2 md:grid-cols-[1fr_auto]">
            <input type="hidden" name="equipmentId" value={equipment.id} />
            <input name="cause" required placeholder="Cause (e.g., Bearing failure)" className="rounded border border-slate-200 px-3 py-2" />
            <button type="submit" className="inline-flex items-center gap-1 rounded bg-cyan-700 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-600"><PlayCircle className="h-4 w-4" />Start Downtime</button>
          </form>
        )}

        <ul className="mt-4 space-y-2 text-sm">
          {downtimeEvents.length ? downtimeEvents.map((event) => (
            <li key={event.id} className="rounded border border-slate-200 p-3">
              <p className="font-medium text-slate-900">{event.cause ?? "Unspecified cause"}</p>
              <p className="text-slate-600">Start: {new Date(event.start_time).toLocaleString()}</p>
              <p className="text-slate-600">End: {event.end_time ? new Date(event.end_time).toLocaleString() : "In progress"}</p>
            </li>
          )) : <li className="text-slate-500">No downtime events recorded.</li>}
        </ul>
      </section>

      {canManage ? (
        <section className="rounded-xl border border-red-200 bg-white p-5 shadow">
          <h3 className="text-lg font-semibold text-red-700">Danger Zone</h3>
          <p className="mt-1 text-sm text-slate-600">Deleting equipment will also remove related sensors and readings through database constraints.</p>
          <form action={deleteEquipmentAction} className="mt-3">
            <input type="hidden" name="id" value={equipment.id} />
            <button type="submit" className="inline-flex items-center gap-1 rounded bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"><Trash2 className="h-4 w-4" />Delete Equipment</button>
          </form>
        </section>
      ) : null}
    </>
  );
}
