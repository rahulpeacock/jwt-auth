import type { accountTable, userTable, verificationTokenTable } from './db';

export type User = typeof userTable.$inferSelect;
export type NewUser = typeof userTable.$inferInsert;

export type Account = typeof accountTable.$inferSelect;
export type NewAccount = typeof accountTable.$inferInsert;

export type VerificationToken = typeof verificationTokenTable.$inferSelect;
export type NewVerificationToken = typeof verificationTokenTable.$inferInsert;
