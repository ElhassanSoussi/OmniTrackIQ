/**
 * Centralized Plan Configuration for OmniTrackIQ
 * 
 * This file defines all plan tiers, their features, limits, and pricing.
 * Used across pricing pages, feature gating, and upgrade prompts.
 */

export type PlanId = "starter" | "pro" | "enterprise";

export interface PlanFeature {
  text: string;
  included: boolean;
  highlight?: boolean;
}

export interface PlanLimit {
  seats: number;
  workspaces: number;
  dataRetentionDays: number;
  integrations: number;
}

export interface Plan {
  id: PlanId;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  targetCustomer: string;
  price: string;
  priceNumeric: number;
  period: string;
  limits: PlanLimit;
  features: PlanFeature[];
  keyBenefits: string[];
  pains: string[];
  cta: string;
  ctaSecondary?: string;
  highlighted?: boolean;
  badge?: string;
}

export const PLANS: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    slug: "starter",
    tagline: "For growing Shopify brands",
    description: "Perfect for single-store founders who want clarity on where their money is going. Get the essentials without the complexity.",
    targetCustomer: "Single Shopify store, small team, founders who aren't \"data people\"",
    price: "$49",
    priceNumeric: 49,
    period: "/month",
    limits: {
      seats: 2,
      workspaces: 1,
      dataRetentionDays: 30,
      integrations: 4,
    },
    features: [
      { text: "Shopify integration", included: true, highlight: true },
      { text: "Facebook Ads integration", included: true },
      { text: "Google Ads integration", included: true },
      { text: "TikTok Ads integration", included: true },
      { text: "\"Money In vs Money Out\" dashboard", included: true, highlight: true },
      { text: "Real profit tracking (revenue - COGS - shipping - discounts - ad spend)", included: true },
      { text: "Simple ROAS by channel & campaign", included: true },
      { text: "Founder Mode: 3-5 key numbers with plain-English explanations", included: true, highlight: true },
      { text: "Basic alerts (ROAS below threshold, spend spikes)", included: true },
      { text: "Weekly email report", included: true },
      { text: "2 team seats", included: true },
      { text: "Email support", included: true },
      { text: "GA4 integration", included: false },
      { text: "Cohort analysis", included: false },
      { text: "Creative intelligence", included: false },
      { text: "AI chatbot", included: false },
    ],
    keyBenefits: [
      "See real profit, not just revenue",
      "Know which ads are actually making money",
      "Simple dashboard designed for founders",
      "Alerts before you overspend",
    ],
    pains: [
      "Don't know where revenue really comes from",
      "Waste money on ads without knowing what's profitable",
      "Spend hours matching numbers between platforms",
      "Want a simple \"money in vs money out\" view",
    ],
    cta: "Start free trial",
    ctaSecondary: "Learn more",
  },
  {
    id: "pro",
    name: "Pro",
    slug: "pro",
    tagline: "For scaling brands & performance marketers",
    description: "Deep analytics, creative insights, and AI-powered answers for teams serious about growth. Everything you need to scale confidently.",
    targetCustomer: "Serious e-commerce stores, performance marketing teams, media buyers",
    price: "$149",
    priceNumeric: 149,
    period: "/month",
    limits: {
      seats: 5,
      workspaces: 2,
      dataRetentionDays: 90,
      integrations: 8,
    },
    features: [
      { text: "Everything in Starter", included: true, highlight: true },
      { text: "GA4 integration", included: true },
      { text: "Email platform integration (Klaviyo)", included: true },
      { text: "Additional ad channels (Pinterest, Snapchat)", included: true },
      { text: "Cohort analysis (new vs returning customers)", included: true, highlight: true },
      { text: "Funnel view (ad → session → cart → purchase)", included: true },
      { text: "Per-product profitability", included: true },
      { text: "Creative Intelligence v1", included: true, highlight: true },
      { text: "Top creatives by ROAS / profit", included: true },
      { text: "Creative fatigue detection (CTR/CR drop alerts)", included: true },
      { text: "Smart alerts (ROAS drop, spend spikes, no conversions, tracking issues)", included: true },
      { text: "AI \"Ask Your Data\" chatbot", included: true, highlight: true },
      { text: "Daily email reports", included: true },
      { text: "Up to 5 team seats", included: true },
      { text: "2 workspaces", included: true },
      { text: "Priority support", included: true },
      { text: "Multi-client management", included: false },
      { text: "White-label reports", included: false },
      { text: "AI budget recommendations", included: false },
    ],
    keyBenefits: [
      "Understand your full customer journey",
      "Know which creatives actually work",
      "Ask questions in plain English, get instant answers",
      "Catch problems before they cost you money",
    ],
    pains: [
      "Need deeper insights than basic dashboards",
      "Don't know which creatives are working",
      "Spend too much time building reports",
      "Want predictions and smart alerts",
    ],
    cta: "Start free trial",
    ctaSecondary: "Learn more",
    highlighted: true,
    badge: "Most Popular",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    slug: "enterprise",
    tagline: "For agencies & multi-store brands",
    description: "Enterprise-grade features for agencies managing multiple clients. White-label dashboards, AI strategy recommendations, and unlimited scale.",
    targetCustomer: "Agencies, larger brands with multiple stores/clients, enterprise teams",
    price: "Custom",
    priceNumeric: 0,
    period: "",
    limits: {
      seats: -1, // Unlimited
      workspaces: -1, // Unlimited
      dataRetentionDays: 365,
      integrations: -1, // Unlimited
    },
    features: [
      { text: "Everything in Pro", included: true, highlight: true },
      { text: "Unlimited client workspaces", included: true, highlight: true },
      { text: "Easy client switching", included: true },
      { text: "Client-specific permissions & logins", included: true },
      { text: "Agency branding / white-label options", included: true, highlight: true },
      { text: "Automatic client reports per workspace", included: true },
      { text: "A/B Creative Inspector", included: true, highlight: true },
      { text: "Compare creatives: spend, CTR, CVR, revenue, ROAS, profit", included: true },
      { text: "AI Strategist Mode", included: true, highlight: true },
      { text: "Budget recommendations (\"Increase Campaign A by 20%\")", included: true },
      { text: "Pause suggestions (\"Campaign B ROAS < 0.8 for 7 days\")", included: true },
      { text: "Industry benchmarks", included: true },
      { text: "Compare to anonymized category averages", included: true },
      { text: "Advanced alert rules", included: true },
      { text: "One-click CSV export for accountants", included: true },
      { text: "Unlimited data retention", included: true },
      { text: "Dedicated success manager", included: true },
      { text: "SLA guarantee", included: true },
    ],
    keyBenefits: [
      "Manage all clients from one dashboard",
      "Deliver professional white-label reports",
      "AI-powered budget optimization",
      "Scale without limits",
    ],
    pains: [
      "Managing multiple client accounts is chaotic",
      "Need white-label dashboards for clients",
      "Want AI to help optimize budgets",
      "Need higher limits and enterprise support",
    ],
    cta: "Contact Us",
    ctaSecondary: "Talk to sales",
  },
];

