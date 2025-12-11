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
              className={`relative flex flex-col rounded-md border p-8 transition hover:shadow-gh ${
                plan.highlighted 
                  ? "border-[#238636] bg-white ring-2 ring-[#238636] dark:border-[#238636] dark:bg-[#161b22]" 
                  : "border-[#d0d7de] bg-white dark:border-[#30363d] dark:bg-[#161b22]"
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#238636] px-4 py-1 text-xs font-semibold text-white">
                  {plan.badge}
                </div>
              )}
              
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-[#1f2328] dark:text-[#e6edf3]">{plan.name}</h3>
                <p className="mt-1 text-sm font-medium text-[#238636] dark:text-[#3fb950]">{plan.tagline}</p>
                <p className="mt-2 text-sm text-[#57606a] dark:text-[#8b949e]">{plan.description}</p>
              </div>
              
              <div className="mb-6">
                <span className="text-4xl font-bold text-[#1f2328] dark:text-[#e6edf3]">{plan.price}</span>
                <span className="text-[#57606a] dark:text-[#8b949e]">{plan.period}</span>
              </div>
              
              <ul className="mb-8 flex-1 space-y-3">
                {getIncludedFeatures(plan).slice(0, 8).map((feature) => (
                  <li key={feature.text} className="flex items-start gap-3 text-sm text-[#1f2328] dark:text-[#e6edf3]">
                    <CheckIcon className={`mt-0.5 h-5 w-5 flex-shrink-0 ${feature.highlight ? "text-[#238636]" : "text-[#57606a] dark:text-[#8b949e]"}`} />
                    <span className={feature.highlight ? "font-medium" : ""}>{feature.text}</span>
                  </li>
                ))}
                {getIncludedFeatures(plan).length > 8 && (
                  <li className="text-sm text-[#0969da] dark:text-[#58a6ff]">
                    <Link href={`/plans/${plan.slug}`} className="hover:underline">
                      + {getIncludedFeatures(plan).length - 8} more features →
                    </Link>
                  </li>
                )}
              </ul>
              
              <div className="space-y-3">
                <Link
                  href={plan.id === "advanced" ? "/contact" : "/signup"}
                  className={`block w-full rounded-md py-2.5 text-center text-sm font-semibold transition ${
                    plan.highlighted
                      ? "bg-[#238636] text-white hover:bg-[#2ea043]"
                      : "bg-[#f6f8fa] text-[#1f2328] hover:bg-[#eaeef2] dark:bg-[#21262d] dark:text-[#e6edf3] dark:hover:bg-[#30363d]"
                  }`}
                >
                  {plan.cta}
                </Link>
                <Link
                  href={`/plans/${plan.slug}`}
                  className="block w-full rounded-md border border-[#d0d7de] py-2.5 text-center text-sm font-medium text-[#1f2328] transition hover:bg-[#f6f8fa] dark:border-[#30363d] dark:text-[#e6edf3] dark:hover:bg-[#21262d]"
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
