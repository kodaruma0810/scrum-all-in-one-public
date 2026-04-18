import { Hono } from 'hono';
import { z } from 'zod';
import { login, signup, refreshToken } from './service.js';

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const SignupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1).max(100),
});

const RefreshSchema = z.object({
  refreshToken: z.string(),
});

const router = new Hono();

router.post('/signup', async (c) => {
  const body = await c.req.json();
  const parsed = SignupSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: 'Validation error', details: parsed.error.errors }, 400);
  }
  const { email, password, name } = parsed.data;

  try {
    const { tokens, user } = await signup(email, password, name);
    return c.json({ ...tokens, user }, 201);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Signup failed';
    return c.json({ error: message }, 400);
  }
});

router.post('/login', async (c) => {
  const body = await c.req.json();
  const parsed = LoginSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: 'Validation error', details: parsed.error.errors }, 400);
  }
  const { email, password } = parsed.data;

  try {
    const { tokens, user } = await login(email, password);
    return c.json({ ...tokens, user });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Login failed';
    return c.json({ error: message }, 401);
  }
});

router.post('/refresh', async (c) => {
  const body = await c.req.json();
  const parsed = RefreshSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: 'Validation error', details: parsed.error.errors }, 400);
  }
  const { refreshToken: token } = parsed.data;

  try {
    const tokens = await refreshToken(token);
    return c.json(tokens);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Token refresh failed';
    return c.json({ error: message }, 401);
  }
});

router.post('/logout', (c) => {
  // Token invalidation would require a token blacklist (Redis)
  // For now, the client is responsible for removing stored tokens
  return c.json({ message: 'Logged out successfully' });
});

export default router;
