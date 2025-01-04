import { configureOpenApi } from '@/api/lib/configure-open-api';
import createApp from '@/api/lib/create-app';
import { registerRoutes } from './lib/register-routes';

const app = registerRoutes(createApp());
configureOpenApi(app);

export default app;
