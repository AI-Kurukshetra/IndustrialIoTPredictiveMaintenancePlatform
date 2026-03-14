"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface TrendPoint {
  timestamp: string;
  temperature: number | null;
  vibration: number | null;
  pressure: number | null;
}

export function SensorTrendChart({ data }: { data: TrendPoint[] }) {
  return (
    <div className="h-72 rounded-xl bg-white p-4 shadow">
      <h3 className="mb-3 text-sm font-semibold text-slate-700">Sensor Trend</h3>
      <ResponsiveContainer width="100%" height="90%">
        <LineChart data={data}>
          <XAxis
            dataKey="timestamp"
            tick={{ fontSize: 11 }}
            tickFormatter={(value: string) => new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip
            labelFormatter={(value: string) => new Date(value).toLocaleString()}
            formatter={(value: number) => value.toFixed(2)}
          />
          <Line type="monotone" dataKey="temperature" stroke="#0284c7" dot={false} />
          <Line type="monotone" dataKey="vibration" stroke="#7c3aed" dot={false} />
          <Line type="monotone" dataKey="pressure" stroke="#0f766e" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
