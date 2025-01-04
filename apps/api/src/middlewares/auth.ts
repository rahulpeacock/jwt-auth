import { createMiddleware } from 'hono/factory';
import type { Auth } from '../services/auth/types';

export const authMiddleware = createMiddleware<{ Variables: { auth: Auth } }>((c, next) => {
  c.set('auth', {
    user: {
      id: 1,
      email: 't2oYK@example.com',
      emailVerified: null,
      metadata: {
        name: 'John Doe',
        avatar_url: null,
      },
      createdAt: new Date(),
      updatedAt: null,
    },
  });
  return next();
});
