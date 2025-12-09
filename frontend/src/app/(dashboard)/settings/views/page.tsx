"use client";

import { useState } from "react";
import Link from "next/link";
import {
  useSavedViews,
  useCreateSavedView,
  useUpdateSavedView,
  useDeleteSavedView,
  SavedView,
  CreateSavedViewData,
} from "@/hooks/useSavedViews";

const VIEW_TYPE_LABELS: Record<string, string> = {
  executive: "Executive Dashboard",
  acquisition: "Acquisition Report",
  campaigns: "Campaign Performance",
  custom: "Custom View",
};

const VIEW_TYPE_COLORS: Record<string, string> = {
  executive: "bg-purple-100 text-purple-700",
  acquisition: "bg-blue-100 text-blue-700",
  campaigns: "bg-orange-100 text-orange-700",
  custom: "bg-gray-100 text-gray-700",
};

export default function SavedViewsPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingView, setEditingView] = useState<SavedView | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  
  const { data: viewsData, isLoading, error } = useSavedViews();
  const createMutation = useCreateSavedView();
  const updateMutation = useUpdateSavedView();
  const deleteMutation = useDeleteSavedView();

  const handleCreate = async (data: CreateSavedViewData) => {
    try {
      await createMutation.mutateAsync(data);
      setShowCreateModal(false);
    } catch (err) {
      console.error("Failed to create view:", err);
    }
  };

  const handleUpdate = async (id: string, data: Partial<CreateSavedViewData>) => {
    try {
      await updateMutation.mutateAsync({ id, data });
      setEditingView(null);
    } catch (err) {
      console.error("Failed to update view:", err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      setDeleteConfirm(null);
    } catch (err) {
      console.error("Failed to delete view:", err);
    }
  };

  const handleSetDefault = async (view: SavedView) => {
    try {
      await updateMutation.mutateAsync({
        id: view.id,
        data: { is_default: !view.is_default },
      });
    } catch (err) {
      console.error("Failed to set default:", err);
    }
  };

  const handleToggleShare = async (view: SavedView) => {
    try {
      await updateMutation.mutateAsync({
        id: view.id,
        data: { is_shared: !view.is_shared },
      });
    } catch (err) {
      console.error("Failed to toggle share:", err);
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm text-gray-500">
            <Link href="/settings" className="hover:text-emerald-600">Settings</Link>
            <span>/</span>
            <span className="text-gray-900">Saved Views</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Saved Views</h1>
          <p className="mt-1 text-gray-500">Manage your custom dashboard views and configurations</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create View
        </button>
      </div>

      {/* Settings Navigation */}
      <div className="mb-8">
        <nav className="flex gap-4 border-b border-gray-200">
          <Link href="/settings" className="border-b-2 border-transparent px-1 pb-3 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700">
            General
          </Link>
          <Link href="/settings/team" className="border-b-2 border-transparent px-1 pb-3 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700">
            Team
          </Link>
          <Link href="/settings/views" className="border-b-2 border-emerald-500 px-1 pb-3 text-sm font-medium text-emerald-600">
            Saved Views
          </Link>
          <Link href="/settings/reports" className="border-b-2 border-transparent px-1 pb-3 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700">
            Reports
          </Link>
        </nav>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="rounded-xl border border-gray-200 bg-white p-8">
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 rounded-lg bg-gray-100" />
            ))}
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
          <p className="font-medium">Failed to load saved views</p>
          <p className="mt-1 text-sm">{error instanceof Error ? error.message : "Unknown error"}</p>
        </div>
      )}

      {/* Views List */}
      {!isLoading && !error && (
        <div className="space-y-4">
          {viewsData?.items && viewsData.items.length > 0 ? (
            viewsData.items.map((view) => (
              <div key={view.id} className="rounded-xl border border-gray-200 bg-white p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-gray-900">{view.name}</h3>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${VIEW_TYPE_COLORS[view.view_type] || VIEW_TYPE_COLORS.custom}`}>
                        {VIEW_TYPE_LABELS[view.view_type] || view.view_type}
                      </span>
                      {view.is_default && (
                        <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                          Default
                        </span>
                      )}
                      {view.is_shared && (
                        <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                          Shared
                        </span>
                      )}
                    </div>
                    {view.description && (
                      <p className="mt-1 text-sm text-gray-500">{view.description}</p>
                    )}
                    <div className="mt-2 flex items-center gap-4 text-xs text-gray-400">
                      <span>Created {new Date(view.created_at).toLocaleDateString()}</span>
                      {view.config.date_range && <span>Range: {view.config.date_range}</span>}
                      {view.config.platform_filter && <span>Platform: {view.config.platform_filter}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleSetDefault(view)}
                      className={`rounded-lg p-2 transition ${view.is_default ? "bg-emerald-100 text-emerald-600" : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"}`}
                      title={view.is_default ? "Remove default" : "Set as default"}
                    >
                      <svg className="h-4 w-4" fill={view.is_default ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleToggleShare(view)}
                      className={`rounded-lg p-2 transition ${view.is_shared ? "bg-blue-100 text-blue-600" : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"}`}
                      title={view.is_shared ? "Make private" : "Share with team"}
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setEditingView(view)}
                      className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                      title="Edit"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(view.id)}
                      className="rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                      title="Delete"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              </svg>
              <p className="mt-4 font-medium text-gray-900">No saved views yet</p>
              <p className="mt-1 text-sm text-gray-500">Create your first saved view to quickly access your favorite dashboard configurations</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Your First View
              </button>
            </div>
          )}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <CreateViewModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreate}
          isLoading={createMutation.isPending}
        />
      )}

      {/* Edit Modal */}
      {editingView && (
        <EditViewModal
          view={editingView}
          onClose={() => setEditingView(null)}
          onSubmit={(data) => handleUpdate(editingView.id, data)}
          isLoading={updateMutation.isPending}
        />
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">Delete Saved View?</h3>
            <p className="mt-2 text-sm text-gray-500">
              This action cannot be undone. The saved view will be permanently deleted.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                disabled={deleteMutation.isPending}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Create View Modal Component
function CreateViewModal({
  onClose,
  onSubmit,
  isLoading,
}: {
  onClose: () => void;
  onSubmit: (data: CreateSavedViewData) => void;
  isLoading: boolean;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [viewType, setViewType] = useState<"executive" | "acquisition" | "campaigns" | "custom">("custom");
  const [dateRange, setDateRange] = useState("30d");
  const [isDefault, setIsDefault] = useState(false);
  const [isShared, setIsShared] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    onSubmit({
      name: name.trim(),
      description: description.trim() || undefined,
      view_type: viewType,
      is_default: isDefault,
      is_shared: isShared,
      config: {
        date_range: dateRange,
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900">Create Saved View</h2>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Dashboard View"
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Description (optional)</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this view"
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label htmlFor="view-type" className="block text-sm font-medium text-gray-700">View Type</label>
            <select
              id="view-type"
              value={viewType}
              onChange={(e) => setViewType(e.target.value as typeof viewType)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="executive">Executive Dashboard</option>
              <option value="acquisition">Acquisition Report</option>
              <option value="campaigns">Campaign Performance</option>
              <option value="custom">Custom</option>
            </select>
          </div>
          <div>
            <label htmlFor="date-range" className="block text-sm font-medium text-gray-700">Default Date Range</label>
            <select
              id="date-range"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
          </div>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-gray-700">Set as default</span>
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={isShared}
                onChange={(e) => setIsShared(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-gray-700">Share with team</span>
            </label>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !name.trim()}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              {isLoading ? "Creating..." : "Create View"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Edit View Modal Component
function EditViewModal({
  view,
  onClose,
  onSubmit,
  isLoading,
}: {
  view: SavedView;
  onClose: () => void;
  onSubmit: (data: Partial<CreateSavedViewData>) => void;
  isLoading: boolean;
}) {
  const [name, setName] = useState(view.name);
  const [description, setDescription] = useState(view.description || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    onSubmit({
      name: name.trim(),
      description: description.trim() || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900">Edit Saved View</h2>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label htmlFor="edit-view-name" className="block text-sm font-medium text-gray-700">Name</label>
            <input
              id="edit-view-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              required
            />
          </div>
          <div>
            <label htmlFor="edit-view-description" className="block text-sm font-medium text-gray-700">Description (optional)</label>
            <input
              id="edit-view-description"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !name.trim()}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
