import * as repository from './repository.js';
import { SearchResults } from './types.js';

export async function search(organizationId: string, q: string): Promise<SearchResults> {
  const trimmed = q.trim();
  if (!trimmed) {
    return { tickets: [], longTermGoals: [], sprintGoals: [], total: 0 };
  }

  const [tickets, longTermGoals, sprintGoals] = await Promise.all([
    repository.searchTickets(organizationId, trimmed),
    repository.searchLongTermGoals(organizationId, trimmed),
    repository.searchSprintGoals(organizationId, trimmed),
  ]);

  return {
    tickets,
    longTermGoals,
    sprintGoals,
    total: tickets.length + longTermGoals.length + sprintGoals.length,
  };
}
