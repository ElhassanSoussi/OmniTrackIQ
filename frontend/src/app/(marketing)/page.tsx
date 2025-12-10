import type { Metadata } from "next";
import Link from "next/link";
import {
  Button,
  Container,
  FeatureCard,
  LogoTile,
  Section,
  SectionHeading,
  StatCard,
} from "@/components/marketing";

export const metadata: Metadata = {
  title: "OmniTrackIQ - Marketing Analytics & Attribution for E-commerce",
  description: "Unified marketing analytics platform for e-commerce brands. Track ROAS, attribution, and ad performance across Facebook, Google, TikTok, and Shopify in one dashboard.",
};

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
    title: "Multi-touch attribution",
    description: "Five attribution models to understand which touchpoints actually drive conversions.",
    tag: "Attribution",
  },
];

const integrations = ["Facebook Ads", "Google Ads", "TikTok Ads", "Shopify", "GA4"];

// Social proof - customer logos (placeholder names)
const customerLogos = [
  "StyleCo", "GlowUp", "HomeFit", "TechGear", "PureBeauty", "UrbanWear"
];

// Testimonials
const testimonials = [
  {
    quote: "OmniTrackIQ finally gave us clarity on which channels actually drive revenue. We improved our ROAS by 40% in the first quarter.",
    name: "Sarah Chen",
    role: "Marketing Director",
    company: "StyleCo Fashion",
  },
  {
    quote: "The unified dashboard saves our team 10+ hours per week. We can make faster, more confident budget decisions.",
    name: "Michael Torres",
    role: "Growth Lead", 
    company: "GlowUp Beauty",
  },
  {
    quote: "Finally, attribution that actually makes sense. We stopped wasting budget on underperforming channels within weeks.",
    name: "Jessica Park",
    role: "Head of Performance",
    company: "TechGear Direct",
  },
];

// Who we help segments
const segments = [
  {
    title: "DTC Brands",
    description: "Track every dollar from click to conversion across all your marketing channels.",
    icon: "🛒",
  },
  {
    title: "E-commerce Agencies",
    description: "Manage multiple client accounts with white-label reporting and cross-account insights.",
    icon: "🏢",
  },
  {
    title: "Growth Teams",
    description: "Get real-time visibility into campaign performance without waiting for data pulls.",
    icon: "📈",
  },
];

