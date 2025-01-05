import { db } from '@/api/lib/drizzle';
import { userTable } from '@/api/schemas/db';
import type { NewUser } from '@/api/schemas/types';
import { eq } from 'drizzle-orm';

export async function createUser(payload: NewUser) {
  const res = await db.insert(userTable).values(payload).returning();
  if (res.length === 0) return null;
  return res[0];
}

export async function getUser(email: string) {
  const res = await db.select().from(userTable).where(eq(userTable.email, email)).limit(1);
  if (res.length === 0) return null;
  return res[0];
}
