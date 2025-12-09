import type { Metadata } from "next";
import Link from "next/link";
import { Section, SectionHeading } from "@/components/marketing";

export const metadata: Metadata = {
  title: "Pricing - OmniTrackIQ",
  description: "Simple, transparent pricing for marketing analytics. Start with a 14-day free trial. Plans for growing brands, scaling teams, and agencies.",
  openGraph: {
    title: "Pricing - OmniTrackIQ",
    description: "Simple, transparent pricing for marketing analytics. Start with a 14-day free trial.",
  },
};

const plans = [
  { 
    name: "Starter", 
    price: "$49", 
    period: "/month",
    description: "Perfect for growing e-commerce brands just starting with marketing analytics.",
    features: [
      "2 ad platform integrations",
      "Shopify connection",
      "Daily email summaries",
      "Basic ROAS tracking",
      "7-day data retention",
      "Email support"
    ],
    cta: "Start free trial",
    highlighted: false,
  },
  { 
    name: "Pro", 
    price: "$149", 
    period: "/month",
    description: "For scaling brands that need deeper insights and team collaboration.",
    features: [
      "All ad platform integrations",
      "Shopify + GA4 connections",
      "Real-time alerts (Slack, email)",
      "Advanced attribution models",
      "90-day data retention",
      "Custom dashboards",
      "Team access (up to 5 users)",
      "Priority support"
    ],
    cta: "Start free trial",
    highlighted: true,
  },
  { 
    name: "Agency", 
    price: "$399", 
    period: "/month",
    description: "Built for agencies managing multiple client accounts at scale.",
    features: [
      "Everything in Pro",
      "Unlimited client accounts",
      "White-label reports",
      "API access",
      "Unlimited data retention",
      "Custom integrations",
      "Dedicated success manager",
      "SLA guarantee"
    ],
    cta: "Contact sales",
    highlighted: false,
  },
];

const faqs = [
  {
    question: "How does the free trial work?",
    answer: "Start with a 14-day free trial on any plan. No credit card required. You'll get full access to all features in your chosen tier."
  },
  {
    question: "Can I change plans later?",
    answer: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately and we'll prorate your billing."
  },
  {
    question: "What ad platforms do you support?",
    answer: "We support Facebook Ads, Google Ads, TikTok Ads, and more. All plans include Shopify integration, and Pro+ includes GA4."
  },
  {
    question: "Is my data secure?",
    answer: "Absolutely. We use bank-level encryption, never store ad account credentials, and are SOC 2 compliant. Your data stays in your cloud."
  },
];

export default function PricingPage() {
  return (
    <main>
      <Section>
        <SectionHeading
          eyebrow="Pricing"
          title="Simple, transparent pricing"
          subtitle="Choose the plan that fits your business. All plans include a 14-day free trial."
          align="center"
        />
        
        <div className="mt-12 grid gap-8 lg:grid-cols-3">
          {plans.map((plan) => (
            <div 
              key={plan.name} 
              className={`relative flex flex-col rounded-2xl border p-8 shadow-sm transition hover:shadow-md ${
                plan.highlighted 
                  ? "border-emerald-500 bg-white ring-2 ring-emerald-500" 
                  : "border-gray-200 bg-white"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-emerald-500 px-4 py-1 text-xs font-semibold text-white">
                  Most Popular
                </div>
              )}
              
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900">{plan.name}</h3>
                <p className="mt-2 text-sm text-gray-500">{plan.description}</p>
              </div>
              
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                <span className="text-gray-500">{plan.period}</span>
              </div>
              
              <ul className="mb-8 flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm text-gray-600">
                    <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              
              <Link
                href={plan.name === "Agency" ? "/contact" : "/signup"}
                className={`block w-full rounded-lg py-3 text-center text-sm font-semibold transition ${
                  plan.highlighted
                    ? "bg-emerald-600 text-white hover:bg-emerald-700"
                    : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </Section>

      <Section bordered>
        <SectionHeading
          eyebrow="FAQ"
          title="Frequently asked questions"
          subtitle="Everything you need to know about OmniTrackIQ pricing and plans."
          align="center"
        />
        
        <div className="mx-auto mt-10 max-w-3xl divide-y divide-gray-200">
          {faqs.map((faq) => (
            <div key={faq.question} className="py-6">
              <h3 className="text-base font-semibold text-gray-900">{faq.question}</h3>
              <p className="mt-2 text-sm text-gray-600">{faq.answer}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section bordered>
        <div className="rounded-2xl border border-gray-200 bg-gradient-to-r from-emerald-50 via-white to-gray-50 p-8 text-center shadow-sm">
          <h2 className="text-2xl font-semibold text-gray-900">Need a custom solution?</h2>
          <p className="mt-2 text-gray-600">
            Enterprise plans with custom integrations, dedicated support, and volume discounts available.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <Link
              href="/contact"
              className="rounded-lg bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              Contact sales
            </Link>
            <Link
              href="/signup"
              className="rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-900 transition hover:bg-gray-50"
            >
              Start free trial
            </Link>
          </div>
        </div>
      </Section>
    </main>
  );
}
