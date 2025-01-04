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
