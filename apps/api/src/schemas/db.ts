import { json, pgTable, serial, timestamp, varchar } from 'drizzle-orm/pg-core';

export const userTable = pgTable('user', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  emailVerified: timestamp('emailVerified', { mode: 'date' }),
  user_metadata: json().$type<{ name: string; avatar_url: string | null }>().notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' }),
});
