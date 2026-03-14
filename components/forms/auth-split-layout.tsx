import type { ReactNode } from "react";

export function AuthSplitLayout({
  title,
  subtitle,
  children
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <main className="grid min-h-screen grid-cols-1 bg-slate-100 lg:grid-cols-2">
      <section className="relative hidden overflow-hidden bg-slate-900 p-10 text-white lg:block">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,0.22),transparent_40%),radial-gradient(circle_at_80%_10%,rgba(56,189,248,0.2),transparent_35%),radial-gradient(circle_at_60%_85%,rgba(14,165,233,0.16),transparent_40%)]" />
        <div className="relative z-10">
          <h1 className="text-3xl font-bold">Industrial IoT Platform</h1>
          <p className="mt-3 max-w-md text-slate-300">
            Live equipment telemetry, predictive insights, and maintenance workflows built for modern plant operations.
          </p>
        </div>
        <div className="absolute bottom-8 left-8 right-8 z-10 rounded-2xl border border-slate-700/70 bg-slate-800/40 p-5 backdrop-blur">
          <p className="text-sm font-medium text-cyan-300">System Snapshot</p>
          <div className="mt-3 grid grid-cols-3 gap-3 text-sm">
            <div className="rounded-lg bg-slate-900/60 p-3">
              <p className="text-slate-400">Uptime</p>
              <p className="text-xl font-semibold">99.2%</p>
            </div>
            <div className="rounded-lg bg-slate-900/60 p-3">
              <p className="text-slate-400">Alerts</p>
              <p className="text-xl font-semibold">8</p>
            </div>
            <div className="rounded-lg bg-slate-900/60 p-3">
              <p className="text-slate-400">Health</p>
              <p className="text-xl font-semibold">87</p>
            </div>
          </div>
        </div>
      </section>

      <section className="flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-md">
          <p className="text-sm font-semibold uppercase tracking-wide text-cyan-700">Secure Access</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-900">{title}</h2>
          <p className="mt-2 text-sm text-slate-600">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </div>
      </section>
    </main>
  );
}
