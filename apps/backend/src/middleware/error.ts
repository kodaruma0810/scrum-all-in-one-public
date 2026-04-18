import { createMiddleware } from 'hono/factory';
import { ZodError } from 'zod';

export const errorMiddleware = createMiddleware(async (c, next) => {
  try {
    await next();
  } catch (err) {
    if (err instanceof ZodError) {
      return c.json(
        {
          error: 'Validation error',
          details: err.errors,
        },
        400
      );
    }

    console.error('Unhandled error:', err);

    return c.json(
      {
        error: 'Internal server error',
      },
      500
    );
  }
});
