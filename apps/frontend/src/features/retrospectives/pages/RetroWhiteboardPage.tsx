import { useState, useRef, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Plus, ThumbsUp, Trash2, Edit3, Check, X,
  CheckCircle2, Circle, Users, Type, ZoomIn, ZoomOut, Maximize2, FileText,
} from 'lucide-react';
import {
  useRetro, useAddRetroItem, useUpdateRetroItem, useDeleteRetroItem,
  useToggleRetroVote, useAddRetroAction, useUpdateRetroAction, useDeleteRetroAction,
} from '../hooks/useRetrospectives';
import { useTeamMembers } from '@/features/teams/hooks/useTeams';
import { useTeamStore } from '@/lib/teamStore';
import type { RetroItem } from '../types';
import { cn } from '@/lib/utils';
import { getFormatDef, type RetroZoneDef } from '../retroFormats';

// --- Canvas constants ---
const CANVAS_W = 2400;
const CANVAS_H = 1600;
const STICKY_W = 160;
const STICKY_H = 120;
const ZONE_PADDING = 60;
const ZONE_TOP = 80;
const ZONE_H = 1440;

interface CanvasZone extends RetroZoneDef { x: number; y: number; w: number; h: number; }

function buildZones(zones: RetroZoneDef[]): CanvasZone[] {
  const count = zones.length;
  const totalGap = ZONE_PADDING * (count + 1);
  const zoneW = Math.floor((CANVAS_W - totalGap) / count);
  return zones.map((z, i) => ({
    ...z,
    x: ZONE_PADDING + i * (zoneW + ZONE_PADDING),
    y: ZONE_TOP,
    w: zoneW,
    h: ZONE_H,
  }));
}

function pickColor(zoneDef: RetroZoneDef, id: string) {
  const h = id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return zoneDef.stickyColors[h % zoneDef.stickyColors.length];
}
function pickRotation(id: string) {
  const h = id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return (h % 7) - 3;
}

function detectZone(cx: number, cy: number, zones: CanvasZone[]): string | null {
  for (const z of zones) {
    if (cx >= z.x && cx <= z.x + z.w && cy >= z.y && cy <= z.y + z.h) return z.type;
  }
  return null;
}

function defaultPos(type: string, count: number, zones: CanvasZone[]): { x: number; y: number } {
  const z = zones.find((z) => z.type === type) ?? zones[0];
  const col = count % 4;
  const row = Math.floor(count / 4);
  return { x: z.x + 30 + col * (STICKY_W + 10), y: z.y + 50 + row * (STICKY_H + 10) };
}

const FONT_SIZES = [10, 12, 14, 16, 18, 20, 24];
const FONT_COLORS = ['#e2e8f0', '#fca5a5', '#93c5fd', '#86efac', '#c4b5fd', '#fdba74', '#94a3b8'];

