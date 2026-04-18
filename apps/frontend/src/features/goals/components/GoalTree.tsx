import * as Accordion from '@radix-ui/react-accordion';
import { ChevronDown, Ticket } from 'lucide-react';
import { HierarchyData, SprintGoal } from '../types';
import LongTermGoalCard from './LongTermGoalCard';
import SprintGoalCard from './SprintGoalCard';
import { useTerms } from '@/hooks/useTerms';

type SprintGoalWithCount = SprintGoal & { ticketCount: number };

interface GoalTreeProps {
  data: HierarchyData;
}

export default function GoalTree({ data }: GoalTreeProps) {
  const t = useTerms();

  if (data.longTermGoals.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        {t('longTermGoal')}がありません
      </div>
    );
  }

  return (
    <Accordion.Root type="multiple" className="space-y-3">
      {data.longTermGoals.map((goal) => (
        <Accordion.Item
          key={goal.id}
          value={goal.id}
          className="border border-border rounded-[var(--radius-md)] overflow-hidden"
        >
          <Accordion.Header>
            <Accordion.Trigger className="w-full text-left group cursor-pointer">
              <div className="flex items-center gap-2 p-1">
                <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180 shrink-0" />
                <div className="flex-1">
                  <LongTermGoalCard goal={goal} />
                </div>
              </div>
            </Accordion.Trigger>
          </Accordion.Header>

          <Accordion.Content className="data-[state=open]:animate-none">
            {goal.sprintGoals.length === 0 ? (
              <div className="px-8 py-4 text-sm text-muted-foreground italic border-t border-border">
                {t('sprintGoal')}なし
              </div>
            ) : (
              <Accordion.Root type="multiple" className="border-t border-border">
                {(goal.sprintGoals as SprintGoalWithCount[]).map((sg) => (
                  <Accordion.Item
                    key={sg.id}
                    value={sg.id}
                    className="border-b border-border last:border-b-0"
                  >
                    <Accordion.Header>
                      <Accordion.Trigger className="w-full text-left group cursor-pointer">
                        <div className="flex items-center gap-2 px-8 py-2">
                          <ChevronDown className="h-3 w-3 text-muted-foreground transition-transform group-data-[state=open]:rotate-180 shrink-0" />
                          <div className="flex-1">
                            <SprintGoalCard goal={sg} />
                          </div>
                        </div>
                      </Accordion.Trigger>
                    </Accordion.Header>

                    <Accordion.Content className="data-[state=open]:animate-none">
                      <div className="px-16 py-3 bg-card">
                        <div className="flex items-center gap-2 text-sm text-foreground/90">
                          <Ticket className="h-4 w-4" />
                          <span>チケット: <span className="tabular-nums">{sg.ticketCount}</span>件</span>
                        </div>
                      </div>
                    </Accordion.Content>
                  </Accordion.Item>
                ))}
              </Accordion.Root>
            )}
          </Accordion.Content>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  );
}
