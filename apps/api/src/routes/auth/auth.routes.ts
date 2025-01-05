import { internalServerErrorSchema } from '@/api/lib/constants';
import { authMiddleware } from '@/api/middlewares/auth';
import { createRoute, z } from '@hono/zod-openapi';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import { jsonContent, jsonContentRequired } from 'stoker/openapi/helpers';
import { createErrorSchema } from 'stoker/openapi/schemas';
import { loginRequestSchema, signUpRequestSchema } from './auth.schema';

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
    [HttpStatusCodes.UNAUTHORIZED]: jsonContent(z.object({ message: z.string() }), 'User does not exist'),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(createErrorSchema(loginRequestSchema.body), 'Validation error'),
    [HttpStatusCodes.OK]: jsonContent(z.object({ message: z.string() }), 'Successful login'),
  },
});
export type LoginRoute = typeof login;

// verify-email
// forgot-password
// reset-password
// update-user - metadata

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
