export interface CreateSprintInput {
  name: string
  startDate: string
  endDate: string
  goal?: string
  incrementId: string
  teamId: string
}

export interface UpdateSprintInput {
  name?: string
  startDate?: string
  endDate?: string
  goal?: string
}

export interface UpdateCapacityInput {
  members: Array<{ userId: string; availableDays: number }>
}

export interface UpsertCalendarInput {
  entries: Array<{ userId: string; date: string; reason?: string }>
}
