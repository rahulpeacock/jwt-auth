import { env } from '@/api/lib/env';
import type { AppMiddlewareVariables, AppRouteHandler } from '@/api/lib/types';
import { createJwtToken, verifyJwtToken } from '@/api/services/auth/jwt';
import { hashPassword, verifyPassword } from '@/api/services/auth/password';
import type { Auth } from '@/api/services/auth/types';
import { createVerificationToken, sendVerificationEmailToUser } from '@/api/services/auth/verification';
import { createAccountInDB, getAccountFromDB, updateAccountInDB } from '@/api/services/db/account';
import { createUser, getUserByEmail, getUserByUserId, updateUserById } from '@/api/services/db/users';
import { deleteCookie, setCookie } from 'hono/cookie';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import type { LoginRoute, SendVerificationEmailRoute, SignoutRoute, SignupRoute, VerifyEmailRoute } from './auth.routes';

export const signup: AppRouteHandler<SignupRoute> = async (c) => {
  const { name, email, password } = c.req.valid('json');

  // Check if user already exists
  const user = await getUserByEmail(email);
  if (user) {
    return c.json({ message: 'Incorrect email' }, HttpStatusCodes.CONFLICT); // User already exists
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
  const accessToken = await createJwtToken<{ user: Auth['user'] }>({ user: newUser }, '7days', env.ACCESS_TOKEN);

  // Generate a refresh token
  const refreshToken = await createJwtToken<{ user: Auth['user'] }>({ user: newUser }, '14days', env.REFRESH_TOKEN);

  // Save access-token in cookie
  setCookie(c, 'jwt-auth.access_token', accessToken, {
    prefix: 'secure',
    path: '/',
    secure: env.NODE_ENV === 'production',
    httpOnly: true,
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // Token expires in 7 days
    sameSite: 'Lax',
  });

  // Create a new account
  const newAccount = await createAccountInDB({
    userId: newUser.id,
    accountId: newUser.id,
    providerId: 'email_and_password_credential',
    refreshToken,
    refreshTokenExpiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14),
    metadata: { password: await hashPassword(password) },
  });

  if (!newAccount) {
    return c.json({ message: 'Failed to create account' }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }

  return c.json({ message: 'Successful signup' }, HttpStatusCodes.CREATED);
};

export const login: AppRouteHandler<LoginRoute> = async (c) => {
  const { email, password } = c.req.valid('json');

  // Check if user exists
  const user = await getUserByEmail(email);
  if (!user) {
    return c.json({ message: 'Incorrect email or password' }, HttpStatusCodes.UNAUTHORIZED); // User does not exist
  }

  // Check if email_and_password_credential account exists
  const account = await getAccountFromDB(user.id, 'email_and_password_credential');
  if (!account) {
    return c.json({ message: 'Reset password', code: 'RESET_PASSWORD' }, HttpStatusCodes.UNAUTHORIZED); // Redirect to reset-password
  }

  // Check if password is correct
  const isPasswordCorrect = await verifyPassword(account.metadata.password as string, password);
  if (!isPasswordCorrect) {
    return c.json({ message: 'Incorrect email or password' }, HttpStatusCodes.UNAUTHORIZED); // Password is incorrect
  }

  // Generate access token
  const accessToken = await createJwtToken<{ user: Auth['user'] }>({ user }, '7days', env.ACCESS_TOKEN);

  // Generate a refresh token
  const refreshToken = await createJwtToken<{ user: Auth['user'] }>({ user }, '14days', env.REFRESH_TOKEN);

  // Save access-token in cookie
  setCookie(c, 'jwt-auth.access_token', accessToken, {
    prefix: 'secure',
    path: '/',
    secure: env.NODE_ENV === 'production',
    httpOnly: true,
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // Token expires in 7 days
    sameSite: 'Lax',
  });

  // Update refresh-token in db
  const updatedAccount = await updateAccountInDB({
    refreshToken,
    refreshTokenExpiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14),
  });

  if (!updatedAccount) {
    return c.json({ message: 'Failed to login' }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }

  return c.json({ message: 'Successful login' }, HttpStatusCodes.OK);
};

export const sendVerificationEmail: AppRouteHandler<SendVerificationEmailRoute, AppMiddlewareVariables<{ auth: Auth }>> = async (c) => {
  const { userId } = c.req.valid('json');
  const auth = c.get('auth');

  if (auth.user.id !== userId) {
    return c.json({ message: 'Permission denied' }, HttpStatusCodes.FORBIDDEN);
  }

  const user = await getUserByUserId(userId);
  if (!user) {
    return c.json({ message: 'User unauthorized' }, HttpStatusCodes.UNAUTHORIZED);
  }

  const verificationToken = await createVerificationToken(user.email);
  await sendVerificationEmailToUser(user.email, verificationToken);

  return c.json({ message: 'Verification email sent' }, HttpStatusCodes.OK);
};

export const verifyEmail: AppRouteHandler<VerifyEmailRoute, AppMiddlewareVariables<{ auth: Auth }>> = async (c) => {
  const auth = c.get('auth');
  const { userId, token } = c.req.valid('json');

  if (auth.user.id !== userId) {
    return c.json({ message: 'Permission denied' }, HttpStatusCodes.FORBIDDEN);
  }

  try {
    const { payload } = await verifyJwtToken<{ email: string }>(token, env.VERIFICATION_TOKEN);
    if (payload.email !== auth.user.email) {
      return c.json({ message: 'Permission denied' }, HttpStatusCodes.FORBIDDEN);
    }

    const user = await getUserByUserId(userId);
    if (!user) {
      return c.json({ message: 'User unauthorized' }, HttpStatusCodes.UNAUTHORIZED);
    }

    if (user.emailVerified) {
      return c.json({ message: 'User verified' }, HttpStatusCodes.OK);
    }

    await updateUserById(userId, { emailVerified: new Date() });

    return c.json({ message: 'User verified' }, HttpStatusCodes.OK);
  } catch (err) {
    // TODO:
    const logger = c.get('logger');
    logger.error(err, 'VERIFY_EMAIL: verification token jwt error');
    return c.json({ message: 'User unauthorized' }, HttpStatusCodes.UNAUTHORIZED);
  }
};

export const signout: AppRouteHandler<SignoutRoute, AppMiddlewareVariables<{ auth: Auth }>> = (c) => {
  // Delete access-token from cookie
  deleteCookie(c, 'jwt-auth.access_token', {
    prefix: 'secure',
    path: '/',
    secure: env.NODE_ENV === 'production',
  });

  return c.body(null, HttpStatusCodes.NO_CONTENT);
};
