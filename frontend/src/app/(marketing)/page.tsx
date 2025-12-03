import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <div className="grid gap-12 md:grid-cols-2 items-center">
        <div className="space-y-6">
          <div className="inline-flex rounded-full bg-emerald-500/10 px-4 py-1 text-emerald-300 text-sm">
            Multi-channel analytics for e-commerce
          </div>
          <h1 className="text-4xl md:text-5xl font-semibold leading-tight">
            See every dollar of ad spend turn into revenue with OmniTrackIQ.
          </h1>
          <p className="text-lg text-slate-200">
            Centralize Facebook, Google, TikTok, Shopify, and GA4 into one dashboard. Reliable ROAS, faster decisions,
            and automated alerts.
          </p>
          <div className="flex gap-4">
            <Link
              href="/signup"
              className="rounded-md bg-emerald-500 px-5 py-3 text-base font-semibold text-slate-950 hover:bg-emerald-400 transition"
            >
              Start free trial
            </Link>
            <Link
              href="/pricing"
              className="rounded-md border border-slate-600 px-5 py-3 text-base font-semibold text-slate-100 hover:border-slate-400 transition"
            >
              View pricing
            </Link>
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-400">
            <span>Facebook Ads</span>
            <span>•</span>
            <span>Google Ads</span>
            <span>•</span>
            <span>TikTok Ads</span>
            <span>•</span>
            <span>Shopify</span>
            <span>•</span>
            <span>GA4</span>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl">
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Revenue (7d)", value: "$124,200" },
              { label: "Ad Spend (7d)", value: "$32,400" },
              { label: "ROAS", value: "3.8x" },
              { label: "Orders", value: "2,340" },
            ].map((item) => (
              <div key={item.label} className="rounded-lg border border-slate-800 bg-slate-950/80 p-4">
                <div className="text-xs text-slate-400">{item.label}</div>
                <div className="text-xl font-semibold text-slate-50 mt-1">{item.value}</div>
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-xl bg-gradient-to-r from-emerald-500/10 via-sky-500/10 to-purple-500/10 p-6 border border-slate-800">
            <div className="text-sm text-slate-300 mb-2">Performance insight</div>
            <div className="text-slate-100">
              ROAS improved +18% WoW driven by TikTok prospecting and Google branded campaigns. Consider increasing
              budget caps by 10%.
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
