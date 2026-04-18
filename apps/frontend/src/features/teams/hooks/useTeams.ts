import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Team, TeamMember } from '../types';

// GET /api/teams/my
export function useMyTeams() {
  return useQuery({
    queryKey: ['teams', 'my'],
    queryFn: async () => {
      const res = await api.get<{ data: Team[] }>('/teams/my');
      return res.data.data;
    },
  });
}

// POST /api/teams
export function useCreateTeam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; ticketPrefix?: string }) => {
      const res = await api.post<{ data: Team }>('/teams', data);
      return res.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['teams'] });
    },
  });
}

// DELETE /api/teams/:teamId
export function useDeleteTeam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (teamId: string) => {
      await api.delete(`/teams/${teamId}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['teams'] });
    },
  });
}

// GET /api/teams/:teamId/members
export function useTeamMembers(teamId: string | null) {
  return useQuery({
    queryKey: ['teams', teamId, 'members'],
    queryFn: async () => {
      const res = await api.get<{ data: TeamMember[] }>(`/teams/${teamId}/members`);
      return res.data.data;
    },
    enabled: !!teamId,
  });
}

// POST /api/teams/:teamId/members
export function useAddTeamMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ teamId, userId }: { teamId: string; userId: string }) => {
      const res = await api.post<{ data: TeamMember }>(`/teams/${teamId}/members`, { userId });
      return res.data.data;
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['teams', variables.teamId, 'members'] });
      qc.invalidateQueries({ queryKey: ['teams', 'my'] });
    },
  });
}

// DELETE /api/teams/:teamId/members/:userId
export function useRemoveTeamMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ teamId, userId }: { teamId: string; userId: string }) => {
      await api.delete(`/teams/${teamId}/members/${userId}`);
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['teams', variables.teamId, 'members'] });
      qc.invalidateQueries({ queryKey: ['teams', 'my'] });
    },
  });
}

// PUT /api/teams/:teamId/members/:userId/owner
export function useToggleTeamOwner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ teamId, userId, isOwner }: { teamId: string; userId: string; isOwner: boolean }) => {
      const res = await api.put<{ data: TeamMember }>(`/teams/${teamId}/members/${userId}/owner`, { isOwner });
      return res.data.data;
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['teams', variables.teamId, 'members'] });
    },
  });
}

// PUT /api/teams/:teamId/members/:userId/role
export function useChangeTeamRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ teamId, userId, role }: { teamId: string; userId: string; role: string }) => {
      const res = await api.put<{ data: TeamMember }>(`/teams/${teamId}/members/${userId}/role`, { role });
      return res.data.data;
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['teams', variables.teamId, 'members'] });
    },
  });
}
