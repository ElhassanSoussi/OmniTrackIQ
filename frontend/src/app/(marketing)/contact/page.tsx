import type { Metadata } from "next";
import Link from "next/link";
import { Section, SectionHeading } from "@/components/marketing";
import { ContactForm } from "./ContactForm";

export const metadata: Metadata = {
  title: "Contact - OmniTrackIQ",
  description: "Get in touch with OmniTrackIQ. Sales inquiries, technical support, partnerships, or book a demo. We respond within 24 hours.",
  openGraph: {
    title: "Contact - OmniTrackIQ",
    description: "Get in touch with OmniTrackIQ. We respond within 24 hours.",
  },
};

export default function ContactPage() {
  return (
    <main>
      <Section>
        <SectionHeading
          eyebrow="Contact"
          title="Get in touch"
          subtitle="Have a question, want to book a demo, or learn more? We'd love to hear from you."
          align="center"
        />
      </Section>

      <Section bordered>
        <div className="mx-auto max-w-2xl">
          <ContactForm />
        </div>
      </Section>

      <Section bordered>
        <div className="grid gap-8 md:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
              <svg className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Email</h3>
            <p className="mt-2 text-sm text-gray-600">hello@omnitrackiq.com</p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
              <svg className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Live chat</h3>
            <p className="mt-2 text-sm text-gray-600">Available Mon-Fri, 9am-5pm EST</p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
              <svg className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Documentation</h3>
            <p className="mt-2 text-sm text-gray-600">
              <Link href="/resources" className="text-emerald-600 hover:underline">
                Browse resources
              </Link>
            </p>
          </div>
        </div>
      </Section>

      <Section bordered>
        <div className="rounded-2xl border border-gray-200 bg-gradient-to-r from-emerald-50 via-white to-gray-50 p-8 text-center shadow-sm">
          <h2 className="text-2xl font-semibold text-gray-900">Ready to see OmniTrackIQ in action?</h2>
          <p className="mt-2 text-gray-600">
            Book a personalized demo with our team and see how we can help your business.
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
