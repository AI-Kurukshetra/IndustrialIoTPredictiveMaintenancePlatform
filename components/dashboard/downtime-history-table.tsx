import type { DowntimeEvent } from "@/types/domain";

function durationHours(startTime: string, endTime: string | null) {
  const end = endTime ? new Date(endTime).getTime() : Date.now();
  const start = new Date(startTime).getTime();
  const diff = Math.max(0, end - start);
  return (diff / (1000 * 60 * 60)).toFixed(2);
}

export function DowntimeHistoryTable({ events }: { events: DowntimeEvent[] }) {
  if (!events.length) {
    return <p className="rounded-xl bg-white p-4 text-sm text-slate-500 shadow">No downtime events recorded.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-xl bg-white shadow">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-50 text-left text-slate-600">
          <tr>
            <th className="px-4 py-3">Cause</th>
            <th className="px-4 py-3">Start</th>
            <th className="px-4 py-3">End</th>
            <th className="px-4 py-3">Duration (h)</th>
          </tr>
        </thead>
        <tbody>
          {events.map((event) => (
            <tr key={event.id} className="border-t border-slate-100">
              <td className="px-4 py-3">{event.cause ?? "Unspecified"}</td>
              <td className="px-4 py-3">{new Date(event.start_time).toLocaleString()}</td>
              <td className="px-4 py-3">{event.end_time ? new Date(event.end_time).toLocaleString() : "In progress"}</td>
              <td className="px-4 py-3">{durationHours(event.start_time, event.end_time)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
