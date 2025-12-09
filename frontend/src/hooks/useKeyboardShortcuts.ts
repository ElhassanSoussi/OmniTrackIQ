"use client";

import { useEffect, useCallback, useRef } from "react";

export type ShortcutKey = 
  | "g d" | "g c" | "g o" | "g a" | "g h" | "g f" | "g n" | "g r" | "g i" | "g b" | "g s"  // Navigation (go to)
  | "?" | "/" | "Escape"  // Global shortcuts
  | "t" | "n" | "e" | "d"  // Actions
  | "j" | "k" | "Enter"   // List navigation
  | "mod+k" | "mod+/" | "mod+s" | "mod+e"; // Command shortcuts

export interface Shortcut {
  key: ShortcutKey;
  description: string;
  action: () => void;
  category?: "navigation" | "actions" | "global";
  enabled?: boolean;
}

export interface ShortcutGroup {
  category: string;
  shortcuts: { key: string; description: string }[];
}

// Default shortcuts definitions (descriptions only, for help modal)
export const DEFAULT_SHORTCUTS: ShortcutGroup[] = [
  {
    category: "Navigation",
    shortcuts: [
      { key: "g then d", description: "Go to Dashboard" },
      { key: "g then c", description: "Go to Campaigns" },
      { key: "g then o", description: "Go to Orders" },
      { key: "g then a", description: "Go to Attribution" },
      { key: "g then h", description: "Go to Cohorts" },
      { key: "g then f", description: "Go to Funnel" },
      { key: "g then n", description: "Go to Anomalies" },
      { key: "g then r", description: "Go to Reports" },
      { key: "g then i", description: "Go to Integrations" },
      { key: "g then b", description: "Go to Billing" },
      { key: "g then s", description: "Go to Settings" },
    ],
  },
  {
    category: "Global",
    shortcuts: [
      { key: "?", description: "Show keyboard shortcuts" },
      { key: "/", description: "Focus search" },
      { key: "Esc", description: "Close modal/sidebar" },
      { key: "⌘ K", description: "Open command palette" },
    ],
  },
  {
    category: "Actions",
    shortcuts: [
      { key: "t", description: "Toggle dark mode" },
      { key: "n", description: "Create new report" },
      { key: "e", description: "Export data" },
    ],
  },
];

interface KeySequence {
  keys: string[];
  timestamp: number;
}

/**
 * Hook for handling keyboard shortcuts with support for key sequences (e.g., "g d")
 */
export function useKeyboardShortcuts(shortcuts: Shortcut[], enabled = true) {
  const sequenceRef = useRef<KeySequence>({ keys: [], timestamp: 0 });
  const SEQUENCE_TIMEOUT = 1000; // 1 second to complete a sequence

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Don't trigger shortcuts when typing in inputs
      const target = event.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable
      ) {
        // Allow Escape to work in inputs
        if (event.key !== "Escape") return;
      }

      const now = Date.now();
      const key = event.key.toLowerCase();
      const isMod = event.metaKey || event.ctrlKey;

      // Reset sequence if timeout expired
      if (now - sequenceRef.current.timestamp > SEQUENCE_TIMEOUT) {
        sequenceRef.current = { keys: [], timestamp: now };
      }

      // Build the current key representation
      let currentKey = key;
      if (isMod && key !== "meta" && key !== "control") {
        currentKey = `mod+${key}`;
      }

      // Add to sequence
      sequenceRef.current.keys.push(currentKey);
      sequenceRef.current.timestamp = now;

      // Check for matching shortcuts
      const sequence = sequenceRef.current.keys.join(" ");

      for (const shortcut of shortcuts) {
        if (shortcut.enabled === false) continue;

        const shortcutKey = shortcut.key.toLowerCase();

        // Check exact match
        if (sequence === shortcutKey || currentKey === shortcutKey) {
          event.preventDefault();
          shortcut.action();
          sequenceRef.current = { keys: [], timestamp: 0 };
          return;
        }

        // Check if current sequence is a prefix of any shortcut
        if (shortcutKey.startsWith(sequence + " ")) {
          // Wait for more keys
          return;
        }
      }

      // If no prefix match, reset sequence (but keep current key for potential single-key shortcuts)
      if (sequenceRef.current.keys.length > 1) {
        sequenceRef.current = { keys: [currentKey], timestamp: now };
      }
    },
    [shortcuts, enabled]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}

/**
 * Format a shortcut key for display
 */
export function formatShortcutKey(key: string): string {
  const isMac = typeof navigator !== "undefined" && navigator.platform.toUpperCase().indexOf("MAC") >= 0;

  return key
    .replace("mod+", isMac ? "⌘" : "Ctrl+")
    .replace("then", "→")
    .replace("Escape", "Esc")
    .toUpperCase();
}
