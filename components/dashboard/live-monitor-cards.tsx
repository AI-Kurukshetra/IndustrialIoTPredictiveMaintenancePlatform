"use client";

import { useEffect, useMemo, useState } from "react";
import { Activity, AlertTriangle, Gauge, Thermometer, Waves } from "lucide-react";
import { createClientSupabaseClient } from "@/lib/supabase/client";
import type { LiveMonitorSnapshot } from "@/types/domain";

interface Props {
  initial: LiveMonitorSnapshot;
}

function formatMetric(value: number | null, unit: string) {
  if (value === null) return "-";
  return `${value.toFixed(2)} ${unit}`;
}

export function LiveMonitorCards({ initial }: Props) {
  const supabase = useMemo(() => createClientSupabaseClient(), []);
  const [snapshot, setSnapshot] = useState<LiveMonitorSnapshot>(initial);

  useEffect(() => {
    async function refreshSnapshot() {
      const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

      const [{ count: readingsLastHour }, { count: openCriticalAlerts }, { data: latestReadings }] =
        await Promise.all([
          supabase
            .from("sensor_readings")
            .select("id", { count: "exact", head: true })
            .gte("recorded_at", hourAgo),
          supabase
            .from("alerts")
            .select("id", { count: "exact", head: true })
            .eq("is_resolved", false)
            .eq("severity", "critical"),
          supabase
            .from("sensor_readings")
            .select("reading_value, sensors!inner(sensor_type), recorded_at")
            .order("recorded_at", { ascending: false })
            .limit(30)
        ]);

      const values: Record<"temperature" | "vibration" | "pressure", number | null> = {
        temperature: null,
        vibration: null,
        pressure: null
      };

      for (const row of latestReadings ?? []) {
        const sensorJoin = row.sensors as unknown;
        const sensor = Array.isArray(sensorJoin)
          ? (sensorJoin[0] as { sensor_type: keyof typeof values } | undefined)
          : (sensorJoin as { sensor_type: keyof typeof values } | undefined);

        if (!sensor) continue;
        if (values[sensor.sensor_type] === null) {
          values[sensor.sensor_type] = Number(row.reading_value);
        }
      }

      setSnapshot({
        readingsLastHour: readingsLastHour ?? 0,
        openCriticalAlerts: openCriticalAlerts ?? 0,
        latestTemperature: values.temperature,
        latestVibration: values.vibration,
        latestPressure: values.pressure
      });
    }

    const channel = supabase
      .channel("dashboard-live-monitor")
      .on("postgres_changes", { event: "*", schema: "public", table: "sensor_readings" }, refreshSnapshot)
      .on("postgres_changes", { event: "*", schema: "public", table: "alerts" }, refreshSnapshot)
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [supabase]);

  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      <article className="rounded-xl bg-white p-4 shadow">
        <div className="flex items-center gap-2 text-slate-600">
          <Activity className="h-4 w-4" />
          <p className="text-sm">Readings (1h)</p>
        </div>
        <p className="mt-2 text-xl font-semibold">{snapshot.readingsLastHour}</p>
      </article>

      <article className="rounded-xl bg-white p-4 shadow">
        <div className="flex items-center gap-2 text-slate-600">
          <Thermometer className="h-4 w-4" />
          <p className="text-sm">Latest Temp</p>
        </div>
        <p className="mt-2 text-xl font-semibold">{formatMetric(snapshot.latestTemperature, "C")}</p>
      </article>

      <article className="rounded-xl bg-white p-4 shadow">
        <div className="flex items-center gap-2 text-slate-600">
          <Waves className="h-4 w-4" />
          <p className="text-sm">Latest Vibration</p>
        </div>
        <p className="mt-2 text-xl font-semibold">{formatMetric(snapshot.latestVibration, "mm/s")}</p>
      </article>

      <article className="rounded-xl bg-white p-4 shadow">
        <div className="flex items-center gap-2 text-slate-600">
          <Gauge className="h-4 w-4" />
          <p className="text-sm">Latest Pressure</p>
        </div>
        <p className="mt-2 text-xl font-semibold">{formatMetric(snapshot.latestPressure, "psi")}</p>
      </article>

      <article className="rounded-xl bg-white p-4 shadow">
        <div className="flex items-center gap-2 text-slate-600">
          <AlertTriangle className="h-4 w-4" />
          <p className="text-sm">Critical Alerts</p>
        </div>
        <p className="mt-2 text-xl font-semibold text-red-700">{snapshot.openCriticalAlerts}</p>
      </article>
    </section>
  );
}
