import type { Alert } from "@/types/domain";

const severityClass: Record<Alert["severity"], string> = {
  low: "bg-blue-50 text-blue-700",
  medium: "bg-amber-50 text-amber-700",
  high: "bg-orange-50 text-orange-700",
  critical: "bg-red-50 text-red-700"
};

export function AlertList({ alerts }: { alerts: Alert[] }) {
  if (!alerts.length) {
    return <p className="rounded-xl bg-white p-4 text-sm text-slate-500 shadow">No active alerts.</p>;
  }

  return (
    <ul className="space-y-3">
      {alerts.map((alert) => (
        <li key={alert.id} className="rounded-xl bg-white p-4 shadow">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-medium text-slate-900">{alert.title}</p>
              <p className="text-sm text-slate-600">{alert.message}</p>
            </div>
            <span className={`rounded px-2 py-1 text-xs font-medium ${severityClass[alert.severity]}`}>
              {alert.severity}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}
