import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Section } from "@/components/marketing";

// Blog posts data - in production, this would come from a CMS or MDX
const blogPosts: Record<string, {
  title: string;
  excerpt: string;
  category: string;
  author: string;
  authorRole: string;
  date: string;
  readTime: string;
  content: string;
}> = {
  "understanding-multi-touch-attribution": {
    title: "Understanding Multi-Touch Attribution: A Complete Guide",
    excerpt: "Learn how multi-touch attribution helps you understand which marketing channels actually drive conversions.",
    category: "Attribution",
    author: "Sarah Chen",
    authorRole: "Head of Analytics",
    date: "December 5, 2025",
    readTime: "8 min read",
    content: `
## What is Multi-Touch Attribution?

Multi-touch attribution (MTA) is a method of measuring marketing effectiveness by assigning credit to multiple touchpoints along the customer journey. Unlike single-touch models that give all credit to the first or last interaction, MTA recognizes that customers typically interact with your brand multiple times before converting.

## Why Single-Touch Attribution Falls Short

Traditional attribution models like first-touch or last-touch only tell part of the story:

- **First-touch** gives all credit to the channel that initially introduced a customer to your brand
- **Last-touch** gives all credit to the final touchpoint before conversion

Both approaches ignore the complex reality of modern customer journeys, which often span multiple channels, devices, and time periods.

## Common Multi-Touch Attribution Models

### Linear Attribution
Distributes credit equally across all touchpoints. If a customer interacted with 4 channels before converting, each gets 25% credit.

**Best for:** Understanding the overall channel mix
**Limitation:** Doesn't account for touchpoint importance

### Time-Decay Attribution
Assigns more credit to touchpoints closer to conversion. The assumption is that more recent interactions had greater influence on the purchase decision.

**Best for:** Businesses with shorter sales cycles
**Limitation:** May undervalue awareness-building channels

### Position-Based (U-Shaped) Attribution
Gives 40% credit to the first and last touchpoints, with the remaining 20% distributed among middle interactions.

**Best for:** Balancing acquisition and conversion focus
**Limitation:** Arbitrary weight distribution

## Implementing MTA in OmniTrackIQ

OmniTrackIQ supports all major attribution models, allowing you to:

1. Compare models side-by-side
2. Customize lookback windows
3. View attribution at channel and campaign levels
4. Export data for further analysis

## Key Takeaways

- No single attribution model is "correct"—each tells a different story
- Use multiple models to get a complete picture
- Focus on trends over time, not absolute numbers
- Consider your business model when choosing a primary model
    `,
  },
  "roas-benchmarks-2025": {
    title: "E-commerce ROAS Benchmarks for 2025",
    excerpt: "Industry benchmarks for Return on Ad Spend across different verticals, ad platforms, and business models.",
    category: "Benchmarks",
    author: "Michael Torres",
    authorRole: "Growth Lead",
    date: "December 1, 2025",
    readTime: "12 min read",
    content: `
## Why Benchmarks Matter

ROAS benchmarks help you understand whether your advertising performance is competitive within your industry. While your own historical data should be your primary comparison, industry benchmarks provide valuable context.

## Overall ROAS Benchmarks by Platform

Based on aggregated data from e-commerce brands in 2025:

### Facebook/Meta Ads
- **Average ROAS:** 2.8x
- **Top quartile:** 4.5x+
- **Bottom quartile:** Below 1.5x

### Google Ads (All Campaigns)
- **Average ROAS:** 3.2x
- **Top quartile:** 5.0x+
- **Bottom quartile:** Below 2.0x

### TikTok Ads
- **Average ROAS:** 2.1x
- **Top quartile:** 3.5x+
- **Bottom quartile:** Below 1.2x

## Benchmarks by Vertical

### Fashion & Apparel
- Blended ROAS: 2.5-3.5x
- Customer Acquisition Cost: $25-45
- Average Order Value: $75-120

### Health & Beauty
- Blended ROAS: 3.0-4.5x
- Customer Acquisition Cost: $20-35
- Average Order Value: $50-85

### Home & Garden
- Blended ROAS: 2.8-4.0x
- Customer Acquisition Cost: $30-50
- Average Order Value: $100-175

## Important Caveats

**These benchmarks should be used as directional guidance only.** Your specific results will vary based on:

- Product margins and pricing
- Brand maturity and recognition
- Geographic targeting
- Seasonality
- Attribution methodology

*Note: All benchmark data in this article is illustrative and based on publicly available industry reports.*
    `,
  },
};

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = blogPosts[slug];
  
  if (!post) {
    return { title: "Post Not Found" };
  }

  return {
    title: post.title,
    description: post.excerpt,
  };
}

