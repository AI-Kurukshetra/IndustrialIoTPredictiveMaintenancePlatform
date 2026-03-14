import Link from "next/link";
import { EquipmentComparisonChart } from "@/components/charts/equipment-comparison-chart";
import { HealthTrendChart } from "@/components/charts/health-trend-chart";
import { SensorTrendChart } from "@/components/charts/sensor-trend-chart";
import { DowntimeHistoryTable } from "@/components/dashboard/downtime-history-table";
import { getDowntimeHistory, getEquipmentComparison, getSensorTrend } from "@/lib/services/analytics";
import { getDashboardSnapshot } from "@/lib/services/dashboard";
import { requireAuth } from "@/lib/utils/auth";

export default async function AnalyticsPage({
  searchParams
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  await requireAuth("manager");
  const params = await searchParams;
  const page = Number(params.page ?? "1") || 1;

  const [snapshot, sensorTrend, downtimeEvents, equipmentComparison] = await Promise.all([
    getDashboardSnapshot(),
    getSensorTrend(100),
    getDowntimeHistory(40),
    getEquipmentComparison(page, 12)
  ]);

  return (
    <>
      <header>
        <h2 className="text-2xl font-semibold">Historical Analytics</h2>
        <p className="text-sm text-slate-600">Health trend, sensor behavior, downtime history, and reliability comparison.</p>
      </header>

      <section className="grid gap-4 lg:grid-cols-2">
        <HealthTrendChart data={snapshot.healthTrend} />
        <SensorTrendChart data={sensorTrend} />
      </section>

      <EquipmentComparisonChart data={equipmentComparison} />

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-700">Downtime History</h3>
          <div className="flex gap-2">
            <Link href={`/analytics?page=${Math.max(1, page - 1)}`} className="rounded border border-slate-200 bg-white px-3 py-1 text-sm hover:bg-slate-50">
              Prev
            </Link>
            <Link href={`/analytics?page=${page + 1}`} className="rounded border border-slate-200 bg-white px-3 py-1 text-sm hover:bg-slate-50">
              Next
            </Link>
          </div>
        </div>
        <DowntimeHistoryTable events={downtimeEvents} />
      </section>
    </>
  );
}
