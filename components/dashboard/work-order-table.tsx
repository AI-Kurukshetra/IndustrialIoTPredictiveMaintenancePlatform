import type { WorkOrder } from "@/types/domain";

export function WorkOrderTable({ workOrders }: { workOrders: WorkOrder[] }) {
  if (!workOrders.length) {
    return <p className="rounded-xl bg-white p-4 text-sm text-slate-500 shadow">No work orders found.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-xl bg-white shadow">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-50 text-left text-slate-600">
          <tr>
            <th className="px-4 py-3">Title</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Priority</th>
            <th className="px-4 py-3">Due Date</th>
          </tr>
        </thead>
        <tbody>
          {workOrders.map((order) => (
            <tr key={order.id} className="border-t border-slate-100">
              <td className="px-4 py-3">{order.title}</td>
              <td className="px-4 py-3">{order.status}</td>
              <td className="px-4 py-3">{order.priority}</td>
              <td className="px-4 py-3">{order.due_date ? new Date(order.due_date).toLocaleDateString() : "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
