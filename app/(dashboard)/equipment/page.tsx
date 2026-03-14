import Link from "next/link";
import type { Route } from "next";
import { Pencil, Plus } from "lucide-react";
import type { EquipmentStatus } from "@/types/domain";
import { PageState } from "@/components/ui/page-state";
import { createEquipmentAction } from "@/app/(dashboard)/equipment/actions";
import { listEquipment } from "@/lib/services/equipment";
import { requireAuth } from "@/lib/utils/auth";

const statusOptions: EquipmentStatus[] = ["online", "maintenance", "offline", "fault"];

function StatusMessage({ status, error }: { status?: string; error?: string }) {
  if (error) {
    return <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>;
  }

  if (!status) return null;

  const text = status === "created" ? "Equipment created successfully." : status === "deleted" ? "Equipment deleted." : status;
  return <p className="rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{text}</p>;
}

export default async function EquipmentPage({
  searchParams
}: {
  searchParams: Promise<{ status?: string; error?: string; page?: string }>;
}) {
  const [{ role }, params] = await Promise.all([requireAuth(), searchParams]);
  const page = Number(params.page ?? "1") || 1;
  const equipment = await listEquipment(20, page);
  const canManage = role === "admin" || role === "manager";

  return (
    <>
      <header className="space-y-2">
        <h2 className="text-2xl font-semibold">Equipment Assets</h2>
        <p className="text-sm text-slate-600">Manage machine inventory, identifiers, and operating status by facility.</p>
      </header>

      <StatusMessage status={params.status} error={params.error} />

      {canManage ? (
        <section className="rounded-xl bg-white p-5 shadow">
          <h3 className="text-lg font-semibold">Add Equipment</h3>
          <form action={createEquipmentAction} className="mt-4 grid gap-3 md:grid-cols-2">
            <label className="space-y-1 text-sm text-slate-700">
              <span>Name</span>
              <input name="name" required className="w-full rounded border border-slate-200 px-3 py-2" placeholder="CNC Line 4" />
            </label>

            <label className="space-y-1 text-sm text-slate-700">
              <span>Type</span>
              <input
                name="equipmentType"
                required
                className="w-full rounded border border-slate-200 px-3 py-2"
                placeholder="Compressor"
              />
            </label>

            <label className="space-y-1 text-sm text-slate-700">
              <span>Serial Number</span>
              <input
                name="serialNumber"
                required
                className="w-full rounded border border-slate-200 px-3 py-2"
                placeholder="SN-00911"
              />
            </label>

            <label className="space-y-1 text-sm text-slate-700">
              <span>Status</span>
              <select name="status" defaultValue="online" className="w-full rounded border border-slate-200 px-3 py-2">
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>

            <div className="md:col-span-2">
              <button type="submit" className="inline-flex items-center gap-2 rounded bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">
                <Plus className="h-4 w-4" />
                Create Equipment
              </button>
            </div>
          </form>
        </section>
      ) : null}

      {equipment.length ? (
        <section className="space-y-3">
          <div className="overflow-x-auto rounded-xl bg-white shadow">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-600">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Serial</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {equipment.map((item) => (
                  <tr key={item.id} className="border-t border-slate-100">
                    <td className="px-4 py-3 font-medium text-slate-900">{item.name}</td>
                    <td className="px-4 py-3">{item.equipment_type}</td>
                    <td className="px-4 py-3">{item.serial_number}</td>
                    <td className="px-4 py-3">{item.status}</td>
                    <td className="px-4 py-3">{new Date(item.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      {canManage ? (
                        <Link href={`/equipment/${item.id}/edit` as Route} className="inline-flex items-center gap-1 text-cyan-700 hover:text-cyan-800">
                          <Pencil className="h-4 w-4" />
                          Edit
                        </Link>
                      ) : (
                        <span className="text-slate-400">View only</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex gap-2">
            <Link href={`/equipment?page=${Math.max(1, page - 1)}` as Route} className="rounded border border-slate-200 bg-white px-3 py-1 text-sm hover:bg-slate-50">
              Prev
            </Link>
            <Link href={`/equipment?page=${page + 1}` as Route} className="rounded border border-slate-200 bg-white px-3 py-1 text-sm hover:bg-slate-50">
              Next
            </Link>
          </div>
        </section>
      ) : (
        <PageState title="No equipment yet" message="Create your first equipment asset to start monitoring." />
      )}
    </>
  );
}
