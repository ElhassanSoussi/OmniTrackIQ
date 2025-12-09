import type { Metadata } from "next";
import Link from "next/link";
import { Section, SectionHeading, Button } from "@/components/marketing";

export const metadata: Metadata = {
  title: "Security - Data Protection & Compliance",
  description: "Learn how OmniTrackIQ protects your marketing data with enterprise-grade security, encryption, and privacy-first practices.",
};

const securityFeatures = [
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
      </svg>
    ),
    title: "Data Encryption",
    description: "All data is encrypted in transit using TLS 1.3 and at rest using AES-256 encryption.",
    details: [
      "TLS 1.3 encryption for all data in transit",
      "AES-256 encryption for data at rest",
      "Encrypted database connections",
      "Secure credential storage with hashing",
    ],
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
      </svg>
    ),
    title: "Access Control",
    description: "Role-based access control (RBAC) ensures team members only see what they need.",
    details: [
      "Role-based permissions (Admin, Member, Viewer)",
      "Workspace-level access isolation",
      "Secure session management with JWT",
      "Automatic session expiration",
    ],
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
      </svg>
    ),
    title: "Multi-Tenant Isolation",
    description: "Each workspace is completely isolated. Your data is never accessible to other accounts.",
    details: [
      "Complete data isolation between workspaces",
      "Separate database schemas per tenant",
      "No cross-tenant data access possible",
      "Audit logging for all data access",
    ],
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    title: "Privacy First",
    description: "We never sell your data. Your marketing data is yours and stays yours.",
    details: [
      "No data selling or sharing with third parties",
      "Data deletion available on request",
      "GDPR-compliant data handling",
      "Transparent data processing",
    ],
  },
];

const infrastructure = [
  {
    title: "Cloud Infrastructure",
    description: "Hosted on enterprise-grade cloud infrastructure with 99.9% uptime SLA.",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" />
      </svg>
    ),
  },
  {
    title: "Regular Backups",
    description: "Automated daily backups with point-in-time recovery capabilities.",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
      </svg>
    ),
  },
  {
    title: "DDoS Protection",
    description: "Built-in protection against distributed denial-of-service attacks.",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286zm0 13.036h.008v.008H12v-.008z" />
      </svg>
    ),
  },
  {
    title: "Vulnerability Scanning",
    description: "Regular security scans and penetration testing to identify vulnerabilities.",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
      </svg>
    ),
  },
];

const compliance = [
  {
    title: "GDPR",
    status: "Compliant",
    description: "We follow GDPR requirements for data handling, processing, and user rights.",
  },
  {
    title: "CCPA",
    status: "Compliant",
    description: "California Consumer Privacy Act compliance for US customers.",
  },
  {
    title: "SOC 2 Type II",
    status: "On Roadmap",
    description: "SOC 2 certification is on our roadmap for 2025.",
  },
  {
    title: "ISO 27001",
    status: "On Roadmap",
    description: "ISO 27001 certification planned for enterprise customers.",
  },
];

export default function SecurityPage() {
  return (
    <main>
      {/* Hero */}
      <Section>
        <div className="mx-auto max-w-4xl text-center">
          <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">
            Security & Privacy
          </span>
          <h1 className="mt-6 text-4xl font-semibold text-gray-900 md:text-5xl">
            Your data security is our top priority
          </h1>
          <p className="mt-6 text-lg text-gray-600">
            OmniTrackIQ is built with enterprise-grade security from the ground up. 
            We protect your marketing data with encryption, access controls, and privacy-first practices.
          </p>
        </div>
      </Section>

      {/* Security Features */}
      <Section bordered>
        <SectionHeading
          eyebrow="Security Features"
          title="Enterprise-grade protection"
          subtitle="Comprehensive security measures to keep your data safe."
        />
        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          {securityFeatures.map((feature) => (
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
                {feature.details.map((detail) => (
                  <li key={detail} className="flex items-start gap-3 text-sm text-gray-600">
                    <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {detail}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      {/* Infrastructure */}
      <Section bordered>
        <SectionHeading
          eyebrow="Infrastructure"
          title="Built on reliable foundations"
          subtitle="Our infrastructure is designed for security, reliability, and performance."
          align="center"
        />
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {infrastructure.map((item) => (
            <div
              key={item.title}
              className="rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm"
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                {item.icon}
              </div>
              <h3 className="mt-4 font-semibold text-gray-900">{item.title}</h3>
              <p className="mt-2 text-sm text-gray-600">{item.description}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Compliance */}
      <Section bordered>
        <SectionHeading
          eyebrow="Compliance"
          title="Meeting industry standards"
          subtitle="We're committed to meeting and exceeding compliance requirements."
          align="center"
        />
        <div className="mx-auto mt-12 max-w-3xl">
          <div className="grid gap-4 md:grid-cols-2">
            {compliance.map((item) => (
              <div
                key={item.title}
                className="flex items-start gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
              >
                <div className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  item.status === "Compliant" 
                    ? "bg-emerald-100 text-emerald-700" 
                    : "bg-amber-100 text-amber-700"
                }`}>
                  {item.status}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{item.title}</h3>
                  <p className="mt-1 text-sm text-gray-600">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Data Handling */}
      <Section bordered>
        <div className="mx-auto max-w-3xl">
          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm md:p-12">
            <h2 className="text-2xl font-semibold text-gray-900">How we handle your data</h2>
            <div className="mt-8 space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900">What data we collect</h3>
                <p className="mt-2 text-gray-600">
                  We collect marketing performance data from your connected ad platforms and e-commerce stores, 
                  including ad spend, impressions, clicks, conversions, and order data. We also collect basic 
                  account information needed to provide our service.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">How we use your data</h3>
                <p className="mt-2 text-gray-600">
                  Your data is used solely to provide the OmniTrackIQ service—generating dashboards, reports, 
                  and insights. We never sell your data or use it for purposes other than delivering our product.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Data retention</h3>
                <p className="mt-2 text-gray-600">
                  We retain your data according to your plan&apos;s data retention policy. You can request data 
                  deletion at any time, and we&apos;ll remove your data within 30 days.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Third-party integrations</h3>
                <p className="mt-2 text-gray-600">
                  We use OAuth for secure authentication with ad platforms. We never store your ad platform 
                  passwords. Integration tokens are encrypted and can be revoked at any time.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Contact */}
      <Section>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-semibold text-gray-900">Have security questions?</h2>
          <p className="mt-4 text-gray-600">
            Our team is happy to answer any questions about our security practices, 
            compliance, or data handling policies.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button href="/contact">Contact our security team</Button>
            <Button href="mailto:security@omnitrackiq.com" variant="secondary">
              security@omnitrackiq.com
            </Button>
          </div>
        </div>
      </Section>
    </main>
  );
}
