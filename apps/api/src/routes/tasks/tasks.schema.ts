import { z } from 'zod';

export const getTaskRequestSchema = {
  params: z.object({
    id: z.coerce.number().openapi({
      param: {
        name: 'id',
        in: 'path',
      },
      example: 1212121,
    }),
  }),
};
