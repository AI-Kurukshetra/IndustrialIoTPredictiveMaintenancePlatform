import Link from "next/link";
import { ClipboardPlus, RefreshCcw } from "lucide-react";
import { PageState } from "@/components/ui/page-state";
import { createMaintenanceScheduleAction, transitionWorkOrderAction } from "@/app/(dashboard)/maintenance/actions";
import { listEquipment } from "@/lib/services/equipment";
import { listMaintenanceSchedules, listTechnicians } from "@/lib/services/maintenance";
import { listWorkOrders } from "@/lib/services/work-orders";
import { requireAuth } from "@/lib/utils/auth";

function StatusMessage({ status, error }: { status?: string; error?: string }) {
  if (error) {
    return <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>;
  }

  if (!status) return null;

  const text =
    status === "schedule_created"
      ? "Maintenance schedule created."
      : status === "work_order_updated"
        ? "Work order updated."
        : status;

  return <p className="rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{text}</p>;
}

export default async function MaintenancePage({
  searchParams
}: {
  searchParams: Promise<{ status?: string; error?: string; page?: string }>;
}) {
  const [{ role }, params] = await Promise.all([requireAuth("technician"), searchParams]);
  const canManage = role === "admin" || role === "manager";
  const page = Number(params.page ?? "1") || 1;

  const [orders, equipment, schedules, technicians] = await Promise.all([
    listWorkOrders(20, page),
    listEquipment(),
    listMaintenanceSchedules(20),
    listTechnicians()
  ]);
  const openCount = orders.filter((o) => o.status === "open").length;
  const assignedCount = orders.filter((o) => o.status === "assigned").length;
  const inProgressCount = orders.filter((o) => o.status === "in_progress").length;
  const completedCount = orders.filter((o) => o.status === "completed").length;

  return (
    <>
      <header>
        <h2 className="text-2xl font-semibold">Maintenance Workflow</h2>
        <p className="text-sm text-slate-600">Manage schedules, technician assignment, and work order lifecycle.</p>
      </header>

      <StatusMessage status={params.status} error={params.error} />

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <article className="rounded-xl bg-white p-4 shadow"><p className="text-sm text-slate-600">Open</p><p className="mt-1 text-2xl font-semibold">{openCount}</p></article>
        <article className="rounded-xl bg-white p-4 shadow"><p className="text-sm text-slate-600">Assigned</p><p className="mt-1 text-2xl font-semibold">{assignedCount}</p></article>
        <article className="rounded-xl bg-white p-4 shadow"><p className="text-sm text-slate-600">In Progress</p><p className="mt-1 text-2xl font-semibold">{inProgressCount}</p></article>
        <article className="rounded-xl bg-white p-4 shadow"><p className="text-sm text-slate-600">Completed</p><p className="mt-1 text-2xl font-semibold">{completedCount}</p></article>
      </section>

      {canManage ? (
        <section className="rounded-xl bg-white p-5 shadow">
          <h3 className="text-lg font-semibold">Create Maintenance Schedule</h3>
          <form action={createMaintenanceScheduleAction} className="mt-4 grid gap-3 md:grid-cols-2">
            <label className="space-y-1 text-sm"><span>Equipment</span><select name="equipmentId" className="w-full rounded border border-slate-200 px-3 py-2" required><option value="">Select equipment</option>{equipment.map((item) => (<option key={item.id} value={item.id}>{item.name} ({item.serial_number})</option>))}</select></label>
            <label className="space-y-1 text-sm"><span>Schedule Title</span><input name="title" required className="w-full rounded border border-slate-200 px-3 py-2" placeholder="Monthly inspection" /></label>
            <label className="space-y-1 text-sm"><span>Cadence (Days)</span><input name="cadenceDays" required min={1} max={365} type="number" className="w-full rounded border border-slate-200 px-3 py-2" /></label>
            <label className="space-y-1 text-sm"><span>Next Due Date</span><input name="nextDueAt" required type="datetime-local" className="w-full rounded border border-slate-200 px-3 py-2" /></label>
            <div className="md:col-span-2"><button type="submit" className="inline-flex items-center gap-2 rounded bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"><ClipboardPlus className="h-4 w-4" />Save Schedule</button></div>
          </form>
        </section>
      ) : null}

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-xl bg-white p-5 shadow">
          <h3 className="text-lg font-semibold">Upcoming Schedules</h3>
          {schedules.length ? (
            <ul className="mt-3 space-y-2 text-sm">
              {schedules.map((schedule) => (
                <li key={schedule.id} className="rounded border border-slate-200 p-3">
                  <p className="font-medium text-slate-900">{schedule.title ?? "Scheduled maintenance"}</p>
                  <p className="text-slate-600">Cadence: {schedule.cadence_days} days</p>
                  <p className="text-slate-600">Next due: {new Date(schedule.next_due_at).toLocaleString()}</p>
                </li>
              ))}
            </ul>
          ) : (
            <PageState title="No schedules" message="Create schedules to automate maintenance planning." />
          )}
        </article>

        <article className="rounded-xl bg-white p-5 shadow">
          <h3 className="text-lg font-semibold">Work Order Lifecycle</h3>
          {orders.length ? (
            <ul className="mt-3 space-y-3">
              {orders.map((order) => (
                <li key={order.id} className="rounded border border-slate-200 p-3">
                  <p className="font-medium text-slate-900">{order.title}</p>
                  <p className="text-sm text-slate-600">Current: {order.status}</p>
                  <form action={transitionWorkOrderAction} className="mt-3 grid gap-2 md:grid-cols-3">
                    <input type="hidden" name="id" value={order.id} />
                    <select name="status" defaultValue={order.status} className="rounded border border-slate-200 px-3 py-2 text-sm">
                      <option value="open">open</option><option value="assigned">assigned</option><option value="in_progress">in_progress</option><option value="completed">completed</option><option value="cancelled">cancelled</option>
                    </select>
                    <select name="assignedTo" defaultValue={order.assigned_to ?? ""} className="rounded border border-slate-200 px-3 py-2 text-sm">
                      <option value="">Unassigned</option>
                      {technicians.map((tech) => (<option key={tech.id} value={tech.id}>{tech.full_name}</option>))}
                    </select>
                    <button type="submit" className="inline-flex items-center justify-center gap-1 rounded bg-cyan-700 px-3 py-2 text-sm font-medium text-white hover:bg-cyan-600"><RefreshCcw className="h-4 w-4" />Update</button>
                    <textarea name="completionNotes" placeholder="Completion notes" className="rounded border border-slate-200 px-3 py-2 text-sm md:col-span-3" />
                  </form>
                </li>
              ))}
            </ul>
          ) : (
            <PageState title="No work orders" message="Work orders will appear as schedules are executed." />
          )}
          <div className="mt-3 flex gap-2">
            <Link href={`/maintenance?page=${Math.max(1, page - 1)}`} className="rounded border border-slate-200 bg-white px-3 py-1 text-sm hover:bg-slate-50">Prev</Link>
            <Link href={`/maintenance?page=${page + 1}`} className="rounded border border-slate-200 bg-white px-3 py-1 text-sm hover:bg-slate-50">Next</Link>
          </div>
        </article>
      </section>
    </>
  );
}
