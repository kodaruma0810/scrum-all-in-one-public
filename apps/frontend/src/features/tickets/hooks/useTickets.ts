import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Ticket, TicketComment, DodCheckResult, BurndownDataPoint, TicketFilters, TicketStatus } from '../types';

// GET /api/tickets
export function useTickets(filters?: TicketFilters) {
  return useQuery({
    queryKey: ['tickets', filters],
    queryFn: async () => {
      try {
        const params = new URLSearchParams();
        if (filters?.sprintId) params.set('sprintId', filters.sprintId);
        if (filters?.sprintGoalId) params.set('sprintGoalId', filters.sprintGoalId);
        if (filters?.status) params.set('status', filters.status);
        if (filters?.assigneeId) params.set('assigneeId', filters.assigneeId);
        const res = await api.get<{ data: Ticket[] }>(`/tickets?${params.toString()}`);
        return res.data.data;
      } catch (err) {
        console.error('Failed to fetch tickets:', err);
        return [] as Ticket[];
      }
    },
  });
}

// GET /api/tickets/:id
export function useTicket(id: string) {
  return useQuery({
    queryKey: ['ticket', id],
    queryFn: async () => {
      try {
        const res = await api.get<{ data: Ticket }>(`/tickets/${id}`);
        return res.data.data;
      } catch (err) {
        console.error('Failed to fetch ticket:', err);
        return null;
      }
    },
    enabled: !!id,
  });
}

// GET /api/tickets/backlog
export function useBacklogTickets() {
  return useQuery({
    queryKey: ['backlog'],
    queryFn: async () => {
      try {
        const res = await api.get<{ data: Ticket[] }>('/tickets/backlog');
        return res.data.data;
      } catch (err) {
        console.error('Failed to fetch backlog tickets:', err);
        return [] as Ticket[];
      }
    },
  });
}

// POST /api/tickets
export function useCreateTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<Ticket>) => {
      const res = await api.post<{ data: Ticket }>('/tickets', data);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['backlog'] });
      queryClient.invalidateQueries({ queryKey: ['sprint'] });
      queryClient.invalidateQueries({ queryKey: ['sprintGoals'] });
    },
    onError: (err) => {
      console.error('Failed to create ticket:', err);
    },
  });
}

// PUT /api/tickets/:id
export function useUpdateTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Ticket> }) => {
      const res = await api.put<{ data: Ticket }>(`/tickets/${id}`, data);
      return res.data.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['ticket', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['backlog'] });
      queryClient.invalidateQueries({ queryKey: ['sprint'] });
      queryClient.invalidateQueries({ queryKey: ['sprintGoals'] });
    },
    onError: (err) => {
      console.error('Failed to update ticket:', err);
    },
  });
}

// DELETE /api/tickets/:id
export function useDeleteTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/tickets/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['backlog'] });
    },
    onError: (err) => {
      console.error('Failed to delete ticket:', err);
    },
  });
}

// PUT /api/tickets/:id/status
export function useChangeTicketStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: TicketStatus }) => {
      const res = await api.put<{ data: Ticket }>(`/tickets/${id}/status`, { status });
      return res.data.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['ticket', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['sprintGoals'] });
      queryClient.invalidateQueries({ queryKey: ['dsu', 'today'] });
    },
    onError: (err) => {
      console.error('Failed to change ticket status:', err);
    },
  });
}

// GET /api/tickets/:id/comments
export function useTicketComments(ticketId: string) {
  return useQuery({
    queryKey: ['comments', ticketId],
    queryFn: async () => {
      try {
        const res = await api.get<{ data: TicketComment[] }>(`/tickets/${ticketId}/comments`);
        return res.data.data;
      } catch (err) {
        console.error('Failed to fetch comments:', err);
        return [] as TicketComment[];
      }
    },
    enabled: !!ticketId,
  });
}

// POST /api/tickets/:id/comments
export function useAddComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ ticketId, content }: { ticketId: string; content: string }) => {
      const res = await api.post<{ data: TicketComment }>(`/tickets/${ticketId}/comments`, { content });
      return res.data.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['comments', variables.ticketId] });
    },
    onError: (err) => {
      console.error('Failed to add comment:', err);
    },
  });
}

// PUT /api/tickets/:id/dod
export function useUpdateDod() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      ticketId,
      items,
    }: {
      ticketId: string;
      items: { dodItemId: string; checked: boolean }[];
    }) => {
      const res = await api.put<{ data: DodCheckResult[] }>(`/tickets/${ticketId}/dod`, { items });
      return res.data.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['ticket', variables.ticketId] });
    },
    onError: (err) => {
      console.error('Failed to update DoD:', err);
    },
  });
}

// GET /api/tickets/sprint/:sprintId/burndown
export function useBurndownData(sprintId: string) {
  return useQuery({
    queryKey: ['burndown', sprintId],
    queryFn: async () => {
      try {
        const res = await api.get<{ data: BurndownDataPoint[] }>(`/tickets/sprint/${sprintId}/burndown`);
        return res.data.data;
      } catch (err) {
        console.error('Failed to fetch burndown data:', err);
        return [] as BurndownDataPoint[];
      }
    },
    enabled: !!sprintId,
  });
}
