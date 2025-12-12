import type { Metadata } from "next";
import Link from "next/link";
import { Section, SectionHeading } from "@/components/marketing";
import { PLANS, GENERAL_FAQS, getIncludedFeatures } from "@/config/plans";

export const metadata: Metadata = {
  title: "Pricing - OmniTrackIQ",
  description: "Simple, transparent pricing for marketing analytics. Start with a 14-day free trial. Plans for growing brands, scaling teams, and agencies.",
  openGraph: {
    title: "Pricing - OmniTrackIQ",
    description: "Simple, transparent pricing for marketing analytics. Start with a 14-day free trial.",
  },
};

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}

export default function PricingPage() {
  return (
    <main>
      <Section>
        <SectionHeading
          eyebrow="Pricing"
          title="Simple, transparent pricing"
          subtitle="Choose the plan that fits your business. All plans include a 14-day free trial. No credit card required."
          align="center"
        />

        <div className="mt-12 grid gap-8 lg:grid-cols-3">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`relative flex flex-col rounded-2xl border p-8 transition-all duration-200 hover:shadow-xl ${plan.highlighted
                ? "border-primary-500 bg-white ring-2 ring-primary-500 dark:border-primary-400 dark:bg-slate-800"
                : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-slate-600"
                }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 px-4 py-1 text-xs font-semibold text-white shadow-md">
                  {plan.badge}
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{plan.name}</h3>
                <p className="mt-1 text-sm font-medium text-primary-600 dark:text-primary-400">{plan.tagline}</p>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{plan.description}</p>
              </div>

              <div className="mb-6">
                <span className="text-4xl font-bold text-slate-900 dark:text-white">{plan.price}</span>
                <span className="text-slate-500 dark:text-slate-400">{plan.period}</span>
              </div>

              <ul className="mb-8 flex-1 space-y-3">
                {getIncludedFeatures(plan).slice(0, 8).map((feature) => (
                  <li key={feature.text} className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300">
                    <CheckIcon className={`mt-0.5 h-5 w-5 flex-shrink-0 ${feature.highlight ? "text-primary-500" : "text-slate-400 dark:text-slate-500"}`} />
                    <span className={feature.highlight ? "font-medium text-slate-900 dark:text-white" : ""}>
                      {feature.text}
                      {feature.comingSoon && (
                        <span className="ml-2 inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                          Coming Soon
                        </span>
                      )}
                    </span>
                  </li>
                ))}
                {getIncludedFeatures(plan).length > 8 && (
                  <li className="text-sm text-primary-600 dark:text-primary-400">
                    <Link href={`/plans/${plan.slug}`} className="hover:underline font-medium">
                      + {getIncludedFeatures(plan).length - 8} more features →
                    </Link>
                  </li>
                )}
              </ul>

              <div className="space-y-3">
                <Link
                  href={plan.id === "enterprise" ? "/contact" : "/signup"}
                  className={`block w-full rounded-lg py-3 text-center text-sm font-semibold transition-all duration-200 ${plan.highlighted
                    ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md hover:from-primary-600 hover:to-primary-700 hover:shadow-lg"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
                    }`}
                >
                  {plan.cta}
                </Link>
                <Link
                  href={`/plans/${plan.slug}`}
                  className="block w-full rounded-lg border border-slate-200 py-3 text-center text-sm font-medium text-slate-700 transition-all duration-200 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                >
                  Learn more
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Feature comparison hint */}
        <div className="mt-8 text-center">
          <Link
            href="#comparison"
            className="text-sm text-[#0969da] hover:underline dark:text-[#58a6ff]"
          >
            Compare all features →
          </Link>
        </div>
      </Section>

      {/* Who is each plan for */}
      <Section bordered>
        <SectionHeading
          eyebrow="Who it's for"
          title="Find the right plan for your business"
          align="center"
        />
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className="rounded-md border border-[#d0d7de] bg-white p-6 dark:border-[#30363d] dark:bg-[#161b22]"
            >
              <div className="mb-4 text-2xl font-semibold text-[#1f2328] dark:text-[#e6edf3]">{plan.name}</div>
              <p className="mb-4 text-sm text-[#57606a] dark:text-[#8b949e]">{plan.targetCustomer}</p>
              <div className="mb-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-[#57606a] dark:text-[#8b949e]">Key benefits</div>
                <ul className="mt-2 space-y-2">
                  {plan.keyBenefits.map((benefit) => (
                    <li key={benefit} className="flex items-start gap-2 text-sm text-[#1f2328] dark:text-[#e6edf3]">
                      <CheckIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#238636]" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
              <Link
                href={`/plans/${plan.slug}`}
                className="text-sm font-medium text-[#0969da] hover:underline dark:text-[#58a6ff]"
              >
                See full details →
              </Link>
            </div>
          ))}
        </div>
      </Section>

      {/* Feature comparison table */}
      <Section bordered id="comparison">
        <SectionHeading
          eyebrow="Features"
          title="Compare plans"
          align="center"
        />
        <div className="mt-10 overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse">
            <thead>
              <tr className="border-b border-[#d0d7de] dark:border-[#30363d]">
                <th className="py-4 text-left text-sm font-semibold text-[#1f2328] dark:text-[#e6edf3]">Feature</th>
                {PLANS.map((plan) => (
                  <th key={plan.id} className="py-4 text-center text-sm font-semibold text-[#1f2328] dark:text-[#e6edf3]">
                    {plan.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-[#d0d7de] dark:border-[#30363d]">
                <td className="py-3 text-sm text-[#57606a] dark:text-[#8b949e]">Team seats</td>
                {PLANS.map((plan) => (
                  <td key={plan.id} className="py-3 text-center text-sm text-[#1f2328] dark:text-[#e6edf3]">
                    {plan.limits.seats === -1 ? "Unlimited" : plan.limits.seats}
                  </td>
                ))}
              </tr>
              <tr className="border-b border-[#d0d7de] dark:border-[#30363d]">
                <td className="py-3 text-sm text-[#57606a] dark:text-[#8b949e]">Workspaces</td>
                {PLANS.map((plan) => (
                  <td key={plan.id} className="py-3 text-center text-sm text-[#1f2328] dark:text-[#e6edf3]">
                    {plan.limits.workspaces === -1 ? "Unlimited" : plan.limits.workspaces}
                  </td>
                ))}
              </tr>
              <tr className="border-b border-[#d0d7de] dark:border-[#30363d]">
                <td className="py-3 text-sm text-[#57606a] dark:text-[#8b949e]">Data retention</td>
                {PLANS.map((plan) => (
                  <td key={plan.id} className="py-3 text-center text-sm text-[#1f2328] dark:text-[#e6edf3]">
                    {plan.limits.dataRetentionDays === 365 ? "1 year" : `${plan.limits.dataRetentionDays} days`}
                  </td>
                ))}
              </tr>
              <tr className="border-b border-[#d0d7de] dark:border-[#30363d]">
                <td className="py-3 text-sm text-[#57606a] dark:text-[#8b949e]">Shopify integration</td>
                {PLANS.map(() => (
                  <td key={Math.random()} className="py-3 text-center">
                    <CheckIcon className="mx-auto h-5 w-5 text-[#238636]" />
                  </td>
                ))}
              </tr>
              <tr className="border-b border-[#d0d7de] dark:border-[#30363d]">
                <td className="py-3 text-sm text-[#57606a] dark:text-[#8b949e]">GA4 integration</td>
                <td className="py-3 text-center text-[#57606a]">—</td>
                <td className="py-3 text-center"><CheckIcon className="mx-auto h-5 w-5 text-[#238636]" /></td>
                <td className="py-3 text-center"><CheckIcon className="mx-auto h-5 w-5 text-[#238636]" /></td>
              </tr>
              <tr className="border-b border-[#d0d7de] dark:border-[#30363d]">
                <td className="py-3 text-sm text-[#57606a] dark:text-[#8b949e]">AI Chatbot</td>
                <td className="py-3 text-center text-[#57606a]">—</td>
                <td className="py-3 text-center"><CheckIcon className="mx-auto h-5 w-5 text-[#238636]" /></td>
                <td className="py-3 text-center"><CheckIcon className="mx-auto h-5 w-5 text-[#238636]" /></td>
              </tr>
              <tr className="border-b border-[#d0d7de] dark:border-[#30363d]">
                <td className="py-3 text-sm text-[#57606a] dark:text-[#8b949e]">Creative Intelligence</td>
                <td className="py-3 text-center text-[#57606a]">—</td>
                <td className="py-3 text-center"><CheckIcon className="mx-auto h-5 w-5 text-[#238636]" /></td>
                <td className="py-3 text-center"><CheckIcon className="mx-auto h-5 w-5 text-[#238636]" /></td>
              </tr>
              <tr className="border-b border-[#d0d7de] dark:border-[#30363d]">
                <td className="py-3 text-sm text-[#57606a] dark:text-[#8b949e]">White-label reports</td>
                <td className="py-3 text-center text-[#57606a]">—</td>
                <td className="py-3 text-center text-[#57606a]">—</td>
                <td className="py-3 text-center"><CheckIcon className="mx-auto h-5 w-5 text-[#238636]" /></td>
              </tr>
              <tr className="border-b border-[#d0d7de] dark:border-[#30363d]">
                <td className="py-3 text-sm text-[#57606a] dark:text-[#8b949e]">AI Budget Recommendations</td>
                <td className="py-3 text-center text-[#57606a]">—</td>
                <td className="py-3 text-center text-[#57606a]">—</td>
                <td className="py-3 text-center"><CheckIcon className="mx-auto h-5 w-5 text-[#238636]" /></td>
              </tr>
            </tbody>
          </table>
        </div>
      </Section>

      {/* FAQs */}
      <Section bordered>
        <SectionHeading
          eyebrow="FAQs"
          title="Frequently asked questions"
          align="center"
        />
        <div className="mx-auto mt-10 max-w-3xl divide-y divide-[#d0d7de] dark:divide-[#30363d]">
          {GENERAL_FAQS.map((faq) => (
            <div key={faq.question} className="py-6">
              <h3 className="text-base font-semibold text-[#1f2328] dark:text-[#e6edf3]">{faq.question}</h3>
              <p className="mt-2 text-sm text-[#57606a] dark:text-[#8b949e]">{faq.answer}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* CTA */}
      <Section bordered>
        <div className="rounded-md border border-[#d0d7de] bg-[#f6f8fa] p-8 text-center dark:border-[#30363d] dark:bg-[#21262d] md:p-12">
          <h2 className="text-2xl font-semibold text-[#1f2328] dark:text-[#e6edf3] md:text-3xl">
            Ready to see where your money is really going?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[#57606a] dark:text-[#8b949e]">
            Start your 14-day free trial today. No credit card required. Connect your accounts in minutes.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/signup"
              className="rounded-md bg-[#238636] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#2ea043]"
            >
              Start free trial
            </Link>
            <Link
              href="/contact"
              className="rounded-md border border-[#d0d7de] bg-white px-6 py-3 text-sm font-semibold text-[#1f2328] transition hover:bg-[#f6f8fa] dark:border-[#30363d] dark:bg-[#161b22] dark:text-[#e6edf3] dark:hover:bg-[#21262d]"
            >
              Talk to sales
            </Link>
          </div>
        </div>
      </Section>
    </main>
  );
}
