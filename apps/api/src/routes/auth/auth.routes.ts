import { internalServerErrorSchema } from '@/api/lib/constants';
import { authMiddleware } from '@/api/middlewares/auth';
import { createRoute, z } from '@hono/zod-openapi';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import { jsonContent, jsonContentRequired } from 'stoker/openapi/helpers';
import { createErrorSchema } from 'stoker/openapi/schemas';
import {
  forgotPasswordRequestSchema,
  loginRequestSchema,
  resetPasswordRequestSchema,
  sendVerificationEmailRequestSchema,
  signUpRequestSchema,
  updateUserRequestSchema,
  verifyEmailRequestSchema,
} from './auth.schema';

export const signup = createRoute({
  method: 'post',
  path: '/auth/signup',
  tags: ['Auth'],
  request: {
    body: jsonContentRequired(signUpRequestSchema.body, 'Signup request'),
  },
  responses: {
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(internalServerErrorSchema, 'Failed to signup'),
    [HttpStatusCodes.CONFLICT]: jsonContent(z.object({ message: z.string() }), 'User already exists'),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(createErrorSchema(signUpRequestSchema.body), 'Validation error'),
    [HttpStatusCodes.CREATED]: jsonContent(z.object({ message: z.string() }), 'Successful signup'),
  },
});
export type SignupRoute = typeof signup;

export const login = createRoute({
  method: 'patch',
  path: '/auth/login',
  tags: ['Auth'],
  request: {
    body: jsonContentRequired(loginRequestSchema.body, 'Login request'),
  },
  responses: {
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(internalServerErrorSchema, 'Failed to login'),
    [HttpStatusCodes.UNAUTHORIZED]: jsonContent(z.object({ message: z.string(), code: z.string().optional() }), 'User does not exist'),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(createErrorSchema(loginRequestSchema.body), 'Validation error'),
    [HttpStatusCodes.OK]: jsonContent(z.object({ message: z.string() }), 'Successful login'),
  },
});
export type LoginRoute = typeof login;

export const sendVerificationEmail = createRoute({
  method: 'post',
  path: '/auth/send-verification-email',
  tags: ['Auth'],
  middleware: [authMiddleware] as const,
  request: {
    body: jsonContentRequired(sendVerificationEmailRequestSchema.body, 'Send verification request'),
  },
  responses: {
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(internalServerErrorSchema, 'Failed to send verification email'),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(createErrorSchema(sendVerificationEmailRequestSchema.body), 'Validation error'),
    [HttpStatusCodes.FORBIDDEN]: jsonContent(z.object({ message: z.string() }), 'Permission denied'),
    [HttpStatusCodes.UNAUTHORIZED]: jsonContent(z.object({ message: z.string() }), 'User unauthorized'),
    [HttpStatusCodes.OK]: jsonContent(z.object({ message: z.string() }), 'Verification email sent'),
  },
});
export type SendVerificationEmailRoute = typeof sendVerificationEmail;

export const verifyEmail = createRoute({
  method: 'post',
  path: '/auth/verify-email',
  tags: ['Auth'],
  middleware: [authMiddleware] as const,
  request: {
    body: jsonContentRequired(verifyEmailRequestSchema.body, 'Verify email'),
  },
  responses: {
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(internalServerErrorSchema, 'Failed to verify email'),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(createErrorSchema(verifyEmailRequestSchema.body), 'Validation error'),
    [HttpStatusCodes.FORBIDDEN]: jsonContent(z.object({ message: z.string() }), 'Permission denied'),
    [HttpStatusCodes.UNAUTHORIZED]: jsonContent(z.object({ message: z.string() }), 'User unauthorized'),
    [HttpStatusCodes.OK]: jsonContent(z.object({ message: z.string() }), 'Successful email verification'),
  },
});
export type VerifyEmailRoute = typeof verifyEmail;

export const forgotPassword = createRoute({
  method: 'post',
  path: '/auth/forgot-password',
  tags: ['Auth'],
  request: {
    body: jsonContentRequired(forgotPasswordRequestSchema.body, 'Forgot password'),
  },
  responses: {
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(internalServerErrorSchema, 'Failed to forgot password'),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(createErrorSchema(forgotPasswordRequestSchema.body), 'Validation error'),
    [HttpStatusCodes.UNAUTHORIZED]: jsonContent(z.object({ message: z.string() }), 'User unauthorized'),
    [HttpStatusCodes.OK]: jsonContent(z.object({ message: z.string() }), 'Successful forgot password'),
  },
});
export type ForgotPasswordRoute = typeof forgotPassword;

export const resetPassword = createRoute({
  method: 'post',
  path: '/auth/reset-password',
  tags: ['Auth'],
  request: {
    body: jsonContentRequired(resetPasswordRequestSchema.body, 'Reset password'),
  },
  responses: {
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(internalServerErrorSchema, 'Failed to forgot password'),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(createErrorSchema(resetPasswordRequestSchema.body), 'Validation error'),
    [HttpStatusCodes.UNAUTHORIZED]: jsonContent(z.object({ message: z.string() }), 'User unauthorized'),
    [HttpStatusCodes.OK]: jsonContent(z.object({ message: z.string() }), 'Successful forgot password'),
  },
});
export type ResetPasswordRoute = typeof resetPassword;

// update-user - metadata, password
export const updateUser = createRoute({
  method: 'patch',
  path: '/auth/update-user',
  tags: ['Auth'],
  middleware: [authMiddleware] as const,
  request: {
    body: jsonContentRequired(updateUserRequestSchema.body, 'Update user'),
  },
  responses: {
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(internalServerErrorSchema, 'Failed to update user'),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(createErrorSchema(resetPasswordRequestSchema.body), 'Validation error'),
    [HttpStatusCodes.UNAUTHORIZED]: jsonContent(z.object({ message: z.string() }), 'User unauthorized'),
    [HttpStatusCodes.OK]: jsonContent(z.object({ message: z.string() }), 'Successful update user'),
  },
});

export const signout = createRoute({
  method: 'patch',
  path: '/auth/signout',
  tags: ['Auth'],
  middleware: [authMiddleware] as const,
  request: {},
  responses: {
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(internalServerErrorSchema, 'Failed to signout'),
    [HttpStatusCodes.UNAUTHORIZED]: jsonContent(z.object({ message: z.string() }), 'User unauthorized'),
    [HttpStatusCodes.NO_CONTENT]: { description: 'Successful signout' },
  },
});
export type SignoutRoute = typeof signout;

// https://demo.better-auth.com/api/auth/verify-email?
// token=eyJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6InJhaHVscGFsYW1hcnRoaUBnbWFpbC5jb20iLCJpYXQiOjE3MzYwNDM0MTksImV4cCI6MTczNjA0NzAxOX0.aDvKHgCuSn-HcylMvCQrDKCplKzB98oBMue4D8fnf20
// &
//callbackURL=https://demo.better-auth.com/dashboard
