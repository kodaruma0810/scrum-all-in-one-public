import { useParams } from 'react-router-dom';
import { useRetro } from '../hooks/useRetrospectives';
import RetroBoardPage from './RetroBoardPage';
import RetroWhiteboardPage from './RetroWhiteboardPage';

export default function RetroDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: retro, isLoading } = useRetro(id ?? null);

  if (isLoading || !retro) {
    return (
      <div className="p-6 max-w-7xl mx-auto animate-pulse space-y-4">
        <div className="h-8 bg-muted rounded w-64" />
        <div className="grid grid-cols-3 gap-4">
          <div className="h-64 bg-muted rounded-[var(--radius-md)]" />
          <div className="h-64 bg-muted rounded-[var(--radius-md)]" />
          <div className="h-64 bg-muted rounded-[var(--radius-md)]" />
        </div>
      </div>
    );
  }

  if (retro.mode === 'BOARD') {
    return <RetroWhiteboardPage />;
  }

  return <RetroBoardPage />;
}
