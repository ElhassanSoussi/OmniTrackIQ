import type { Metadata } from "next";
import Link from "next/link";
import { Section, SectionHeading, Button } from "@/components/marketing";

export const metadata: Metadata = {
  title: "Case Studies - Customer Success Stories",
  description: "See how e-commerce brands use OmniTrackIQ to improve ROAS, reduce CAC, and scale their marketing profitably.",
};

// Sample case studies - these would be real customer stories in production
const caseStudies = [
  {
    id: "fashion-brand-roas",
    company: "StyleCo Fashion",
    industry: "Fashion & Apparel",
    logo: "SC",
    headline: "+47% ROAS improvement",
    metric: "3.2x → 4.7x",
    metricLabel: "Blended ROAS",
    summary: "StyleCo Fashion used OmniTrackIQ's multi-touch attribution to identify underperforming campaigns and reallocate budget to high-performing channels, resulting in a 47% improvement in overall ROAS.",
    quote: "We finally have visibility into which touchpoints actually drive conversions. The attribution insights alone paid for the platform in the first month.",
    quotePerson: "Marketing Director",
    tags: ["Attribution", "Budget Optimization"],
  },
  {
    id: "beauty-brand-cac",
    company: "GlowUp Beauty",
    industry: "Health & Beauty",
    logo: "GB",
    headline: "-32% Customer Acquisition Cost",
    metric: "$45 → $31",
    metricLabel: "CAC Reduction",
    summary: "GlowUp Beauty leveraged OmniTrackIQ's cross-channel analytics to identify inefficient spend across Facebook and TikTok, reducing their CAC by 32% while maintaining growth.",
    quote: "The unified dashboard saved our team 10+ hours per week on reporting, and the insights helped us cut wasted ad spend significantly.",
    quotePerson: "Growth Lead",
    tags: ["CAC Optimization", "Cross-Channel"],
  },
  {
    id: "agency-scaling",
    company: "ScaleUp Agency",
    industry: "Marketing Agency",
    logo: "SA",
    headline: "3x client portfolio growth",
    metric: "15 → 45",
    metricLabel: "Clients Managed",
    summary: "ScaleUp Agency used OmniTrackIQ's multi-workspace feature and automated reporting to scale their client portfolio 3x without adding headcount.",
    quote: "The white-label reports and automated alerts let us manage more clients with the same team. Our clients love the transparency.",
    quotePerson: "Agency Founder",
    tags: ["Agency", "Automation"],
  },
  {
    id: "dtc-brand-scaling",
    company: "HomeFit Gear",
    industry: "Home & Fitness",
    logo: "HF",
    headline: "2.5x revenue growth",
    metric: "$1.2M → $3M",
    metricLabel: "Monthly Revenue",
    summary: "HomeFit Gear used OmniTrackIQ's real-time dashboards and alerts to confidently scale ad spend from $50K to $200K/month while maintaining profitability.",
    quote: "Before OmniTrackIQ, we were flying blind. Now we can scale with confidence because we know exactly which campaigns are profitable.",
    quotePerson: "Founder & CEO",
    tags: ["Scaling", "Real-time Analytics"],
  },
];

const industries = ["All Industries", "Fashion & Apparel", "Health & Beauty", "Marketing Agency", "Home & Fitness"];

export default function CaseStudiesPage() {
  return (
    <main>
      <Section>
        <SectionHeading
          eyebrow="Case Studies"
          title="Real results from real customers"
          subtitle="See how e-commerce brands and agencies use OmniTrackIQ to improve their marketing performance."
          align="center"
        />
      </Section>

      {/* Industry Filter */}
      <Section bordered>
        <div className="mb-8 flex flex-wrap justify-center gap-2">
          {industries.map((industry) => (
            <button
              key={industry}
              className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 transition hover:border-emerald-500 hover:text-emerald-600"
            >
              {industry}
            </button>
          ))}
        </div>

        {/* Case Study Cards */}
        <div className="grid gap-8 md:grid-cols-2">
          {caseStudies.map((study) => (
            <div
              key={study.id}
              className="flex flex-col rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition hover:shadow-md"
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-lg font-bold text-emerald-700">
                    {study.logo}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{study.company}</h3>
                    <span className="text-sm text-gray-500">{study.industry}</span>
                  </div>
                </div>
              </div>

              {/* Headline Metric */}
              <div className="mt-6 rounded-xl bg-emerald-50 p-6 text-center">
                <div className="text-3xl font-bold text-emerald-700">{study.headline}</div>
                <div className="mt-2 text-sm text-gray-600">
                  <span className="font-medium text-gray-900">{study.metric}</span> {study.metricLabel}
                </div>
              </div>

              {/* Summary */}
              <p className="mt-6 flex-1 text-gray-600">{study.summary}</p>

              {/* Quote */}
              <blockquote className="mt-6 border-l-4 border-emerald-200 pl-4">
                <p className="text-sm italic text-gray-600">&ldquo;{study.quote}&rdquo;</p>
                <cite className="mt-2 block text-sm font-medium text-gray-900 not-italic">
                  — {study.quotePerson}
                </cite>
              </blockquote>

              {/* Tags */}
              <div className="mt-6 flex flex-wrap gap-2">
                {study.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Disclaimer */}
        <p className="mt-8 text-center text-xs text-gray-500">
          *Case study metrics are representative examples. Individual results may vary based on business model, industry, and implementation.
        </p>
      </Section>

      {/* CTA */}
      <Section>
        <div className="rounded-3xl bg-gradient-to-r from-emerald-600 to-emerald-700 px-8 py-16 text-center text-white md:px-16">
          <h2 className="text-3xl font-semibold">Ready to write your success story?</h2>
          <p className="mx-auto mt-4 max-w-2xl text-emerald-100">
            Join hundreds of brands using OmniTrackIQ to make smarter marketing decisions.
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
              Talk to sales
            </Link>
          </div>
        </div>
      </Section>
    </main>
  );
}
