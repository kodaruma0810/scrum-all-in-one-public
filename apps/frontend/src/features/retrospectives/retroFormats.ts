/** レトロスペクティブのフォーマット定義 */

export interface RetroZoneDef {
  type: string;
  label: string;
  emoji: string;
  /** カード表示用ラベル（テキスト表示で使う） */
  textLabel: string;
  /** ボード上のゾーン色 (rgba) */
  zoneBg: string;
  zoneBorder: string;
  /** 付箋の色バリエーション (dark palette) */
  stickyColors: string[];
  /** 一覧バッジ色 */
  badgeBg: string;
  badgeText: string;
}

export interface RetroFormatDef {
  id: string;
  name: string;
  description: string;
  zones: RetroZoneDef[];
}

// =====================================================
// フォーマット一覧
// =====================================================

const KPT: RetroFormatDef = {
  id: 'KPT',
  name: 'KPT',
  description: 'Keep / Problem / Try',
  zones: [
    { type: 'KEEP',    label: 'Keep',    emoji: '👍', textLabel: 'Keep（続けること）',    zoneBg: 'rgba(16,185,129,0.04)', zoneBorder: 'rgba(16,185,129,0.2)', stickyColors: ['#365a47','#2f5240','#3a6350'], badgeBg: 'bg-emerald-500/10', badgeText: 'text-emerald-400' },
    { type: 'PROBLEM', label: 'Problem', emoji: '⚡', textLabel: 'Problem（問題点）',     zoneBg: 'rgba(244,63,94,0.04)',  zoneBorder: 'rgba(244,63,94,0.2)',  stickyColors: ['#5c3340','#553040','#623848'], badgeBg: 'bg-rose-500/10',    badgeText: 'text-rose-400' },
    { type: 'TRY',     label: 'Try',     emoji: '💡', textLabel: 'Try（挑戦すること）',   zoneBg: 'rgba(14,165,233,0.04)', zoneBorder: 'rgba(14,165,233,0.2)', stickyColors: ['#2e4a5c','#2a4555','#344f62'], badgeBg: 'bg-sky-500/10',     badgeText: 'text-sky-400' },
  ],
};

const SSC: RetroFormatDef = {
  id: 'SSC',
  name: 'Start/Stop/Continue',
  description: 'Start / Stop / Continue',
  zones: [
    { type: 'START',    label: 'Start',    emoji: '🚀', textLabel: 'Start（始めること）',     zoneBg: 'rgba(34,197,94,0.04)',  zoneBorder: 'rgba(34,197,94,0.2)',  stickyColors: ['#2d5a3e','#285236','#326348'], badgeBg: 'bg-green-500/10',   badgeText: 'text-green-400' },
    { type: 'STOP',     label: 'Stop',     emoji: '🛑', textLabel: 'Stop（やめること）',      zoneBg: 'rgba(239,68,68,0.04)',  zoneBorder: 'rgba(239,68,68,0.2)',  stickyColors: ['#5c3030','#552a2a','#623838'], badgeBg: 'bg-red-500/10',     badgeText: 'text-red-400' },
    { type: 'CONTINUE', label: 'Continue', emoji: '🔄', textLabel: 'Continue（続けること）',  zoneBg: 'rgba(59,130,246,0.04)', zoneBorder: 'rgba(59,130,246,0.2)', stickyColors: ['#2e3f5c','#2a3a55','#343f62'], badgeBg: 'bg-blue-500/10',    badgeText: 'text-blue-400' },
  ],
};

const FOUR_LS: RetroFormatDef = {
  id: '4LS',
  name: '4Ls',
  description: 'Liked / Learned / Lacked / Longed for',
  zones: [
    { type: 'LIKED',     label: 'Liked',      emoji: '❤️', textLabel: 'Liked（良かったこと）',      zoneBg: 'rgba(244,63,94,0.04)',  zoneBorder: 'rgba(244,63,94,0.2)',  stickyColors: ['#5c3340','#553040','#623848'], badgeBg: 'bg-rose-500/10',    badgeText: 'text-rose-400' },
    { type: 'LEARNED',   label: 'Learned',    emoji: '📚', textLabel: 'Learned（学んだこと）',      zoneBg: 'rgba(59,130,246,0.04)', zoneBorder: 'rgba(59,130,246,0.2)', stickyColors: ['#2e3f5c','#2a3a55','#343f62'], badgeBg: 'bg-blue-500/10',    badgeText: 'text-blue-400' },
    { type: 'LACKED',    label: 'Lacked',     emoji: '⚠️', textLabel: 'Lacked（不足していたこと）', zoneBg: 'rgba(245,158,11,0.04)', zoneBorder: 'rgba(245,158,11,0.2)', stickyColors: ['#5c4a2e','#554428','#624f34'], badgeBg: 'bg-amber-500/10',   badgeText: 'text-amber-400' },
    { type: 'LONGED_FOR',label: 'Longed for', emoji: '🌟', textLabel: 'Longed for（望むこと）',     zoneBg: 'rgba(168,85,247,0.04)', zoneBorder: 'rgba(168,85,247,0.2)', stickyColors: ['#3f2e5c','#3a2a55','#443462'], badgeBg: 'bg-purple-500/10',  badgeText: 'text-purple-400' },
  ],
};

const MSG: RetroFormatDef = {
  id: 'MSG',
  name: 'Mad/Sad/Glad',
  description: 'Mad / Sad / Glad',
  zones: [
    { type: 'MAD',  label: 'Mad',  emoji: '😡', textLabel: 'Mad（怒り）',  zoneBg: 'rgba(239,68,68,0.04)',  zoneBorder: 'rgba(239,68,68,0.2)',  stickyColors: ['#5c3030','#552a2a','#623838'], badgeBg: 'bg-red-500/10',    badgeText: 'text-red-400' },
    { type: 'SAD',  label: 'Sad',  emoji: '😢', textLabel: 'Sad（悲しみ）', zoneBg: 'rgba(59,130,246,0.04)', zoneBorder: 'rgba(59,130,246,0.2)', stickyColors: ['#2e3f5c','#2a3a55','#343f62'], badgeBg: 'bg-blue-500/10',   badgeText: 'text-blue-400' },
    { type: 'GLAD', label: 'Glad', emoji: '😊', textLabel: 'Glad（喜び）', zoneBg: 'rgba(234,179,8,0.04)',  zoneBorder: 'rgba(234,179,8,0.2)',  stickyColors: ['#5c5028','#554a22','#625830'], badgeBg: 'bg-yellow-500/10', badgeText: 'text-yellow-400' },
  ],
};

export const RETRO_FORMATS: RetroFormatDef[] = [KPT, SSC, FOUR_LS, MSG];

export function getFormatDef(formatId: string): RetroFormatDef {
  return RETRO_FORMATS.find((f) => f.id === formatId) ?? KPT;
}
