import * as repository from './repository.js';
import { CreateSprintInput, UpdateSprintInput, UpdateCapacityInput, UpsertCalendarInput } from './types.js';

export interface JapaneseHoliday {
  date: string;
  name: string;
}

export function getJapaneseHolidays(year: number): JapaneseHoliday[] {
  const holidays: Record<number, JapaneseHoliday[]> = {
    2024: [
      { date: '2024-01-01', name: '元日' },
      { date: '2024-01-08', name: '成人の日' },
      { date: '2024-02-11', name: '建国記念日' },
      { date: '2024-02-12', name: '建国記念日 振替休日' },
      { date: '2024-02-23', name: '天皇誕生日' },
      { date: '2024-03-20', name: '春分の日' },
      { date: '2024-04-29', name: '昭和の日' },
      { date: '2024-05-03', name: '憲法記念日' },
      { date: '2024-05-04', name: 'みどりの日' },
      { date: '2024-05-05', name: 'こどもの日' },
      { date: '2024-05-06', name: 'こどもの日 振替休日' },
      { date: '2024-07-15', name: '海の日' },
      { date: '2024-08-11', name: '山の日' },
      { date: '2024-08-12', name: '山の日 振替休日' },
      { date: '2024-09-16', name: '敬老の日' },
      { date: '2024-09-22', name: '秋分の日' },
      { date: '2024-09-23', name: '秋分の日 振替休日' },
      { date: '2024-10-14', name: 'スポーツの日' },
      { date: '2024-11-03', name: '文化の日' },
      { date: '2024-11-04', name: '文化の日 振替休日' },
      { date: '2024-11-23', name: '勤労感謝の日' },
    ],
    2025: [
      { date: '2025-01-01', name: '元日' },
      { date: '2025-01-13', name: '成人の日' },
      { date: '2025-02-11', name: '建国記念日' },
      { date: '2025-02-23', name: '天皇誕生日' },
      { date: '2025-02-24', name: '天皇誕生日 振替休日' },
      { date: '2025-03-20', name: '春分の日' },
      { date: '2025-04-29', name: '昭和の日' },
      { date: '2025-05-03', name: '憲法記念日' },
      { date: '2025-05-04', name: 'みどりの日' },
      { date: '2025-05-05', name: 'こどもの日' },
      { date: '2025-05-06', name: 'こどもの日 振替休日' },
      { date: '2025-07-21', name: '海の日' },
      { date: '2025-08-11', name: '山の日' },
      { date: '2025-09-15', name: '敬老の日' },
      { date: '2025-09-23', name: '秋分の日' },
      { date: '2025-10-13', name: 'スポーツの日' },
      { date: '2025-11-03', name: '文化の日' },
      { date: '2025-11-23', name: '勤労感謝の日' },
      { date: '2025-11-24', name: '勤労感謝の日 振替休日' },
    ],
    2026: [
      { date: '2026-01-01', name: '元日' },
      { date: '2026-01-12', name: '成人の日' },
      { date: '2026-02-11', name: '建国記念日' },
      { date: '2026-02-23', name: '天皇誕生日' },
      { date: '2026-03-20', name: '春分の日' },
      { date: '2026-04-29', name: '昭和の日' },
      { date: '2026-05-03', name: '憲法記念日' },
      { date: '2026-05-04', name: 'みどりの日' },
      { date: '2026-05-05', name: 'こどもの日' },
      { date: '2026-05-06', name: 'みどりの日 振替休日' },
      { date: '2026-07-20', name: '海の日' },
      { date: '2026-08-11', name: '山の日' },
      { date: '2026-09-21', name: '敬老の日' },
      { date: '2026-09-23', name: '秋分の日' },
      { date: '2026-10-12', name: 'スポーツの日' },
      { date: '2026-11-03', name: '文化の日' },
      { date: '2026-11-23', name: '勤労感謝の日' },
    ],
  };

  return holidays[year] ?? [];
}

export async function listSprints(organizationId: string, teamId: string) {
  return repository.findSprints(organizationId, teamId);
}

export async function getSprint(id: string, organizationId: string) {
  const sprint = await repository.findSprintById(id, organizationId);
  if (!sprint) {
    throw Object.assign(new Error('Sprint not found'), { statusCode: 404 });
  }
  return sprint;
}

export async function createSprint(organizationId: string, data: CreateSprintInput) {
  return repository.createSprint(organizationId, data);
}

export async function updateSprint(id: string, organizationId: string, data: UpdateSprintInput) {
  const existing = await repository.findSprintById(id, organizationId);
  if (!existing) {
    throw Object.assign(new Error('Sprint not found'), { statusCode: 404 });
  }
  return repository.updateSprint(id, organizationId, data);
}

export async function startSprint(id: string, organizationId: string) {
  const existing = await repository.findSprintById(id, organizationId);
  if (!existing) {
    throw Object.assign(new Error('Sprint not found'), { statusCode: 404 });
  }
  return repository.startSprint(id, organizationId);
}

export async function completeSprint(id: string, organizationId: string) {
  const existing = await repository.findSprintById(id, organizationId);
  if (!existing) {
    throw Object.assign(new Error('Sprint not found'), { statusCode: 404 });
  }
  return repository.completeSprint(id, organizationId);
}

export async function reopenSprint(id: string, organizationId: string) {
  const existing = await repository.findSprintById(id, organizationId);
  if (!existing) {
    throw Object.assign(new Error('Sprint not found'), { statusCode: 404 });
  }
  return repository.reopenSprint(id, organizationId);
}

export async function getVelocityHistory(organizationId: string, teamId: string) {
  return repository.getVelocityHistory(organizationId, teamId);
}

export async function getCapacity(sprintId: string, organizationId: string) {
  const sprint = await repository.findSprintById(sprintId, organizationId);
  if (!sprint) {
    throw Object.assign(new Error('Sprint not found'), { statusCode: 404 });
  }
  return repository.getCapacity(sprintId, organizationId);
}

export async function upsertCapacity(sprintId: string, organizationId: string, input: UpdateCapacityInput) {
  const sprint = await repository.findSprintById(sprintId, organizationId);
  if (!sprint) {
    throw Object.assign(new Error('Sprint not found'), { statusCode: 404 });
  }
  return repository.upsertCapacity(sprintId, input.members);
}

export async function getTeamCalendar(teamId: string) {
  return repository.getTeamCalendar(teamId);
}

export async function upsertCalendarEntries(organizationId: string, input: UpsertCalendarInput & { teamId: string }) {
  return repository.upsertCalendarEntries(input.teamId, organizationId, input.entries);
}
