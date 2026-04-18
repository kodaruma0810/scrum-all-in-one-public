import { useState } from 'react';
import {
  Plus,
  Edit3,
  Trash2,
  History,
  ChevronDown,
  ChevronRight,
  Eye,
  ToggleLeft,
  ToggleRight,
  FolderPlus,
} from 'lucide-react';
import {
  useWAList,
  useCreateWACategory,
  useUpdateWACategory,
  useDeleteWACategory,
  useCreateWARule,
  useUpdateWARule,
  useToggleWARule,
} from '../hooks/useWorkingAgreements';
import WACategoryDialog from '../components/WACategoryDialog';
import WARuleDialog from '../components/WARuleDialog';
import WAHistoryDialog from '../components/WAHistoryDialog';
import type { WARule } from '../types';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

export default function WorkingAgreementsPage() {
  const { data, isLoading } = useWAList();
  const categories = data?.categories ?? [];
  const uncategorizedRules = data?.uncategorizedRules ?? [];
  const navigate = useNavigate();

  // Category dialog state
  const [catDialogOpen, setCatDialogOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<{ id: string; name: string } | null>(null);
  const createCat = useCreateWACategory();
  const updateCat = useUpdateWACategory();
  const deleteCat = useDeleteWACategory();

  // Rule dialog state
  const [ruleDialogOpen, setRuleDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<WARule | null>(null);
  const [defaultCategoryId, setDefaultCategoryId] = useState<string | null>(null);
  const createRule = useCreateWARule();
  const updateRule = useUpdateWARule();
  const toggleRule = useToggleWARule();

  // History dialog state
  const [historyRuleId, setHistoryRuleId] = useState<string | null>(null);
  const [historyRuleTitle, setHistoryRuleTitle] = useState('');

  // Collapsed state
  const [collapsedCats, setCollapsedCats] = useState<Set<string>>(new Set());

  // Delete confirmation
  const [deletingCatId, setDeletingCatId] = useState<string | null>(null);

  function toggleCollapsed(catId: string) {
    setCollapsedCats((prev) => {
      const next = new Set(prev);
      if (next.has(catId)) next.delete(catId);
      else next.add(catId);
      return next;
    });
  }

  function handleCreateCategory(data: { name: string }) {
    createCat.mutate(data, {
      onSuccess: () => setCatDialogOpen(false),
    });
  }

  function handleUpdateCategory(data: { name: string }) {
    if (!editingCat) return;
    updateCat.mutate(
      { id: editingCat.id, name: data.name },
      { onSuccess: () => setEditingCat(null) }
    );
  }

  function handleDeleteCategory(id: string) {
    deleteCat.mutate(id, {
      onSuccess: () => setDeletingCatId(null),
    });
  }

  function handleCreateRule(data: {
    title: string;
    description?: string;
    agreedAt: string;
    proposedById: string;
    categoryId?: string | null;
  }) {
    createRule.mutate(
      { ...data, categoryId: data.categoryId ?? null },
      { onSuccess: () => setRuleDialogOpen(false) }
    );
  }

  function handleUpdateRule(data: {
    title: string;
    description?: string;
    agreedAt: string;
    proposedById: string;
    categoryId?: string | null;
  }) {
    if (!editingRule) return;
    updateRule.mutate(
      {
        id: editingRule.id,
        title: data.title,
        description: data.description ?? null,
        agreedAt: data.agreedAt,
        categoryId: data.categoryId,
      },
      { onSuccess: () => setEditingRule(null) }
    );
  }

  function handleToggle(rule: WARule) {
    toggleRule.mutate({ id: rule.id, isActive: !rule.isActive });
  }

  function renderRule(rule: WARule) {
    return (
      <div
        key={rule.id}
        className={cn(
          'flex items-start justify-between px-4 py-3 gap-3',
          !rule.isActive && 'opacity-50'
        )}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p
              className={cn(
                'text-sm font-medium',
                rule.isActive ? 'text-foreground' : 'text-muted-foreground line-through'
              )}
            >
              {rule.title}
            </p>
            {!rule.isActive && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                無効
              </span>
            )}
          </div>
          {rule.description && (
            <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
              {rule.description}
            </p>
          )}
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground/60">
            <span>合意日: {new Date(rule.agreedAt).toLocaleDateString('ja-JP')}</span>
            <span>提案: {rule.proposedByName}</span>
            <span>更新: {rule.lastModifiedByName}</span>
          </div>
        </div>
        <div className="flex items-center gap-0.5 shrink-0">
          <button
            onClick={() => handleToggle(rule)}
            disabled={toggleRule.isPending}
            className={cn(
              'p-1.5 rounded-[var(--radius-sm)] transition-colors cursor-pointer',
              rule.isActive
                ? 'text-emerald-400 hover:text-emerald-300'
                : 'text-muted-foreground hover:text-emerald-400'
            )}
            title={rule.isActive ? '無効にする' : '有効にする'}
          >
            {rule.isActive ? (
              <ToggleRight className="h-4 w-4" />
            ) : (
              <ToggleLeft className="h-4 w-4" />
            )}
          </button>
          <button
            onClick={() => {
              setEditingRule(rule);
              setRuleDialogOpen(true);
            }}
            className="p-1.5 text-muted-foreground hover:text-foreground rounded-[var(--radius-sm)] transition-colors cursor-pointer"
            title="編集"
          >
            <Edit3 className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => {
              setHistoryRuleId(rule.id);
              setHistoryRuleTitle(rule.title);
            }}
            className="p-1.5 text-muted-foreground hover:text-foreground rounded-[var(--radius-sm)] transition-colors cursor-pointer"
            title="変更履歴"
          >
            <History className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-64" />
          <div className="h-48 bg-muted rounded-[var(--radius-md)]" />
          <div className="h-48 bg-muted rounded-[var(--radius-md)]" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">ワーキングアグリーメント</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            チームのルールや合意事項を管理します。
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => navigate('/working-agreements/share')}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm border border-border text-muted-foreground rounded-[var(--radius-md)] hover:text-foreground hover:bg-muted/40 cursor-pointer"
          >
            <Eye className="h-4 w-4" />
            共有ビュー
          </button>
          <button
            onClick={() => {
              setEditingCat(null);
              setCatDialogOpen(true);
            }}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm border border-border text-muted-foreground rounded-[var(--radius-md)] hover:text-foreground hover:bg-muted/40 cursor-pointer"
          >
            <FolderPlus className="h-4 w-4" />
            カテゴリ追加
          </button>
          <button
            onClick={() => {
              setEditingRule(null);
              setDefaultCategoryId(null);
              setRuleDialogOpen(true);
            }}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-primary text-primary-foreground rounded-[var(--radius-md)] hover:bg-primary/90 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            ルール追加
          </button>
        </div>
      </div>

      {/* Categories */}
      {categories.length === 0 && uncategorizedRules.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-sm">ルールがまだありません。「ルール追加」から始めましょう。</p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Categorized rules */}
          {categories.map((cat) => {
            const isCollapsed = collapsedCats.has(cat.id);
            const activeCount = cat.rules.filter((r) => r.isActive).length;
            return (
              <div
                key={cat.id}
                className="rounded-[var(--radius-md)] border border-border bg-card overflow-hidden"
              >
                {/* Category header */}
                <div className="flex items-center justify-between px-4 py-3 bg-muted/30">
                  <button
                    onClick={() => toggleCollapsed(cat.id)}
                    className="flex items-center gap-2 text-sm font-semibold text-foreground cursor-pointer hover:text-primary transition-colors"
                  >
                    {isCollapsed ? (
                      <ChevronRight className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                    {cat.name}
                    <span className="text-xs font-normal text-muted-foreground">
                      ({activeCount}/{cat.rules.length})
                    </span>
                  </button>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingRule(null);
                        setDefaultCategoryId(cat.id);
                        setRuleDialogOpen(true);
                      }}
                      className="p-1.5 text-muted-foreground hover:text-primary rounded-[var(--radius-sm)] transition-colors cursor-pointer"
                      title="ルールを追加"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        setEditingCat(cat);
                        setCatDialogOpen(true);
                      }}
                      className="p-1.5 text-muted-foreground hover:text-foreground rounded-[var(--radius-sm)] transition-colors cursor-pointer"
                      title="カテゴリ名を編集"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                    {deletingCatId === cat.id ? (
                      <div className="flex items-center gap-1 ml-1">
                        <button
                          onClick={() => handleDeleteCategory(cat.id)}
                          disabled={deleteCat.isPending}
                          className="px-2 py-1 text-xs bg-red-500 text-white rounded-[var(--radius-sm)] hover:bg-red-600 cursor-pointer disabled:opacity-50"
                        >
                          削除
                        </button>
                        <button
                          onClick={() => setDeletingCatId(null)}
                          className="px-2 py-1 text-xs border border-border text-muted-foreground rounded-[var(--radius-sm)] hover:text-foreground cursor-pointer"
                        >
                          取消
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeletingCatId(cat.id)}
                        className="p-1.5 text-muted-foreground hover:text-red-400 rounded-[var(--radius-sm)] transition-colors cursor-pointer"
                        title="カテゴリを削除"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Rules */}
                {!isCollapsed && (
                  <div className="divide-y divide-border">
                    {cat.rules.length === 0 ? (
                      <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                        ルールがまだありません
                      </div>
                    ) : (
                      cat.rules.map(renderRule)
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Uncategorized rules */}
          {uncategorizedRules.length > 0 && (
            <div className="rounded-[var(--radius-md)] border border-border border-dashed bg-card overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 bg-muted/20">
                <button
                  onClick={() => toggleCollapsed('__uncategorized__')}
                  className="flex items-center gap-2 text-sm font-semibold text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                >
                  {collapsedCats.has('__uncategorized__') ? (
                    <ChevronRight className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                  未分類
                  <span className="text-xs font-normal">
                    ({uncategorizedRules.filter((r) => r.isActive).length}/{uncategorizedRules.length})
                  </span>
                </button>
              </div>
              {!collapsedCats.has('__uncategorized__') && (
                <div className="divide-y divide-border">
                  {uncategorizedRules.map(renderRule)}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Dialogs */}
      <WACategoryDialog
        open={catDialogOpen || editingCat !== null}
        onClose={() => {
          setCatDialogOpen(false);
          setEditingCat(null);
        }}
        onSubmit={editingCat ? handleUpdateCategory : handleCreateCategory}
        isPending={createCat.isPending || updateCat.isPending}
        initial={editingCat ? { name: editingCat.name } : undefined}
      />

      <WARuleDialog
        open={ruleDialogOpen || editingRule !== null}
        onClose={() => {
          setRuleDialogOpen(false);
          setEditingRule(null);
        }}
        onSubmit={editingRule ? handleUpdateRule : handleCreateRule}
        isPending={createRule.isPending || updateRule.isPending}
        categories={categories}
        defaultCategoryId={defaultCategoryId}
        initial={
          editingRule
            ? {
                title: editingRule.title,
                description: editingRule.description,
                agreedAt: editingRule.agreedAt,
                proposedById: editingRule.proposedById,
                categoryId: editingRule.categoryId,
              }
            : undefined
        }
      />

      <WAHistoryDialog
        open={historyRuleId !== null}
        onClose={() => setHistoryRuleId(null)}
        ruleId={historyRuleId}
        ruleTitle={historyRuleTitle}
      />
    </div>
  );
}
