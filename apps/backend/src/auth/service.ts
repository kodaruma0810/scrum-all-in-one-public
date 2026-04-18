import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../db/client.js';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  organizationId: string;
}

function generateTokens(user: AuthUser): TokenPair {
  const jwtSecret = process.env.JWT_SECRET;
  const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;

  if (!jwtSecret || !jwtRefreshSecret) {
    throw new Error('JWT secrets are not configured');
  }

  const payload = {
    sub: user.id,
    email: user.email,
    role: user.role,
    organizationId: user.organizationId,
  };

  const accessToken = jwt.sign(payload, jwtSecret, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ sub: user.id }, jwtRefreshSecret, { expiresIn: '7d' });

  return { accessToken, refreshToken };
}

export async function signup(
  email: string,
  password: string,
  name: string
): Promise<{ tokens: TokenPair; user: AuthUser }> {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new Error('このメールアドレスは既に登録されています');
  }

  // デフォルト組織を取得（なければ作成）
  let organization = await prisma.organization.findFirst();
  if (!organization) {
    organization = await prisma.organization.create({
      data: { name: 'Default Organization', slug: 'default-org' },
    });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const dbUser = await prisma.user.create({
    data: {
      email,
      passwordHash,
      name,
      role: 'MEMBER',
      organizationId: organization.id,
    },
  });

  const user: AuthUser = {
    id: dbUser.id,
    email: dbUser.email,
    name: dbUser.name,
    role: dbUser.role,
    organizationId: dbUser.organizationId,
  };

  const tokens = generateTokens(user);
  return { tokens, user };
}

export async function login(email: string, password: string): Promise<{ tokens: TokenPair; user: AuthUser }> {
  const dbUser = await prisma.user.findUnique({
    where: { email },
  });

  if (!dbUser) {
    throw new Error('Invalid credentials');
  }

  const isPasswordValid = await bcrypt.compare(password, dbUser.passwordHash);

  if (!isPasswordValid) {
    throw new Error('Invalid credentials');
  }

  const user: AuthUser = {
    id: dbUser.id,
    email: dbUser.email,
    name: dbUser.name,
    role: dbUser.role,
    organizationId: dbUser.organizationId,
  };

  const tokens = generateTokens(user);

  return { tokens, user };
}

export async function refreshToken(token: string): Promise<TokenPair> {
  const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;

  if (!jwtRefreshSecret) {
    throw new Error('JWT_REFRESH_SECRET is not configured');
  }

  let payload: { sub: string };

  try {
    payload = jwt.verify(token, jwtRefreshSecret) as { sub: string };
  } catch {
    throw new Error('Invalid or expired refresh token');
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: payload.sub },
  });

  if (!dbUser) {
    throw new Error('User not found');
  }

  const user: AuthUser = {
    id: dbUser.id,
    email: dbUser.email,
    name: dbUser.name,
    role: dbUser.role,
    organizationId: dbUser.organizationId,
  };

  return generateTokens(user);
}
