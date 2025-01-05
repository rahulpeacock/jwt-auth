import { db } from '@/api/lib/drizzle';
import { accountTable } from '@/api/schemas/db';
import type { NewAccount } from '@/api/schemas/types';

export async function createAccount(payload: NewAccount) {
  const res = await db.insert(accountTable).values(payload).returning();
  if (res.length === 0) return null;
  return res[0];
}
