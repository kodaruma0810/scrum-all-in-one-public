export type SprintStatus = 'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'ARCHIVED'

export interface Sprint {
  id: string
  name: string
  startDate: string
  endDate: string
  status: SprintStatus
  goal?: string
  velocity?: number
  incrementId: string
  teamId: string
  organizationId: string
  increment?: { id: string; name: string }
  team?: { id: string; name: string }
  sprintGoals?: SprintGoal[]
  tickets?: Ticket[]
  memberCapacities?: MemberCapacity[]
  _count?: { tickets: number; sprintGoals: number }
  createdAt: string
  updatedAt: string
}

export interface SprintGoal {
  id: string
  title: string
  status: string
  longTermGoal?: { id: string; title: string }
  tickets?: { id: string; status: string; storyPoints?: number }[]
  _count?: { tickets: number }
}

export interface Ticket {
  id: string
  ticketNumber: number
  title: string
  status: string
  priority: string
  storyPoints?: number
  assignee?: { id: string; name: string; avatarUrl?: string }
}

export interface MemberCapacity {
  id: string
  sprintId: string
  userId: string
  availableDays: number
  user?: { id: string; name: string; avatarUrl?: string }
}

export interface TeamCalendarEntry {
  id: string
  teamId: string
  userId: string
  date: string
  reason?: string
  user?: { id: string; name: string }
  team?: { id: string; name: string }
}

export interface VelocityDataPoint {
  name: string
  velocity: number | null
  endDate: string
}

export interface JapaneseHoliday {
  date: string
  name: string
}
