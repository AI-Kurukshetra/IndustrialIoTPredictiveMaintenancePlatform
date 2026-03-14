"use client";

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface EquipmentComparisonRow {
  equipmentId: string;
  name: string;
  type: string;
  status: string;
  mtbfHours: number | null;
  mttrHours: number;
  uptimePercent: number;
}

export function EquipmentComparisonChart({ data }: { data: EquipmentComparisonRow[] }) {
  return (
    <div className="h-80 rounded-xl bg-white p-4 shadow">
      <h3 className="mb-3 text-sm font-semibold text-slate-700">Equipment Uptime Comparison</h3>
      <ResponsiveContainer width="100%" height="90%">
        <BarChart data={data}>
          <XAxis dataKey="name" tick={{ fontSize: 10 }} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
          <Tooltip formatter={(value: number) => `${value.toFixed(2)}%`} />
          <Bar dataKey="uptimePercent" fill="#0ea5e9" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
