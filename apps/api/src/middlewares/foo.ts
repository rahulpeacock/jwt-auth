import { createMiddleware } from 'hono/factory';

export const foo = createMiddleware<{
  Variables: { foo: string };
}>((c, next) => {
  console.log('foo middleware');
  c.set('foo', 'abc');
  return next();
});
