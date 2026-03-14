import Link from "next/link";
import { CheckCircle2, ShieldCheck } from "lucide-react";
import { PageState } from "@/components/ui/page-state";
import { acknowledgeAlertAction, resolveAlertAction } from "@/app/(dashboard)/alerts/actions";
import { listAlerts } from "@/lib/services/alerts";
import { requireAuth } from "@/lib/utils/auth";

function StatusMessage({ status, error }: { status?: string; error?: string }) {
  if (error) {
    return <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>;
  }

  if (!status) return null;
  const map: Record<string, string> = {
    acknowledged: "Alert acknowledged.",
    resolved: "Alert resolved."
  };

  return <p className="rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{map[status] ?? status}</p>;
}

export default async function AlertsPage({
  searchParams
}: {
  searchParams: Promise<{
    severity?: "low" | "medium" | "high" | "critical";
    includeResolved?: string;
    includeAcknowledged?: string;
    status?: string;
    error?: string;
    page?: string;
  }>;
}) {
  await requireAuth();
  const params = await searchParams;
  const page = Number(params.page ?? "1") || 1;

  const alerts = await listAlerts({
    severity: params.severity,
    includeResolved: params.includeResolved === "true",
    includeAcknowledged: params.includeAcknowledged !== "false",
    page,
    limit: 20
  });

  const filterQuery = new URLSearchParams();
  if (params.severity) filterQuery.set("severity", params.severity);
  if (params.includeResolved === "true") filterQuery.set("includeResolved", "true");
  if (params.includeAcknowledged === "false") filterQuery.set("includeAcknowledged", "false");

  return (
    <>
      <header>
        <h2 className="text-2xl font-semibold">Alert Center</h2>
        <p className="text-sm text-slate-600">Filter by severity, acknowledge incidents, and review alert history.</p>
      </header>

      <StatusMessage status={params.status} error={params.error} />

      <form method="GET" className="grid gap-3 rounded-xl bg-white p-4 shadow md:grid-cols-4">
        <label className="text-sm">
          <span className="mb-1 block text-slate-600">Severity</span>
          <select name="severity" defaultValue={params.severity ?? ""} className="w-full rounded border border-slate-200 px-3 py-2">
            <option value="">All</option>
            <option value="low">low</option>
            <option value="medium">medium</option>
            <option value="high">high</option>
            <option value="critical">critical</option>
          </select>
        </label>

        <label className="text-sm">
          <span className="mb-1 block text-slate-600">Resolved</span>
          <select name="includeResolved" defaultValue={params.includeResolved ?? "false"} className="w-full rounded border border-slate-200 px-3 py-2">
            <option value="false">Open only</option>
            <option value="true">Include resolved</option>
          </select>
        </label>

        <label className="text-sm">
          <span className="mb-1 block text-slate-600">Acknowledged</span>
          <select
            name="includeAcknowledged"
            defaultValue={params.includeAcknowledged ?? "true"}
            className="w-full rounded border border-slate-200 px-3 py-2"
          >
            <option value="true">Include acknowledged</option>
            <option value="false">Unacknowledged only</option>
          </select>
        </label>

        <div className="flex items-end">
          <button type="submit" className="w-full rounded bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">
            Apply Filters
          </button>
        </div>
      </form>

      {alerts.length ? (
        <ul className="space-y-3">
          {alerts.map((alert) => (
            <li key={alert.id} className="rounded-xl bg-white p-4 shadow">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-slate-900">{alert.title}</p>
                  <p className="text-sm text-slate-600">{alert.message}</p>
                  <p className="mt-1 text-xs text-slate-500">Created: {new Date(alert.created_at).toLocaleString()}</p>
                </div>
                <span className="rounded bg-slate-100 px-2 py-1 text-xs font-semibold uppercase text-slate-700">{alert.severity}</span>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <form action={acknowledgeAlertAction}>
                  <input type="hidden" name="id" value={alert.id} />
                  <button
                    type="submit"
                    disabled={Boolean(alert.acknowledged_at)}
                    className="inline-flex items-center gap-1 rounded border border-slate-200 px-3 py-1 text-sm disabled:opacity-50"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    {alert.acknowledged_at ? "Acknowledged" : "Acknowledge"}
                  </button>
                </form>

                <form action={resolveAlertAction}>
                  <input type="hidden" name="id" value={alert.id} />
                  <button
                    type="submit"
                    disabled={alert.is_resolved}
                    className="inline-flex items-center gap-1 rounded bg-cyan-700 px-3 py-1 text-sm text-white disabled:opacity-50"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    {alert.is_resolved ? "Resolved" : "Mark Resolved"}
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <PageState title="No alerts" message="No alerts match the current filters." />
      )}

      <div className="flex gap-2">
        <Link
          href={`/alerts?${new URLSearchParams({ ...Object.fromEntries(filterQuery), page: String(Math.max(1, page - 1)) }).toString()}`}
          className="rounded border border-slate-200 bg-white px-3 py-1 text-sm hover:bg-slate-50"
        >
          Prev
        </Link>
        <Link
          href={`/alerts?${new URLSearchParams({ ...Object.fromEntries(filterQuery), page: String(page + 1) }).toString()}`}
          className="rounded border border-slate-200 bg-white px-3 py-1 text-sm hover:bg-slate-50"
        >
          Next
        </Link>
      </div>
    </>
  );
}
