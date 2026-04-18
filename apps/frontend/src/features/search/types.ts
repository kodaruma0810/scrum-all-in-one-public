export interface SearchResultItem {
  type: 'ticket' | 'longTermGoal' | 'sprintGoal';
  id: string;
  title: string;
  description?: string | null;
  meta?: Record<string, unknown>;
}

export interface SearchResults {
  tickets: SearchResultItem[];
  longTermGoals: SearchResultItem[];
  sprintGoals: SearchResultItem[];
  total: number;
}
