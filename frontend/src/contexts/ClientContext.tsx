"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useSwitchClient, ClientBranding } from "@/hooks/useAgency";

interface CurrentClient {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  branding: ClientBranding | null;
}

interface ClientContextType {
  // Current client state
  currentClient: CurrentClient | null;
  isAgencyView: boolean; // true when viewing aggregate agency data
  
  // Actions
  switchClient: (clientId: string) => Promise<void>;
  clearClient: () => void;
  setAgencyView: () => void;
  
  // Loading state
  isSwitching: boolean;
}

const ClientContext = createContext<ClientContextType | undefined>(undefined);

const STORAGE_KEY = "omnitrackiq_current_client";

export function ClientProvider({ children }: { children: React.ReactNode }) {
  const [currentClient, setCurrentClient] = useState<CurrentClient | null>(null);
  const [isAgencyView, setIsAgencyView] = useState(true);
  
  const switchClientMutation = useSwitchClient();

  // Load persisted client on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setCurrentClient(parsed);
          setIsAgencyView(false);
        } catch {
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    }
  }, []);

  // Persist client changes to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (currentClient) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(currentClient));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, [currentClient]);

  const switchClient = useCallback(async (clientId: string) => {
    try {
      const result = await switchClientMutation.mutateAsync(clientId);
      if (result && result.success && result.client) {
        setCurrentClient(result.client);
        setIsAgencyView(false);
      }
    } catch (error) {
      console.error("Failed to switch client:", error);
      throw error;
    }
  }, [switchClientMutation]);

  const clearClient = useCallback(() => {
    setCurrentClient(null);
    setIsAgencyView(true);
  }, []);

  const setAgencyView = useCallback(() => {
    setCurrentClient(null);
    setIsAgencyView(true);
  }, []);

  return (
    <ClientContext.Provider
      value={{
        currentClient,
        isAgencyView,
        switchClient,
        clearClient,
        setAgencyView,
        isSwitching: switchClientMutation.isPending,
      }}
    >
      {children}
    </ClientContext.Provider>
  );
}

export function useClientContext() {
  const context = useContext(ClientContext);
  if (context === undefined) {
    throw new Error("useClientContext must be used within a ClientProvider");
  }
  return context;
}

/**
 * Hook to check if the user is in agency mode with a specific client selected
 */
export function useCurrentClient() {
  const { currentClient, isAgencyView } = useClientContext();
  return {
    client: currentClient,
    isAgencyView,
    hasClient: currentClient !== null,
  };
}
