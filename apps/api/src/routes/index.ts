import { createRouter } from '@/api/lib/create-router';
import { createRoute } from '@hono/zod-openapi';
import { jsonContent } from 'stoker/openapi/helpers';
import { z } from 'zod';

const router = createRouter().openapi(
  createRoute({
    tags: ['Index'],
    method: 'get',
    path: '/',
    responses: {
      200: jsonContent(
        z.object({
          message: z.string(),
        }),
        'Successful response',
      ),
    },
  }),
  (c) => {
    return c.json({ message: 'Hello world' }, 200);
  },
);

export default router;
