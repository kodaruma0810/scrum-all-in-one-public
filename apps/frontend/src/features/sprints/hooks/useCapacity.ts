import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { MemberCapacity } from '../types';

// GET /api/sprints/:id/capacity
export function useCapacity(sprintId: string) {
  return useQuery({
    queryKey: ['capacity', sprintId],
    queryFn: async () => {
      try {
        const res = await api.get<{ data: MemberCapacity[] }>(`/sprints/${sprintId}/capacity`);
        return res.data.data;
      } catch (err) {
        console.error('Failed to fetch capacity:', err);
        return [] as MemberCapacity[];
      }
    },
    enabled: !!sprintId,
  });
}

// PUT /api/sprints/:id/capacity
export function useUpsertCapacity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      sprintId,
      members,
    }: {
      sprintId: string;
      members: Array<{ userId: string; availableDays: number }>;
    }) => {
      const res = await api.put<{ data: MemberCapacity[] }>(`/sprints/${sprintId}/capacity`, { members });
      return res.data.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['capacity', variables.sprintId] });
    },
    onError: (err) => {
      console.error('Failed to upsert capacity:', err);
    },
  });
}
