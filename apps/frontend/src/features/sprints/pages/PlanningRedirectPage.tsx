import { Navigate } from 'react-router-dom';
import { useSprints } from '../hooks/useSprints';
import { ClipboardList } from 'lucide-react';
import { useTerms } from '@/hooks/useTerms';

export default function PlanningRedirectPage() {
  const t = useTerms();
  const { data: sprints = [], isLoading } = useSprints();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground/70 text-sm">読み込み中...</p>
      </div>
    );
  }

  // ACTIVE があればそのまま、なければ PLANNED で一番古い（startDate昇順）
  const activeSprint = sprints.find((s) => s.status === 'ACTIVE');
  const oldestPlanned = sprints
    .filter((s) => s.status === 'PLANNED')
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())[0];

  const target = activeSprint ?? oldestPlanned;

  if (target) {
    return <Navigate to={`/pi/${target.incrementId}/planning/${target.id}`} replace />;
  }

  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 p-8">
      <ClipboardList className="h-12 w-12 text-muted-foreground/30" />
      <p className="text-muted-foreground text-sm">
        プランニング対象の{t('sprint')}がありません
      </p>
      <p className="text-muted-foreground/50 text-xs">
        {t('increment')}画面から{t('sprint')}を作成してください
      </p>
    </div>
  );
}
