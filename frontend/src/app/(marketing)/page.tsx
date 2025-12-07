import {
  Button,
  Container,
  FeatureCard,
  LogoTile,
  Section,
  SectionHeading,
  StatCard,
} from "@/components/marketing";

const stats = [
  { label: "Revenue (7d)", value: "$124,200", detail: "Up 18% vs last week" },
  { label: "Ad Spend (7d)", value: "$32,400", detail: "Blended CAC $27.4" },
  { label: "ROAS", value: "3.8x", detail: "Target 3.0x" },
  { label: "Orders", value: "2,340", detail: "Avg order $53" },
];

const features = [
  {
    title: "Unified ad tracking",
    description: "Normalize spend, clicks, and conversions across Facebook, Google, TikTok, and more without CSV chaos.",
    tag: "Accuracy",
  },
  {
    title: "ROAS insight engine",
    description: "Blend Shopify revenue with campaign spend to see ROAS, profit, and CAC by channel and campaign.",
    tag: "Profit",
  },
  {
    title: "Automated alerts",
    description: "Stay ahead with budget caps, CPA drift, and conversion drop alerts piped to Slack or email.",
    tag: "Automation",
  },
  {
    title: "Workflow-ready via n8n",
    description: "Trigger n8n flows from fresh metrics to enrich data, sync to your warehouse, or fan out notifications.",
    tag: "Integrations",
  },
];

const integrations = ["Facebook Ads", "Google Ads", "TikTok Ads", "Shopify", "GA4"];

export default function LandingPage() {
  return (
    <main>
      <Section>
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">
              OmniTrackIQ for eCommerce teams
            </div>
            <div className="space-y-3">
              <h1 className="text-4xl font-semibold leading-tight text-gray-900 md:text-5xl">
                Every ad dollar, every order, one dashboard.
              </h1>
              <p className="text-lg text-gray-600">
                OmniTrackIQ unifies ad spend, revenue, and channel performance so you can scale confidently. No more
                spreadsheets—just trustworthy, real-time ROAS.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button href="/signup">Start free trial</Button>
              <Button href="/dashboard" variant="secondary">
                View live demo
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">7-day setup</span>
              <span>•</span>
              <span>Data stays in your cloud</span>
              <span>•</span>
              <span>Works with existing pixels & tags</span>
            </div>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-gradient-to-b from-white via-gray-50 to-gray-100 p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-gray-900">Live performance snapshot</div>
              <div className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">Auto-sync</div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              {stats.slice(0, 2).map((item) => (
                <div key={item.label} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                  <div className="text-xs uppercase tracking-wide text-gray-500">{item.label}</div>
                  <div className="mt-1 text-2xl font-semibold text-gray-900">{item.value}</div>
                  <div className="text-xs text-emerald-600">{item.detail}</div>
                </div>
              ))}
              <div className="col-span-2 rounded-xl border border-emerald-200 bg-gradient-to-r from-emerald-50 via-sky-50 to-purple-50 p-5">
                <div className="text-xs uppercase tracking-wide text-emerald-700">Insights</div>
                <div className="mt-2 text-sm text-gray-700">
                  ROAS improved +18% WoW; TikTok prospecting and Google brand are leading. Consider shifting +10% budget
                  to top converters.
                </div>
                <div className="mt-3 grid grid-cols-3 gap-3 text-xs text-gray-600">
                  <div className="rounded-lg bg-white/80 border border-gray-100 px-3 py-2 shadow-sm">
                    <div className="text-[11px] text-gray-500">Best channel</div>
                    <div className="text-sm font-semibold text-gray-900">Google Ads</div>
                  </div>
                  <div className="rounded-lg bg-white/80 border border-gray-100 px-3 py-2 shadow-sm">
                    <div className="text-[11px] text-gray-500">Top campaign</div>
                    <div className="text-sm font-semibold text-gray-900">TikTok Prospecting</div>
                  </div>
                  <div className="rounded-lg bg-white/80 border border-gray-100 px-3 py-2 shadow-sm">
                    <div className="text-[11px] text-gray-500">Alert</div>
                    <div className="text-sm font-semibold text-gray-900">CPA drift +9%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Container className="mt-10">
          <div className="grid gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:grid-cols-4">
            {stats.map((stat) => (
              <StatCard key={stat.label} label={stat.label} value={stat.value} detail={stat.detail} />
            ))}
          </div>
        </Container>
      </Section>

      <Section bordered>
        <SectionHeading
          eyebrow="Why teams choose us"
          title="Built for operators who need trustworthy numbers"
          subtitle="Blend spend, revenue, and channel data without waiting on a data team. OmniTrackIQ keeps your ROAS, profit, and CAC aligned across every campaign."
        />
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {features.map((feature) => (
            <FeatureCard key={feature.title} title={feature.title} description={feature.description} tag={feature.tag} />
          ))}
        </div>
      </Section>

      <Section bordered>
        <div className="flex flex-col gap-10">
          <SectionHeading
            eyebrow="Integrations"
            title="Connect your stack in minutes"
            subtitle="Native connectors for paid social, search, commerce, and analytics with automatic normalization."
            align="center"
          />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 md:grid-cols-5">
            {integrations.map((name) => (
              <LogoTile key={name} name={name} />
            ))}
          </div>
        </div>
      </Section>

      <Section bordered>
        <div className="overflow-hidden rounded-3xl border border-gray-200 bg-gradient-to-r from-emerald-50 via-white to-gray-50 p-8 shadow-lg md:p-10">
          <div className="grid gap-6 items-center md:grid-cols-[2fr,1fr]">
            <div className="space-y-3">
              <div className="text-sm font-semibold uppercase tracking-wide text-emerald-700">Get started</div>
              <div className="text-3xl font-semibold text-gray-900 md:text-4xl">Launch OmniTrackIQ in under a week.</div>
              <p className="text-base text-gray-600">
                Connect your ad accounts, plug in Shopify and GA4, and ship automated alerts. Our team will guide your
                first dashboards and data sanity checks.
              </p>
            </div>
            <div className="flex flex-col gap-3 md:items-end">
              <Button href="/signup">Start free trial</Button>
              <Button href="/pricing" variant="ghost" className="w-full md:w-auto">
                View pricing
              </Button>
            </div>
          </div>
        </div>
      </Section>
    </main>
  );
}
