import { useTerminology } from '@/features/users/hooks/useUsers';
import { DEFAULT_TERMINOLOGY } from '@/features/users/types';

type TermKey =
  | 'increment' | 'sprint' | 'longTermGoal' | 'sprintGoal'
  | 'backlog' | 'ticket' | 'storyPoints' | 'velocity'
  | 'retrospective' | 'workingAgreement' | 'dailyScrum' | 'planning';

const defaultMap: Record<TermKey, string> = Object.fromEntries(
  DEFAULT_TERMINOLOGY.map((e) => [e.key, e.value])
) as Record<TermKey, string>;

/**
 * カスタマイズされた用語を返すフック
 * 例: const t = useTerms(); t('sprintGoal') → "ITゴール" or カスタム値
 */
export function useTerms() {
  const { data } = useTerminology();

  const map = { ...defaultMap };
  if (data) {
    for (const entry of data) {
      if (entry.key in map) {
        map[entry.key as TermKey] = entry.value;
      }
    }
  }

  return (key: TermKey) => map[key];
}
