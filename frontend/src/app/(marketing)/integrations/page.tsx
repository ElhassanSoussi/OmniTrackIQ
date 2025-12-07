import Link from "next/link";
import { Section, SectionHeading } from "@/components/marketing";

const integrations = [
  {
    name: "Facebook Ads",
    category: "Advertising",
    description: "Sync campaigns, ad sets, and conversion data from Meta Ads Manager.",
    features: ["Campaign performance", "Ad spend tracking", "Conversion events", "Audience insights"],
    status: "available",
  },
  {
    name: "Google Ads",
    category: "Advertising",
    description: "Import search, shopping, and display campaign metrics automatically.",
    features: ["Search campaigns", "Shopping performance", "Display metrics", "Keyword data"],
    status: "available",
  },
  {
    name: "TikTok Ads",
    category: "Advertising",
    description: "Track TikTok ad performance alongside your other paid channels.",
    features: ["Campaign metrics", "Creative performance", "Audience data", "Conversion tracking"],
    status: "available",
  },
  {
    name: "Shopify",
    category: "Commerce",
    description: "Stream orders, revenue, and customer data to power your attribution.",
    features: ["Order sync", "Revenue tracking", "Customer data", "Product performance"],
    status: "available",
  },
  {
    name: "Google Analytics 4",
    category: "Analytics",
    description: "Connect GA4 for web analytics alignment and cross-platform insights.",
    features: ["Session data", "Event tracking", "Conversion goals", "User behavior"],
    status: "available",
  },
  {
    name: "Klaviyo",
    category: "Email",
    description: "Track email revenue attribution and campaign performance.",
    features: ["Email revenue", "Flow performance", "Subscriber data", "Campaign metrics"],
    status: "coming_soon",
  },
  {
    name: "Pinterest Ads",
    category: "Advertising",
    description: "Monitor Pinterest ad spend and conversion performance.",
    features: ["Pin performance", "Ad spend", "Conversions", "Audience insights"],
    status: "coming_soon",
  },
  {
    name: "Snapchat Ads",
    category: "Advertising",
    description: "Track Snapchat advertising campaigns and ROAS.",
    features: ["Campaign data", "Ad metrics", "Conversion events", "Audience reach"],
    status: "coming_soon",
  },
];

const categories = ["All", "Advertising", "Commerce", "Analytics", "Email"];

export default function IntegrationsMarketingPage() {
  return (
    <main>
      <Section>
        <SectionHeading
          eyebrow="Integrations"
          title="Connect your entire marketing stack"
          subtitle="Native integrations with your favorite ad platforms, commerce tools, and analytics. Set up in minutes, not days."
          align="center"
        />
      </Section>

      <Section bordered>
        <div className="mb-8 flex flex-wrap justify-center gap-2">
          {categories.map((category) => (
            <button
              key={category}
              className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 transition hover:border-emerald-500 hover:text-emerald-600"
            >
              {category}
            </button>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {integrations.map((integration) => (
            <div
              key={integration.name}
              className="flex flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-medium text-emerald-600">{integration.category}</span>
                  <h3 className="mt-1 text-lg font-semibold text-gray-900">{integration.name}</h3>
                </div>
                {integration.status === "coming_soon" && (
                  <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                    Coming soon
                  </span>
                )}
              </div>
              
              <p className="mt-3 flex-1 text-sm text-gray-600">{integration.description}</p>
              
              <div className="mt-4 flex flex-wrap gap-2">
                {integration.features.map((feature) => (
                  <span
                    key={feature}
                    className="rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-600"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section bordered>
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <span className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
              Workflow automation
            </span>
            <h2 className="mt-2 text-3xl font-semibold text-gray-900">
              Extend with n8n workflows
            </h2>
            <p className="mt-4 text-gray-600">
              OmniTrackIQ integrates with n8n for powerful workflow automation. Trigger flows on new data, 
              sync to your warehouse, send custom notifications, and more.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "Trigger on metric changes",
                "Sync to BigQuery or Snowflake",
                "Custom Slack notifications",
                "Enrich data with external APIs",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-gray-600">
                  <svg className="h-5 w-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-8">
            <div className="space-y-4">
              <div className="rounded-lg border border-gray-200 bg-white p-4">
                <div className="text-sm font-medium text-gray-900">Webhook trigger</div>
                <div className="mt-1 text-xs text-gray-500">On: ROAS drops below 2.5x</div>
              </div>
              <div className="flex justify-center">
                <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>
              <div className="rounded-lg border border-gray-200 bg-white p-4">
                <div className="text-sm font-medium text-gray-900">Slack notification</div>
                <div className="mt-1 text-xs text-gray-500">Send alert to #marketing-alerts</div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Section bordered>
        <div className="rounded-2xl border border-gray-200 bg-gradient-to-r from-emerald-50 via-white to-gray-50 p-8 text-center shadow-sm">
          <h2 className="text-2xl font-semibold text-gray-900">Need a custom integration?</h2>
          <p className="mt-2 text-gray-600">
            We can build custom connectors for your specific needs. Contact us to discuss.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <Link
              href="/contact"
              className="rounded-lg bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              Contact us
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
