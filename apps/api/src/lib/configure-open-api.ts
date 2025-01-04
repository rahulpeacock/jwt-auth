import { apiReference } from '@scalar/hono-api-reference';
import packageJson from '../../package.json' with { type: 'json' };
import type { AppOpenApi } from './types';

export function configureOpenApi(app: AppOpenApi) {
  app.doc('/doc', {
    openapi: '3.0.0',
    info: {
      version: packageJson.version,
      title: 'Lidoku API',
    },
  });

  app.get(
    '/reference',
    apiReference({
      theme: 'kepler',
      layout: 'classic',
      spec: {
        url: '/api/doc',
      },
      defaultHttpClient: {
        targetKey: 'javascript',
        clientKey: 'fetch',
      },
    }),
  );
}
