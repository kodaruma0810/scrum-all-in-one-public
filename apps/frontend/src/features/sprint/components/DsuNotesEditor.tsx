import { useState, useEffect } from 'react';
import { useUpdateDsuNotes } from '@/features/dsu/hooks/useDsu';

interface DsuNotesEditorProps {
  dsuLogId: string;
  initialNotes: string;
}

export default function DsuNotesEditor({ dsuLogId, initialNotes }: DsuNotesEditorProps) {
  const [notes, setNotes] = useState(initialNotes);
  const updateNotes = useUpdateDsuNotes();

  useEffect(() => {
    setNotes(initialNotes);
  }, [initialNotes]);

  const handleBlur = () => {
    if (notes !== initialNotes) {
      updateNotes.mutate({ dsuLogId, notes });
    }
  };

  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground/70 uppercase tracking-widest mb-2">
        DSU決定事項・メモ
      </p>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        onBlur={handleBlur}
        placeholder="DSUでの決定事項やメモを記録..."
        rows={4}
        className="w-full bg-muted/40 border border-border rounded-[var(--radius-sm)] px-3 py-2 text-sm text-foreground/90 placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/30 resize-none"
      />
      {updateNotes.isPending && (
        <p className="text-xs text-muted-foreground/50 mt-1">保存中...</p>
      )}
    </div>
  );
}
