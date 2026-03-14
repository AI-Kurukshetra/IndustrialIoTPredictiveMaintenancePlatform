import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden px-4 pb-16 pt-12 sm:px-6 lg:px-8 lg:pt-20">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="mb-4 inline-flex rounded-full bg-cyan-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-cyan-800">
            Industrial IoT Predictive Maintenance Platform
          </p>
          <h1 className="text-4xl font-bold leading-tight text-slate-900 sm:text-5xl">
            Prevent Equipment Failures Before They Stop Production.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-slate-600">
            Monitor machine telemetry in real time, detect early anomalies, and trigger maintenance actions before downtime impacts
            your facility output.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button href="#final-cta" size="lg">
              Start Monitoring Your Equipment
            </Button>
            <Button href="#pricing" variant="secondary" size="lg">
              Book Demo
            </Button>
          </div>
        </div>

        <figure
          className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-cyan-100"
          role="img"
          aria-label="Platform dashboard preview showing uptime, alerts, and equipment health trends"
        >
          <div className="mb-4 grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-emerald-50 p-3">
              <p className="text-xs text-slate-500">Uptime</p>
              <p className="text-xl font-bold text-emerald-700">99.1%</p>
            </div>
            <div className="rounded-xl bg-amber-50 p-3">
              <p className="text-xs text-slate-500">Active Alerts</p>
              <p className="text-xl font-bold text-amber-700">12</p>
            </div>
            <div className="rounded-xl bg-cyan-50 p-3">
              <p className="text-xs text-slate-500">Avg Health</p>
              <p className="text-xl font-bold text-cyan-700">86</p>
            </div>
          </div>
          <div className="h-44 rounded-2xl bg-gradient-to-br from-cyan-100 via-white to-blue-100 p-4">
            <div className="flex h-full items-end gap-2">
              {[35, 50, 38, 62, 56, 70, 82, 74].map((h, i) => (
                <span key={i} className="w-full rounded-t bg-cyan-500/70" style={{ height: `${h}%` }} aria-hidden="true" />
              ))}
            </div>
          </div>
        </figure>
      </div>
    </section>
  );
}
