import { foo } from '@/api/middlewares/foo';
import { createRoute, z } from '@hono/zod-openapi';
import { createMiddleware } from 'hono/factory';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import { jsonContent } from 'stoker/openapi/helpers';
import { getTaskRequestSchema } from './tasks.schema';

export const createTasks = createRoute({
  method: 'post',
  path: '/tasks',
  tags: ['Tasks'],
  middleware: [
    foo,
    createMiddleware<{
      Variables: { bar: number };
    }>((c, next) => {
      console.log('bar middleware');
      c.set('bar', 321);
      return next();
    }),
  ] as const,
  request: {},
  responses: {
    [HttpStatusCodes.OK]: jsonContent(z.object({ created: z.string() }), 'Successful response'),
  },
});
export type CreateTasksRoute = typeof createTasks;

export const getTask = createRoute({
  method: 'get',
  path: '/tasks/{id}',
  tags: ['Tasks'],
  request: {
    params: getTaskRequestSchema.params,
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(z.object({ id: z.number(), task: z.string() }), 'Successful response'),
  },
});
export type GetTaskRoute = typeof getTask;
