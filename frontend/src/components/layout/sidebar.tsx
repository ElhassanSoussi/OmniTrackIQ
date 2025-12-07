"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

const links = [
  { href: "/dashboard", label: "Overview", icon: "📊" },
  { href: "/campaigns", label: "Campaigns", icon: "📈" },
  { href: "/orders", label: "Orders", icon: "📦" },
  { href: "/integrations", label: "Integrations", icon: "🔗" },
  { href: "/billing", label: "Billing", icon: "💳" },
  { href: "/settings", label: "Settings", icon: "⚙️" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { logout, user } = useAuth();

  return (
    <aside className="flex min-h-screen w-64 flex-col border-r border-gray-200 bg-white">
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-gray-200 px-6">
        <Link href="/dashboard" className="text-xl font-bold text-gray-900">
          OmniTrackIQ
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {links.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                active
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <span className="text-base">{link.icon}</span>
              {link.label}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="border-t border-gray-200 p-4">
        {user && (
          <div className="mb-3 truncate text-sm text-gray-600">
            {user.email}
          </div>
        )}
        <button
          onClick={() => logout()}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50 hover:text-gray-900"
        >
          <span>🚪</span>
          Sign out
        </button>
      </div>
    </aside>
  );
}
