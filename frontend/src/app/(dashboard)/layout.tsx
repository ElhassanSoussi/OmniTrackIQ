"use client";

import Sidebar from "@/components/layout/sidebar";
import Topbar from "@/components/layout/topbar";
import { Chatbot } from "@/components/chat";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { KeyboardShortcutsProvider } from "@/contexts/KeyboardShortcutsContext";
import { ClientProvider } from "@/contexts/ClientContext";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

function DashboardContent({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gh-canvas-subtle dark:bg-gh-canvas-dark transition-colors duration-200">
      <Sidebar />
      <div className="flex flex-1 flex-col min-w-0">
        <Topbar />
        <main className="flex-1 p-3 sm:p-4 lg:p-6 overflow-x-hidden">{children}</main>
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
      <div className="flex min-h-screen items-center justify-center bg-gh-canvas-subtle dark:bg-gh-canvas-dark">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
          <p className="text-sm text-gh-text-secondary dark:text-gh-text-secondary-dark">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gh-canvas-subtle dark:bg-gh-canvas-dark p-4">
        <div className="w-full max-w-md rounded-md border border-gh-border bg-gh-canvas-default px-6 py-6 text-center dark:border-gh-border-dark dark:bg-gh-canvas-dark">
          <div className="text-lg font-semibold text-gh-text-primary dark:text-gh-text-primary-dark">Authentication error</div>
          <div className="mt-2 text-sm text-gh-text-secondary dark:text-gh-text-secondary-dark">{error}</div>
          <div className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="/login"
              className="w-full sm:w-auto inline-flex justify-center rounded-md bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-600"
            >
              Go to login
            </a>
            <button
              onClick={() => refresh()}
              className="w-full sm:w-auto inline-flex justify-center rounded-md border border-gh-border px-4 py-2 text-sm font-semibold text-gh-text-primary transition hover:bg-gh-canvas-subtle dark:border-gh-border-dark dark:text-gh-text-primary-dark dark:hover:bg-gh-canvas-subtle-dark"
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
