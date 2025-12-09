import type { Metadata } from "next";
import Link from "next/link";
import { Section, SectionHeading } from "@/components/marketing";

export const metadata: Metadata = {
  title: "Blog - Marketing Analytics Insights",
  description: "Learn about marketing analytics, attribution, ROAS optimization, and e-commerce growth strategies from the OmniTrackIQ team.",
};

// Blog posts data - in a real app, this would come from a CMS or MDX files
const blogPosts = [
  {
    slug: "understanding-multi-touch-attribution",
    title: "Understanding Multi-Touch Attribution: A Complete Guide",
    excerpt: "Learn how multi-touch attribution helps you understand which marketing channels actually drive conversions, and how to choose the right model for your business.",
    category: "Attribution",
    author: "Sarah Chen",
    date: "December 5, 2025",
    readTime: "8 min read",
    featured: true,
  },
  {
    slug: "roas-benchmarks-2025",
    title: "E-commerce ROAS Benchmarks for 2025",
    excerpt: "Industry benchmarks for Return on Ad Spend across different verticals, ad platforms, and business models. See how your performance compares.",
    category: "Benchmarks",
    author: "Michael Torres",
    date: "December 1, 2025",
    readTime: "12 min read",
    featured: true,
  },
  {
    slug: "ios-14-attribution-strategies",
    title: "Post-iOS 14 Attribution Strategies That Actually Work",
    excerpt: "Privacy changes have made tracking harder. Here are proven strategies to maintain visibility into your marketing performance.",
    category: "Attribution",
    author: "Sarah Chen",
    date: "November 28, 2025",
    readTime: "10 min read",
    featured: false,
  },
  {
    slug: "reducing-customer-acquisition-cost",
    title: "7 Strategies to Reduce Customer Acquisition Cost",
    excerpt: "Practical tactics to lower your CAC while maintaining growth. From audience optimization to creative testing frameworks.",
    category: "Growth",
    author: "David Kim",
    date: "November 22, 2025",
    readTime: "9 min read",
    featured: false,
  },
  {
    slug: "shopify-marketing-analytics-setup",
    title: "Setting Up Marketing Analytics for Your Shopify Store",
    excerpt: "A step-by-step guide to implementing proper tracking, attribution, and analytics for your Shopify e-commerce business.",
    category: "Tutorials",
    author: "Emily Rodriguez",
    date: "November 18, 2025",
    readTime: "7 min read",
    featured: false,
  },
  {
    slug: "facebook-ads-scaling-framework",
    title: "The Facebook Ads Scaling Framework We Use",
    excerpt: "Our proven framework for scaling Facebook ad campaigns profitably. Includes budget allocation, testing strategies, and optimization tactics.",
    category: "Paid Media",
    author: "Michael Torres",
    date: "November 12, 2025",
    readTime: "11 min read",
    featured: false,
  },
];

const categories = ["All", "Attribution", "Benchmarks", "Growth", "Paid Media", "Tutorials"];

export default function BlogPage() {
  const featuredPosts = blogPosts.filter((post) => post.featured);
  const regularPosts = blogPosts.filter((post) => !post.featured);

  return (
    <main>
      <Section>
        <SectionHeading
          eyebrow="Blog"
          title="Marketing analytics insights"
          subtitle="Learn about attribution, ROAS optimization, and e-commerce growth strategies from our team."
          align="center"
        />
      </Section>

      {/* Featured Posts */}
      <Section bordered>
        <h2 className="text-xl font-semibold text-gray-900">Featured Articles</h2>
        <div className="mt-6 grid gap-8 lg:grid-cols-2">
          {featuredPosts.map((post) => (
            <Link
              key={post.slug}
              href={`/resources/blog/${post.slug}`}
              className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md"
            >
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                  {post.category}
                </span>
                <span className="text-xs text-gray-500">{post.readTime}</span>
              </div>
              <h3 className="mt-4 text-xl font-semibold text-gray-900 group-hover:text-emerald-600">
                {post.title}
              </h3>
              <p className="mt-2 text-gray-600">{post.excerpt}</p>
              <div className="mt-4 flex items-center gap-3 text-sm text-gray-500">
                <span>{post.author}</span>
                <span>•</span>
                <span>{post.date}</span>
              </div>
            </Link>
          ))}
        </div>
      </Section>

      {/* Category Filter */}
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

        {/* All Posts */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {regularPosts.map((post) => (
            <Link
              key={post.slug}
              href={`/resources/blog/${post.slug}`}
              className="group rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md"
            >
              <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                {post.category}
              </span>
              <h3 className="mt-3 font-semibold text-gray-900 group-hover:text-emerald-600">
                {post.title}
              </h3>
              <p className="mt-2 text-sm text-gray-600 line-clamp-2">{post.excerpt}</p>
              <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                <span>{post.author}</span>
                <span>{post.readTime}</span>
              </div>
            </Link>
          ))}
        </div>
      </Section>

      {/* Newsletter CTA */}
      <Section>
        <div className="mx-auto max-w-2xl rounded-2xl border border-gray-200 bg-gradient-to-r from-emerald-50 to-white p-8 text-center shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900">Subscribe to our newsletter</h2>
          <p className="mt-2 text-gray-600">
            Get the latest marketing analytics insights delivered to your inbox.
          </p>
          <form className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <input
              type="email"
              placeholder="Enter your email"
              className="rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 sm:w-64"
            />
            <button
              type="submit"
              className="rounded-lg bg-emerald-600 px-6 py-3 font-semibold text-white transition hover:bg-emerald-700"
            >
              Subscribe
            </button>
          </form>
          <p className="mt-4 text-xs text-gray-500">No spam. Unsubscribe anytime.</p>
        </div>
      </Section>
    </main>
  );
}
