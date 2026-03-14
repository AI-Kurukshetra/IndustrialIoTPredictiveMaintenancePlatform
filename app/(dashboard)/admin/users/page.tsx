import { Save, Users } from "lucide-react";
import { listFacilityUsers } from "@/lib/services/admin";
import { requireAuth } from "@/lib/utils/auth";
import type { UserRole } from "@/types/domain";
import { updateFacilityUserRoleAction } from "../actions";

const roles: UserRole[] = ["operator", "technician", "manager", "admin"];

export default async function ManageUsersPage({
  searchParams
}: {
  searchParams?: Promise<{ status?: string; error?: string }>;
}) {
  await requireAuth("admin");
  const users = await listFacilityUsers();
  const query = (await searchParams) ?? {};

  return (
    <>
      <header className="rounded-xl bg-white p-5 shadow">
        <h2 className="inline-flex items-center gap-2 text-2xl font-semibold text-slate-900">
          <Users className="h-6 w-6" />
          Manage Users
        </h2>
        <p className="mt-1 text-sm text-slate-600">Update role access for users in your facility.</p>
      </header>

      {query.status ? <p className="rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">User role updated successfully.</p> : null}
      {query.error ? <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{decodeURIComponent(query.error)}</p> : null}

      {users.length === 0 ? (
        <div className="rounded-xl bg-white p-6 text-sm text-slate-600 shadow">No users found in this facility.</div>
      ) : (
        <div className="overflow-x-auto rounded-xl bg-white shadow">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-100 text-left text-slate-700">
              <tr>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 text-slate-900">{user.email}</td>
                  <td className="px-4 py-3 text-slate-600">{user.full_name ?? "-"}</td>
                  <td className="px-4 py-3">
                    <form action={updateFacilityUserRoleAction} className="flex items-center gap-2">
                      <input type="hidden" name="userId" value={user.id} />
                      <select
                        name="role"
                        defaultValue={user.role}
                        className="rounded border border-slate-200 bg-white px-2 py-1 text-sm text-slate-700"
                        aria-label={`Role for ${user.email}`}
                      >
                        {roles.map((role) => (
                          <option key={role} value={role}>
                            {role}
                          </option>
                        ))}
                      </select>
                      <button
                        type="submit"
                        className="inline-flex items-center gap-1 rounded bg-cyan-700 px-2 py-1 text-xs font-medium text-white hover:bg-cyan-600"
                      >
                        <Save className="h-3.5 w-3.5" />
                        Save
                      </button>
                    </form>
                  </td>
                  <td className="px-4 py-3 text-right text-xs text-slate-500">{new Date(user.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
