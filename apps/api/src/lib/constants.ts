import * as HttpStatusPhrases from 'stoker/http-status-phrases';
import { createMessageObjectSchema } from 'stoker/openapi/schemas';

export const BASE_PATH = '/api' as const;

// server
export const internalServerErrorSchema = createMessageObjectSchema(HttpStatusPhrases.INTERNAL_SERVER_ERROR);

// auth
export const unauthorizedSchema = createMessageObjectSchema(HttpStatusPhrases.UNAUTHORIZED);
export const forbiddenSchema = createMessageObjectSchema(HttpStatusPhrases.FORBIDDEN);

// helpers
export const notFoundSchema = createMessageObjectSchema(HttpStatusPhrases.NOT_FOUND);
