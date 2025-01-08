import { z } from 'zod';

export const signUpRequestSchema = {
  body: z.object({
    name: z.string(),
    email: z.string().email(),
    password: z.string().min(8),
  }),
};

export const loginRequestSchema = {
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8),
  }),
};

export const verifyEmailRequestSchema = {
  params: z.object({
    id: z.string().openapi({
      param: {
        name: 'token',
        in: 'path',
      },
      example: 'access_token',
    }),
  }),
};

export const forgotPasswordRequestSchema = {
  body: z.object({
    email: z.string().email(),
  }),
};

export const resetPasswordRequestSchema = {
  body: z.object({
    password: z.string(),
    token: z.string(),
  }),
};
