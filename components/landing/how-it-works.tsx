const steps = [
  {
    title: "Connect Sensors",
    text: "Attach existing IoT sensors to each equipment asset and map them by facility and machine type."
  },
  {
    title: "Analyze Data",
    text: "Ingest telemetry continuously and calculate rolling health indicators and anomaly signals."
  },
  {
    title: "Prevent Failures",
    text: "Trigger alerts and maintenance work orders before critical failures impact throughput."
  }
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl rounded-3xl bg-slate-900 p-8 text-white lg:p-12">
        <h2 className="text-3xl font-bold">How It Works</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {steps.map((step, index) => (
            <article key={step.title} className="rounded-2xl bg-white/10 p-5 ring-1 ring-white/20">
              <p className="text-sm font-semibold text-cyan-300">Step {index + 1}</p>
              <h3 className="mt-2 text-xl font-semibold">{step.title}</h3>
              <p className="mt-3 text-sm text-slate-200">{step.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
