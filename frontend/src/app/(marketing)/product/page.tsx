import type { Metadata } from "next";
import Link from "next/link";
import { Section, SectionHeading, Button } from "@/components/marketing";

export const metadata: Metadata = {
  title: "Product - Features & Capabilities",
  description: "Explore OmniTrackIQ's marketing analytics features: unified reporting, multi-touch attribution, cross-channel ROAS, and order-level insights for e-commerce.",
};

const features = [
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
      </svg>
    ),
    title: "Unified Reporting",
    description: "All your marketing data in one place. No more switching between platforms or wrestling with spreadsheets.",
    bullets: [
      "Automatic data normalization across all channels",
      "Real-time sync every 15 minutes",
      "Custom date range comparisons",
      "Export to CSV, PDF, or schedule reports",
    ],
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
      </svg>
    ),
    title: "Multi-Touch Attribution",
    description: "Understand which touchpoints actually drive conversions with five attribution models.",
    bullets: [
      "First-touch, last-touch, linear, time-decay, position-based",
      "Compare models side-by-side",
      "Channel-level and campaign-level attribution",
      "Lookback window customization",
    ],
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "Cross-Channel ROAS",
    description: "See true return on ad spend by blending revenue data from Shopify with spend from all your ad platforms.",
    bullets: [
      "Blended ROAS across Facebook, Google, TikTok",
      "Profit margin calculations",
      "Cost per acquisition (CPA) tracking",
      "Channel comparison dashboards",
    ],
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
      </svg>
    ),
    title: "Order-Level Insights",
    description: "Connect the dots between ad clicks and actual orders. See exactly which campaigns drive revenue.",
    bullets: [
      "UTM parameter tracking",
      "Order source attribution",
      "Customer journey mapping",
      "Revenue by campaign breakdown",
    ],
  },
];

const howItWorks = [
  {
    step: "01",
    title: "Connect your integrations",
    description: "Link your ad platforms (Facebook, Google, TikTok) and e-commerce store (Shopify) in minutes.",
  },
  {
    step: "02",
    title: "Data is normalized automatically",
    description: "We clean, standardize, and enrich your data so metrics are comparable across channels.",
  },
  {
    step: "03",
    title: "Analyze in unified dashboards",
    description: "See ROAS, spend, revenue, and attribution in one view. No more spreadsheet gymnastics.",
  },
  {
    step: "04",
    title: "Share reports & automate alerts",
    description: "Schedule reports, set up Slack alerts, and keep your team aligned on performance.",
  },
];

const additionalCapabilities = [
  {
    title: "Cohort Analysis",
    description: "Track customer retention and lifetime value over time with cohort heatmaps.",
  },
  {
    title: "Funnel Visualization",
    description: "See conversion rates from impression to purchase across your marketing funnel.",
  },
  {
    title: "Anomaly Detection",
    description: "Get alerted when metrics deviate significantly from expected patterns.",
  },
  {
    title: "Custom Report Builder",
    description: "Build reports with the exact metrics, dimensions, and filters you need.",
  },
  {
    title: "Scheduled Reports",
    description: "Automate daily, weekly, or monthly reports delivered to email or Slack.",
  },
  {
    title: "Team Collaboration",
    description: "Invite team members with role-based access to dashboards and reports.",
  },
];

