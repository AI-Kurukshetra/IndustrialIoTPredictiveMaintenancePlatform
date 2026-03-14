const quotes = [
  {
    quote:
      "We reduced unplanned stoppages within the first quarter by turning noisy sensor data into actionable maintenance decisions.",
    name: "Anita Rao",
    title: "Plant Operations Manager"
  },
  {
    quote:
      "Our maintenance team now sees risk early, prioritizes work orders better, and avoids emergency repairs during peak shifts.",
    name: "David Brooks",
    title: "Maintenance Engineering Lead"
  },
  {
    quote: "Multi-facility visibility gave us a standard reliability playbook across all production lines.",
    name: "Carlos Medina",
    title: "Regional Manufacturing Director"
  }
];

export function Testimonials() {
  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <h2 className="text-3xl font-bold text-slate-900">Trusted by Industrial Leaders</h2>
        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {quotes.map((item) => (
            <figure key={item.name} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <blockquote className="text-slate-700">&ldquo;{item.quote}&rdquo;</blockquote>
              <figcaption className="mt-4 text-sm text-slate-500">
                <p className="font-semibold text-slate-900">{item.name}</p>
                <p>{item.title}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
