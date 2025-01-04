import type { OpenAPIHono, RouteConfig, RouteHandler } from '@hono/zod-openapi';
import type { Env } from 'hono';
import type { PinoLogger } from 'hono-pino';
import type { BASE_PATH } from './constants';

export interface AppBindings {
  Variables: {
    logger: PinoLogger;
  };
}

// biome-ignore lint/complexity/noBannedTypes: <explanation>
export type AppOpenApi = OpenAPIHono<AppBindings, {}, typeof BASE_PATH>;

export type AppRouteHandler<R extends RouteConfig, A extends Env = AppBindings> = RouteHandler<R, A>;

export type AppMiddlewareVariables<T extends object> = AppBindings & {
  Variables: T;
};
