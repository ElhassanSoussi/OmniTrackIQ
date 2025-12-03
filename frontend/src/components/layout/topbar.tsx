"use client";

import Link from "next/link";

export default function Topbar() {
  return (
    <header className="flex items-center justify-between border-b border-slate-800 bg-slate-950/70 px-6 py-3">
      <div className="text-sm text-slate-400">Dashboard</div>
      <div className="flex items-center gap-4 text-sm">
        <Link href="/settings" className="text-slate-300 hover:text-white">
          Settings
        </Link>
        <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-emerald-200">Beta</span>
      </div>
    </header>
  );
}
