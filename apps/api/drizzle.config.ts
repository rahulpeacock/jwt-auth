import { defineConfig } from 'drizzle-kit';
import { env } from './src/lib/env';

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/schemas/db.ts',
  out: './drizzle',
  dbCredentials: {
    url: env.DATABASE_URL,
  },
});
