import { Building2, Save } from "lucide-react";
import { getMyFacility } from "@/lib/services/admin";
import { requireAuth } from "@/lib/utils/auth";
import { updateFacilityAction } from "../actions";

export default async function ManageFacilityPage({
  searchParams
}: {
  searchParams?: Promise<{ status?: string; error?: string }>;
}) {
  await requireAuth("admin");
  const facility = await getMyFacility();
  const query = (await searchParams) ?? {};

  return (
    <>
      <header className="rounded-xl bg-white p-5 shadow">
        <h2 className="inline-flex items-center gap-2 text-2xl font-semibold text-slate-900">
          <Building2 className="h-6 w-6" />
          Manage Facility
        </h2>
        <p className="mt-1 text-sm text-slate-600">Maintain facility details used across onboarding and operations.</p>
      </header>

      {query.status ? <p className="rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">Facility updated successfully.</p> : null}
      {query.error ? <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{decodeURIComponent(query.error)}</p> : null}

      {!facility ? (
        <div className="rounded-xl bg-white p-6 text-sm text-slate-600 shadow">No facility is linked to your user.</div>
      ) : (
        <form action={updateFacilityAction} className="space-y-4 rounded-xl bg-white p-6 shadow">
          <input type="hidden" name="id" value={facility.id} />

          <div>
            <label htmlFor="facility-name" className="mb-1 block text-sm text-slate-700">
              Facility Name
            </label>
            <input
              id="facility-name"
              name="name"
              defaultValue={facility.name}
              className="w-full rounded border border-slate-200 px-3 py-2 text-sm text-slate-900"
              required
            />
          </div>

          <div>
            <label htmlFor="facility-code" className="mb-1 block text-sm text-slate-700">
              Facility Code
            </label>
            <input
              id="facility-code"
              name="code"
              defaultValue={facility.code}
              className="w-full rounded border border-slate-200 px-3 py-2 text-sm text-slate-900"
              required
            />
          </div>

          <div>
            <label htmlFor="facility-location" className="mb-1 block text-sm text-slate-700">
              Location
            </label>
            <input
              id="facility-location"
              name="location"
              defaultValue={facility.location}
              className="w-full rounded border border-slate-200 px-3 py-2 text-sm text-slate-900"
              required
            />
          </div>

          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded bg-cyan-700 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-600"
          >
            <Save className="h-4 w-4" />
            Save Changes
          </button>
        </form>
      )}
    </>
  );
}
