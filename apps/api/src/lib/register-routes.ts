import index from '@/api/routes/index';
import tasks from '@/api/routes/tasks/tasks.base';
import { BASE_PATH } from '../lib/constants';
import { createRouter } from './create-router';
import type { AppOpenApi } from './types';

export function registerRoutes(app: AppOpenApi) {
  return app.route('/', index).route('/', tasks);
}

// stand alone router type used for api client
export const router = registerRoutes(createRouter().basePath(BASE_PATH));
export type Router = typeof router;