export default function LandingPage() {
  return (
    <main>
      <Section>
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-4 py-1 text-xs font-medium uppercase tracking-wide text-brand-700 dark:border-brand-800 dark:bg-brand-900/30 dark:text-brand-400">
              OmniTrackIQ for eCommerce teams
            </div>
            <div className="space-y-3">
              <h1 className="text-4xl font-semibold leading-tight text-gh-text-primary dark:text-gh-text-primary-dark md:text-5xl">
                Every ad dollar, every order, one dashboard.
              </h1>
              <p className="text-lg text-gh-text-secondary dark:text-gh-text-secondary-dark">
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
            <div className="flex flex-wrap items-center gap-3 text-sm text-gh-text-secondary dark:text-gh-text-secondary-dark">
              <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-medium text-brand-700 dark:bg-brand-900/40 dark:text-brand-400">7-day setup</span>
              <span>•</span>
              <span>Data stays in your cloud</span>
              <span>•</span>
              <span>Works with existing pixels & tags</span>
            </div>
          </div>

          <div className="rounded-xl border border-gh-border bg-gh-canvas-subtle p-6 shadow-gh-md dark:border-gh-border-dark dark:bg-gh-canvas-subtle-dark">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-gh-text-primary dark:text-gh-text-primary-dark">Live performance snapshot</div>
              <div className="rounded-full bg-brand-100 px-3 py-1 text-xs font-medium text-brand-700 dark:bg-brand-900/40 dark:text-brand-400">Auto-sync</div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              {stats.slice(0, 2).map((item) => (
                <div key={item.label} className="rounded-md border border-gh-border bg-gh-canvas-default p-4 dark:border-gh-border-dark dark:bg-gh-canvas-dark">
                  <div className="text-xs uppercase tracking-wide text-gh-text-tertiary dark:text-gh-text-tertiary-dark">{item.label}</div>
                  <div className="mt-1 text-2xl font-semibold text-gh-text-primary dark:text-gh-text-primary-dark">{item.value}</div>
                  <div className="text-xs text-brand-600 dark:text-brand-400">{item.detail}</div>
                </div>
              ))}
              <div className="col-span-2 rounded-md border border-brand-200 bg-brand-50 p-5 dark:border-brand-800 dark:bg-brand-900/20">
                <div className="text-xs uppercase tracking-wide text-brand-700 dark:text-brand-400">Insights</div>
                <div className="mt-2 text-sm text-gh-text-secondary dark:text-gh-text-secondary-dark">
                  ROAS improved +18% WoW; TikTok prospecting and Google brand are leading. Consider shifting +10% budget
                  to top converters.
                </div>
                <div className="mt-3 grid grid-cols-3 gap-3 text-xs">
                  <div className="rounded-md border border-gh-border bg-gh-canvas-default px-3 py-2 dark:border-gh-border-dark dark:bg-gh-canvas-dark">
                    <div className="text-[11px] text-gh-text-tertiary dark:text-gh-text-tertiary-dark">Best channel</div>
                    <div className="text-sm font-semibold text-gh-text-primary dark:text-gh-text-primary-dark">Google Ads</div>
                  </div>
                  <div className="rounded-md border border-gh-border bg-gh-canvas-default px-3 py-2 dark:border-gh-border-dark dark:bg-gh-canvas-dark">
                    <div className="text-[11px] text-gh-text-tertiary dark:text-gh-text-tertiary-dark">Top campaign</div>
                    <div className="text-sm font-semibold text-gh-text-primary dark:text-gh-text-primary-dark">TikTok Prospecting</div>
                  </div>
                  <div className="rounded-md border border-gh-border bg-gh-canvas-default px-3 py-2 dark:border-gh-border-dark dark:bg-gh-canvas-dark">
                    <div className="text-[11px] text-gh-text-tertiary dark:text-gh-text-tertiary-dark">Alert</div>
                    <div className="text-sm font-semibold text-gh-text-primary dark:text-gh-text-primary-dark">CPA drift +9%</div>
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

      {/* Customer logos strip */}
      <Section bordered>
        <div className="flex flex-col gap-6">
          <p className="text-center text-sm font-medium uppercase tracking-wide text-gh-text-tertiary dark:text-gh-text-tertiary-dark">
            Trusted by leading e-commerce brands
          </p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
            {customerLogos.map((logo) => (
              <LogoTile key={logo} name={logo} />
            ))}
          </div>
        </div>
      </Section>

      {/* Who we help */}
      <Section bordered>
        <SectionHeading
          eyebrow="Who we help"
          title="Built for teams that move fast"
          subtitle="Whether you're a DTC brand, agency, or growth team, OmniTrackIQ gives you the data clarity you need."
          align="center"
        />
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {segments.map((segment) => (
            <Link
              key={segment.title}
              href="/solutions"
              className="group rounded-md border border-gh-border bg-gh-canvas-default p-6 transition-colors hover:border-brand-300 hover:bg-gh-canvas-subtle dark:border-gh-border-dark dark:bg-gh-canvas-dark dark:hover:border-brand-700 dark:hover:bg-gh-canvas-subtle-dark"
            >
              <div className="text-3xl">{segment.icon}</div>
              <h3 className="mt-4 text-lg font-semibold text-gh-text-primary group-hover:text-brand-600 dark:text-gh-text-primary-dark dark:group-hover:text-brand-400">{segment.title}</h3>
              <p className="mt-2 text-sm text-gh-text-secondary dark:text-gh-text-secondary-dark">{segment.description}</p>
              <span className="mt-4 inline-flex items-center text-sm font-medium text-brand-600 dark:text-brand-400">
                Learn more
                <svg className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </Link>
          ))}
        </div>
      </Section>

      <Section bordered>
        <div className="flex flex-col gap-10">
          <SectionHeading
            eyebrow="What customers say"
            title="Real results from real teams"
            subtitle="Hear how OmniTrackIQ is transforming marketing for e-commerce brands."
            align="center"
          />
          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((testimonial) => (
              <div key={testimonial.name} className="rounded-md border border-gh-border bg-gh-canvas-default p-6 dark:border-gh-border-dark dark:bg-gh-canvas-dark">
                <p className="text-sm text-gh-text-secondary dark:text-gh-text-secondary-dark">&ldquo;{testimonial.quote}&rdquo;</p>
                <div className="mt-4">
                  <div className="text-sm font-semibold text-gh-text-primary dark:text-gh-text-primary-dark">{testimonial.name}</div>
                  <div className="text-xs text-gh-text-tertiary dark:text-gh-text-tertiary-dark">{testimonial.role}, {testimonial.company}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section bordered>
        <div className="overflow-hidden rounded-xl border border-gh-border bg-gh-canvas-subtle p-8 dark:border-gh-border-dark dark:bg-gh-canvas-subtle-dark md:p-10">
          <div className="grid items-center gap-6 md:grid-cols-[2fr,1fr]">
            <div className="space-y-3">
              <div className="text-sm font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-400">Get started</div>
              <div className="text-3xl font-semibold text-gh-text-primary dark:text-gh-text-primary-dark md:text-4xl">Launch OmniTrackIQ in under a week.</div>
              <p className="text-base text-gh-text-secondary dark:text-gh-text-secondary-dark">
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
