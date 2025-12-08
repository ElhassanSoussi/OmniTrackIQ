"use client";

import { useState, useRef, useEffect } from "react";

interface MetricTooltipProps {
  metric: string;
  children: React.ReactNode;
}

const METRIC_INFO: Record<string, { title: string; description: string; formula?: string }> = {
  revenue: {
    title: "Revenue",
    description: "Total revenue from all orders attributed to your marketing channels. This is the blended revenue across all platforms.",
  },
  spend: {
    title: "Ad Spend",
    description: "Total advertising spend across all connected ad platforms including Facebook, Google, TikTok, and others.",
  },
  roas: {
    title: "Return on Ad Spend",
    description: "A measure of marketing efficiency. Higher ROAS means more revenue per dollar spent on ads.",
    formula: "ROAS = Revenue ÷ Ad Spend",
  },
  profit: {
    title: "Profit",
    description: "Net profit after subtracting ad spend from revenue. Does not include COGS or other business costs.",
    formula: "Profit = Revenue - Ad Spend",
  },
  ctr: {
    title: "Click-Through Rate",
    description: "The percentage of people who click on your ad after seeing it. Higher CTR indicates more engaging ads.",
    formula: "CTR = (Clicks ÷ Impressions) × 100",
  },
  cpc: {
    title: "Cost Per Click",
    description: "The average amount you pay for each click on your ads. Lower CPC means more efficient traffic acquisition.",
    formula: "CPC = Ad Spend ÷ Clicks",
  },
  cpa: {
    title: "Cost Per Acquisition",
    description: "The average cost to acquire a customer or conversion. Lower CPA indicates more efficient marketing.",
    formula: "CPA = Ad Spend ÷ Conversions",
  },
  aov: {
    title: "Average Order Value",
    description: "The average amount spent per order. Higher AOV can offset higher acquisition costs.",
    formula: "AOV = Revenue ÷ Number of Orders",
  },
  conversions: {
    title: "Conversions",
    description: "The number of desired actions taken, typically purchases. This is reported by your ad platforms.",
  },
  clicks: {
    title: "Clicks",
    description: "Total number of clicks on your ads across all campaigns and platforms.",
  },
  impressions: {
    title: "Impressions",
    description: "The number of times your ads were displayed to users. One user may see multiple impressions.",
  },
  orders: {
    title: "Orders",
    description: "Total number of orders placed and synced from your e-commerce platform.",
  },
  cvr: {
    title: "Conversion Rate",
    description: "The percentage of visitors who complete a purchase after clicking your ad.",
    formula: "CVR = (Conversions ÷ Clicks) × 100",
  },
  cac: {
    title: "Customer Acquisition Cost",
    description: "Similar to CPA, this represents the cost to acquire a new customer.",
    formula: "CAC = Total Marketing Spend ÷ New Customers",
  },
  ltv: {
    title: "Lifetime Value",
    description: "The predicted total revenue a customer will generate over their relationship with your business.",
  },
};

export function MetricTooltip({ metric, children }: MetricTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<"top" | "bottom">("top");
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  
  const info = METRIC_INFO[metric.toLowerCase()];
  
  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const spaceAbove = rect.top;
      const spaceBelow = window.innerHeight - rect.bottom;
      
      // Position tooltip below if not enough space above
      setPosition(spaceAbove < 200 ? "bottom" : "top");
    }
  }, [isOpen]);
  
  if (!info) {
    return <>{children}</>;
  }
  
  return (
    <div className="relative inline-flex items-center gap-1" ref={triggerRef}>
      {children}
      <button
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setIsOpen(false)}
        className="inline-flex h-4 w-4 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1"
        aria-label={`Learn more about ${info.title}`}
      >
        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>
      
      {isOpen && (
        <div
          ref={tooltipRef}
          className={`absolute left-1/2 z-50 w-64 -translate-x-1/2 rounded-lg bg-gray-900 p-3 text-sm text-white shadow-lg ${
            position === "top" ? "bottom-full mb-2" : "top-full mt-2"
          }`}
          role="tooltip"
        >
          {/* Arrow */}
          <div
            className={`absolute left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-gray-900 ${
              position === "top" ? "-bottom-1" : "-top-1"
            }`}
          />
          
          <p className="font-semibold text-emerald-400">{info.title}</p>
          <p className="mt-1 text-gray-300">{info.description}</p>
          {info.formula && (
            <p className="mt-2 rounded bg-gray-800 px-2 py-1 font-mono text-xs text-gray-400">
              {info.formula}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// Export metric info for use elsewhere
export { METRIC_INFO };
