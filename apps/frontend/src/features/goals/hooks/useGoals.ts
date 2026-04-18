import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import {
  Increment,
  LongTermGoal,
  SprintGoal,
  HierarchyData,
  ProgressData,
} from '../types';

// GET /api/goals/increments
export function useIncrements() {
  return useQuery({
    queryKey: ['increments'],
    queryFn: async () => {
      try {
        const res = await api.get<{ data: Increment[] }>('/goals/increments');
        return res.data.data;
      } catch (err) {
        console.error('Failed to fetch increments:', err);
        return [] as Increment[];
      }
    },
  });
}

// GET /api/goals/increments/:id
export function useIncrement(id: string) {
  return useQuery({
    queryKey: ['increment', id],
    queryFn: async () => {
      try {
        const res = await api.get<{ data: Increment }>(`/goals/increments/${id}`);
        return res.data.data;
      } catch (err) {
        console.error('Failed to fetch increment:', err);
        return null;
      }
    },
    enabled: !!id,
  });
}

// POST /api/goals/increments
export function useCreateIncrement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<Increment> & { sprintDurationWeeks?: number }) => {
      const res = await api.post<{ data: Increment }>('/goals/increments', data);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['increments'] });
    },
    onError: (err) => {
      console.error('Failed to create increment:', err);
    },
  });
}

// DELETE /api/goals/increments/:id
export function useDeleteIncrement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/goals/increments/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['increments'] });
    },
  });
}

// PUT /api/goals/increments/:id
export function useUpdateIncrement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Increment> }) => {
      const res = await api.put<{ data: Increment }>(`/goals/increments/${id}`, data);
      return res.data.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['increments'] });
      queryClient.invalidateQueries({ queryKey: ['increment', variables.id] });
    },
    onError: (err) => {
      console.error('Failed to update increment:', err);
    },
  });
}

// GET /api/goals/increments/:id/goals
export function useLongTermGoals(incrementId: string) {
  return useQuery({
    queryKey: ['longTermGoals', incrementId],
    queryFn: async () => {
      try {
        const res = await api.get<{ data: LongTermGoal[] }>(`/goals/increments/${incrementId}/goals`);
        return res.data.data;
      } catch (err) {
        console.error('Failed to fetch long term goals:', err);
        return [] as LongTermGoal[];
      }
    },
    enabled: !!incrementId,
  });
}

// POST /api/goals/increments/:id/goals
export function useCreateLongTermGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ incrementId, data }: { incrementId: string; data: Partial<LongTermGoal> }) => {
      const res = await api.post<{ data: LongTermGoal }>(`/goals/increments/${incrementId}/goals`, data);
      return res.data.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['longTermGoals', variables.incrementId] });
      queryClient.invalidateQueries({ queryKey: ['increment', variables.incrementId] });
    },
    onError: (err) => {
      console.error('Failed to create long term goal:', err);
    },
  });
}

// PUT /api/goals/increments/:id/goals/:goalId
export function useUpdateLongTermGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      incrementId,
      goalId,
      data,
    }: {
      incrementId: string;
      goalId: string;
      data: Partial<LongTermGoal>;
    }) => {
      const res = await api.put<{ data: LongTermGoal }>(
        `/goals/increments/${incrementId}/goals/${goalId}`,
        data
      );
      return res.data.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['longTermGoals', variables.incrementId] });
      queryClient.invalidateQueries({ queryKey: ['increment', variables.incrementId] });
    },
    onError: (err) => {
      console.error('Failed to update long term goal:', err);
    },
  });
}

// DELETE /api/goals/increments/:id/goals/:goalId
export function useDeleteLongTermGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ incrementId, goalId }: { incrementId: string; goalId: string }) => {
      await api.delete(`/goals/increments/${incrementId}/goals/${goalId}`);
      return goalId;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['longTermGoals', variables.incrementId] });
      queryClient.invalidateQueries({ queryKey: ['increment', variables.incrementId] });
    },
    onError: (err) => {
      console.error('Failed to delete long term goal:', err);
    },
  });
}

// GET /api/goals/sprints/:id/goals
export function useSprintGoals(sprintId: string) {
  return useQuery({
    queryKey: ['sprintGoals', sprintId],
    queryFn: async () => {
      try {
        const res = await api.get<{ data: SprintGoal[] }>(`/goals/sprints/${sprintId}/goals`);
        return res.data.data;
      } catch (err) {
        console.error('Failed to fetch sprint goals:', err);
        return [] as SprintGoal[];
      }
    },
    enabled: !!sprintId,
  });
}

// POST /api/goals/sprints/:id/goals
export function useCreateSprintGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ sprintId, data }: { sprintId: string; data: Partial<SprintGoal> }) => {
      const res = await api.post<{ data: SprintGoal }>(`/goals/sprints/${sprintId}/goals`, data);
      return res.data.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['sprintGoals', variables.sprintId] });
      queryClient.invalidateQueries({ queryKey: ['longTermGoals'] });
      queryClient.invalidateQueries({ queryKey: ['hierarchy'] });
      queryClient.invalidateQueries({ queryKey: ['progress'] });
    },
    onError: (err) => {
      console.error('Failed to create sprint goal:', err);
    },
  });
}

// PUT /api/goals/sprints/:id/goals/:goalId
export function useUpdateSprintGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      sprintId,
      goalId,
      data,
    }: {
      sprintId: string;
      goalId: string;
      data: Partial<SprintGoal>;
    }) => {
      const res = await api.put<{ data: SprintGoal }>(
        `/goals/sprints/${sprintId}/goals/${goalId}`,
        data
      );
      return res.data.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['sprintGoals', variables.sprintId] });
      queryClient.invalidateQueries({ queryKey: ['longTermGoals'] });
      queryClient.invalidateQueries({ queryKey: ['hierarchy'] });
      queryClient.invalidateQueries({ queryKey: ['progress'] });
    },
    onError: (err) => {
      console.error('Failed to update sprint goal:', err);
    },
  });
}

// GET /api/goals/increments/:id/hierarchy
export function useHierarchyData(incrementId: string) {
  return useQuery({
    queryKey: ['hierarchy', incrementId],
    queryFn: async () => {
      try {
        const res = await api.get<{ data: HierarchyData }>(`/goals/increments/${incrementId}/hierarchy`);
        return res.data.data;
      } catch (err) {
        console.error('Failed to fetch hierarchy data:', err);
        return null;
      }
    },
    enabled: !!incrementId,
  });
}

// GET /api/goals/increments/:id/progress
export function useProgressData(incrementId: string) {
  return useQuery({
    queryKey: ['progress', incrementId],
    queryFn: async () => {
      try {
        const res = await api.get<{ data: ProgressData[] }>(`/goals/increments/${incrementId}/progress`);
        return res.data.data;
      } catch (err) {
        console.error('Failed to fetch progress data:', err);
        return [] as ProgressData[];
      }
    },
    enabled: !!incrementId,
  });
}
