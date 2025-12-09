import type { Metadata } from "next";
import Link from "next/link";
import { Section, SectionHeading, FeatureCard } from "@/components/marketing";

export const metadata: Metadata = {
  title: "Solutions - OmniTrackIQ",
  description: "Marketing analytics solutions for DTC brands, e-commerce agencies, and growth teams. Track ROAS, attribution, and performance across all channels.",
  openGraph: {
    title: "Solutions - OmniTrackIQ",
    description: "Marketing analytics solutions for DTC brands, e-commerce agencies, and growth teams.",
  },
};

const useCases = [
  {
    title: "DTC Brands",
    description: "Track every dollar from ad click to order. See true ROAS across Facebook, Google, and TikTok without juggling spreadsheets.",
    features: [
      "Multi-touch attribution across all channels",
      "Shopify revenue synced in real-time",
      "Blended CAC and LTV tracking",
      "Budget pacing alerts",
    ],
  },
  {
    title: "E-commerce Agencies",
    description: "Manage all your clients from one dashboard. White-label reports, automated alerts, and cross-account insights.",
    features: [
      "Multi-account management",
      "White-label client reports",
      "Cross-client benchmarking",
      "Automated weekly summaries",
    ],
  },
  {
    title: "Growth Teams",
    description: "Stop waiting for weekly data pulls. Get real-time visibility into campaign performance and automate reporting.",
    features: [
      "Real-time performance dashboards",
      "Slack and email alerts",
      "Custom KPI tracking",
      "n8n workflow triggers",
    ],
  },
];

const capabilities = [
  {
    title: "Unified data layer",
    description: "All your marketing data normalized and enriched in one place. No more CSV exports or API headaches.",
    tag: "Data",
  },
  {
    title: "Attribution modeling",
    description: "First-touch, last-touch, linear, and time-decay models. Understand which channels actually drive conversions.",
    tag: "Analytics",
  },
  {
    title: "Automated reporting",
    description: "Schedule daily, weekly, or monthly reports. Delivered to email or Slack with key insights highlighted.",
    tag: "Automation",
  },
  {
    title: "Smart alerts",
    description: "Get notified when ROAS drops, spend exceeds budget, or conversion rates drift. Stay ahead of problems.",
    tag: "Monitoring",
  },
];

export default function SolutionsPage() {
  return (
    <main>
      <Section>
        <SectionHeading
          eyebrow="Solutions"
          title="Marketing analytics for every team"
          subtitle="Whether you're a DTC brand, agency, or growth team, OmniTrackIQ gives you the data clarity you need to scale."
          align="center"
        />
      </Section>

      <Section bordered>
        <div className="grid gap-8 lg:grid-cols-3">
          {useCases.map((useCase) => (
            <div
              key={useCase.title}
              className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition hover:shadow-md"
            >
              <h3 className="text-xl font-semibold text-gray-900">{useCase.title}</h3>
              <p className="mt-3 text-sm text-gray-600">{useCase.description}</p>
              <ul className="mt-6 space-y-3">
                {useCase.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm text-gray-600">
                    <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className="mt-8 block w-full rounded-lg bg-gray-100 py-3 text-center text-sm font-semibold text-gray-900 transition hover:bg-gray-200"
              >
                Get started
              </Link>
            </div>
          ))}
        </div>
      </Section>

      <Section bordered>
        <SectionHeading
          eyebrow="Capabilities"
          title="Everything you need to understand your marketing"
          subtitle="From data ingestion to automated insights, OmniTrackIQ handles the complexity so you can focus on growth."
        />
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {capabilities.map((capability) => (
            <FeatureCard
              key={capability.title}
              title={capability.title}
              description={capability.description}
              tag={capability.tag}
            />
          ))}
        </div>
      </Section>

      <Section bordered>
        <div className="rounded-2xl border border-gray-200 bg-gradient-to-r from-emerald-50 via-white to-gray-50 p-8 text-center shadow-sm">
          <h2 className="text-2xl font-semibold text-gray-900">Ready to see your true ROAS?</h2>
          <p className="mt-2 text-gray-600">
            Start your free trial today. No credit card required.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <Link
              href="/signup"
              className="rounded-lg bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              Start free trial
            </Link>
            <Link
              href="/pricing"
              className="rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-900 transition hover:bg-gray-50"
            >
              View pricing
            </Link>
          </div>
        </div>
      </Section>
    </main>
  );
}
