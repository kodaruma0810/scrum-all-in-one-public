import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Plus, Users } from 'lucide-react';
import { useMyTeams } from '../hooks/useTeams';
import { useTeamStore } from '@/lib/teamStore';
import CreateTeamDialog from './CreateTeamDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function TeamSwitcher() {
  const [createOpen, setCreateOpen] = useState(false);
  const { data: teams = [], isLoading } = useMyTeams();
  const { currentTeamId, currentTeamName, setCurrentTeam } = useTeamStore();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="px-3 py-2">
        <div className="h-8 bg-muted/40 rounded-[var(--radius-sm)] animate-pulse" />
      </div>
    );
  }

  return (
    <>
      <div className="px-3 py-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center justify-between w-full px-3 py-2 text-sm rounded-[var(--radius-sm)] border border-border bg-muted/30 hover:bg-muted/60 transition-colors cursor-pointer text-left">
              <span className="truncate text-foreground/90 font-medium">
                {currentTeamName ?? 'チームを選択'}
              </span>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0 ml-2" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-52 bg-popover border-border">
            {teams.map((team) => (
              <DropdownMenuItem
                key={team.id}
                onClick={() => {
                  if (team.id !== currentTeamId) {
                    setCurrentTeam(team.id, team.name);
                    navigate('/dashboard');
                  }
                }}
                className={`cursor-pointer ${
                  team.id === currentTeamId
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-foreground/80 hover:text-foreground focus:text-foreground'
                }`}
              >
                <Users className="mr-2 h-4 w-4 shrink-0" />
                <span className="truncate">{team.name}</span>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator className="bg-muted" />
            <DropdownMenuItem
              onClick={() => setCreateOpen(true)}
              className="text-foreground/80 hover:text-foreground focus:text-foreground cursor-pointer"
            >
              <Plus className="mr-2 h-4 w-4" />
              チームを作成
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <CreateTeamDialog open={createOpen} onOpenChange={setCreateOpen} />
    </>
  );
}
