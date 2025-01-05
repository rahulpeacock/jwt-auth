import type { AppMiddlewareVariables, AppRouteHandler } from '@/api/lib/types';
import type { CreateTasksRoute, GetTaskRoute } from './tasks.routes';

export const createTasks: AppRouteHandler<
  CreateTasksRoute,
  AppMiddlewareVariables<{
    bar: number;
  }>
> = (c) => {
  return c.json({ created: 'created' }, 200);
};

export const getTask: AppRouteHandler<GetTaskRoute> = (c) => {
  const { id } = c.req.valid('param');

  return c.json({ id, task: `This is task with id: ${id}` }, 200);
};
