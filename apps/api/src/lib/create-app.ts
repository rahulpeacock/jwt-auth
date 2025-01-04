import { pinoLogger } from '@/api/middlewares/pino-logger';
import { notFound, onError, serveEmojiFavicon } from 'stoker/middlewares';
import { spaFavicon, spaRedirect } from '../middlewares/spa-redirect';
import { BASE_PATH } from './constants';
import { createRouter } from './create-router';
import type { AppOpenApi } from './types';

export default function createApp() {
  const app = createRouter()
    .use('/vite.svg', spaFavicon) // SPA favicon
    .use(spaRedirect) // SPA redirect
    .basePath(BASE_PATH) as AppOpenApi;

  app.use(serveEmojiFavicon('🍀'));
  app.use(pinoLogger());

  app.notFound(notFound);
  app.onError(onError);

  return app;
}
