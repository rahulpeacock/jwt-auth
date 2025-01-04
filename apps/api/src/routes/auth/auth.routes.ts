import { internalServerErrorSchema } from '@/api/lib/constants';
import { createRoute, z } from '@hono/zod-openapi';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import { jsonContent, jsonContentRequired } from 'stoker/openapi/helpers';
import { createErrorSchema } from 'stoker/openapi/schemas';
import { loginRequestSchema, signUpRequestSchema } from './auth.schema';

export const signUp = createRoute({
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
export type SignupRoute = typeof signUp;

export const login = createRoute({
  method: 'post',
  path: '/auth/login',
  tags: ['Auth'],
  request: {
    body: jsonContentRequired(loginRequestSchema.body, 'Login request'),
  },
  responses: {
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(internalServerErrorSchema, 'Failed to login'),
    [HttpStatusCodes.UNAUTHORIZED]: jsonContent(z.object({ message: z.string() }), 'User does not exist'),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(createErrorSchema(loginRequestSchema.body), 'Validation error'),
    [HttpStatusCodes.CREATED]: jsonContent(z.object({ message: z.string() }), 'Successful login'),
  },
});
export type LoginRoute = typeof login;
