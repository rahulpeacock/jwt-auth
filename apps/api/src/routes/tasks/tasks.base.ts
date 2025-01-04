import { createRouter } from '@/api/lib/create-router';
import * as handlers from './tasks.handlers';
import * as routes from './tasks.routes';

const router = createRouter().openapi(routes.createTasks, handlers.createTasks).openapi(routes.getTask, handlers.getTask);

export default router;
