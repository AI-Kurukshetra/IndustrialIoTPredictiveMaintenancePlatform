const stats = [
  { value: "40%", label: "Downtime reduction" },
  { value: "25%", label: "Maintenance cost reduction" },
  { value: "99%", label: "Equipment uptime visibility" }
];

export function Metrics() {
  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <article key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
            <p className="text-4xl font-bold text-cyan-700">{stat.value}</p>
            <p className="mt-2 text-sm text-slate-600">{stat.label}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
