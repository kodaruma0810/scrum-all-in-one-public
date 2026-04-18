import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useActiveWARules } from '../hooks/useWorkingAgreements';

export default function WAShareViewPage() {
  const { data, isLoading } = useActiveWARules();
  const categories = data?.categories ?? [];
  const uncategorizedRules = data?.uncategorizedRules ?? [];
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="px-4 py-6 md:p-8 max-w-2xl mx-auto animate-pulse space-y-6">
        <div className="h-8 bg-muted rounded w-64" />
        <div className="h-32 bg-muted rounded" />
        <div className="h-32 bg-muted rounded" />
      </div>
    );
  }

  const hasContent = categories.length > 0 || uncategorizedRules.length > 0;

  return (
    <div className="px-4 py-6 md:p-8 max-w-2xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">ワーキングアグリーメント</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            現在有効なチームルール一覧
          </p>
        </div>
        <button
          onClick={() => navigate('/working-agreements')}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm border border-border text-muted-foreground rounded-[var(--radius-md)] hover:text-foreground cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          管理画面へ
        </button>
      </div>

      {!hasContent ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-sm">有効なルールがありません。</p>
        </div>
      ) : (
        <div className="space-y-6">
          {categories.map((cat) => (
            <section key={cat.id}>
              <h2 className="text-base font-semibold text-foreground/90 border-b border-border pb-2 mb-3">
                {cat.name}
              </h2>
              <ul className="space-y-2">
                {cat.rules.map((rule) => (
                  <li key={rule.id} className="flex gap-3 items-start">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm text-foreground">{rule.title}</p>
                      {rule.description && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {rule.description}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
          {uncategorizedRules.length > 0 && (
            <section>
              <h2 className="text-base font-semibold text-muted-foreground/70 border-b border-border border-dashed pb-2 mb-3">
                未分類
              </h2>
              <ul className="space-y-2">
                {uncategorizedRules.map((rule) => (
                  <li key={rule.id} className="flex gap-3 items-start">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm text-foreground">{rule.title}</p>
                      {rule.description && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {rule.description}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
