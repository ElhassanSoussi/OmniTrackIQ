"use client";

import Sidebar from "@/components/layout/sidebar";
import Topbar from "@/components/layout/topbar";
import { Chatbot } from "@/components/chat";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { KeyboardShortcutsProvider } from "@/contexts/KeyboardShortcutsContext";
import { ClientProvider } from "@/contexts/ClientContext";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

function DashboardContent({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
      <Sidebar />
      <div className="flex flex-1 flex-col min-w-0">
        <Topbar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">{children}</main>
      </div>
      <Chatbot />
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, loading, error, refresh } = useAuth();

  if (!loading && !user && !error) {
    router.replace("/login");
    return null;
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-primary-500/20 blur-xl" />
            <Loader2 className="h-10 w-10 animate-spin text-primary-500 relative" />
          </div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
        <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white px-8 py-8 text-center shadow-lg dark:border-slate-700 dark:bg-slate-800">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-danger-100 dark:bg-danger-900/30">
            <svg className="h-6 w-6 text-danger-600 dark:text-danger-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Authentication Error</h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{error}</p>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="/login"
              className="w-full sm:w-auto inline-flex justify-center rounded-lg bg-primary-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary-600 hover:shadow-glow-primary"
            >
              Go to login
            </a>
            <button
              onClick={() => refresh()}
              className="w-full sm:w-auto inline-flex justify-center rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <KeyboardShortcutsProvider>
        <ClientProvider>
          <DashboardContent>{children}</DashboardContent>
        </ClientProvider>
      </KeyboardShortcutsProvider>
    </SidebarProvider>
  );
}

