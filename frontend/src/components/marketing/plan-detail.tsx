import Link from "next/link";
import { Section, SectionHeading } from "@/components/marketing";
import { Plan, PLAN_FAQS, getIncludedFeatures, PlanId } from "@/config/plans";

interface PlanDetailProps {
  plan: Plan;
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

export function PlanDetail({ plan }: PlanDetailProps) {
  const faqs = PLAN_FAQS[plan.id as PlanId] || [];
  const includedFeatures = getIncludedFeatures(plan);

  return (
    <main>
      {/* Hero Section */}
      <Section>
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#238636] bg-[#dafbe1] px-4 py-1.5 text-sm font-medium text-[#1a7f37] dark:border-[#238636] dark:bg-[#23863620] dark:text-[#3fb950]">
            {plan.tagline}
          </div>
          <h1 className="text-4xl font-semibold text-[#1f2328] dark:text-[#e6edf3] md:text-5xl">{plan.name}</h1>
          <p className="mt-4 max-w-2xl text-lg text-[#57606a] dark:text-[#8b949e]">{plan.description}</p>
          
          <div className="mt-8 flex items-baseline gap-1">
            <span className="text-5xl font-bold text-[#1f2328] dark:text-[#e6edf3]">{plan.price}</span>
            <span className="text-xl text-[#57606a] dark:text-[#8b949e]">{plan.period}</span>
          </div>
          
          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Link
              href={plan.id === "advanced" ? "/contact" : "/signup"}
              className="rounded-md bg-[#238636] px-8 py-3 text-sm font-semibold text-white transition hover:bg-[#2ea043]"
            >
              {plan.cta}
            </Link>
            {plan.ctaSecondary && plan.id === "advanced" && (
              <Link
                href="/contact"
                className="rounded-md border border-[#d0d7de] bg-white px-8 py-3 text-sm font-semibold text-[#1f2328] transition hover:bg-[#f6f8fa] dark:border-[#30363d] dark:bg-[#161b22] dark:text-[#e6edf3] dark:hover:bg-[#21262d]"
              >
                {plan.ctaSecondary}
              </Link>
            )}
          </div>
          
          <p className="mt-4 text-sm text-[#57606a] dark:text-[#8b949e]">
            14-day free trial • No credit card required
          </p>
        </div>
      </Section>

      {/* Who this plan is for */}
      <Section bordered>
        <SectionHeading
          eyebrow="Who it's for"
          title={`${plan.name} is perfect for`}
          align="center"
        />
        <div className="mx-auto mt-8 max-w-2xl text-center">
          <p className="text-lg text-[#57606a] dark:text-[#8b949e]">{plan.targetCustomer}</p>
        </div>
        
        {/* Pains this plan solves */}
        <div className="mx-auto mt-12 max-w-3xl">
          <h3 className="mb-6 text-center text-lg font-semibold text-[#1f2328] dark:text-[#e6edf3]">
            Problems {plan.name} solves
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {plan.pains.map((pain) => (
              <div 
                key={pain} 
                className="flex items-start gap-3 rounded-md border border-[#d0d7de] bg-white p-4 dark:border-[#30363d] dark:bg-[#161b22]"
              >
                <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#ffebe9] text-[#cf222e] dark:bg-[#f8514920] dark:text-[#f85149]">
                  <XIcon className="h-4 w-4" />
                </div>
                <p className="text-sm text-[#1f2328] dark:text-[#e6edf3]">{pain}</p>
              </div>
            ))}
          </div>
        </div>
        
        {/* Key benefits */}
        <div className="mx-auto mt-12 max-w-3xl">
          <h3 className="mb-6 text-center text-lg font-semibold text-[#1f2328] dark:text-[#e6edf3]">
            What you get with {plan.name}
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {plan.keyBenefits.map((benefit) => (
              <div 
                key={benefit} 
                className="flex items-start gap-3 rounded-md border border-[#d0d7de] bg-white p-4 dark:border-[#30363d] dark:bg-[#161b22]"
              >
                <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#dafbe1] text-[#1a7f37] dark:bg-[#23863620] dark:text-[#3fb950]">
                  <CheckIcon className="h-4 w-4" />
                </div>
                <p className="text-sm text-[#1f2328] dark:text-[#e6edf3]">{benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Full feature list */}
      <Section bordered>
        <SectionHeading
          eyebrow="Features"
          title="Everything included"
          subtitle={`Full list of features in the ${plan.name} plan`}
          align="center"
        />
        <div className="mx-auto mt-10 max-w-3xl">
          <div className="rounded-md border border-[#d0d7de] bg-white dark:border-[#30363d] dark:bg-[#161b22]">
            <div className="divide-y divide-[#d0d7de] dark:divide-[#30363d]">
              {plan.features.map((feature) => (
                <div 
                  key={feature.text} 
                  className="flex items-center justify-between px-6 py-4"
                >
                  <span className={`text-sm ${feature.included ? "text-[#1f2328] dark:text-[#e6edf3]" : "text-[#57606a] dark:text-[#8b949e]"} ${feature.highlight ? "font-medium" : ""}`}>
                    {feature.text}
                  </span>
                  {feature.included ? (
                    <CheckIcon className="h-5 w-5 text-[#238636]" />
                  ) : (
                    <span className="text-[#57606a] dark:text-[#8b949e]">—</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Limits */}
        <div className="mx-auto mt-10 max-w-3xl">
          <h3 className="mb-4 text-center text-lg font-semibold text-[#1f2328] dark:text-[#e6edf3]">Plan limits</h3>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-md border border-[#d0d7de] bg-white p-4 text-center dark:border-[#30363d] dark:bg-[#161b22]">
              <div className="text-2xl font-bold text-[#1f2328] dark:text-[#e6edf3]">
                {plan.limits.seats === -1 ? "∞" : plan.limits.seats}
              </div>
              <div className="text-xs text-[#57606a] dark:text-[#8b949e]">Team seats</div>
            </div>
            <div className="rounded-md border border-[#d0d7de] bg-white p-4 text-center dark:border-[#30363d] dark:bg-[#161b22]">
              <div className="text-2xl font-bold text-[#1f2328] dark:text-[#e6edf3]">
                {plan.limits.workspaces === -1 ? "∞" : plan.limits.workspaces}
              </div>
              <div className="text-xs text-[#57606a] dark:text-[#8b949e]">Workspaces</div>
            </div>
            <div className="rounded-md border border-[#d0d7de] bg-white p-4 text-center dark:border-[#30363d] dark:bg-[#161b22]">
              <div className="text-2xl font-bold text-[#1f2328] dark:text-[#e6edf3]">
                {plan.limits.dataRetentionDays === 365 ? "1yr" : `${plan.limits.dataRetentionDays}d`}
              </div>
              <div className="text-xs text-[#57606a] dark:text-[#8b949e]">Data retention</div>
            </div>
            <div className="rounded-md border border-[#d0d7de] bg-white p-4 text-center dark:border-[#30363d] dark:bg-[#161b22]">
              <div className="text-2xl font-bold text-[#1f2328] dark:text-[#e6edf3]">
                {plan.limits.integrations === -1 ? "∞" : plan.limits.integrations}
              </div>
              <div className="text-xs text-[#57606a] dark:text-[#8b949e]">Integrations</div>
            </div>
          </div>
        </div>
      </Section>

      {/* Screenshot/Preview placeholder */}
      <Section bordered>
        <SectionHeading
          eyebrow="Preview"
          title="See it in action"
          align="center"
        />
        <div className="mx-auto mt-10 max-w-4xl">
          <div className="flex aspect-video items-center justify-center rounded-md border border-[#d0d7de] bg-[#f6f8fa] dark:border-[#30363d] dark:bg-[#21262d]">
            <div className="text-center">
              <div className="text-4xl">📊</div>
              <p className="mt-4 text-sm text-[#57606a] dark:text-[#8b949e]">
                Dashboard preview coming soon
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* FAQs */}
      {faqs.length > 0 && (
        <Section bordered>
          <SectionHeading
            eyebrow="FAQs"
            title={`${plan.name} questions`}
            align="center"
          />
          <div className="mx-auto mt-10 max-w-3xl divide-y divide-[#d0d7de] dark:divide-[#30363d]">
            {faqs.map((faq) => (
              <div key={faq.question} className="py-6">
                <h3 className="text-base font-semibold text-[#1f2328] dark:text-[#e6edf3]">{faq.question}</h3>
                <p className="mt-2 text-sm text-[#57606a] dark:text-[#8b949e]">{faq.answer}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* CTA */}
      <Section bordered>
        <div className="rounded-md border border-[#d0d7de] bg-[#f6f8fa] p-8 text-center dark:border-[#30363d] dark:bg-[#21262d] md:p-12">
          <h2 className="text-2xl font-semibold text-[#1f2328] dark:text-[#e6edf3] md:text-3xl">
            Ready to get started with {plan.name}?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[#57606a] dark:text-[#8b949e]">
            Start your 14-day free trial today. No credit card required.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href={plan.id === "advanced" ? "/contact" : "/signup"}
              className="rounded-md bg-[#238636] px-8 py-3 text-sm font-semibold text-white transition hover:bg-[#2ea043]"
            >
              {plan.cta}
            </Link>
            <Link
              href="/pricing"
              className="text-sm font-medium text-[#0969da] hover:underline dark:text-[#58a6ff]"
            >
              ← Compare all plans
            </Link>
          </div>
        </div>
      </Section>
    </main>
  );
}
