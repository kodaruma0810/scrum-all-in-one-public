import * as repository from './repository.js';
import { CreateUserInput, UpdateUserInput, UpdateTeamInput, UserDto, TeamDto, TerminologyEntry } from './types.js';

function toUserDto(u: { id: string; email: string; name: string; role: string; avatarUrl: string | null; createdAt: Date }): UserDto {
  return { ...u, role: u.role as UserDto['role'], createdAt: u.createdAt.toISOString() };
}

export async function listUsers(organizationId: string): Promise<UserDto[]> {
  const users = await repository.findAllUsers(organizationId);
  return users.map(toUserDto);
}

export async function getUser(id: string, organizationId: string): Promise<UserDto | null> {
  const user = await repository.findUserById(id, organizationId);
  return user ? toUserDto(user) : null;
}

export async function createUser(organizationId: string, input: CreateUserInput): Promise<UserDto> {
  const user = await repository.createUser(organizationId, input);
  return toUserDto(user);
}

export async function updateUser(id: string, organizationId: string, input: UpdateUserInput): Promise<UserDto | null> {
  const existing = await repository.findUserById(id, organizationId);
  if (!existing) return null;
  const user = await repository.updateUser(id, input);
  return toUserDto(user);
}

export async function deleteUser(id: string, organizationId: string): Promise<boolean> {
  const existing = await repository.findUserById(id, organizationId);
  if (!existing) return false;
  await repository.deleteUser(id);
  return true;
}

export async function changeRole(id: string, organizationId: string, role: string): Promise<UserDto | null> {
  const existing = await repository.findUserById(id, organizationId);
  if (!existing) return null;
  const user = await repository.updateUserRole(id, role);
  return toUserDto(user);
}

export async function getTeamSettings(organizationId: string, teamId?: string): Promise<TeamDto | null> {
  return repository.findTeam(organizationId, teamId);
}

export async function updateTeamSettings(organizationId: string, input: UpdateTeamInput, teamId?: string): Promise<TeamDto | null> {
  const team = await repository.findTeam(organizationId, teamId);
  if (!team) return null;
  return repository.updateTeam(team.id, input);
}

export async function getTerminology(organizationId: string): Promise<TerminologyEntry[]> {
  return repository.findTerminology(organizationId);
}

export async function updateTerminologyBulk(
  organizationId: string,
  entries: TerminologyEntry[]
): Promise<TerminologyEntry[]> {
  return Promise.all(
    entries.map(({ key, value }) => repository.upsertTerminology(organizationId, key, value))
  );
}
