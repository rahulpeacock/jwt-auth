import { db } from '@/api/lib/drizzle';
import { userTable } from '@/api/schemas/db';
import type { NewUser, User } from '@/api/schemas/types';
import { eq } from 'drizzle-orm';
import { lower } from './utils';

export async function createUser(payload: NewUser) {
  const res = await db.insert(userTable).values(payload).returning();
  if (res.length === 0) return null;
  return res[0];
}

export async function getUserByEmail(email: string) {
  const res = await db
    .select()
    .from(userTable)
    .where(eq(lower(userTable.email), email))
    .limit(1);
  if (res.length === 0) return null;
  return res[0];
}

export async function getUserByUserId(userId: number) {
  const res = await db.select().from(userTable).where(eq(userTable.id, userId)).limit(1);
  if (res.length === 0) return null;
  return res[0];
}

export async function updateUserById(userId: number, payload: Partial<User>) {
  const res = await db.update(userTable).set(payload).where(eq(userTable.id, userId)).returning();
  if (res.length === 0) return null;
  return res[0];
}