export default function ProductPage() {
  return (
    <main>
      {/* Hero */}
      <Section>
        <div className="mx-auto max-w-4xl text-center">
          <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">
            Product
          </span>
          <h1 className="mt-6 text-4xl font-semibold text-gray-900 md:text-5xl">
            Everything you need to understand your marketing
          </h1>
          <p className="mt-6 text-lg text-gray-600">
            OmniTrackIQ brings together ad spend, revenue, and attribution data from all your channels 
            into one trustworthy dashboard. Stop guessing, start knowing.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button href="/signup">Start free trial</Button>
            <Button href="/contact" variant="secondary">Talk to sales</Button>
          </div>
        </div>
      </Section>

      {/* Core Features */}
      <Section bordered>
        <SectionHeading
          eyebrow="Core Features"
          title="Built for marketing operators"
          subtitle="Every feature designed to give you clarity on what's working and what's not."
        />
        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                {feature.icon}
              </div>
              <h3 className="mt-6 text-xl font-semibold text-gray-900">{feature.title}</h3>
              <p className="mt-3 text-gray-600">{feature.description}</p>
              <ul className="mt-6 space-y-3">
                {feature.bullets.map((bullet) => (
                  <li key={bullet} className="flex items-start gap-3 text-sm text-gray-600">
                    <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {bullet}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      {/* How It Works */}
      <Section bordered>
        <SectionHeading
          eyebrow="How It Works"
          title="From setup to insights in under an hour"
          subtitle="No complex implementation. No waiting weeks for data. Connect, configure, and go."
          align="center"
        />
        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {howItWorks.map((item, index) => (
            <div key={item.step} className="relative">
              {index < howItWorks.length - 1 && (
                <div className="absolute right-0 top-8 hidden h-0.5 w-full bg-gradient-to-r from-emerald-200 to-transparent lg:block" style={{ left: '60%', width: '80%' }} />
              )}
              <div className="relative flex flex-col items-center text-center lg:items-start lg:text-left">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-2xl font-bold text-emerald-600">
                  {item.step}
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">{item.title}</h3>
                <p className="mt-2 text-sm text-gray-600">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Additional Capabilities */}
      <Section bordered>
        <SectionHeading
          eyebrow="More Capabilities"
          title="Advanced features for power users"
          subtitle="Dig deeper with cohort analysis, funnel visualization, anomaly detection, and more."
          align="center"
        />
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {additionalCapabilities.map((cap) => (
            <div
              key={cap.title}
              className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md"
            >
              <h3 className="text-lg font-semibold text-gray-900">{cap.title}</h3>
              <p className="mt-2 text-sm text-gray-600">{cap.description}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Dashboard Preview */}
      <Section bordered>
        <div className="rounded-3xl border border-gray-200 bg-gradient-to-b from-gray-50 to-white p-8 md:p-12">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <span className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
                Dashboard Preview
              </span>
              <h2 className="mt-4 text-3xl font-semibold text-gray-900">
                See your entire marketing performance at a glance
              </h2>
              <p className="mt-4 text-gray-600">
                Clean, intuitive dashboards that surface the metrics that matter. 
                No clutter, no confusion—just the numbers you need to make decisions.
              </p>
              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <svg className="h-5 w-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Real-time KPIs: Revenue, Spend, ROAS, Orders
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <svg className="h-5 w-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Channel breakdown with trend indicators
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <svg className="h-5 w-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Campaign-level performance table
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <svg className="h-5 w-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Recent orders with attribution data
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xl">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <div className="text-xs uppercase tracking-wide text-gray-500">Revenue</div>
                  <div className="mt-1 text-2xl font-bold text-gray-900">$124,200</div>
                  <div className="text-xs text-emerald-600">↑ 18% vs last week</div>
                </div>
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <div className="text-xs uppercase tracking-wide text-gray-500">Ad Spend</div>
                  <div className="mt-1 text-2xl font-bold text-gray-900">$32,400</div>
                  <div className="text-xs text-gray-500">Across all channels</div>
                </div>
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <div className="text-xs uppercase tracking-wide text-gray-500">ROAS</div>
                  <div className="mt-1 text-2xl font-bold text-emerald-600">3.83x</div>
                  <div className="text-xs text-emerald-600">Above target</div>
                </div>
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <div className="text-xs uppercase tracking-wide text-gray-500">Orders</div>
                  <div className="mt-1 text-2xl font-bold text-gray-900">2,340</div>
                  <div className="text-xs text-gray-500">AOV $53.08</div>
                </div>
              </div>
              <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                <div className="text-xs font-medium text-emerald-700">Top Performer</div>
                <div className="mt-1 text-sm text-gray-700">
                  Google Brand campaigns are returning 4.3x ROAS—consider increasing budget by 15%.
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* CTA */}
      <Section>
        <div className="rounded-3xl bg-gradient-to-r from-emerald-600 to-emerald-700 px-8 py-16 text-center text-white md:px-16">
          <h2 className="text-3xl font-semibold md:text-4xl">Ready to see your true ROAS?</h2>
          <p className="mx-auto mt-4 max-w-2xl text-emerald-100">
            Join hundreds of e-commerce brands using OmniTrackIQ to make smarter marketing decisions.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/signup"
              className="rounded-lg bg-white px-6 py-3 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
            >
              Start free trial
            </Link>
            <Link
              href="/contact"
              className="rounded-lg border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Book a demo
            </Link>
          </div>
        </div>
      </Section>
    </main>
  );
}
