import { Button } from "@/components/ui/button";

const plans = [
  {
    name: "Starter",
    price: "$299/mo",
    details: ["Up to 50 assets", "Core monitoring", "Email alerts"],
    cta: "Start Monitoring"
  },
  {
    name: "Growth",
    price: "$899/mo",
    details: ["Up to 250 assets", "Predictive analytics", "Work order workflows"],
    cta: "Book Demo",
    highlighted: true
  },
  {
    name: "Enterprise",
    price: "Custom",
    details: ["Unlimited assets", "Multi-facility controls", "Dedicated onboarding"],
    cta: "Talk to Sales"
  }
];

export function Pricing() {
  return (
    <section id="pricing" className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <h2 className="text-3xl font-bold text-slate-900">Simple Pricing for Growing Operations</h2>
        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {plans.map((plan) => (
            <article
              key={plan.name}
              className={`rounded-2xl border p-6 shadow-sm ${
                plan.highlighted ? "border-cyan-300 bg-cyan-50/40" : "border-slate-200 bg-white"
              }`}
            >
              <h3 className="text-xl font-semibold text-slate-900">{plan.name}</h3>
              <p className="mt-2 text-3xl font-bold text-slate-900">{plan.price}</p>
              <ul className="mt-4 space-y-2 text-sm text-slate-600">
                {plan.details.map((detail) => (
                  <li key={detail}>{detail}</li>
                ))}
              </ul>
              <Button href="#final-cta" variant={plan.highlighted ? "primary" : "secondary"} className="mt-6 w-full">
                {plan.cta}
              </Button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
