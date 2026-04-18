import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useTeamStore } from '@/lib/teamStore';
import { User, TeamSettings, TerminologyEntry } from '../types';

// ─── Users ───────────────────────────────────────────────────────────────

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await api.get<{ data: User[] }>('/users');
      return res.data.data;
    },
  });
}

export function useMyProfile() {
  return useQuery({
    queryKey: ['users', 'me'],
    queryFn: async () => {
      const res = await api.get<{ data: User }>('/users/me');
      return res.data.data;
    },
  });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { email: string; name: string; role: string; password: string }) =>
      api.post<{ data: User }>('/users', data).then((r) => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; name?: string; avatarUrl?: string | null }) =>
      api.put<{ data: User }>(`/users/${id}`, data).then((r) => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/users/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });
}

export function useUpdateRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) =>
      api.put<{ data: User }>(`/users/${id}/role`, { role }).then((r) => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });
}

export function useUpdateMyProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name?: string; avatarUrl?: string | null }) =>
      api.put<{ data: User }>('/users/me', data).then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users', 'me'] });
      qc.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

// ─── Team ────────────────────────────────────────────────────────────────

export function useTeamSettings() {
  const teamId = useTeamStore((s) => s.currentTeamId);
  return useQuery({
    queryKey: ['team', teamId],
    queryFn: async () => {
      const res = await api.get<{ data: TeamSettings }>('/team');
      return res.data.data;
    },
    enabled: !!teamId,
  });
}

export function useUpdateTeamSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<TeamSettings>) =>
      api.put<{ data: TeamSettings }>('/team', data).then((r) => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['team'] }),
  });
}

// ─── Terminology ─────────────────────────────────────────────────────────

export function useTerminology() {
  return useQuery({
    queryKey: ['settings', 'terminology'],
    queryFn: async () => {
      const res = await api.get<{ data: TerminologyEntry[] }>('/settings/terminology');
      return res.data.data;
    },
  });
}

export function useUpdateTerminology() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (entries: TerminologyEntry[]) =>
      api.put<{ data: TerminologyEntry[] }>('/settings/terminology', entries).then((r) => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['settings', 'terminology'] }),
  });
}
