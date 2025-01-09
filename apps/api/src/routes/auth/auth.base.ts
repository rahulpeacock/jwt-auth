import { createRouter } from '@/api/lib/create-router';
import * as handlers from './auth.handlers';
import * as routes from './auth.routes';

const router = createRouter()
  .openapi(routes.signup, handlers.signup)
  .openapi(routes.login, handlers.login)
  .openapi(routes.sendVerificationEmail, handlers.sendVerificationEmail)
  .openapi(routes.verifyEmail, handlers.verifyEmail)
  .openapi(routes.signout, handlers.signout);

export default router;
