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

export const sendVerificationEmailRequestSchema = {
  body: z.object({
    userId: z.number(),
  }),
};

export const verifyEmailRequestSchema = {
  body: z.object({
    userId: z.number(),
    token: z.string(),
  }),
};

export const forgotPasswordRequestSchema = {
  body: z.object({
    email: z.string().email(),
  }),
};

export const resetPasswordRequestSchema = {
  body: z.object({
    password: z.string().min(8),
    token: z.string(),
  }),
};

export const updateUserRequestSchema = {
  body: z.object({
    userId: z.number(),
    metadata: z
      .object({
        name: z.string(),
        avatar_url: z.string().url(),
      })
      .partial()
      .optional(),
    password: z.string().min(8).optional(),
  }),
};
