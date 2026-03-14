export function DashboardPreview() {
  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl rounded-3xl border border-slate-200 bg-white p-6 shadow-xl lg:p-10">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-cyan-700">Platform Dashboard Preview</p>
            <h2 className="text-3xl font-bold text-slate-900">One View for Reliability, Alerts, and Maintenance</h2>
          </div>
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">Live Data</span>
        </div>

        <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="mb-3 text-sm font-semibold text-slate-700">Health Trend by Line</p>
            <div className="h-56 rounded-xl bg-gradient-to-br from-cyan-100 via-white to-blue-100 p-4">
              <div className="flex h-full items-end gap-2">
                {[20, 35, 52, 48, 62, 70, 65, 78, 82, 90, 86, 92].map((h, i) => (
                  <span key={i} className="w-full rounded-t bg-cyan-600/70" style={{ height: `${h}%` }} aria-hidden="true" />
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <article className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-sm text-slate-500">Critical Alerts</p>
              <p className="mt-2 text-3xl font-bold text-red-600">4</p>
            </article>
            <article className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-sm text-slate-500">Open Work Orders</p>
              <p className="mt-2 text-3xl font-bold text-amber-600">19</p>
            </article>
            <article className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-sm text-slate-500">Fleet Health Score</p>
              <p className="mt-2 text-3xl font-bold text-cyan-700">88/100</p>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}
