import { getCookie } from 'hono/cookie';
import { createMiddleware } from 'hono/factory';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import { env } from '../lib/env';
import { verifyJwtToken } from '../services/auth/jwt';
import type { Auth } from '../services/auth/types';

export const authMiddleware = createMiddleware<{ Variables: { auth: Auth } }>(async (c, next) => {
  const accessToken = getCookie(c, 'jwt-auth.access_token', 'secure');

  if (!accessToken) {
    return c.json({ message: 'User unauthorized', code: 'LOGIN' }, HttpStatusCodes.UNAUTHORIZED);
  }

  try {
    const decodedPayload = await verifyJwtToken(accessToken, env.ACCESS_TOKEN);
    c.set('auth', decodedPayload);
    return next();
  } catch (err) {
    return c.json({ message: 'User unauthorized', code: 'LOGIN' }, HttpStatusCodes.UNAUTHORIZED);
  }
});
