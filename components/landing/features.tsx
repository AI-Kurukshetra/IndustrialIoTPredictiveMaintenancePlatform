import { Activity, BellRing, Building2, CalendarCheck2, Gauge, ShieldAlert } from "lucide-react";

const items = [
  {
    title: "Real-time equipment monitoring",
    icon: Activity,
    text: "Stream live machine telemetry across temperature, vibration, and pressure."
  },
  {
    title: "Predictive failure detection",
    icon: ShieldAlert,
    text: "Identify failure risk early with threshold anomalies and health trends."
  },
  {
    title: "Automated maintenance scheduling",
    icon: CalendarCheck2,
    text: "Convert insights into structured work orders before breakdowns happen."
  },
  {
    title: "Smart alert system",
    icon: BellRing,
    text: "Route severity-based alerts to maintenance and operations teams instantly."
  },
  {
    title: "Equipment health analytics",
    icon: Gauge,
    text: "Track rolling equipment health scores and historical performance baselines."
  },
  {
    title: "Multi-facility monitoring",
    icon: Building2,
    text: "Scale oversight across plants with facility-level access control boundaries."
  }
];

export function Features() {
  return (
    <section id="features" className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <h2 className="text-3xl font-bold text-slate-900">Built for Manufacturing Reliability Teams</h2>
        <p className="mt-3 max-w-3xl text-slate-600">
          Everything you need to move from reactive maintenance to proactive, data-driven operations.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <Icon className="h-6 w-6 text-cyan-700" aria-hidden="true" />
                <h3 className="mt-3 font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{item.text}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
