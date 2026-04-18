import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { queryClient } from './queryClient';

interface TeamState {
  currentTeamId: string | null;
  currentTeamName: string | null;
  setCurrentTeam: (teamId: string, teamName: string) => void;
  clearCurrentTeam: () => void;
}

export const useTeamStore = create<TeamState>()(
  persist(
    (set, get) => ({
      currentTeamId: null,
      currentTeamName: null,
      setCurrentTeam: (teamId, teamName) => {
        const prev = get().currentTeamId;
        set({ currentTeamId: teamId, currentTeamName: teamName });
        if (prev !== teamId) {
          queryClient.clear();
        }
      },
      clearCurrentTeam: () => {
        set({ currentTeamId: null, currentTeamName: null });
        queryClient.clear();
      },
    }),
    { name: 'team-storage' }
  )
);
