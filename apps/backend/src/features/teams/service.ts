import * as repository from './repository.js';
import { prisma } from '../../db/client.js';
import { TeamDto, TeamMemberDto, CreateTeamInput } from './types.js';

/**
 * organizationId が DB に存在しない場合（Dev Login 等）、
 * デフォルト組織のIDにフォールバックする
 */
async function resolveOrganizationId(organizationId: string): Promise<string> {
  const org = await prisma.organization.findUnique({ where: { id: organizationId }, select: { id: true } });
  if (org) return org.id;
  const defaultOrg = await prisma.organization.findFirst({ select: { id: true } });
  if (defaultOrg) return defaultOrg.id;
  throw new Error('組織が見つかりません。先にシードデータを実行してください。');
}

/**
 * userId が DB に存在しない場合（Dev Login 等）、
 * デフォルトユーザーのIDにフォールバックする
 */
async function resolveUserId(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
  if (user) return user.id;
  const defaultUser = await prisma.user.findFirst({ select: { id: true } });
  if (defaultUser) return defaultUser.id;
  throw new Error('ユーザーが見つかりません。先にシードデータを実行してください。');
}

function toTeamDto(team: {
  id: string;
  name: string;
  ticketPrefix: string;
  velocityMode: string;
  _count: { members: number };
}): TeamDto {
  return {
    id: team.id,
    name: team.name,
    ticketPrefix: team.ticketPrefix,
    velocityMode: team.velocityMode,
    memberCount: team._count.members,
  };
}

function toMemberDto(member: {
  id: string;
  userId: string;
  role: string;
  isOwner: boolean;
  joinedAt: Date;
  user: { id: string; name: string; email: string };
}): TeamMemberDto {
  return {
    id: member.id,
    userId: member.user.id,
    userName: member.user.name,
    userEmail: member.user.email,
    role: member.role,
    isOwner: member.isOwner,
    joinedAt: member.joinedAt.toISOString(),
  };
}

export async function listMyTeams(userId: string, organizationId: string): Promise<TeamDto[]> {
  const resolvedOrgId = await resolveOrganizationId(organizationId);
  const resolvedUserId = await resolveUserId(userId);
  const teams = await repository.findTeamsByUser(resolvedUserId, resolvedOrgId);
  return teams.map(toTeamDto);
}

export async function createTeam(
  organizationId: string,
  userId: string,
  input: CreateTeamInput
): Promise<TeamDto> {
  const resolvedOrgId = await resolveOrganizationId(organizationId);
  const resolvedUserId = await resolveUserId(userId);
  const team = await repository.createTeam(resolvedOrgId, input);
  // 作成者をオーナーとしてメンバーに追加
  await repository.addTeamMember(team.id, resolvedUserId, { role: 'DEVELOPER', isOwner: true });
  return { ...toTeamDto(team), memberCount: 1 };
}

export async function getTeamMembers(teamId: string): Promise<TeamMemberDto[]> {
  const members = await repository.findTeamMembers(teamId);
  return members.map(toMemberDto);
}

export async function addMember(teamId: string, userId: string): Promise<TeamMemberDto> {
  const member = await repository.addTeamMember(teamId, userId);
  return toMemberDto(member);
}

export async function removeMember(teamId: string, userId: string): Promise<void> {
  await repository.removeTeamMember(teamId, userId);
}

export async function checkMembership(teamId: string, userId: string): Promise<boolean> {
  return repository.isTeamMember(teamId, userId);
}

/**
 * チームメンバーのロールを変更する
 * 認可: リクエストユーザーがADMIN（グローバル）またはチームのオーナーであること
 */
export async function changeMemberRole(
  teamId: string,
  targetUserId: string,
  newRole: string,
  requestUserId: string,
  requestUserGlobalRole: string
): Promise<TeamMemberDto> {
  // 認可チェック
  const isGlobalAdmin = requestUserGlobalRole === 'ADMIN';
  if (!isGlobalAdmin) {
    const resolvedRequestUserId = await resolveUserId(requestUserId);
    const requester = await repository.findTeamMember(teamId, resolvedRequestUserId);
    if (!requester || !requester.isOwner) {
      throw Object.assign(new Error('ロール変更の権限がありません'), { statusCode: 403 });
    }
  }

  const member = await repository.updateMemberRole(teamId, targetUserId, newRole);
  return toMemberDto(member);
}

/**
 * チームメンバーのオーナー権限を変更する
 * 認可: リクエストユーザーがADMIN（グローバル）またはチームのオーナーであること
 */
export async function toggleOwner(
  teamId: string,
  targetUserId: string,
  isOwner: boolean,
  requestUserId: string,
  requestUserGlobalRole: string
): Promise<TeamMemberDto> {
  const isGlobalAdmin = requestUserGlobalRole === 'ADMIN';
  if (!isGlobalAdmin) {
    const resolvedRequestUserId = await resolveUserId(requestUserId);
    const requester = await repository.findTeamMember(teamId, resolvedRequestUserId);
    if (!requester || !requester.isOwner) {
      throw Object.assign(new Error('管理権限の変更権限がありません'), { statusCode: 403 });
    }
  }

  // オーナー権限を外す場合、他にオーナーがいるかチェック
  if (!isOwner) {
    const ownerCount = await repository.countOwners(teamId);
    if (ownerCount <= 1) {
      throw Object.assign(
        new Error('チームに管理者が1人しかいないため、管理権限を外せません。先に他のメンバーに管理権限を付与してください。'),
        { statusCode: 400 }
      );
    }
  }

  const member = await repository.updateMemberOwner(teamId, targetUserId, isOwner);
  return toMemberDto(member);
}

/**
 * チームを削除する
 * 認可: システムADMINまたはチームオーナーのみ
 */
export async function deleteTeam(
  teamId: string,
  requestUserId: string,
  requestUserGlobalRole: string
): Promise<void> {
  const isGlobalAdmin = requestUserGlobalRole === 'ADMIN';
  if (!isGlobalAdmin) {
    const resolvedRequestUserId = await resolveUserId(requestUserId);
    const requester = await repository.findTeamMember(teamId, resolvedRequestUserId);
    if (!requester || !requester.isOwner) {
      throw Object.assign(new Error('チーム削除の権限がありません'), { statusCode: 403 });
    }
  }
  await repository.deleteTeam(teamId);
}
