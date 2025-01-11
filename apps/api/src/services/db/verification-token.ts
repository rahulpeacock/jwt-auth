import { db } from '@/api/lib/drizzle';
import { verificationTokenTable } from '@/api/schemas/db';
import type { NewVerificationToken } from '@/api/schemas/types';
import { eq } from 'drizzle-orm';

export async function createVerificationTokenInDB(payload: NewVerificationToken) {
  const res = await db.insert(verificationTokenTable).values(payload).returning();
  if (res.length === 0) return null;
  return res[0];
}

export async function upsertVerificationTokenInDB(payload: NewVerificationToken) {
  const res = await db
    .insert(verificationTokenTable)
    .values(payload)
    .onConflictDoUpdate({
      target: verificationTokenTable.identifier,
      set: { token: payload.token, expiresAt: payload.expiresAt },
    })
    .returning();
  if (res.length === 0) return null;
  return res[0];
}

export async function getVerificationTokenFromDB(token: string) {
  const req = await db.select().from(verificationTokenTable).where(eq(verificationTokenTable.token, token)).limit(1);
  if (req.length === 0) return null;
  return req[0];
}
