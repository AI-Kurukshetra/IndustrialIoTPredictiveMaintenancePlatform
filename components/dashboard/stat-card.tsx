import type { ReactNode } from "react";

export function StatCard({ title, value, helper }: { title: string; value: string; helper?: ReactNode }) {
  return (
    <article className="rounded-xl bg-white p-4 shadow">
      <p className="text-sm text-slate-600">{title}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
      {helper ? <div className="mt-2 text-xs text-slate-500">{helper}</div> : null}
    </article>
  );
}
