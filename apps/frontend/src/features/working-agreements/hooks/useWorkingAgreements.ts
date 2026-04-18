import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { WAListResponse, WAHistory } from '../types';

// GET /api/working-agreements
export function useWAList() {
  return useQuery({
    queryKey: ['working-agreements'],
    queryFn: async () => {
      const res = await api.get<{ data: WAListResponse }>('/working-agreements');
      return res.data.data;
    },
  });
}

// GET /api/working-agreements/active
export function useActiveWARules() {
  return useQuery({
    queryKey: ['working-agreements', 'active'],
    queryFn: async () => {
      const res = await api.get<{ data: WAListResponse }>('/working-agreements/active');
      return res.data.data;
    },
  });
}

// POST /api/working-agreements/categories
export function useCreateWACategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; orderIndex?: number }) => {
      const res = await api.post<{ data: { id: string } }>('/working-agreements/categories', data);
      return res.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['working-agreements'] });
    },
  });
}

// PUT /api/working-agreements/categories/:id
export function useUpdateWACategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; name?: string; orderIndex?: number }) => {
      await api.put(`/working-agreements/categories/${id}`, data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['working-agreements'] });
    },
  });
}

// DELETE /api/working-agreements/categories/:id
export function useDeleteWACategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/working-agreements/categories/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['working-agreements'] });
    },
  });
}

// POST /api/working-agreements/rules
export function useCreateWARule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      categoryId?: string | null;
      title: string;
      description?: string;
      agreedAt: string;
      proposedById: string;
      orderIndex?: number;
    }) => {
      const res = await api.post('/working-agreements/rules', data);
      return res.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['working-agreements'] });
    },
  });
}

// PUT /api/working-agreements/rules/:id
export function useUpdateWARule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: {
      id: string;
      title?: string;
      description?: string | null;
      agreedAt?: string;
      isActive?: boolean;
      categoryId?: string | null;
    }) => {
      const res = await api.put(`/working-agreements/rules/${id}`, data);
      return res.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['working-agreements'] });
    },
  });
}

// PATCH /api/working-agreements/rules/:id/toggle
export function useToggleWARule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const res = await api.patch(`/working-agreements/rules/${id}/toggle`, { isActive });
      return res.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['working-agreements'] });
    },
  });
}

// GET /api/working-agreements/rules/:id/history
export function useWARuleHistory(ruleId: string | null) {
  return useQuery({
    queryKey: ['working-agreements', 'history', ruleId],
    queryFn: async () => {
      const res = await api.get<{ data: WAHistory[] }>(`/working-agreements/rules/${ruleId}/history`);
      return res.data.data;
    },
    enabled: !!ruleId,
  });
}