export function generateStaticParams() {
  return Object.keys(blogPosts).map((slug) => ({ slug }));
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = blogPosts[slug];

  if (!post) {
    notFound();
  }

  return (
    <main>
      <Section>
        <div className="mx-auto max-w-3xl">
          {/* Breadcrumb */}
          <nav className="mb-8 flex items-center gap-2 text-sm text-gray-500">
            <Link href="/resources" className="hover:text-gray-700">Resources</Link>
            <span>/</span>
            <Link href="/resources/blog" className="hover:text-gray-700">Blog</Link>
            <span>/</span>
            <span className="text-gray-900">{post.category}</span>
          </nav>

          {/* Header */}
          <header className="border-b border-gray-200 pb-8">
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
              {post.category}
            </span>
            <h1 className="mt-4 text-3xl font-semibold text-gray-900 md:text-4xl">
              {post.title}
            </h1>
            <p className="mt-4 text-lg text-gray-600">{post.excerpt}</p>
            <div className="mt-6 flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-semibold">
                {post.author.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <div className="font-medium text-gray-900">{post.author}</div>
                <div className="text-sm text-gray-500">{post.authorRole}</div>
              </div>
              <span className="text-gray-300">•</span>
              <span className="text-sm text-gray-500">{post.date}</span>
              <span className="text-gray-300">•</span>
              <span className="text-sm text-gray-500">{post.readTime}</span>
            </div>
          </header>

          {/* Content */}
          <article className="prose prose-gray mt-8 max-w-none prose-headings:font-semibold prose-h2:text-2xl prose-h3:text-xl prose-a:text-emerald-600 prose-strong:text-gray-900">
            {/* Simple markdown-style rendering */}
            {post.content.split('\n\n').map((paragraph, index) => {
              if (paragraph.startsWith('## ')) {
                return <h2 key={index} className="mt-8 mb-4 text-2xl font-semibold text-gray-900">{paragraph.replace('## ', '')}</h2>;
              }
              if (paragraph.startsWith('### ')) {
                return <h3 key={index} className="mt-6 mb-3 text-xl font-semibold text-gray-900">{paragraph.replace('### ', '')}</h3>;
              }
              if (paragraph.startsWith('- ')) {
                const items = paragraph.split('\n').filter(line => line.startsWith('- '));
                return (
                  <ul key={index} className="my-4 list-disc pl-6 space-y-2">
                    {items.map((item, i) => (
                      <li key={i} className="text-gray-600">{item.replace('- ', '')}</li>
                    ))}
                  </ul>
                );
              }
              if (paragraph.startsWith('**') && paragraph.includes(':**')) {
                return <p key={index} className="my-4 text-gray-600"><strong className="text-gray-900">{paragraph}</strong></p>;
              }
              if (paragraph.startsWith('*Note:')) {
                return <p key={index} className="my-4 text-sm italic text-gray-500">{paragraph}</p>;
              }
              if (paragraph.trim()) {
                return <p key={index} className="my-4 text-gray-600 leading-relaxed">{paragraph}</p>;
              }
              return null;
            })}
          </article>

          {/* CTA */}
          <div className="mt-12 rounded-2xl border border-gray-200 bg-gradient-to-r from-emerald-50 to-white p-8">
            <h3 className="text-xl font-semibold text-gray-900">Ready to see your attribution data?</h3>
            <p className="mt-2 text-gray-600">
              Start tracking multi-touch attribution across all your marketing channels with OmniTrackIQ.
            </p>
            <div className="mt-6 flex flex-wrap gap-4">
              <Link
                href="/signup"
                className="rounded-lg bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                Start free trial
              </Link>
              <Link
                href="/resources/blog"
                className="rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Read more articles
              </Link>
            </div>
          </div>
        </div>
      </Section>
    </main>
  );
}
