import { db } from '@/api/lib/drizzle';
import { accountTable } from '@/api/schemas/db';
import type { Account, NewAccount } from '@/api/schemas/types';
import { and, eq } from 'drizzle-orm';

export async function createAccountInDB(payload: NewAccount) {
  const res = await db.insert(accountTable).values(payload).returning();
  if (res.length === 0) return null;
  return res[0];
}

export async function upsertAccountInDB(payload: NewAccount) {
  const res = await db
    .insert(accountTable)
    .values(payload)
    .onConflictDoUpdate({
      target: accountTable.userId,
      set: { metadata: { password: payload.metadata.password } },
    })
    .returning();
  if (res.length === 0) return null;
  return res[0];
}

export async function getAccountFromDB(userId: number, provider: string) {
  const res = await db
    .select()
    .from(accountTable)
    .where(and(eq(accountTable.userId, userId), eq(accountTable.providerId, provider)));
  if (res.length === 0) return null;
  return res[0];
}

export async function updateAccountInDB(payload: Partial<Account>) {
  const res = await db.update(accountTable).set(payload).returning();
  if (res.length === 0) return null;
  return res[0];
}