// Helper functions
export function getPlanById(id: PlanId): Plan | undefined {
  return PLANS.find((p) => p.id === id);
}

export function getPlanBySlug(slug: string): Plan | undefined {
  return PLANS.find((p) => p.slug === slug);
}

export function getIncludedFeatures(plan: Plan): PlanFeature[] {
  return plan.features.filter((f) => f.included);
}

export function getHighlightedFeatures(plan: Plan): PlanFeature[] {
  return plan.features.filter((f) => f.included && f.highlight);
}

// FAQ items per plan
export interface FAQ {
  question: string;
  answer: string;
}

export const PLAN_FAQS: Record<PlanId, FAQ[]> = {
  starter: [
    {
      question: "What's included in the free trial?",
      answer: "You get full access to all Starter features for 14 days. No credit card required. Connect your Shopify and ad accounts and see real data immediately.",
    },
    {
      question: "Can I upgrade later?",
      answer: "Absolutely! You can upgrade to Pro or Advanced at any time. Your data and settings are preserved, and you'll get instant access to additional features.",
    },
    {
      question: "How is profit calculated?",
      answer: "We calculate real profit as: Revenue - COGS - Shipping - Discounts - Fees - Ad Spend. This gives you true profitability, not just top-line revenue.",
    },
    {
      question: "What ad platforms are supported?",
      answer: "Starter includes Facebook Ads, Google Ads, TikTok Ads, and Shopify. Need GA4 or email platforms? Check out Pro.",
    },
    {
      question: "How many team members can I add?",
      answer: "Starter includes 2 seats – perfect for a founder and their media buyer or marketing lead.",
    },
  ],
  pro: [
    {
      question: "What's the AI chatbot?",
      answer: "Ask questions in plain English like \"What was my ROAS yesterday?\" or \"Top 3 losing campaigns last week?\" and get instant answers with data from your connected accounts.",
    },
    {
      question: "How does Creative Intelligence work?",
      answer: "We analyze your ad creatives to show which ones drive the best ROAS and profit. We also detect creative fatigue – when CTR or conversion rates start dropping.",
    },
    {
      question: "What's cohort analysis?",
      answer: "See how new customers behave differently from returning customers. Understand acquisition costs vs lifetime value and optimize your marketing accordingly.",
    },
    {
      question: "Can I have multiple workspaces?",
      answer: "Pro includes 2 workspaces – great if you run multiple brands or want to separate test accounts. Need unlimited? Check out Advanced.",
    },
    {
      question: "What kind of alerts can I set up?",
      answer: "Smart alerts for: ROAS dropping below threshold, spend spikes, campaigns with no conversions, and tracking issues (no events in X hours).",
    },
  ],
  enterprise: [
    {
      question: "How does white-labeling work?",
      answer: "Add your agency's logo, colors, and branding to all dashboards and reports. Your clients see your brand, not ours. Perfect for client presentations.",
    },
    {
      question: "What are AI budget recommendations?",
      answer: "Our AI analyzes performance data and suggests specific actions like \"Increase Campaign A budget by 20%\" or \"Pause Campaign B – ROAS below 0.8 for 7 days\".",
    },
    {
      question: "How do client permissions work?",
      answer: "Create separate logins for each client with access only to their workspace. They see their data, you see everything. Full control over who sees what.",
    },
    {
      question: "What are industry benchmarks?",
      answer: "Compare your performance to anonymized averages from similar businesses in your industry. See if your ROAS, CPA, and other metrics are above or below average.",
    },
    {
      question: "Is there a setup fee?",
      answer: "No setup fees. You get a dedicated success manager who will help you onboard, migrate data, and train your team at no extra cost.",
    },
  ],
};

// General FAQs (shown on main pricing page)
export const GENERAL_FAQS: FAQ[] = [
  {
    question: "How does the free trial work?",
    answer: "Start with a 14-day free trial on any plan. No credit card required. You'll get full access to all features in your chosen tier.",
  },
  {
    question: "Can I change plans later?",
    answer: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately and we'll prorate your billing.",
  },
  {
    question: "What ad platforms do you support?",
    answer: "We support Facebook Ads, Google Ads, TikTok Ads, Pinterest, Snapchat, and more. All plans include Shopify integration, and Pro+ includes GA4.",
  },
  {
    question: "Is my data secure?",
    answer: "Absolutely. We use bank-level encryption (AES-256), never store ad account credentials, and follow SOC 2 best practices. Your data stays in your cloud.",
  },
  {
    question: "Do you offer annual billing?",
    answer: "Yes! Annual billing saves you 20%. Contact us for annual pricing or select it during checkout.",
  },
  {
    question: "What if I need help getting started?",
    answer: "All plans include email support. Pro gets priority support, and Advanced includes a dedicated success manager who will personally help you onboard.",
  },
];
