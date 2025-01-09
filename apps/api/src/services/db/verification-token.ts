import { db } from '@/api/lib/drizzle';
import { verificationTokenTable } from '@/api/schemas/db';
import type { NewVerificationToken } from '@/api/schemas/types';

export async function createVerificationTokenInDB(payload: NewVerificationToken) {
  const res = await db.insert(verificationTokenTable).values(payload).returning();
  if (res.length === 0) return null;
  return res[0];
}