export default function RetroWhiteboardPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: retro, isLoading } = useRetro(id ?? null, { polling: true });
  const currentTeamId = useTeamStore((s) => s.currentTeamId);
  const { data: members = [] } = useTeamMembers(currentTeamId);

  const addItem = useAddRetroItem();
  const updateItem = useUpdateRetroItem();
  const deleteItem = useDeleteRetroItem();
  const toggleVote = useToggleRetroVote();
  const addAction = useAddRetroAction();
  const updateAction = useUpdateRetroAction();
  const deleteAction = useDeleteRetroAction();

  // Format zones
  const formatDef = useMemo(() => retro ? getFormatDef(retro.format) : null, [retro?.format]);
  const zones = useMemo(() => formatDef ? buildZones(formatDef.zones) : [], [formatDef]);

  // View mode
  const [textView, setTextView] = useState(false);

  // Canvas zoom / pan
  const [zoom, setZoom] = useState(0.55);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const viewportRef = useRef<HTMLDivElement>(null);

  // Sticky drag
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const dragOffset = useRef({ x: 0, y: 0 });

  // Edit / style
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [styleMenuId, setStyleMenuId] = useState<string | null>(null);

  // New item
  const [addingZone, setAddingZone] = useState<string | null>(null);
  const [newText, setNewText] = useState('');

  // Actions
  const [newActionTitle, setNewActionTitle] = useState('');
  const [newActionAssignee, setNewActionAssignee] = useState('');

  // --- Zoom ---
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setZoom((z) => Math.max(0.2, Math.min(1.5, z - e.deltaY * 0.001)));
  }, []);

  const zoomTo = (level: number) => setZoom(Math.max(0.2, Math.min(1.5, level)));
  const fitView = () => { setZoom(0.55); setPan({ x: 0, y: 0 }); };

  // --- Pan (middle-click or empty area drag) ---
  const handleViewportPointerDown = useCallback((e: React.PointerEvent) => {
    // Only pan if clicking on the canvas background (not a sticky)
    if ((e.target as HTMLElement).dataset.canvas !== 'true') return;
    setIsPanning(true);
    panStart.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [pan]);

  const handleViewportPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isPanning) return;
    setPan({
      x: panStart.current.panX + (e.clientX - panStart.current.x),
      y: panStart.current.panY + (e.clientY - panStart.current.y),
    });
  }, [isPanning]);

  const handleViewportPointerUp = useCallback(() => { setIsPanning(false); }, []);

  // --- Sticky drag ---
  const handleStickyPointerDown = useCallback((e: React.PointerEvent, item: RetroItem) => {
    if (editingItemId || styleMenuId) return;
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    dragOffset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    setDraggingId(item.id);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }, [editingItemId, styleMenuId]);

  const handleStickyPointerMove = useCallback((e: React.PointerEvent, item: RetroItem) => {
    if (draggingId !== item.id || !viewportRef.current) return;
    const vpRect = viewportRef.current.getBoundingClientRect();
    const canvasX = (e.clientX - vpRect.left - pan.x - dragOffset.current.x * zoom) / zoom;
    const canvasY = (e.clientY - vpRect.top - pan.y - dragOffset.current.y * zoom) / zoom;
    const el = e.currentTarget as HTMLElement;
    el.style.left = `${canvasX}px`;
    el.style.top = `${canvasY}px`;
  }, [draggingId, pan, zoom]);

  const handleStickyPointerUp = useCallback((e: React.PointerEvent, item: RetroItem) => {
    if (draggingId !== item.id || !viewportRef.current) { setDraggingId(null); return; }
    const vpRect = viewportRef.current.getBoundingClientRect();
    const canvasX = Math.max(0, (e.clientX - vpRect.left - pan.x - dragOffset.current.x * zoom) / zoom);
    const canvasY = Math.max(0, (e.clientY - vpRect.top - pan.y - dragOffset.current.y * zoom) / zoom);
    setDraggingId(null);

    // Detect zone → auto-classify
    const centerX = canvasX + STICKY_W / 2;
    const centerY = canvasY + STICKY_H / 2;
    const newType = detectZone(centerX, centerY, zones);
    const updates: Record<string, unknown> = { id: item.id, posX: Math.round(canvasX), posY: Math.round(canvasY) };
    if (newType && newType !== item.type) updates.type = newType;
    updateItem.mutate(updates as Parameters<typeof updateItem.mutate>[0]);
  }, [draggingId, pan, zoom, updateItem]);

  // --- Add item to zone ---
  function handleAddItem(type: string) {
    const body = newText.trim();
    if (!body || !id) return;
    const count = retro?.items.filter((i) => i.type === type).length ?? 0;
    const pos = defaultPos(type, count, zones);
    addItem.mutate(
      { retroId: id, type, body },
      {
        onSuccess: (data) => {
          updateItem.mutate({ id: data.id, posX: pos.x, posY: pos.y });
          setNewText('');
          setAddingZone(null);
        },
      }
    );
  }

  function handleSaveEdit(itemId: string) {
    const body = editingText.trim();
    if (!body) return;
    updateItem.mutate({ id: itemId, body }, { onSuccess: () => setEditingItemId(null) });
  }

  function handleAddAction(e: React.FormEvent) {
    e.preventDefault();
    if (!newActionTitle.trim() || !id) return;
    addAction.mutate(
      { retroId: id, title: newActionTitle.trim(), assigneeId: newActionAssignee || null },
      { onSuccess: () => { setNewActionTitle(''); setNewActionAssignee(''); } }
    );
  }

  if (isLoading || !retro) {
    return (
      <div className="p-6 animate-pulse space-y-4">
        <div className="h-8 bg-muted rounded w-64" />
        <div className="h-[70vh] bg-muted/30 rounded-xl" />
      </div>
    );
  }

  // --- Text view ---
  if (textView) {
    const grouped: Record<string, RetroItem[]> = {};
    formatDef!.zones.forEach((z) => { grouped[z.type] = []; });
    retro.items.forEach((i) => { if (grouped[i.type]) grouped[i.type].push(i); });
    return (
      <div className="flex flex-col h-[calc(100vh-3.5rem)] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-card shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setTextView(false)} className="p-1.5 text-muted-foreground hover:text-foreground rounded-[var(--radius-sm)] cursor-pointer">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-base font-bold text-foreground">{retro.title} — テキスト表示</h1>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-8 max-w-3xl mx-auto w-full space-y-8">
          {formatDef!.zones.map(({ type, textLabel, badgeText: color }) => (
            <section key={type}>
              <h2 className={cn('text-lg font-bold border-b pb-2 mb-3', color)}>{textLabel}</h2>
              {grouped[type].length === 0 ? (
                <p className="text-sm text-muted-foreground">項目なし</p>
              ) : (
                <ul className="space-y-2">
                  {grouped[type].sort((a, b) => b.voteCount - a.voteCount).map((item) => (
                    <li key={item.id} className="flex gap-3 items-start">
                      <span className="text-muted-foreground/40 mt-0.5">•</span>
                      <div className="flex-1">
                        <p className="text-sm text-foreground">{item.body}</p>
                        <p className="text-[11px] text-muted-foreground/50 mt-0.5">
                          {item.authorName}{item.voteCount > 0 && ` — 👍 ${item.voteCount}`}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
          {retro.actions.length > 0 && (
            <section>
              <h2 className="text-lg font-bold border-b pb-2 mb-3 text-foreground">アクションアイテム</h2>
              <ul className="space-y-1.5">
                {retro.actions.map((a) => (
                  <li key={a.id} className="flex items-center gap-2 text-sm">
                    {a.status === 'DONE' ? <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" /> : <Circle className="h-4 w-4 text-muted-foreground shrink-0" />}
                    <span className={a.status === 'DONE' ? 'line-through text-muted-foreground' : 'text-foreground'}>{a.title}</span>
                    {a.assigneeName && <span className="text-xs text-muted-foreground/50">({a.assigneeName})</span>}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    );
  }

  // --- Board view ---
  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/retrospectives')} className="p-1.5 text-muted-foreground hover:text-foreground rounded-[var(--radius-sm)] cursor-pointer">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-sm font-bold text-foreground">{retro.title}</h1>
            {(retro.incrementName || retro.sprintName) && (
              <p className="text-[10px] text-muted-foreground">{[retro.incrementName, retro.sprintName].filter(Boolean).join(' / ')}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {/* Zoom controls */}
          <button onClick={() => zoomTo(zoom - 0.1)} className="p-1 text-muted-foreground hover:text-foreground cursor-pointer" title="縮小"><ZoomOut className="h-4 w-4" /></button>
          <span className="text-[10px] text-muted-foreground w-10 text-center font-mono">{Math.round(zoom * 100)}%</span>
          <button onClick={() => zoomTo(zoom + 0.1)} className="p-1 text-muted-foreground hover:text-foreground cursor-pointer" title="拡大"><ZoomIn className="h-4 w-4" /></button>
          <button onClick={fitView} className="p-1 text-muted-foreground hover:text-foreground cursor-pointer" title="全体表示"><Maximize2 className="h-4 w-4" /></button>
          <div className="w-px h-4 bg-border mx-1" />
          <button onClick={() => setTextView(true)} className="inline-flex items-center gap-1 px-2 py-1 text-xs text-muted-foreground hover:text-foreground border border-border rounded-[var(--radius-sm)] cursor-pointer" title="テキスト表示">
            <FileText className="h-3.5 w-3.5" />テキスト
          </button>
          <div className="w-px h-4 bg-border mx-1" />
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />自動更新
          </span>
          <Users className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
      </div>

      {/* Canvas viewport */}
      <div
        ref={viewportRef}
        className="flex-1 overflow-hidden bg-neutral-900 relative"
        onWheel={handleWheel}
        onPointerDown={handleViewportPointerDown}
        onPointerMove={handleViewportPointerMove}
        onPointerUp={handleViewportPointerUp}
        style={{ cursor: isPanning ? 'grabbing' : 'grab' }}
      >
        <div
          data-canvas="true"
          style={{
            width: CANVAS_W, height: CANVAS_H,
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
            position: 'absolute',
          }}
        >
          {/* Grid dots */}
          <svg className="absolute inset-0 pointer-events-none" width={CANVAS_W} height={CANVAS_H}>
            <defs>
              <pattern id="dots" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle cx="20" cy="20" r="1" fill="currentColor" className="text-neutral-700" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dots)" />
          </svg>

          {/* Zones */}
          {zones.map((z) => (
            <div
              key={z.type}
              data-canvas="true"
              style={{ left: z.x, top: z.y, width: z.w, height: z.h, background: z.zoneBg, borderColor: z.zoneBorder }}
              className="absolute rounded-2xl border-2 border-dashed"
            >
              <div className="flex items-center justify-between px-4 pt-3 pb-2" data-canvas="true">
                <span className="text-lg font-bold opacity-60" data-canvas="true">{z.emoji} {z.label}</span>
                <button
                  onClick={() => { setAddingZone(z.type); setNewText(''); }}
                  className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer text-muted-foreground hover:text-foreground"
                  title={`${z.label}に付箋を追加`}
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}

          {/* Sticky notes */}
          {retro.items.map((item) => {
            const isDragging = draggingId === item.id;
            const rot = pickRotation(item.id);
            const zoneDef = zones.find((z) => z.type === item.type) ?? zones[0];
            const bg = pickColor(zoneDef, item.id);
            return (
              <div
                key={item.id}
                onPointerDown={(e) => handleStickyPointerDown(e, item)}
                onPointerMove={(e) => handleStickyPointerMove(e, item)}
                onPointerUp={(e) => handleStickyPointerUp(e, item)}
                style={{
                  left: item.posX, top: item.posY,
                  width: STICKY_W,
                  minHeight: STICKY_H,
                  backgroundColor: bg,
                  transform: isDragging ? 'rotate(0deg) scale(1.08)' : `rotate(${rot}deg)`,
                  fontSize: item.fontSize,
                  color: item.fontColor,
                  touchAction: 'none',
                  zIndex: isDragging ? 1000 : 1,
                }}
                className={cn(
                  'absolute p-3 rounded shadow-md cursor-grab select-none group transition-shadow',
                  isDragging ? 'shadow-2xl cursor-grabbing' : 'hover:shadow-lg'
                )}
              >
                {editingItemId === item.id ? (
                  <div className="space-y-2" onPointerDown={(e) => e.stopPropagation()}>
                    <textarea value={editingText} onChange={(e) => setEditingText(e.target.value)}
                      className="block w-full rounded border border-white/10 bg-black/30 px-2 py-1 text-sm resize-none focus:outline-none"
                      style={{ color: item.fontColor }} rows={3} autoFocus />
                    <div className="flex justify-end gap-1">
                      <button onClick={() => setEditingItemId(null)} className="p-1 text-gray-500 cursor-pointer"><X className="h-3.5 w-3.5" /></button>
                      <button onClick={() => handleSaveEdit(item.id)} className="p-1 text-emerald-700 cursor-pointer"><Check className="h-3.5 w-3.5" /></button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="whitespace-pre-wrap break-words leading-relaxed font-medium">{item.body}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-[9px] opacity-30 font-medium">{item.authorName}</span>
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleVote.mutate(item.id); }}
                        onPointerDown={(e) => e.stopPropagation()}
                        className={cn(
                          'inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[11px] rounded-full cursor-pointer',
                          item.votedByMe ? 'bg-black/10 font-bold' : 'opacity-30 hover:opacity-60'
                        )}
                      >
                        <ThumbsUp className="h-3 w-3" />
                        {item.voteCount > 0 && <span>{item.voteCount}</span>}
                      </button>
                    </div>
                    {/* Hover toolbar */}
                    <div className="absolute -top-3 right-0 opacity-0 group-hover:opacity-100 transition-opacity flex gap-0.5 bg-neutral-800 border border-neutral-600 rounded-full px-1 py-0.5 shadow-lg"
                      onPointerDown={(e) => e.stopPropagation()}>
                      <button onClick={() => { setEditingItemId(item.id); setEditingText(item.body); }} className="p-1 text-neutral-400 hover:text-white cursor-pointer"><Edit3 className="h-3 w-3" /></button>
                      <button onClick={() => setStyleMenuId(styleMenuId === item.id ? null : item.id)} className="p-1 text-neutral-400 hover:text-white cursor-pointer"><Type className="h-3 w-3" /></button>
                      <button onClick={() => deleteItem.mutate(item.id)} className="p-1 text-neutral-400 hover:text-red-400 cursor-pointer"><Trash2 className="h-3 w-3" /></button>
                    </div>
                    {/* Style popup */}
                    {styleMenuId === item.id && (
                      <div className="absolute top-full left-0 mt-1 p-2.5 bg-neutral-800 border border-neutral-600 rounded-lg shadow-xl z-[1001] w-52 space-y-2"
                        onPointerDown={(e) => e.stopPropagation()}>
                        <div>
                          <p className="text-[10px] text-neutral-400 mb-1 font-medium">文字サイズ</p>
                          <div className="flex flex-wrap gap-1">
                            {FONT_SIZES.map((s) => (
                              <button key={s} onClick={() => updateItem.mutate({ id: item.id, fontSize: s })}
                                className={cn('px-1.5 py-0.5 text-[10px] rounded border cursor-pointer',
                                  item.fontSize === s ? 'border-blue-400 bg-blue-500/20 text-blue-300 font-bold' : 'border-neutral-600 text-neutral-400 hover:border-blue-400')}>{s}</button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-[10px] text-neutral-400 mb-1 font-medium">文字色</p>
                          <div className="flex gap-1.5">
                            {FONT_COLORS.map((c) => (
                              <button key={c} onClick={() => updateItem.mutate({ id: item.id, fontColor: c })}
                                className={cn('w-5 h-5 rounded-full border-2 cursor-pointer',
                                  item.fontColor === c ? 'border-blue-400 scale-110' : 'border-transparent hover:border-neutral-500')}
                                style={{ backgroundColor: c }} />
                            ))}
                          </div>
                        </div>
                        <button onClick={() => setStyleMenuId(null)} className="w-full text-center text-[10px] text-neutral-500 hover:text-neutral-300 pt-1 cursor-pointer">閉じる</button>
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}

          {/* Add item dialog (positioned at zone center) */}
          {addingZone && (() => {
            const z = zones.find((z) => z.type === addingZone)!;
            return (
              <div style={{ left: z.x + z.w / 2 - 140, top: z.y + z.h / 2 - 60 }}
                className="absolute z-[1002] w-[280px] p-4 bg-neutral-800 border border-neutral-600 rounded-xl shadow-2xl"
                onPointerDown={(e) => e.stopPropagation()}>
                <p className="text-xs font-bold text-neutral-300 mb-2">{z.emoji} {z.label} に付箋を追加</p>
                <textarea value={newText} onChange={(e) => setNewText(e.target.value)} rows={3} autoFocus
                  placeholder="内容を入力..."
                  className="block w-full rounded border border-neutral-600 bg-neutral-900 px-3 py-2 text-sm text-neutral-200 focus:outline-none focus:border-blue-400 resize-none"
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); handleAddItem(addingZone); } }} />
                <div className="flex justify-end gap-2 mt-2">
                  <button onClick={() => setAddingZone(null)} className="px-3 py-1 text-xs text-neutral-400 hover:text-neutral-200 cursor-pointer">キャンセル</button>
                  <button onClick={() => handleAddItem(addingZone)} disabled={!newText.trim()}
                    className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-40 cursor-pointer">追加</button>
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Action Items */}
      <div className="border-t border-border bg-card shrink-0">
        <details className="group">
          <summary className="px-5 py-2 cursor-pointer text-sm font-bold text-foreground flex items-center gap-2 select-none">
            アクションアイテム
            {retro.actions.length > 0 && <span className="text-xs font-normal text-muted-foreground">({retro.actions.filter((a) => a.status === 'DONE').length}/{retro.actions.length} 完了)</span>}
          </summary>
          <div className="px-5 pb-3 space-y-1.5 max-h-48 overflow-y-auto">
            {retro.actions.map((action) => (
              <div key={action.id} className="flex items-center gap-3 group/action">
                <button onClick={() => updateAction.mutate({ id: action.id, status: action.status === 'DONE' ? 'OPEN' : 'DONE' })} className="cursor-pointer shrink-0">
                  {action.status === 'DONE' ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <Circle className="h-4 w-4 text-muted-foreground hover:text-emerald-400" />}
                </button>
                <span className={cn('flex-1 text-sm', action.status === 'DONE' ? 'line-through text-muted-foreground' : 'text-foreground')}>{action.title}</span>
                {action.assigneeName && <span className="text-xs text-muted-foreground/60">{action.assigneeName}</span>}
                <button onClick={() => deleteAction.mutate(action.id)} className="p-1 text-muted-foreground/30 hover:text-red-400 opacity-0 group-hover/action:opacity-100 cursor-pointer"><Trash2 className="h-3 w-3" /></button>
              </div>
            ))}
            <form onSubmit={handleAddAction} className="flex items-center gap-2 pt-1">
              <input type="text" value={newActionTitle} onChange={(e) => setNewActionTitle(e.target.value)} placeholder="新しいアクション..."
                className="flex-1 rounded border border-border/50 bg-muted/30 px-2.5 py-1 text-sm placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/30" />
              <select value={newActionAssignee} onChange={(e) => setNewActionAssignee(e.target.value)}
                className="w-28 rounded border border-border/50 bg-muted/30 px-2 py-1 text-xs focus:outline-none focus:border-primary/30">
                <option value="">担当なし</option>
                {members.map((m) => <option key={m.userId} value={m.userId}>{m.userName}</option>)}
              </select>
              <button type="submit" disabled={!newActionTitle.trim()} className="p-1 text-muted-foreground hover:text-primary disabled:opacity-30 cursor-pointer"><Plus className="h-4 w-4" /></button>
            </form>
          </div>
        </details>
      </div>
    </div>
  );
}
