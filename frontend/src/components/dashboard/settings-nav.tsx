"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const items = [
    { name: "Profile", href: "/settings/profile" },
    { name: "Organization", href: "/settings/organization" },
    { name: "Team", href: "/settings/team" },
    { name: "Notifications", href: "/settings/notifications" },
    { name: "Billing", href: "/settings/billing" },
];

export function SettingsNav() {
    const pathname = usePathname();

    return (
        <div className="flex gap-2 border-b border-gh-border dark:border-gh-border-dark overflow-x-auto mb-6">
            {items.map((item) => {
                const isActive = pathname === item.href;
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors",
                            isActive
                                ? "border-brand-500 text-brand-500 dark:text-brand-400"
                                : "border-transparent text-gh-text-secondary hover:text-gh-text-primary dark:text-gh-text-secondary-dark dark:hover:text-gh-text-primary-dark"
                        )}
                    >
                        {item.name}
                    </Link>
                );
            })}
        </div>
    );
}
