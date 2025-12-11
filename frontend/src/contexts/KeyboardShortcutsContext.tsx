"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useKeyboardShortcuts, Shortcut, DEFAULT_SHORTCUTS, formatShortcutKey } from "@/hooks/useKeyboardShortcuts";

interface KeyboardShortcutsContextType {
  showHelpModal: boolean;
  openHelpModal: () => void;
  closeHelpModal: () => void;
  toggleHelpModal: () => void;
  showCommandPalette: boolean;
  openCommandPalette: () => void;
  closeCommandPalette: () => void;
}

const KeyboardShortcutsContext = createContext<KeyboardShortcutsContextType | undefined>(undefined);

export function KeyboardShortcutsProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);

  const openHelpModal = useCallback(() => setShowHelpModal(true), []);
  const closeHelpModal = useCallback(() => setShowHelpModal(false), []);
  const toggleHelpModal = useCallback(() => setShowHelpModal((prev) => !prev), []);

  const openCommandPalette = useCallback(() => setShowCommandPalette(true), []);
  const closeCommandPalette = useCallback(() => setShowCommandPalette(false), []);

  // Navigation shortcuts
  const shortcuts: Shortcut[] = [
    // Go to pages (g + key)
    { key: "g d", description: "Go to Dashboard", action: () => router.push("/dashboard"), category: "navigation" },
    { key: "g c", description: "Go to Campaigns", action: () => router.push("/campaigns"), category: "navigation" },
    { key: "g o", description: "Go to Orders", action: () => router.push("/orders"), category: "navigation" },
    { key: "g a", description: "Go to Attribution", action: () => router.push("/analytics/attribution"), category: "navigation" },
    { key: "g h", description: "Go to Cohorts", action: () => router.push("/analytics/cohorts"), category: "navigation" },
    { key: "g f", description: "Go to Funnel", action: () => router.push("/analytics/funnel"), category: "navigation" },
    { key: "g n", description: "Go to Anomalies", action: () => router.push("/analytics/anomalies"), category: "navigation" },
    { key: "g r", description: "Go to Reports", action: () => router.push("/analytics/reports"), category: "navigation" },
    { key: "g i", description: "Go to Integrations", action: () => router.push("/integrations"), category: "navigation" },
    { key: "g b", description: "Go to Billing", action: () => router.push("/billing"), category: "navigation" },
    { key: "g s", description: "Go to Settings", action: () => router.push("/settings"), category: "navigation" },

    // Global shortcuts
    { key: "?", description: "Show keyboard shortcuts", action: toggleHelpModal, category: "global" },
    { key: "mod+k", description: "Open command palette", action: openCommandPalette, category: "global" },
    { key: "Escape", description: "Close modal", action: () => {
      closeHelpModal();
      closeCommandPalette();
    }, category: "global" },

    // Theme toggle
    { key: "t", description: "Toggle dark mode", action: () => {
      const isDark = document.documentElement.classList.contains("dark");
      if (isDark) {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("theme", "light");
      } else {
        document.documentElement.classList.add("dark");
        localStorage.setItem("theme", "dark");
      }
    }, category: "actions" },
  ];

  useKeyboardShortcuts(shortcuts);

  return (
    <KeyboardShortcutsContext.Provider
      value={{
        showHelpModal,
        openHelpModal,
        closeHelpModal,
        toggleHelpModal,
        showCommandPalette,
        openCommandPalette,
        closeCommandPalette,
      }}
    >
      {children}
      {showHelpModal && <KeyboardShortcutsHelpModal onClose={closeHelpModal} />}
      {showCommandPalette && <CommandPalette onClose={closeCommandPalette} />}
    </KeyboardShortcutsContext.Provider>
  );
}

export function useKeyboardShortcutsContext() {
  const context = useContext(KeyboardShortcutsContext);
  if (context === undefined) {
    throw new Error("useKeyboardShortcutsContext must be used within a KeyboardShortcutsProvider");
  }
  return context;
}

