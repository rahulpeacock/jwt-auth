import { env } from '@/api/lib/env';
import type { AppRouteHandler } from '@/api/lib/types';
import { generateJwtToken } from '@/api/services/auth/jwt';
import { hashPassword } from '@/api/services/auth/password';
import { createAccount } from '@/api/services/db/account';
import { createUser, getUser } from '@/api/services/db/users';
import { setCookie } from 'hono/cookie';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import type { SignupRoute } from './auth.routes';

export const signup: AppRouteHandler<SignupRoute> = async (c) => {
  const { name, email, password } = c.req.valid('json');

  // Check if user already exists
  const user = await getUser(email);
  if (user) {
    return c.json({ message: 'User already exists' }, HttpStatusCodes.CONFLICT);
  }

  // Create a new user
  const newUser = await createUser({
    email,
    metadata: { name, avatar_url: null },
  });

  if (!newUser) {
    return c.json({ message: 'Failed to create user' }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }

  // Generate access token
  const accessToken = await generateJwtToken(
    {
      user: newUser,
      exp: Math.floor(Date.now() / 1000) + 60 * 5, // Token expires in 5 minutes
    },
    env.ACCESS_TOKEN,
  );

  // Generate a refresh token
  const refreshToken = await generateJwtToken(
    {
      user: newUser,
      exp: Math.floor(Date.now() / 1000) + 60 * 10, // Token expires in 10 minutes
    },
    env.REFRESH_TOKEN,
  );

  // Save access-token in cookie
  setCookie(c, '__Secure-jwt-auth.access_token', accessToken, {
    path: '/',
    secure: env.NODE_ENV === 'production',
    httpOnly: true,
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // Token expires in 7 days
    sameSite: 'Strict',
  });

  // Create a new account
  const newAccount = await createAccount({
    userId: newUser.id,
    accountId: newUser.id,
    providerId: 'email_and_password_credential',
    refreshToken,
    refreshTokenExpiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
    metadata: { password: await hashPassword(password) },
  });

  if (!newAccount) {
    return c.json({ message: 'Failed to create account' }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }

  return c.json({ message: 'Successful signup' }, HttpStatusCodes.CREATED);
};
