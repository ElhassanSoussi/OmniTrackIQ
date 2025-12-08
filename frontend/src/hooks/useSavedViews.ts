import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";

export interface SavedViewConfig {
  date_range?: string;
  platform_filter?: string | null;
  metrics?: string[];
  sort_by?: string;
  sort_direction?: "asc" | "desc";
  columns?: string[];
  custom_filters?: Record<string, unknown>;
}

export interface SavedView {
  id: string;
  name: string;
  view_type: "executive" | "acquisition" | "campaigns" | "custom";
  description?: string;
  config: SavedViewConfig;
  is_shared: boolean;
  is_default: boolean;
  created_at: string;
  updated_at?: string;
  user_id: string;
}

export interface SavedViewsResponse {
  items: SavedView[];
  total: number;
}

export interface CreateSavedViewData {
  name: string;
  view_type?: "executive" | "acquisition" | "campaigns" | "custom";
  description?: string;
  config?: SavedViewConfig;
  is_shared?: boolean;
  is_default?: boolean;
}

export interface UpdateSavedViewData {
  name?: string;
  description?: string;
  config?: SavedViewConfig;
  is_shared?: boolean;
  is_default?: boolean;
}

export function useSavedViews(viewType?: string, includeShared = true) {
  return useQuery<SavedViewsResponse>({
    queryKey: ["saved-views", viewType, includeShared],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (viewType) params.set("view_type", viewType);
      params.set("include_shared", String(includeShared));
      const result = await apiFetch(`/saved-views?${params}`);
      return result as SavedViewsResponse;
    },
  });
}

export function useSavedView(viewId: string | null) {
  return useQuery<SavedView>({
    queryKey: ["saved-view", viewId],
    queryFn: async () => {
      const result = await apiFetch(`/saved-views/${viewId}`);
      return result as SavedView;
    },
    enabled: !!viewId,
  });
}

export function useDefaultView() {
  return useQuery<SavedView | null>({
    queryKey: ["saved-view-default"],
    queryFn: async () => {
      const result = await apiFetch(`/saved-views/default`);
      return result as SavedView | null;
    },
  });
}

export function useCreateSavedView() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateSavedViewData) => {
      const result = await apiFetch("/saved-views", {
        method: "POST",
        body: JSON.stringify(data),
      });
      return result as SavedView;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saved-views"] });
      queryClient.invalidateQueries({ queryKey: ["saved-view-default"] });
    },
  });
}

export function useUpdateSavedView() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateSavedViewData }) => {
      const result = await apiFetch(`/saved-views/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
      return result as SavedView;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["saved-views"] });
      queryClient.invalidateQueries({ queryKey: ["saved-view", data.id] });
      queryClient.invalidateQueries({ queryKey: ["saved-view-default"] });
    },
  });
}

export function useDeleteSavedView() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (viewId: string) => {
      await apiFetch(`/saved-views/${viewId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saved-views"] });
      queryClient.invalidateQueries({ queryKey: ["saved-view-default"] });
    },
  });
}
