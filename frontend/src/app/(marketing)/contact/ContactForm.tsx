"use client";

import { useState, FormEvent } from "react";

const contactReasons = [
  { value: "sales", label: "Sales inquiry" },
  { value: "demo", label: "Book a demo" },
  { value: "support", label: "Technical support" },
  { value: "partnership", label: "Partnership" },
  { value: "other", label: "Other" },
];

export function ContactForm() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-lg">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
        <svg className="h-8 w-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </div>
      <h3 className="mb-2 text-xl font-bold text-gray-900">Get in touch</h3>
      <p className="mb-6 text-gray-600">
        We&apos;d love to hear from you. Please email our support team directly.
      </p>
      <a
        href="mailto:support@omnitrackiq.com"
        className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
      >
        support@omnitrackiq.com
      </a>
    </div>
  );
}
