"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/campaigns", label: "Campaigns" },
  { href: "/dashboard/orders", label: "Orders" },
  { href: "/dashboard/integrations", label: "Integrations" },
  { href: "/dashboard/billing", label: "Billing" },
  { href: "/dashboard/settings", label: "Settings" },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="min-h-screen w-60 border-r border-slate-800 bg-slate-950 px-4 py-6 text-slate-200">
      <div className="mb-8 text-xl font-bold text-white">OmniTrackIQ</div>
      <nav className="space-y-2">
        {links.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`block rounded-md px-3 py-2 text-sm font-medium transition ${
                active ? "bg-emerald-500/20 text-emerald-200" : "hover:bg-slate-800 hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
