import { AlertList } from "@/components/dashboard/alert-list";
import { StatCard } from "@/components/dashboard/stat-card";
import { WorkOrderTable } from "@/components/dashboard/work-order-table";
import { HealthTrendChart } from "@/components/charts/health-trend-chart";
import { LiveMonitorCards } from "@/components/dashboard/live-monitor-cards";
import { getActiveAlerts, getDashboardSnapshot } from "@/lib/services/dashboard";
import { getLiveMonitorSnapshot } from "@/lib/services/monitoring";
import { toPercent } from "@/lib/utils/format";

export default async function DashboardPage() {
  const [snapshot, alerts, liveSnapshot] = await Promise.all([
    getDashboardSnapshot(),
    getActiveAlerts(),
    getLiveMonitorSnapshot()
  ]);

  return (
    <>
      <header className="rounded-xl bg-white p-5 shadow">
        <h2 className="text-2xl font-semibold">Equipment Performance Dashboard</h2>
        <p className="text-sm text-slate-600">Live equipment monitoring, health scoring, and operations status.</p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Equipment" value={`${snapshot.equipmentCount}`} />
        <StatCard title="Active Alerts" value={`${snapshot.activeAlerts}`} />
        <StatCard title="Avg Health" value={toPercent(snapshot.avgHealthScore)} />
        <StatCard title="Estimated Uptime" value={toPercent(snapshot.uptimePercent)} />
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <StatCard title="MTBF (hours)" value={snapshot.mtbfHours.toFixed(2)} />
        <StatCard title="MTTR (hours)" value={snapshot.mttrHours.toFixed(2)} />
      </section>

      <LiveMonitorCards initial={liveSnapshot} />

      <section className="grid gap-4 lg:grid-cols-2">
        <HealthTrendChart data={snapshot.healthTrend} />
        <div className="rounded-xl bg-white p-4 shadow">
          <h3 className="mb-3 text-sm font-semibold text-slate-700">Active Alerts</h3>
          <AlertList alerts={alerts.slice(0, 5)} />
        </div>
      </section>

      <section>
        <h3 className="mb-3 text-sm font-semibold text-slate-700">Recent Work Orders</h3>
        <WorkOrderTable workOrders={snapshot.recentWorkOrders} />
      </section>
    </>
  );
}