// Keyboard shortcuts help modal
function KeyboardShortcutsHelpModal({ onClose }: { onClose: () => void }) {
  // Close on click outside
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={handleBackdropClick}
    >
      <div className="w-full max-w-2xl max-h-[80vh] overflow-auto rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-900">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Keyboard Shortcuts</h2>
          <button
            onClick={onClose}
            aria-label="Close keyboard shortcuts"
            title="Close"
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {DEFAULT_SHORTCUTS.map((group) => (
            <div key={group.category}>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">{group.category}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {group.shortcuts.map((shortcut) => (
                  <div
                    key={shortcut.key}
                    className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-800"
                  >
                    <span className="text-sm text-gray-600 dark:text-gray-300">{shortcut.description}</span>
                    <kbd className="ml-3 inline-flex items-center gap-1 rounded-md bg-gray-200 px-2 py-1 font-mono text-xs text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                      {formatShortcutKey(shortcut.key)}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Press <kbd className="rounded bg-gray-200 px-1.5 py-0.5 font-mono text-[10px] dark:bg-gray-700">?</kbd> anytime to toggle this help
          </p>
        </div>
      </div>
    </div>
  );
}

// Command palette component
function CommandPalette({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const commands = [
    { id: "dashboard", label: "Go to Dashboard", icon: "📊", action: () => router.push("/dashboard") },
    { id: "campaigns", label: "Go to Campaigns", icon: "📢", action: () => router.push("/campaigns") },
    { id: "orders", label: "Go to Orders", icon: "🛒", action: () => router.push("/orders") },
    { id: "attribution", label: "Go to Attribution", icon: "📈", action: () => router.push("/analytics/attribution") },
    { id: "cohorts", label: "Go to Cohorts", icon: "👥", action: () => router.push("/analytics/cohorts") },
    { id: "funnel", label: "Go to Funnel", icon: "🔽", action: () => router.push("/analytics/funnel") },
    { id: "anomalies", label: "Go to Anomalies", icon: "⚠️", action: () => router.push("/analytics/anomalies") },
    { id: "reports", label: "Go to Reports", icon: "📋", action: () => router.push("/analytics/reports") },
    { id: "integrations", label: "Go to Integrations", icon: "🔗", action: () => router.push("/integrations") },
    { id: "billing", label: "Go to Billing", icon: "💳", action: () => router.push("/billing") },
    { id: "settings", label: "Go to Settings", icon: "⚙️", action: () => router.push("/settings") },
    { id: "theme", label: "Toggle Dark Mode", icon: "🌙", action: () => {
      const isDark = document.documentElement.classList.contains("dark");
      if (isDark) {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("theme", "light");
      } else {
        document.documentElement.classList.add("dark");
        localStorage.setItem("theme", "dark");
      }
    }},
    { id: "shortcuts", label: "Show Keyboard Shortcuts", icon: "⌨️", action: () => {
      onClose();
      // Small delay to allow palette to close
      setTimeout(() => document.dispatchEvent(new KeyboardEvent("keydown", { key: "?" })), 100);
    }},
  ];

  const filteredCommands = query
    ? commands.filter((cmd) => cmd.label.toLowerCase().includes(query.toLowerCase()))
    : commands;

  const handleSelect = useCallback((command: typeof commands[0]) => {
    command.action();
    onClose();
  }, [onClose]);

  // Close on click outside
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  // Handle keyboard navigation
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((i) => Math.min(i + 1, filteredCommands.length - 1));
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((i) => Math.max(i - 1, 0));
          break;
        case "Enter":
          e.preventDefault();
          if (filteredCommands[selectedIndex]) {
            handleSelect(filteredCommands[selectedIndex]);
          }
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [filteredCommands, selectedIndex, handleSelect]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-black/50 backdrop-blur-sm p-4"
      onClick={handleBackdropClick}
    >
      <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900 overflow-hidden">
        {/* Search input */}
        <div className="flex items-center gap-3 border-b border-gray-200 px-4 dark:border-gray-700">
          <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search..."
            className="flex-1 bg-transparent py-4 text-sm text-gray-900 placeholder-gray-400 outline-none dark:text-white"
            autoFocus
          />
          <kbd className="rounded bg-gray-100 px-2 py-1 font-mono text-xs text-gray-500 dark:bg-gray-800 dark:text-gray-400">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto py-2">
          {filteredCommands.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
              No commands found
            </div>
          ) : (
            filteredCommands.map((command, index) => (
              <button
                key={command.id}
                onClick={() => handleSelect(command)}
                className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition ${
                  index === selectedIndex
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                    : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                }`}
              >
                <span className="text-lg">{command.icon}</span>
                <span className="text-sm font-medium">{command.label}</span>
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-gray-200 px-4 py-2 text-xs text-gray-500 dark:border-gray-700 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
          </div>
          <span>⌘K to open</span>
        </div>
      </div>
    </div>
  );
}
