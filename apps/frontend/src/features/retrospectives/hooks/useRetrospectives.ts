import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { RetroSummary, Retro, RetroItem, RetroAction, RetroMode } from '../types';

export function useRetroList() {
  return useQuery({
    queryKey: ['retrospectives'],
    queryFn: async () => {
      const res = await api.get<{ data: RetroSummary[] }>('/retrospectives');
      return res.data.data;
    },
  });
}

export function useRetro(id: string | null, options?: { polling?: boolean }) {
  return useQuery({
    queryKey: ['retrospectives', id],
    queryFn: async () => {
      const res = await api.get<{ data: Retro }>(`/retrospectives/${id}`);
      return res.data.data;
    },
    enabled: !!id,
    refetchInterval: options?.polling ? 3000 : false,
  });
}

export function useCreateRetro() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { title: string; sprintId?: string | null; format?: string; mode?: RetroMode }) => {
      const res = await api.post<{ data: { id: string } }>('/retrospectives', data);
      return res.data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['retrospectives'] }),
  });
}

export function useUpdateRetro() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; title?: string; sprintId?: string | null }) => {
      await api.put(`/retrospectives/${id}`, data);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['retrospectives'] }),
  });
}

export function useDeleteRetro() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/retrospectives/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['retrospectives'] }),
  });
}

// --- Items ---

export function useAddRetroItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ retroId, ...data }: { retroId: string; type: string; body: string }) => {
      const res = await api.post<{ data: RetroItem }>(`/retrospectives/${retroId}/items`, data);
      return res.data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['retrospectives'] }),
  });
}

export function useUpdateRetroItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; body?: string; type?: string; posX?: number; posY?: number; fontSize?: number; fontColor?: string }) => {
      const res = await api.put<{ data: RetroItem }>(`/retrospectives/items/${id}`, data);
      return res.data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['retrospectives'] }),
  });
}

export function useDeleteRetroItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/retrospectives/items/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['retrospectives'] }),
  });
}

export function useToggleRetroVote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (itemId: string) => {
      const res = await api.post<{ data: { voted: boolean } }>(`/retrospectives/items/${itemId}/vote`);
      return res.data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['retrospectives'] }),
  });
}

// --- Actions ---

export function useAddRetroAction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ retroId, ...data }: { retroId: string; title: string; assigneeId?: string | null }) => {
      const res = await api.post<{ data: RetroAction }>(`/retrospectives/${retroId}/actions`, data);
      return res.data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['retrospectives'] }),
  });
}

export function useUpdateRetroAction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; title?: string; assigneeId?: string | null; status?: 'OPEN' | 'DONE' }) => {
      const res = await api.put<{ data: RetroAction }>(`/retrospectives/actions/${id}`, data);
      return res.data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['retrospectives'] }),
  });
}

export function useDeleteRetroAction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/retrospectives/actions/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['retrospectives'] }),
  });
}
