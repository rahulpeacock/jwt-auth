import type { userTable } from './db';

export type User = typeof userTable.$inferSelect;
export type NewUser = typeof userTable.$inferInsert;
