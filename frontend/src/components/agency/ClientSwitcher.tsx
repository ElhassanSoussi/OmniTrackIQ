"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useClientAccounts, ClientAccount } from "@/hooks/useAgency";
import { useClientContext } from "@/contexts/ClientContext";
import { useBilling } from "@/hooks/useBilling";

export default function ClientSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { billing } = useBilling();
  const { currentClient, isAgencyView, switchClient, setAgencyView, isSwitching } = useClientContext();
  const { data: clientsData, isLoading } = useClientAccounts("active", search || undefined);

  // Only show for agency plan
  const isAgencyPlan = billing?.plan === "agency" || billing?.plan === "enterprise";

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close on escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  if (!isAgencyPlan) {
    return null;
  }

  const clients = clientsData?.clients || [];

  const handleClientSelect = async (client: ClientAccount) => {
    try {
      await switchClient(client.id);
      setIsOpen(false);
      setSearch("");
    } catch (error) {
      console.error("Failed to switch client:", error);
    }
  };

  const handleAgencyView = () => {
    setAgencyView();
    setIsOpen(false);
    setSearch("");
  };

  return (
    <div ref={dropdownRef} className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-left text-sm transition hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-gray-600 dark:hover:bg-gray-750"
        disabled={isSwitching}
      >
        {/* Client Avatar/Icon */}
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
          {currentClient?.logo_url ? (
            <Image
              src={currentClient.logo_url}
              alt={currentClient.name}
              width={32}
              height={32}
              className="h-8 w-8 rounded-lg object-cover"
            />
          ) : isAgencyView ? (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          ) : (
            <span className="text-xs font-semibold">
              {currentClient?.name?.charAt(0)?.toUpperCase() || "?"}
            </span>
          )}
        </div>

        {/* Client Name */}
        <div className="flex-1 min-w-0">
          <p className="truncate font-medium text-gray-900 dark:text-white">
            {isAgencyView ? "Agency Overview" : currentClient?.name || "Select Client"}
          </p>
          <p className="truncate text-xs text-gray-500 dark:text-gray-400">
            {isAgencyView ? "All clients" : currentClient?.slug || ""}
          </p>
        </div>

        {/* Chevron */}
        <svg
          className={`h-4 w-4 shrink-0 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-80 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
          {/* Search */}
          <div className="border-b border-gray-200 p-2 dark:border-gray-700">
            <input
              type="text"
              placeholder="Search clients..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm placeholder-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500"
              autoFocus
            />
          </div>

          {/* Agency Overview Option */}
          <div className="border-b border-gray-200 p-1 dark:border-gray-700">
            <button
              onClick={handleAgencyView}
              className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition ${
                isAgencyView
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                  : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
              }`}
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gray-100 dark:bg-gray-600">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <p className="font-medium">Agency Overview</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">View all clients</p>
              </div>
              {isAgencyView && (
                <svg className="ml-auto h-4 w-4 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          </div>

          {/* Client List */}
          <div className="max-h-48 overflow-y-auto p-1">
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
              </div>
            ) : clients.length === 0 ? (
              <p className="px-3 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                {search ? "No clients found" : "No clients yet"}
              </p>
            ) : (
              clients.map((client) => (
                <button
                  key={client.id}
                  onClick={() => handleClientSelect(client)}
                  disabled={isSwitching}
                  className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition ${
                    currentClient?.id === client.id
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                      : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
                  }`}
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gray-100 text-xs font-semibold text-gray-600 dark:bg-gray-600 dark:text-gray-300">
                    {client.logo_url ? (
                      <Image src={client.logo_url} alt={client.name} width={28} height={28} className="h-7 w-7 rounded-md object-cover" />
                    ) : (
                      client.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium">{client.name}</p>
                    <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                      {client.industry || client.slug}
                    </p>
                  </div>
                  {currentClient?.id === client.id && (
                    <svg className="ml-auto h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ))
            )}
          </div>

          {/* Manage Clients Link */}
          <div className="border-t border-gray-200 p-1 dark:border-gray-700">
            <a
              href="/agency/clients"
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-600 transition hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Manage Clients
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
