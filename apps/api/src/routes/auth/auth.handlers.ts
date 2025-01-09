import { env } from '@/api/lib/env';
import type { AppMiddlewareVariables, AppRouteHandler } from '@/api/lib/types';
import { sendForgotPasswordEmail, sendVerificationEmailToUser } from '@/api/services/auth/email-verification';
import { createJwtToken, verifyJwtToken } from '@/api/services/auth/jwt';
import { hashPassword, verifyPasswordHash } from '@/api/services/auth/password';
import type { Auth } from '@/api/services/auth/types';
import { createVerificationToken, generateForgotPasswordToken } from '@/api/services/auth/utils';
import { createAccountInDB, getAccountFromDB, updateAccountInDB, upsertAccountInDB } from '@/api/services/db/account';
import { createUser, getUserByEmail, getUserByUserId, updateUserById } from '@/api/services/db/users';
import { createVerificationTokenInDB, getVerificationTokenFromDB } from '@/api/services/db/verification-token';
import { deleteCookie, setCookie } from 'hono/cookie';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import type {
  ForgotPasswordRoute,
  LoginRoute,
  ResetPasswordRoute,
  SendVerificationEmailRoute,
  SignoutRoute,
  SignupRoute,
  VerifyEmailRoute,
} from './auth.routes';

export const signup: AppRouteHandler<SignupRoute> = async (c) => {
  const { name, email, password } = c.req.valid('json');
  console.log('Password hash: ', await hashPassword(password));

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
  const isPasswordCorrect = await verifyPasswordHash(account.metadata.password as string, password);
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

export const forgotPassword: AppRouteHandler<ForgotPasswordRoute> = async (c) => {
  const { email } = c.req.valid('json');

  const user = await getUserByEmail(email);
  if (!user) {
    return c.json({ message: 'Incorrect email' }, HttpStatusCodes.UNAUTHORIZED);
  }

  const token = generateForgotPasswordToken();
  await createVerificationTokenInDB({
    identifier: user.email,
    token,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60),
  });

  await sendForgotPasswordEmail(email, token);

  return c.json({ message: 'Reset password email sent' }, HttpStatusCodes.OK);
};

export const resetPassword: AppRouteHandler<ResetPasswordRoute> = async (c) => {
  const { token, password } = c.req.valid('json');

  const verificationToken = await getVerificationTokenFromDB(token);

  if (!verificationToken) {
    return c.json({ message: 'Incorrect token' }, HttpStatusCodes.UNAUTHORIZED);
  }

  const user = await getUserByEmail(verificationToken.identifier);
  if (!user) {
    return c.json({ message: 'Incorrect token' }, HttpStatusCodes.UNAUTHORIZED);
  }

  await upsertAccountInDB({
    userId: user.id,
    accountId: user.id,
    providerId: 'email_and_password_credential',
    refreshToken: null,
    refreshTokenExpiresAt: null,
    metadata: { password: await hashPassword(password) },
  });

  return c.json({ message: 'Password reset successful' }, HttpStatusCodes.OK);
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
