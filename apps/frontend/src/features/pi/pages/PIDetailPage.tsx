import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Plus, ChevronRight, Trash2 } from 'lucide-react';
import * as Tabs from '@radix-ui/react-tabs';
import * as Progress from '@radix-ui/react-progress';
import {
  useIncrement,
  useLongTermGoals,
  useCreateLongTermGoal,
  useUpdateLongTermGoal,
  useDeleteLongTermGoal,
  useDeleteIncrement,
  useProgressData,
  useCreateSprintGoal,
  useUpdateSprintGoal,
  useHierarchyData,
} from '@/features/goals/hooks/useGoals';
import { useSprints, useCreateSprint } from '@/features/sprints/hooks/useSprints';
import { LongTermGoal, SprintGoal } from '@/features/goals/types';
import type { Sprint } from '@/features/sprints/types';
import PIGoalAccordion from '../components/PIGoalAccordion';
import SprintCardInline from '../components/SprintCardInline';
import { GoalForm } from '@/features/goals/components/GoalForm';
import SprintForm from '@/features/sprints/components/SprintForm';
import GoalTree from '@/features/goals/components/GoalTree';
import GoalMatrix from '@/features/goals/components/GoalMatrix';
import { useTerms } from '@/hooks/useTerms';

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('ja-JP', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

function statusColor(status: string) {
  switch (status) {
    case 'ACHIEVED': return 'bg-emerald-500';
    case 'IN_PROGRESS': return 'bg-blue-500';
    case 'NOT_STARTED': return 'bg-muted-foreground/40';
    case 'NOT_ACHIEVED': return 'bg-red-500';
    case 'PARTIALLY_ACHIEVED': return 'bg-amber-500';
    default: return 'bg-muted-foreground/40';
  }
}

function statusBadgeClass(status: string) {
  switch (status) {
    case 'ACHIEVED': return 'bg-emerald-500/10 text-emerald-400';
    case 'IN_PROGRESS': return 'bg-blue-500/10 text-blue-400';
    case 'NOT_STARTED': return 'bg-muted text-muted-foreground';
    case 'NOT_ACHIEVED': return 'bg-red-500/10 text-red-400';
    case 'PARTIALLY_ACHIEVED': return 'bg-amber-500/10 text-amber-300';
    default: return 'bg-muted text-muted-foreground';
  }
}

function statusLabel(status: string) {
  switch (status) {
    case 'ACHIEVED': return '達成';
    case 'IN_PROGRESS': return '進行中';
    case 'NOT_STARTED': return '未着手';
    case 'NOT_ACHIEVED': return '未達成';
    case 'PARTIALLY_ACHIEVED': return '部分達成';
    default: return status;
  }
}

const tabTriggerClass =
  'px-4 py-2 text-sm font-medium text-muted-foreground data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary -mb-px cursor-pointer';

export default function PIDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const t = useTerms();

  const { data: increment, isLoading: incrementLoading } = useIncrement(id ?? '');
  const { data: goals = [], isLoading: goalsLoading } = useLongTermGoals(id ?? '');
  const { data: progressData = [] } = useProgressData(id ?? '');
  const { data: hierarchyData } = useHierarchyData(id ?? '');
  const { data: allSprints = [] } = useSprints();
  const piSprints = allSprints
    .filter((s) => s.incrementId === id)
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

  // PIゴール mutations
  const createGoal = useCreateLongTermGoal();
  const updateGoal = useUpdateLongTermGoal();
  const deleteGoal = useDeleteLongTermGoal();
  const deleteIncrement = useDeleteIncrement();

  // スプリント mutations
  const createSprint = useCreateSprint();

  // PIゴールフォーム state
  const [goalFormOpen, setGoalFormOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<LongTermGoal | undefined>(undefined);


  // スプリントフォーム state
  const [sprintFormOpen, setSprintFormOpen] = useState(false);

  // 全スプリントのITゴールを集約して取得
  // PIDetailPageではPIゴールに紐づくITゴールを表示するため、全スプリントのゴールが必要
  // 個別のスプリントIDではなく、goals APIのLongTermGoalに含まれるsprintGoalsを使用
  const allSprintGoals: SprintGoal[] = goals.flatMap((g) => g.sprintGoals ?? []);

  // ITゴール mutations
  const createSprintGoal = useCreateSprintGoal();
  const updateSprintGoal = useUpdateSprintGoal();

  // PIゴール handlers
  const handleCreateGoal = (data: Partial<LongTermGoal>) => {
    if (!id) return;
    createGoal.mutate(
      { incrementId: id, data },
      { onSuccess: () => setGoalFormOpen(false) }
    );
  };

  const handleUpdateGoal = (data: Partial<LongTermGoal>) => {
    if (!id || !editingGoal) return;
    updateGoal.mutate(
      { incrementId: id, goalId: editingGoal.id, data },
      { onSuccess: () => { setGoalFormOpen(false); setEditingGoal(undefined); } }
    );
  };

  const handleDeleteGoal = (goal: LongTermGoal) => {
    if (!id) return;
    if (!window.confirm(`「${goal.title}」を削除しますか？`)) return;
    deleteGoal.mutate({ incrementId: id, goalId: goal.id });
  };

  const handleEditGoal = (goal: LongTermGoal) => {
    setEditingGoal(goal);
    setGoalFormOpen(true);
  };

  // ITゴール handlers（インラインスロットから呼ばれる）
  const handleInlineCreateITGoal = (sprintId: string, longTermGoalId: string, title: string) => {
    createSprintGoal.mutate(
      { sprintId, data: { title, longTermGoalId } },
      {
        onSuccess: () => {
          // longTermGoals を再取得してスロット表示を更新
        },
      }
    );
  };

  const handleInlineUpdateITGoal = (sprintId: string, goalId: string, data: Partial<SprintGoal>) => {
    updateSprintGoal.mutate({ sprintId, goalId, data });
  };


  // スプリント handlers
  const handleCreateSprint = (data: Partial<Sprint>) => {
    createSprint.mutate(
      { ...data, incrementId: id },
      { onSuccess: () => setSprintFormOpen(false) }
    );
  };

  if (incrementLoading) {
    return <div className="p-6 text-center text-muted-foreground">読み込み中...</div>;
  }

  if (!increment) {
    return <div className="p-6 text-center text-muted-foreground">{t('increment')}が見つかりません</div>;
  }

  return (
    <div className="px-4 py-4 md:p-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
        <Link to="/pi" className="hover:text-foreground cursor-pointer">{t('increment')}管理</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground font-medium">{increment.name}</span>
      </nav>

      {/* PI Info */}
      <div className="bg-card border border-border rounded-[var(--radius-md)] p-4 md:p-5 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-1">{increment.name}</h1>
            <p className="text-sm text-muted-foreground tabular-nums">
              {formatDate(increment.startDate)} 〜 {formatDate(increment.endDate)}
            </p>
            {increment.description && (
              <p className="text-sm text-foreground/90 mt-2">{increment.description}</p>
            )}
          </div>
          <button
            onClick={() => {
              if (!window.confirm(`「${increment.name}」を削除しますか？関連するゴール・スプリントも全て削除されます。`)) return;
              deleteIncrement.mutate(increment.id, {
                onSuccess: () => navigate('/pi'),
              });
            }}
            disabled={deleteIncrement.isPending}
            className="flex items-center gap-2 px-3 py-2 text-sm border border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-[var(--radius-md)] cursor-pointer disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
            削除
          </button>
        </div>
      </div>

      {/* 4 Tabs */}
      <Tabs.Root defaultValue="goals">
        <Tabs.List className="flex border-b border-border mb-6 overflow-x-auto">
          <Tabs.Trigger value="goals" className={tabTriggerClass}>{t('longTermGoal')}</Tabs.Trigger>
          <Tabs.Trigger value="sprints" className={tabTriggerClass}>{t('sprint')}</Tabs.Trigger>
          <Tabs.Trigger value="progress" className={tabTriggerClass}>進捗</Tabs.Trigger>
          <Tabs.Trigger value="hierarchy" className={tabTriggerClass}>階層ビュー</Tabs.Trigger>
        </Tabs.List>

        {/* Tab 1: PIゴール */}
        <Tabs.Content value="goals">
          <div className="flex justify-end mb-4">
            <button
              onClick={() => { setEditingGoal(undefined); setGoalFormOpen(true); }}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-[var(--radius-md)] hover:bg-primary/90 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              {t('longTermGoal')}追加
            </button>
          </div>

          {goalsLoading ? (
            <div className="text-center py-8 text-muted-foreground">読み込み中...</div>
          ) : goals.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>{t('longTermGoal')}がありません</p>
              <p className="text-sm mt-1">「{t('longTermGoal')}追加」から作成してください</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {goals.map((goal) => (
                <PIGoalAccordion
                  key={goal.id}
                  goal={goal}
                  sprintGoals={allSprintGoals}
                  sprints={piSprints.map((s) => ({ id: s.id, name: s.name }))}
                  onEditGoal={handleEditGoal}
                  onDeleteGoal={handleDeleteGoal}
                  onCreateITGoal={handleInlineCreateITGoal}
                  onUpdateITGoal={handleInlineUpdateITGoal}
                />
              ))}
            </div>
          )}
        </Tabs.Content>

        {/* Tab 2: スプリント */}
        <Tabs.Content value="sprints">
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setSprintFormOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-[var(--radius-md)] hover:bg-primary/90 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              {t('sprint')}作成
            </button>
          </div>

          {piSprints.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>{t('sprint')}がありません</p>
              <p className="text-sm mt-1">「{t('sprint')}作成」から追加してください</p>
            </div>
          ) : (
            <div className="space-y-3">
              {piSprints.map((sprint) => (
                <SprintCardInline key={sprint.id} sprint={sprint} piId={id!} />
              ))}
            </div>
          )}
        </Tabs.Content>

        {/* Tab 3: 進捗 */}
        <Tabs.Content value="progress">
          {progressData.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">進捗データがありません</div>
          ) : (
            <div className="space-y-6">
              {progressData.map((item) => (
                <div key={item.longTermGoalId} className="bg-card border border-border rounded-[var(--radius-md)] p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-foreground">{item.title}</h3>
                      <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full ${statusBadgeClass(item.status)}`}>
                        {statusLabel(item.status)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-foreground tabular-nums">{item.progressRate}%</span>
                      <p className="text-xs text-muted-foreground mt-0.5 tabular-nums">
                        {item.achievedSprintGoals} / {item.totalSprintGoals} 達成
                      </p>
                    </div>
                  </div>

                  <Progress.Root
                    value={item.progressRate}
                    className="relative overflow-hidden bg-muted rounded-full h-3"
                  >
                    <Progress.Indicator
                      className={`h-full rounded-full transition-all ${statusColor(item.status)}`}
                      style={{ width: `${item.progressRate}%` }}
                    />
                  </Progress.Root>
                </div>
              ))}
            </div>
          )}
        </Tabs.Content>

        {/* Tab 4: 階層ビュー */}
        <Tabs.Content value="hierarchy">
          <Tabs.Root defaultValue="tree">
            <Tabs.List className="flex border-b border-border mb-4">
              <Tabs.Trigger value="tree" className={tabTriggerClass}>ツリービュー</Tabs.Trigger>
              <Tabs.Trigger value="matrix" className={tabTriggerClass}>マトリクスビュー</Tabs.Trigger>
            </Tabs.List>
            <Tabs.Content value="tree">
              {hierarchyData ? (
                <GoalTree data={hierarchyData} />
              ) : (
                <div className="text-center py-12 text-muted-foreground">データがありません</div>
              )}
            </Tabs.Content>
            <Tabs.Content value="matrix">
              {increment ? (
                <GoalMatrix increment={increment} />
              ) : (
                <div className="text-center py-12 text-muted-foreground">データがありません</div>
              )}
            </Tabs.Content>
          </Tabs.Root>
        </Tabs.Content>
      </Tabs.Root>

      {/* PIゴールフォーム */}
      <GoalForm
        open={goalFormOpen}
        onClose={() => { setGoalFormOpen(false); setEditingGoal(undefined); }}
        goal={editingGoal}
        onSubmit={editingGoal ? handleUpdateGoal : handleCreateGoal}
        isLoading={createGoal.isPending || updateGoal.isPending}
      />

      {/* スプリントフォーム */}
      <SprintForm
        open={sprintFormOpen}
        onOpenChange={setSprintFormOpen}
        onSubmit={handleCreateSprint}
        initialValues={{ incrementId: id }}
        isLoading={createSprint.isPending}
      />
    </div>
  );
}
