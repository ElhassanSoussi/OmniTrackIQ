import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://omnitrackiq.com"),
  title: {
    default: "OmniTrackIQ - Marketing Analytics & Attribution for E-commerce",
    template: "%s | OmniTrackIQ",
  },
  description: "Unified marketing analytics platform for e-commerce brands. Track ROAS, attribution, and ad performance across Facebook, Google, TikTok, and Shopify in one dashboard.",
  keywords: ["marketing analytics", "ROAS tracking", "e-commerce analytics", "attribution", "ad tracking", "Facebook ads", "Google ads", "TikTok ads", "Shopify analytics"],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "OmniTrackIQ",
    title: "OmniTrackIQ - Marketing Analytics & Attribution for E-commerce",
    description: "Unified marketing analytics platform for e-commerce brands. Track ROAS, attribution, and ad performance in one dashboard.",
  },
  twitter: {
    card: "summary_large_image",
    title: "OmniTrackIQ - Marketing Analytics & Attribution for E-commerce",
    description: "Unified marketing analytics platform for e-commerce brands.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const navLinks = [
  { href: "/product", label: "Product" },
  { href: "/solutions", label: "Solutions" },
  { href: "/platforms", label: "Integrations" },
  { href: "/pricing", label: "Pricing" },
  { href: "/resources", label: "Resources" },
];

const footerLinks = {
  product: [
    { href: "/product", label: "Features" },
    { href: "/platforms", label: "Integrations" },
    { href: "/pricing", label: "Pricing" },
    { href: "/security", label: "Security" },
  ],
  solutions: [
    { href: "/solutions", label: "For E-commerce Brands" },
    { href: "/solutions#agencies", label: "For Agencies" },
    { href: "/solutions#growth-teams", label: "For Growth Teams" },
  ],
  resources: [
    { href: "/resources/blog", label: "Blog" },
    { href: "/resources/case-studies", label: "Case Studies" },
    { href: "/resources", label: "Guides" },
    { href: "/contact", label: "Contact Sales" },
  ],
  company: [
    { href: "/about", label: "About Us" },
    { href: "/contact", label: "Contact" },
    { href: "/security", label: "Security" },
    { href: "/status", label: "Status" },
  ],
  legal: [
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/terms", label: "Terms of Service" },
  ],
};

function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-gh-border bg-gh-canvas-default/95 backdrop-blur-md dark:border-gh-border-dark dark:bg-gh-canvas-dark/95">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 text-xl font-semibold text-gh-text-primary dark:text-gh-text-primary-dark">
            <svg className="h-8 w-8 text-brand-500" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="32" height="32" rx="6" fill="currentColor" />
              <path d="M8 16L14 22L24 10" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            OmniTrackIQ
          </Link>
          <div className="hidden items-center gap-1 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="gh-nav-link rounded-md px-3 py-2 text-sm font-medium text-gh-text-secondary transition-colors hover:bg-gh-canvas-subtle hover:text-gh-text-primary dark:text-gh-text-secondary-dark dark:hover:bg-gh-canvas-subtle-dark dark:hover:text-gh-text-primary-dark"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden text-sm font-medium text-gh-text-secondary transition-colors hover:text-gh-text-primary dark:text-gh-text-secondary-dark dark:hover:text-gh-text-primary-dark sm:block"
          >
            Sign in
          </Link>
          <Link
            href="/contact"
            className="gh-btn-secondary hidden rounded-md border border-gh-border bg-gh-canvas-default px-3 py-1.5 text-sm font-medium text-gh-text-primary shadow-sm transition-colors hover:bg-gh-canvas-subtle dark:border-gh-border-dark dark:bg-gh-canvas-dark dark:text-gh-text-primary-dark dark:hover:bg-gh-canvas-subtle-dark sm:block"
          >
            Book a demo
          </Link>
          <Link
            href="/signup"
            className="gh-btn-primary rounded-md bg-brand-500 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-600"
          >
            Start free trial
          </Link>
        </div>
      </nav>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-gh-border bg-gh-canvas-subtle dark:border-gh-border-dark dark:bg-gh-canvas-subtle-dark">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-1">
            <Link href="/" className="text-xl font-semibold text-gh-text-primary dark:text-gh-text-primary-dark">
              OmniTrackIQ
            </Link>
            <p className="mt-4 text-sm text-gh-text-secondary dark:text-gh-text-secondary-dark">
              Unified marketing analytics for e-commerce brands. Track ad spend, revenue, and ROAS in one dashboard.
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gh-text-primary dark:text-gh-text-primary-dark">Product</h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-gh-text-secondary transition-colors hover:text-gh-link dark:text-gh-text-secondary-dark dark:hover:text-gh-link-dark">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gh-text-primary dark:text-gh-text-primary-dark">Company</h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-gh-text-secondary transition-colors hover:text-gh-link dark:text-gh-text-secondary-dark dark:hover:text-gh-link-dark">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gh-text-primary dark:text-gh-text-primary-dark">Resources</h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-gh-text-secondary transition-colors hover:text-gh-link dark:text-gh-text-secondary-dark dark:hover:text-gh-link-dark">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gh-text-primary dark:text-gh-text-primary-dark">Legal</h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-gh-text-secondary transition-colors hover:text-gh-link dark:text-gh-text-secondary-dark dark:hover:text-gh-link-dark">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-gh-border pt-8 dark:border-gh-border-dark md:flex-row">
          <p className="text-sm text-gh-text-tertiary dark:text-gh-text-tertiary-dark">
            © {new Date().getFullYear()} OmniTrackIQ. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="https://twitter.com" className="text-gh-text-tertiary transition-colors hover:text-gh-text-secondary dark:text-gh-text-tertiary-dark dark:hover:text-gh-text-secondary-dark">
              <span className="sr-only">Twitter</span>
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
              </svg>
            </Link>
            <Link href="https://linkedin.com" className="text-gh-text-tertiary transition-colors hover:text-gh-text-secondary dark:text-gh-text-tertiary-dark dark:hover:text-gh-text-secondary-dark">
              <span className="sr-only">LinkedIn</span>
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gh-canvas-default text-gh-text-primary dark:bg-gh-canvas-dark dark:text-gh-text-primary-dark">
      <Header />
      {children}
      <Footer />
    </div>
  );
}
