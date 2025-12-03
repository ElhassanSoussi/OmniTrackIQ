const plans = [
  { name: "Starter", price: "$99/mo", features: ["2 integrations", "Daily summary email", "Basic alerts"] },
  { name: "Pro", price: "$249/mo", features: ["All integrations", "Advanced alerts", "Team access"] },
  { name: "Agency", price: "Custom", features: ["Multi-account", "White-label options", "Dedicated support"] },
];

export default function PricingPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-16 text-slate-100">
      <h1 className="text-4xl font-semibold mb-4">Pricing</h1>
      <p className="text-slate-300 mb-10">Choose the plan that matches your growth stage.</p>
      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <div key={plan.name} className="rounded-xl border border-slate-800 bg-slate-900/70 p-6">
            <div className="text-xl font-semibold">{plan.name}</div>
            <div className="text-3xl font-bold mt-2">{plan.price}</div>
            <ul className="mt-4 space-y-2 text-sm text-slate-300">
              {plan.features.map((f) => (
                <li key={f}>• {f}</li>
              ))}
            </ul>
            <button className="mt-6 w-full rounded-md bg-emerald-500 px-4 py-2 font-semibold text-slate-950 hover:bg-emerald-400 transition">
              Start trial
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}
