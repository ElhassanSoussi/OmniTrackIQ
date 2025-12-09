"use client";

import Sidebar from "@/components/layout/sidebar";
import Topbar from "@/components/layout/topbar";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { KeyboardShortcutsProvider } from "@/contexts/KeyboardShortcutsContext";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

function DashboardContent({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
      <Sidebar />
      <div className="flex flex-1 flex-col min-w-0">
        <Topbar />
        <main className="flex-1 p-3 sm:p-4 lg:p-6 overflow-x-hidden">{children}</main>
      </div>
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
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent"></div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
        <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white px-6 py-6 text-center shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="text-lg font-semibold text-gray-900 dark:text-white">Authentication error</div>
          <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">{error}</div>
          <div className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="/login"
              className="w-full sm:w-auto inline-flex justify-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              Go to login
            </a>
            <button
              onClick={() => refresh()}
              className="w-full sm:w-auto inline-flex justify-center rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
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
        <DashboardContent>{children}</DashboardContent>
      </KeyboardShortcutsProvider>
    </SidebarProvider>
  );
}
