import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Sprint, VelocityDataPoint, TeamCalendarEntry, JapaneseHoliday } from '../types';

// GET /api/sprints
export function useSprints() {
  return useQuery({
    queryKey: ['sprints'],
    queryFn: async () => {
      try {
        const res = await api.get<{ data: Sprint[] }>('/sprints');
        return res.data.data;
      } catch (err) {
        console.error('Failed to fetch sprints:', err);
        return [] as Sprint[];
      }
    },
  });
}

// GET /api/sprints/:id
export function useSprint(id: string) {
  return useQuery({
    queryKey: ['sprint', id],
    queryFn: async () => {
      try {
        const res = await api.get<{ data: Sprint }>(`/sprints/${id}`);
        return res.data.data;
      } catch (err) {
        console.error('Failed to fetch sprint:', err);
        return null;
      }
    },
    enabled: !!id,
  });
}

// POST /api/sprints
export function useCreateSprint() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<Sprint>) => {
      const res = await api.post<{ data: Sprint }>('/sprints', data);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sprints'] });
    },
    onError: (err) => {
      console.error('Failed to create sprint:', err);
    },
  });
}

// PUT /api/sprints/:id
export function useUpdateSprint() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Sprint> }) => {
      const res = await api.put<{ data: Sprint }>(`/sprints/${id}`, data);
      return res.data.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['sprints'] });
      queryClient.invalidateQueries({ queryKey: ['sprint', variables.id] });
    },
    onError: (err) => {
      console.error('Failed to update sprint:', err);
    },
  });
}

// POST /api/sprints/:id/start
export function useStartSprint() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.post<{ data: Sprint }>(`/sprints/${id}/start`);
      return res.data.data;
    },
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ['sprints'] });
      queryClient.invalidateQueries({ queryKey: ['sprint', id] });
      // removeQueries で古いキャッシュを完全削除し、スプリント画面遷移時に再取得させる
      queryClient.removeQueries({ queryKey: ['dsu', 'today'] });
    },
    onError: (err) => {
      console.error('Failed to start sprint:', err);
    },
  });
}

// POST /api/sprints/:id/complete
export function useCompleteSprint() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.post<{ data: Sprint }>(`/sprints/${id}/complete`);
      return res.data.data;
    },
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ['sprints'] });
      queryClient.invalidateQueries({ queryKey: ['sprint', id] });
      queryClient.invalidateQueries({ queryKey: ['velocity'] });
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['backlog'] });
      queryClient.invalidateQueries({ queryKey: ['dsu', 'today'] });
    },
    onError: (err) => {
      console.error('Failed to complete sprint:', err);
    },
  });
}

// POST /api/sprints/:id/reopen
export function useReopenSprint() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.post<{ data: Sprint }>(`/sprints/${id}/reopen`);
      return res.data.data;
    },
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ['sprints'] });
      queryClient.invalidateQueries({ queryKey: ['sprint', id] });
      queryClient.invalidateQueries({ queryKey: ['velocity'] });
    },
    onError: (err) => {
      console.error('Failed to reopen sprint:', err);
    },
  });
}

// GET /api/sprints/velocity
export function useVelocityHistory() {
  return useQuery({
    queryKey: ['velocity'],
    queryFn: async () => {
      try {
        const res = await api.get<{ data: VelocityDataPoint[] }>('/sprints/velocity');
        return res.data.data;
      } catch (err) {
        console.error('Failed to fetch velocity history:', err);
        return [] as VelocityDataPoint[];
      }
    },
  });
}

// GET /api/sprints/team/calendar
export function useTeamCalendar() {
  return useQuery({
    queryKey: ['teamCalendar'],
    queryFn: async () => {
      try {
        const res = await api.get<{ data: TeamCalendarEntry[] }>('/sprints/team/calendar');
        return res.data.data;
      } catch (err) {
        console.error('Failed to fetch team calendar:', err);
        return [] as TeamCalendarEntry[];
      }
    },
  });
}

// GET /api/sprints/holidays?year=
export function useJapaneseHolidays(year: number) {
  return useQuery({
    queryKey: ['holidays', year],
    queryFn: async () => {
      try {
        const res = await api.get<{ data: JapaneseHoliday[] }>(`/sprints/holidays?year=${year}`);
        return res.data.data;
      } catch (err) {
        console.error('Failed to fetch holidays:', err);
        return [] as JapaneseHoliday[];
      }
    },
    enabled: !!year,
  });
}
