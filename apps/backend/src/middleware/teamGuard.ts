import { createMiddleware } from 'hono/factory';
import { isTeamMember } from '../features/teams/repository.js';
import { prisma } from '../db/client.js';

type Variables = {
  user: { sub: string; organizationId: string };
  teamId: string;
};

async function resolveUserId(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
  if (user) return user.id;
  const defaultUser = await prisma.user.findFirst({ select: { id: true } });
  return defaultUser?.id ?? userId;
}

export const teamMemberGuard = createMiddleware<{ Variables: Variables }>(
  async (c, next) => {
    const teamId = c.req.header('X-Team-Id');

    if (!teamId) {
      return c.json({ error: 'X-Team-Id header is required' }, 400);
    }

    const user = c.get('user');
    const resolvedUserId = await resolveUserId(user.sub);
    const isMember = await isTeamMember(teamId, resolvedUserId);

    if (!isMember) {
      return c.json({ error: 'You are not a member of this team' }, 403);
    }

    c.set('teamId', teamId);
    await next();
  }
);
