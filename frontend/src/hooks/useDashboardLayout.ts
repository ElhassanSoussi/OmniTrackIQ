"use client";

import { useState, useCallback, useEffect } from "react";

export type WidgetSize = "sm" | "md" | "lg" | "xl";

export interface WidgetConfig {
  id: string;
  type: "kpi" | "chart" | "table" | "funnel" | "custom";
  title: string;
  size: WidgetSize;
  order: number;
  visible: boolean;
  // Grid position for future grid-based layout
  gridX?: number;
  gridY?: number;
  gridW?: number;
  gridH?: number;
}

export interface DashboardLayout {
  id: string;
  name: string;
  widgets: WidgetConfig[];
  createdAt: string;
  updatedAt: string;
}

const DEFAULT_WIDGETS: WidgetConfig[] = [
  { id: "kpis", type: "kpi", title: "Key Metrics", size: "xl", order: 0, visible: true },
  { id: "revenue-chart", type: "chart", title: "Revenue & Spend", size: "lg", order: 1, visible: true },
  { id: "channel-breakdown", type: "table", title: "Channel Performance", size: "md", order: 2, visible: true },
  { id: "campaigns-table", type: "table", title: "Top Campaigns", size: "lg", order: 3, visible: true },
  { id: "orders-table", type: "table", title: "Recent Orders", size: "lg", order: 4, visible: true },
];

const STORAGE_KEY = "omnitrackiq_dashboard_layout";

/**
 * Hook to manage dashboard widget layout with persistence
 */
export function useDashboardLayout() {
  const [widgets, setWidgets] = useState<WidgetConfig[]>(DEFAULT_WIDGETS);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load layout from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Merge with defaults to handle new widgets
        const mergedWidgets = DEFAULT_WIDGETS.map((defaultWidget) => {
          const savedWidget = parsed.widgets?.find((w: WidgetConfig) => w.id === defaultWidget.id);
          return savedWidget ? { ...defaultWidget, ...savedWidget } : defaultWidget;
        });
        setWidgets(mergedWidgets);
      }
    } catch (e) {
      console.error("Failed to load dashboard layout:", e);
    }
    setIsLoaded(true);
  }, []);

  // Save layout to localStorage when widgets change
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ widgets, updatedAt: new Date().toISOString() }));
      } catch (e) {
        console.error("Failed to save dashboard layout:", e);
      }
    }
  }, [widgets, isLoaded]);

  // Move widget to new position
  const moveWidget = useCallback((fromIndex: number, toIndex: number) => {
    setWidgets((prev) => {
      const newWidgets = [...prev];
      const [moved] = newWidgets.splice(fromIndex, 1);
      newWidgets.splice(toIndex, 0, moved);
      // Update order values
      return newWidgets.map((w, i) => ({ ...w, order: i }));
    });
  }, []);

  // Toggle widget visibility
  const toggleWidget = useCallback((widgetId: string) => {
    setWidgets((prev) =>
      prev.map((w) => (w.id === widgetId ? { ...w, visible: !w.visible } : w))
    );
  }, []);

  // Change widget size
  const resizeWidget = useCallback((widgetId: string, size: WidgetSize) => {
    setWidgets((prev) =>
      prev.map((w) => (w.id === widgetId ? { ...w, size } : w))
    );
  }, []);

  // Reset to default layout
  const resetLayout = useCallback(() => {
    setWidgets(DEFAULT_WIDGETS);
  }, []);

  // Get visible widgets sorted by order
  const visibleWidgets = widgets
    .filter((w) => w.visible)
    .sort((a, b) => a.order - b.order);

  return {
    widgets,
    visibleWidgets,
    isEditing,
    setIsEditing,
    moveWidget,
    toggleWidget,
    resizeWidget,
    resetLayout,
    isLoaded,
  };
}

/**
 * Get CSS class for widget size
 */
export function getWidgetSizeClass(size: WidgetSize): string {
  switch (size) {
    case "sm":
      return "col-span-1";
    case "md":
      return "col-span-1 lg:col-span-1";
    case "lg":
      return "col-span-1 lg:col-span-2";
    case "xl":
      return "col-span-1 lg:col-span-2 xl:col-span-full";
    default:
      return "col-span-1";
  }
}
