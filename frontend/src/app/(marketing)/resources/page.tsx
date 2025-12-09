import type { Metadata } from "next";
import Link from "next/link";
import { Section, SectionHeading } from "@/components/marketing";

export const metadata: Metadata = {
  title: "Resources - Guides, Blog, and Case Studies",
  description: "Learn about marketing analytics with guides, tutorials, blog posts, and customer case studies from OmniTrackIQ.",
};

// Resource hub categories
const resourceCategories = [
  {
    title: "Blog",
    description: "Marketing analytics insights, attribution strategies, and e-commerce growth tips.",
    href: "/resources/blog",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" />
      </svg>
    ),
    count: "6 articles",
  },
  {
    title: "Case Studies",
    description: "See how e-commerce brands use OmniTrackIQ to improve their marketing performance.",
    href: "/resources/case-studies",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
    count: "4 stories",
  },
];

const resources = [
  {
    category: "Guides",
    items: [
      {
        title: "Getting Started with OmniTrackIQ",
        description: "Learn how to set up your account, connect integrations, and create your first dashboard.",
        link: "/docs/getting-started",
        readTime: "5 min read",
      },
      {
        title: "Understanding Attribution Models",
        description: "A deep dive into first-touch, last-touch, linear, and time-decay attribution models.",
        link: "/docs/attribution",
        readTime: "8 min read",
      },
      {
        title: "Setting Up Automated Alerts",
        description: "Configure smart alerts for ROAS drops, budget overruns, and conversion anomalies.",
        link: "/docs/alerts",
        readTime: "4 min read",
      },
    ],
  },
  {
    category: "Best Practices",
    items: [
      {
        title: "E-commerce ROAS Benchmarks 2024",
        description: "Industry benchmarks for ROAS, CAC, and LTV across different verticals and ad platforms.",
        link: "/blog/roas-benchmarks",
        readTime: "10 min read",
      },
      {
        title: "Building a Marketing Data Stack",
        description: "How to structure your marketing analytics infrastructure for scale.",
        link: "/blog/data-stack",
        readTime: "12 min read",
      },
      {
        title: "Multi-Channel Attribution Strategy",
        description: "Strategies for measuring the true impact of each marketing channel.",
        link: "/blog/multi-channel",
        readTime: "7 min read",
      },
    ],
  },
  {
    category: "Tutorials",
    items: [
      {
        title: "Connecting Facebook Ads",
        description: "Step-by-step guide to connecting your Facebook Ads account and syncing campaign data.",
        link: "/docs/integrations/facebook",
        readTime: "3 min read",
      },
      {
        title: "Creating Custom Dashboards",
        description: "Build custom dashboards tailored to your team's specific KPIs and reporting needs.",
        link: "/docs/dashboards",
        readTime: "6 min read",
      },
      {
        title: "n8n Workflow Integration",
        description: "Automate your marketing workflows with OmniTrackIQ and n8n.",
        link: "/docs/integrations/n8n",
        readTime: "8 min read",
      },
    ],
  },
];

const webinars = [
  {
    title: "Mastering E-commerce Attribution",
    date: "December 15, 2025",
    time: "2:00 PM EST",
    description: "Learn how to track the full customer journey across paid and organic channels.",
  },
  {
    title: "2025 Marketing Analytics Trends",
    date: "January 10, 2026",
    time: "1:00 PM EST",
    description: "What's changing in marketing measurement and how to prepare your stack.",
  },
];

export default function ResourcesPage() {
  return (
    <main>
      <Section>
        <SectionHeading
          eyebrow="Resources"
          title="Learn, grow, and optimize"
          subtitle="Guides, tutorials, and best practices to help you get the most out of your marketing analytics."
          align="center"
        />

        {/* Resource Hub Cards */}
        <div className="mx-auto mt-12 grid max-w-2xl gap-6 md:grid-cols-2">
          {resourceCategories.map((category) => (
            <Link
              key={category.title}
              href={category.href}
              className="group rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition hover:border-emerald-200 hover:shadow-md"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition group-hover:bg-emerald-100">
                {category.icon}
              </div>
              <h3 className="mt-4 text-xl font-semibold text-gray-900">{category.title}</h3>
              <p className="mt-2 text-gray-600">{category.description}</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm text-gray-500">{category.count}</span>
                <span className="text-sm font-medium text-emerald-600 group-hover:underline">
                  Browse →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </Section>

      {resources.map((section) => (
        <Section key={section.category} bordered>
          <h2 className="mb-8 text-2xl font-semibold text-gray-900">{section.category}</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {section.items.map((item) => (
              <Link
                key={item.title}
                href={item.link}
                className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md"
              >
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-emerald-600">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-gray-600">{item.description}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs text-gray-400">{item.readTime}</span>
                  <span className="text-sm font-medium text-emerald-600 group-hover:underline">
                    Read more →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </Section>
      ))}

      <Section bordered>
        <SectionHeading
          eyebrow="Webinars"
          title="Upcoming events"
          subtitle="Join our live sessions to learn from experts and ask questions."
        />
        
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {webinars.map((webinar) => (
            <div
              key={webinar.title}
              className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-center gap-2 text-sm text-emerald-600">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {webinar.date} • {webinar.time}
              </div>
              <h3 className="mt-3 text-lg font-semibold text-gray-900">{webinar.title}</h3>
              <p className="mt-2 text-sm text-gray-600">{webinar.description}</p>
              <button className="mt-4 rounded-lg bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-900 transition hover:bg-gray-200">
                Register
              </button>
            </div>
          ))}
        </div>
      </Section>

      <Section bordered>
        <div className="rounded-2xl border border-gray-200 bg-gradient-to-r from-emerald-50 via-white to-gray-50 p-8 text-center shadow-sm">
          <h2 className="text-2xl font-semibold text-gray-900">Need help?</h2>
          <p className="mt-2 text-gray-600">
            Can&apos;t find what you&apos;re looking for? Our support team is here to help.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <Link
              href="/contact"
              className="rounded-lg bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              Contact support
            </Link>
            <Link
              href="/docs"
              className="rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-900 transition hover:bg-gray-50"
            >
              Browse documentation
            </Link>
          </div>
        </div>
      </Section>
    </main>
  );
}
