import { env } from '@/api/lib/env';
import { serveStatic } from '@hono/node-server/serve-static';
import { createMiddleware } from 'hono/factory';
import { BASE_PATH } from '../lib/constants';

export const spaFavicon = createMiddleware(serveStatic({ root: env.SPA_ROOT_DIR, path: 'vite.svg' }));

export const spaRedirect = createMiddleware(async (c, next) => {
  if (c.req.path.startsWith(BASE_PATH)) {
    return next();
  }

  // SPA redirect for static assets (css, js)
  if (c.req.path.startsWith(env.SPA_ASSETS_PATH)) {
    return serveStatic({ root: env.SPA_ROOT_DIR })(c, next);
  }

  // SPA redirect to /index.html
  return serveStatic({ root: env.SPA_ROOT_DIR, path: 'index.html' })(c, next);
});
