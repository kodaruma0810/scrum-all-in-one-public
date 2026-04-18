import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { DsuTodayData, DsuLog, DsuHistoryFilters } from '../types';

export function useDsuToday() {
  return useQuery({
    queryKey: ['dsu', 'today'],
    queryFn: async () => {
      try {
        const res = await api.get<{ data: DsuTodayData }>('/dsu/today');
        return res.data.data;
      } catch (err) {
        console.error('Failed to fetch DSU today:', err);
        return { sprint: null, dsuLog: null } as DsuTodayData;
      }
    },
    refetchInterval: 60_000,
  });
}

export function useCreateDsuLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { sprintId: string; date: string; notes?: string }) => {
      const res = await api.post<{ data: DsuLog }>('/dsu', data);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dsu'] });
    },
  });
}

export function useDsuLog(id: string | undefined) {
  return useQuery({
    queryKey: ['dsu', id],
    queryFn: async () => {
      try {
        const res = await api.get<{ data: DsuLog }>(`/dsu/${id}`);
        return res.data.data;
      } catch (err) {
        console.error('Failed to fetch DSU log:', err);
        return null;
      }
    },
    enabled: !!id,
  });
}

export function useUpsertMemberStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (vars: {
      dsuLogId: string;
      data: {
        userId: string;
        yesterday?: string;
        today?: string;
        blockers?: string;
        status: 'PRESENT' | 'ABSENT' | 'REMOTE';
      };
    }) => {
      const res = await api.put(`/dsu/${vars.dsuLogId}/member-status`, vars.data);
      return res.data;
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ['dsu', vars.dsuLogId] });
      queryClient.invalidateQueries({ queryKey: ['dsu', 'today'] });
    },
  });
}

export function useUpdateDsuNotes() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ dsuLogId, notes }: { dsuLogId: string; notes: string }) => {
      const res = await api.put(`/dsu/${dsuLogId}/notes`, { notes });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dsu', 'today'] });
    },
  });
}

export function useDsuHistory(filters?: DsuHistoryFilters) {
  return useQuery({
    queryKey: ['dsu', 'history', filters],
    queryFn: async () => {
      try {
        const params = new URLSearchParams();
        if (filters?.sprintId) params.set('sprintId', filters.sprintId);
        if (filters?.limit) params.set('limit', String(filters.limit));
        if (filters?.offset) params.set('offset', String(filters.offset));
        const query = params.toString();
        const res = await api.get<{ data: DsuLog[] }>(`/dsu/history${query ? `?${query}` : ''}`);
        return res.data.data;
      } catch (err) {
        console.error('Failed to fetch DSU history:', err);
        return [] as DsuLog[];
      }
    },
  });
}
