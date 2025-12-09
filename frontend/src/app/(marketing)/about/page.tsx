import type { Metadata } from "next";
import Link from "next/link";
import { Section, SectionHeading } from "@/components/marketing";

export const metadata: Metadata = {
  title: "About - OmniTrackIQ",
  description: "Learn about OmniTrackIQ, the marketing analytics platform built for e-commerce teams who need trustworthy, actionable data.",
  openGraph: {
    title: "About - OmniTrackIQ",
    description: "The marketing analytics platform built for e-commerce teams who need trustworthy data.",
  },
};

const values = [
  {
    title: "Data accuracy first",
    description: "We obsess over data quality. Every number you see should be trustworthy and actionable.",
  },
  {
    title: "Simplicity over complexity",
    description: "Marketing data is already complex. Our tools should make it simpler, not harder.",
  },
  {
    title: "Built for operators",
    description: "We design for the people who actually run campaigns, not just executives who review dashboards.",
  },
  {
    title: "Privacy by design",
    description: "Your data is yours. We never sell data, and we're committed to privacy-first analytics.",
  },
];

const stats = [
  { value: "$50M+", label: "Ad spend tracked monthly" },
  { value: "500+", label: "E-commerce brands" },
  { value: "99.9%", label: "Uptime SLA" },
  { value: "5min", label: "Average setup time" },
];

export default function AboutPage() {
  return (
    <main>
      <Section>
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
            About OmniTrackIQ
          </span>
          <h1 className="mt-4 text-4xl font-semibold text-gray-900 md:text-5xl">
            Marketing analytics should be simple
          </h1>
          <p className="mt-6 text-lg text-gray-600">
            We started OmniTrackIQ because we were tired of cobbling together spreadsheets, 
            API connections, and manual reports just to understand if our ads were working. 
            There had to be a better way.
          </p>
        </div>
      </Section>

      <Section bordered>
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Our story</h2>
            <div className="mt-6 space-y-4 text-gray-600">
              <p>
                OmniTrackIQ was born from frustration. As e-commerce operators ourselves, we spent 
                countless hours pulling data from Facebook, Google, TikTok, and Shopify just to 
                answer one simple question: &ldquo;Is our marketing profitable?&rdquo;
              </p>
              <p>
                We built the tool we wished existed—a unified analytics platform that connects 
                all your marketing data, normalizes it automatically, and gives you clear, 
                actionable insights without the spreadsheet chaos.
              </p>
              <p>
                Today, hundreds of e-commerce brands trust OmniTrackIQ to track their marketing 
                performance and make better decisions. We&apos;re just getting started.
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm"
              >
                <div className="text-3xl font-bold text-emerald-600">{stat.value}</div>
                <div className="mt-2 text-sm text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section bordered>
        <SectionHeading
          eyebrow="Our values"
          title="What we believe"
          subtitle="These principles guide everything we build and every decision we make."
          align="center"
        />
        
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {values.map((value) => (
            <div
              key={value.title}
              className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
            >
              <h3 className="text-lg font-semibold text-gray-900">{value.title}</h3>
              <p className="mt-2 text-sm text-gray-600">{value.description}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section bordered>
        <div className="rounded-2xl border border-gray-200 bg-gradient-to-r from-emerald-50 via-white to-gray-50 p-8 text-center shadow-sm">
          <h2 className="text-2xl font-semibold text-gray-900">Join our team</h2>
          <p className="mt-2 text-gray-600">
            We&apos;re building the future of marketing analytics. Want to help?
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <Link
              href="/careers"
              className="rounded-lg bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              View open roles
            </Link>
            <Link
              href="/contact"
              className="rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-900 transition hover:bg-gray-50"
            >
              Contact us
            </Link>
          </div>
        </div>
      </Section>
    </main>
  );
}
