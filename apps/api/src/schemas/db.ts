import { bigint, json, pgTable, serial, text, timestamp, varchar } from 'drizzle-orm/pg-core';

export const userTable = pgTable('user', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  emailVerified: timestamp('email_verified', { mode: 'date' }),
  metadata: json().$type<{ name: string; avatar_url: string | null }>().notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' }),
});

export const accountTable = pgTable('account', {
  id: serial('id').primaryKey(),
  userId: bigint('user_id', { mode: 'number' })
    .references(() => userTable.id, { onDelete: 'cascade' })
    .notNull(),
  accountId: bigint('account_id', { mode: 'number' }).notNull(),
  providerId: varchar('provider_id', { length: 255 }).notNull(),
  refreshToken: text('refresh_token'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at', { mode: 'date' }),
  scope: text('scope'),
  idToken: text('id_token'),
  metadata: json().$type<{ password: string | null }>().notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' }),
});
