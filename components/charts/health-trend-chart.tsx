"use client";

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";

export function HealthTrendChart({ data }: { data: Array<{ label: string; score: number }> }) {
  return (
    <div className="h-64 rounded-xl bg-white p-4 shadow">
      <h3 className="mb-3 text-sm font-semibold text-slate-700">Health Score Trend</h3>
      <ResponsiveContainer width="100%" height="90%">
        <AreaChart data={data}>
          <XAxis dataKey="label" tick={{ fontSize: 12 }} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
          <Tooltip />
          <Area type="monotone" dataKey="score" stroke="#0284c7" fill="#bae6fd" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
